import { http, HttpResponse } from 'msw';
import { API, withAuth, notFound } from './utils';
import {
    loadOrders, loadPaymentBills, nextPaymentId, nowIso, saveOrders, savePaymentBills, serializePayment, toMoney,
} from '../data/orders';
import { nextId } from '../db';
import { resolveDemoAsset, toIso } from '../shared/seed';
import { APP_BASE_URL } from '../appBaseUrl';

// POST payments/ { order_id, ...fields } (src/api/paymentApi.js updatePayment) — an upsert of the order's
// payment, which is embedded in the shared order record. OrderWrapper.jsx creates it for a new order with
// { post_paid_amount: null }; Products / OrderStatus send totals, discount and type; CartProducts resets it
// with { final_amount: null, amount: null, status: 'NONE' }. Answers the payment (OrderStatus.jsx puts the
// response into order.payment, so it carries already_paid_amount like GET orders/:id/).
//
// Payment bills ("рахунки", OrderStatus.jsx / Bill.jsx) are the shared `paymentBills` collection, in the seed's
// shape (keyed by order_id); the API addresses them by the order's payment id:
//   GET    payments/?order_id=                          -> [payment]
//   GET    payments_types/payment_bill/?payment_id=     -> [bill], oldest first (bill №1 is the first one)
//   POST   payments_types/payment_bill/ { payment, method[, prepayment_amount] } -> the new bill
//   PATCH  payments_types/payment_bill/:id/ { payment, ...fields }              -> the bill
//   DELETE payments_types/payment_bill/:id/                                     -> 204
//   POST   receipt/approved/ (multipart: payment = bill id, is_approved)        -> the bill
// Bill amounts go out as numbers: Bill.jsx adds them to the available sum.

const MONEY_FIELDS = ['amount', 'final_amount', 'post_paid_amount'];
const OTHER_FIELDS = ['status', 'type', 'discount_type', 'discount_amount', 'receipt_url'];

const BILL_FIELDS = ['type', 'method', 'status', 'comment'];

const badRequest = (errors) => HttpResponse.json(errors, { status: 400, statusText: 'Bad Request' });

const findOrderByPaymentId = (orders, paymentId) =>
    orders.find((o) => o.payment && String(o.payment.id) === String(paymentId));

const serializeBill = (bill, order) => ({
    id: bill.id,
    payment: order?.payment?.id ?? null,
    order: bill.order_id,
    type: bill.type,
    method: bill.method,
    status: bill.status,
    prepayment_amount: bill.prepayment_amount === null ? null : Number(bill.prepayment_amount),
    prepayment_datetime: bill.prepayment_datetime,
    paid_datetime: bill.paid_datetime,
    comment: bill.comment ?? null,
    receipt_url: bill.receipt_url,
    customer_receipt: resolveDemoAsset(bill.customer_receipt, APP_BASE_URL),
    customer_receipt_approved: bill.customer_receipt_approved,
});

/** An order is paid once all its bills are paid and they cover its total (the seed's rule for PAID). */
const updatePaidStatus = (order, bills) => {
    const own = bills.filter((b) => b.order_id === order.id);
    const paid = own.filter((b) => b.status === 'PAID').reduce((sum, b) => sum + Number(b.prepayment_amount), 0);
    if (own.length && own.every((b) => b.status === 'PAID') && paid >= Number(order.payment.final_amount)) {
        order.payment.status = 'PAID';
    }
};

