import { http, HttpResponse } from 'msw';
import { API, withLatency, notFound } from './utils';
import {
    clientUrl, loadCustomers, loadOrders, loadPaymentBills, nowIso, saveOrders, savePaymentBills, serializeBill,
    serializeOrder, serializePayment, updatePaidStatus,
} from '../data/orders';
import { loadOrderProducts, serializeOrderProduct } from '../data/orderProducts';
import { emptyItem, findNpItem, loadDirectory, serializeNpItem } from '../data/novaPoshta';

// The customer's side (ClientPage/*), all public — the customer has no account, only the order link:
//   GET  orders/free-access/?order_hash=          -> { order, general_order, payment, products, kits, payment_bills,
//                                                      nova_poshta_delivery, ukr_poshta_delivery } (Status.jsx; 404 if unknown)
//   POST orders/free-access-customer/ { order_id, phone_last_digits } -> { customer, nova_poshta_delivery } (DetailsInput.jsx)
//   POST receipt/ (multipart: payment = bill id, receipt = file)    -> the bill with its customer receipt (IN_PROC)
//   POST payments_types/{monobank,wayforpay}/ { payment_bill_id }   -> { invoice_id, invoice_url }
//   POST payments_types/:type/:invoice_id/successful/               -> { id, payment: bill + free_access_order_url }
//   POST checkbox/receipt/ { payment_id, payment_type }             -> { id, payment: bill } with the fiscal receipt_url
// Payment services are not called: the "invoice" link leads straight to the app's own finish page
// (/monobank/finish-order/?invoice_id=…), which confirms the payment as the service's return would.

const badRequest = (errors) => HttpResponse.json({ errors }, { status: 400, statusText: 'Bad Request' });

// customer receipts were uploaded files; the demo keeps the sample receipt instead of the file (public/demo/, as the seed)
const CUSTOMER_RECEIPT_URL = 'demo/customer-receipt.svg';
const RECEIPT_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif'];
const RECEIPT_MAX_SIZE = 5 * 1024 * 1024;
// fiscal receipts were Checkbox pages: the demo links to their start page, as the seed does
const FISCAL_RECEIPT_URL = 'https://checkbox.ua/';
const PROVIDERS = ['monobank', 'wayforpay'];

