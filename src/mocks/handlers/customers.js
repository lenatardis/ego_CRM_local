import { http, HttpResponse } from 'msw';
import { API, withAuth, notFound } from './utils';
import { nextId } from '../db';
import { loadCustomers, loadOrders, nowIso, saveCustomers, saveOrders } from '../data/orders';

// POST customers/ { order_id, ...fields } (src/api/customersApi.js) — an upsert of the order's customer:
// creates one when the order has none yet (OrderWrapper.jsx sends { first_name: null } for a new order),
// otherwise edits it. The customer record is shared by all orders that refer to it.
// Answers the customer (`id` is what OrderCreate.jsx checks) or field errors ({ phone: [message] }).

const CUSTOMER_FIELDS = ['first_name', 'last_name', 'middle_name', 'phone', 'username', 'url'];

// OrderCreate.jsx sends the masked phone with spaces, brackets and dashes stripped: "+380XXXXXXXXX"
const PHONE_RE = /^\+380\d{9}$/;

export const customerHandlers = [
    http.post(`${API}/customers/`, withAuth(async ({ request }) => {
        const { order_id, ...body } = await request.json();
        const orders = loadOrders();
        const order = orders.find((o) => String(o.id) === String(order_id));
        if (!order) return notFound();

        const fields = {};
        CUSTOMER_FIELDS.filter((key) => key in body).forEach((key) => {
            const value = typeof body[key] === 'string' ? body[key].trim() : body[key];
            fields[key] = value === '' ? null : value;
        });
        // an untouched phone mask comes back as "+38" / "+380"
        if (fields.phone && fields.phone.length <= 4) fields.phone = null;
        if (fields.phone && !PHONE_RE.test(fields.phone)) {
            return HttpResponse.json({ phone: ['Введіть коректний номер телефону.'] }, { status: 400, statusText: 'Bad Request' });
        }

        const customers = loadCustomers();
        let customer = customers.find((c) => c.id === order.customer_id);
        if (!customer) {
            customer = { id: nextId(customers), first_name: null, last_name: null, middle_name: null, phone: null, username: null, url: null };
            customers.push(customer);
            Object.assign(order, { customer_id: customer.id, modified: nowIso() });
            saveOrders(orders);
        }
        Object.assign(customer, fields);
        saveCustomers(customers);
        return HttpResponse.json(customer);
    })),
];