export const paymentHandlers = [
    http.get(`${API}/payments/`, withAuth(({ request }) => {
        const orderId = new URL(request.url).searchParams.get('order_id');
        const order = loadOrders().find((o) => String(o.id) === String(orderId));
        return HttpResponse.json(order?.payment ? [{ ...serializePayment(order), order_id: order.id }] : []);
    })),

    http.post(`${API}/payments/`, withAuth(async ({ request }) => {
        const { order_id, ...body } = await request.json();
        const orders = loadOrders();
        const order = orders.find((o) => String(o.id) === String(order_id));
        if (!order) return notFound();

        order.payment ??= {
            id: nextPaymentId(orders),
            status: 'NONE',
            type: null,
            amount: null,
            final_amount: null,
            discount_type: 'NONE',
            discount_amount: 0,
            post_paid_amount: null,
            receipt_url: null,
        };
        MONEY_FIELDS.filter((key) => key in body).forEach((key) => {
            order.payment[key] = toMoney(body[key]);
        });
        OTHER_FIELDS.filter((key) => key in body).forEach((key) => {
            order.payment[key] = key === 'discount_amount' ? Number(body[key]) || 0 : body[key];
        });
        order.modified = nowIso();
        saveOrders(orders);
        return HttpResponse.json({ ...serializePayment(order), order_id: order.id });
    })),

    http.get(`${API}/payments_types/payment_bill/`, withAuth(({ request }) => {
        const paymentId = new URL(request.url).searchParams.get('payment_id');
        const order = findOrderByPaymentId(loadOrders(), paymentId);
        if (!order) return HttpResponse.json([]);
        const bills = loadPaymentBills().filter((b) => b.order_id === order.id).sort((a, b) => a.id - b.id);
        return HttpResponse.json(bills.map((b) => serializeBill(b, order)));
    })),

    http.post(`${API}/payments_types/payment_bill/`, withAuth(async ({ request }) => {
        const body = await request.json();
        const order = findOrderByPaymentId(loadOrders(), body.payment);
        if (!order) return badRequest({ payment: [`Invalid pk "${body.payment}" - object does not exist.`] });

        const bills = loadPaymentBills();
        // a new bill waits for the manager to pick its type, amount and date
        const bill = {
            id: nextId(bills),
            order_id: order.id,
            type: null,
            method: body.method ?? 'PREPAYMENT',
            status: 'PAY_WAIT',
            prepayment_amount: toMoney(body.prepayment_amount),
            prepayment_datetime: null,
            paid_datetime: null,
            payment_id: null,
            receipt_id: null,
            receipt_url: null,
            customer_receipt: null,
            customer_receipt_approved: null,
            provider_payment: null,
            comment: null,
        };
        bills.push(bill);
        savePaymentBills(bills);
        return HttpResponse.json(serializeBill(bill, order), { status: 201 });
    })),

    http.patch(`${API}/payments_types/payment_bill/:id/`, withAuth(async ({ request, params }) => {
        const body = await request.json();
        const bills = loadPaymentBills();
        const bill = bills.find((b) => String(b.id) === params.id);
        if (!bill) return notFound();

        BILL_FIELDS.filter((key) => key in body).forEach((key) => {
            bill[key] = body[key];
        });
        if ('prepayment_amount' in body) bill.prepayment_amount = toMoney(body.prepayment_amount);
        if ('prepayment_datetime' in body) {
            bill.prepayment_datetime = body.prepayment_datetime ? toIso(new Date(body.prepayment_datetime)) : null;
        }
        savePaymentBills(bills);
        const order = loadOrders().find((o) => o.id === bill.order_id);
        return HttpResponse.json(serializeBill(bill, order));
    })),

    http.delete(`${API}/payments_types/payment_bill/:id/`, withAuth(({ params }) => {
        const bills = loadPaymentBills();
        if (!bills.some((b) => String(b.id) === params.id)) return notFound();
        savePaymentBills(bills.filter((b) => String(b.id) !== params.id));
        return new HttpResponse(null, { status: 204 });
    })),

    // the manager's decision on the customer's transfer screenshot (Bill.jsx "Підтвердити оплату")
    http.post(`${API}/receipt/approved/`, withAuth(async ({ request }) => {
        const form = await request.formData();
        const billId = form.get('payment');
        const isApproved = form.get('is_approved') === 'true';

        const bills = loadPaymentBills();
        const bill = bills.find((b) => String(b.id) === String(billId));
        if (!bill) return notFound();
        if (bill.customer_receipt_approved !== 'IN_PROC') {
            return badRequest({ customer_receipt_approved: ['The payment has already been processed.'] });
        }

        bill.customer_receipt_approved = isApproved ? 'APPROVED' : 'DECLINED';
        if (isApproved && bill.status !== 'PAID') {
            bill.status = 'PAID';
            bill.paid_datetime = nowIso();
        } else if (!isApproved && bill.status !== 'PAID') {
            bill.status = 'NOT_PAID';
        }
        savePaymentBills(bills);

        const orders = loadOrders();
        const order = orders.find((o) => o.id === bill.order_id);
        if (isApproved && order?.payment) {
            updatePaidStatus(order, bills);
            order.modified = nowIso();
            saveOrders(orders);
        }
        return HttpResponse.json(serializeBill(bill, order));
    })),
];