const randomChars = (alphabet, n) => Array.from({ length: n }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
const uuid = () => [8, 4, 4, 4, 12].map((n) => randomChars('0123456789abcdef', n)).join('-');
// like the seed's Monobank invoice ids: yymmdd + 14 letters/digits
const newInvoiceId = () => `${nowIso().slice(2, 10).replace(/-/g, '')}${randomChars('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', 14)}`;

const lastDigits = (phone) => String(phone ?? '').replace(/\D/g, '').slice(-4);

/** The bill, its order and the collections, or null. */
const findBillContext = (billId) => {
    const bills = loadPaymentBills();
    const bill = bills.find((b) => String(b.id) === String(billId));
    if (!bill) return null;
    const orders = loadOrders();
    return { bills, bill, orders, order: orders.find((o) => o.id === bill.order_id) };
};

const billWithOrderUrl = (bill, order) => ({ ...serializeBill(bill, order), free_access_order_url: order ? clientUrl(order) : null });

export const clientHandlers = [
    http.get(`${API}/orders/free-access/`, withLatency(async ({ request }) => {
        const hash = new URL(request.url).searchParams.get('order_hash');
        const orders = loadOrders();
        const order = orders.find((o) => o.order_hash === hash);
        if (!order) return notFound();

        await loadDirectory();
        const serialized = serializeOrder(order, { orders });
        const cart = loadOrderProducts().filter((p) => p.order_id === order.id).map(serializeOrderProduct);
        const bills = loadPaymentBills();
        // the delivery belongs to the general order (one parcel for the order and its suborders)
        const deliveryOrderId = order.general_order_id ?? order.id;
        const npItem = findNpItem((i) => i.order_id === deliveryOrderId);

        return HttpResponse.json({
            order: serialized,
            general_order: serialized.general_order,
            payment: serializePayment(order, bills),
            products: cart.filter((p) => p.warehouse_item).map((p) => p.warehouse_item),
            kits: cart.filter((p) => p.kit).map((p) => p.kit),
            payment_bills: bills.filter((b) => b.order_id === order.id).sort((a, b) => a.id - b.id).map((b) => serializeBill(b, order)),
            nova_poshta_delivery: npItem ? serializeNpItem(npItem, { bills }) : null,
            ukr_poshta_delivery: null,
        });
    })),

    // "Детальна інформація": the last 4 digits of the receiver's phone unlock the customer's contacts and delivery
    http.post(`${API}/orders/free-access-customer/`, withLatency(async ({ request }) => {
        const { order_id, phone_last_digits } = await request.json();
        const order = loadOrders().find((o) => String(o.id) === String(order_id));
        if (!order) return notFound();

        await loadDirectory();
        const customer = loadCustomers().find((c) => c.id === order.customer_id) ?? null;
        const npItem = findNpItem((i) => i.order_id === order.id);
        const receiverPhone = npItem?.receiver.delivery_receiver.phone || customer?.phone;
        if (!receiverPhone || lastDigits(receiverPhone) !== String(phone_last_digits ?? '')) {
            return badRequest({ phone_last_digits: ['Невірні цифри номера телефону.'] });
        }
        // an order without a delivery yet has an empty one (orders created in the CRM always get an item)
        return HttpResponse.json({
            customer,
            nova_poshta_delivery: npItem ? serializeNpItem(npItem) : emptyItem(null, order.id, nowIso()),
        });
    })),

    // "Повідомити про оплату": the customer's transfer screenshot for a bill paid by requisites
    http.post(`${API}/receipt/`, withLatency(async ({ request }) => {
        const form = await request.formData();
        const file = form.get('receipt');
        const ctx = findBillContext(form.get('payment'));
        if (!ctx) return notFound();
        const { bills, bill, order } = ctx;

        if (!(file instanceof File) || !RECEIPT_TYPES.includes(file.type) || file.size > RECEIPT_MAX_SIZE) {
            return badRequest({ receipt: ['Завантажте PDF, JPG, PNG або GIF до 5 МБ.'] });
        }
        if (bill.type !== 'IBAN' || bill.status === 'PAID' || (bill.customer_receipt && bill.customer_receipt_approved !== 'DECLINED')) {
            return badRequest({ receipt: ['Для цього рахунку чек уже надіслано або він не потрібен.'] });
        }

        bill.customer_receipt = CUSTOMER_RECEIPT_URL;
        bill.customer_receipt_approved = 'IN_PROC';
        // a bill whose earlier receipt was declined waits for payment again
        if (bill.status === 'NOT_PAID') bill.status = 'PAY_WAIT';
        savePaymentBills(bills);
        return HttpResponse.json(serializeBill(bill, order));
    })),

    ...PROVIDERS.map((provider) => http.post(`${API}/payments_types/${provider}/`, withLatency(async ({ request }) => {
        const { payment_bill_id } = await request.json();
        const ctx = findBillContext(payment_bill_id);
        if (!ctx) return notFound();
        const { bills, bill } = ctx;
        if (bill.type !== 'ONLINE' || bill.status !== 'PAY_WAIT' || !(Number(bill.prepayment_amount) > 0)) {
            return badRequest({ payment_bill: ['Рахунок не можна оплатити онлайн.'] });
        }

        const invoiceId = newInvoiceId();
        const invoiceUrl = `${window.location.origin}${process.env.PUBLIC_URL}/${provider}/finish-order/?invoice_id=${invoiceId}`;
        bill.provider_payment = { type: provider, order_id: invoiceId, invoice_url: invoiceUrl };
        savePaymentBills(bills);
        return HttpResponse.json({ invoice_id: invoiceId, invoice_url: invoiceUrl });
    }))),

    // the payment service's return: the invoice is paid (opening the finish page again shows the same result)
    http.post(`${API}/payments_types/:provider/:invoiceId/successful/`, withLatency(({ params }) => {
        const bills = loadPaymentBills();
        const bill = bills.find((b) => b.provider_payment?.type === params.provider && b.provider_payment?.order_id === params.invoiceId);
        if (!bill) return badRequest({ invoice: ['Рахунок не знайдено.'] });

        const orders = loadOrders();
        const order = orders.find((o) => o.id === bill.order_id);
        if (bill.status !== 'PAID') {
            bill.status = 'PAID';
            bill.paid_datetime = nowIso();
            savePaymentBills(bills);
            if (order?.payment) {
                updatePaidStatus(order, bills);
                order.modified = nowIso();
                saveOrders(orders);
            }
        }
        return HttpResponse.json({
            id: params.invoiceId,
            invoice_id: params.invoiceId,
            status: 'success',
            payment: billWithOrderUrl(bill, order),
        });
    })),

    // Checkbox fiscal receipt of an online payment (payment_id = the bill)
    http.post(`${API}/checkbox/receipt/`, withLatency(async ({ request }) => {
        const { payment_id } = await request.json();
        const ctx = findBillContext(payment_id);
        if (!ctx) return notFound();
        const { bills, bill, order } = ctx;
        if (bill.status !== 'PAID') return badRequest({ payment: ['Рахунок ще не оплачено.'] });

        if (!bill.receipt_url) {
            bill.receipt_id = uuid();
            bill.receipt_url = FISCAL_RECEIPT_URL;
            savePaymentBills(bills);
        }
        return HttpResponse.json({ id: bill.receipt_id, payment: billWithOrderUrl(bill, order) });
    })),
];
