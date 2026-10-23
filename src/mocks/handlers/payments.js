import { http, HttpResponse } from 'msw';
import { API, withAuth, notFound } from './utils';
import { loadOrders, nextPaymentId, nowIso, saveOrders, serializePayment, toMoney } from '../data/orders';

// POST payments/ { order_id, ...fields } (src/api/paymentApi.js updatePayment) — an upsert of the order's
// payment, which is embedded in the shared order record. OrderWrapper.jsx creates it for a new order with
// { post_paid_amount: null }; Products / OrderStatus send totals, discount and type; CartProducts resets it
// with { final_amount: null, amount: null, status: 'NONE' }. Answers the payment (OrderStatus.jsx puts the
// response into order.payment, so it carries already_paid_amount like GET orders/:id/).

const MONEY_FIELDS = ['amount', 'final_amount', 'post_paid_amount'];
const OTHER_FIELDS = ['status', 'type', 'discount_type', 'discount_amount', 'receipt_url'];

export const paymentHandlers = [
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
];
