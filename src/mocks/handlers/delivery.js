import { http, HttpResponse } from 'msw';
import { API, withAuth, notFound } from './utils';
import { getCollection, saveCollection, nextId } from '../db';
import { nowIso } from '../data/orders';

// Nova Poshta delivery item of an order (src/api/novaPoshtaApi.js getDeliverNP / setDeliverNP), CRM-private.
//   GET  delivery/nova_poshta/item/?order_id= -> [item], or 404 { detail } when the order has none yet
//        (OrderCreate.jsx then creates it with { paid_by_the_sender: false, payment_method: 'NON_CASH' })
//   POST delivery/nova_poshta/item/ { order_id, ...fields } -> the item (upsert keyed by order)
// For now the item keeps the posted fields as they are; the response shape the delivery pages read
// (receiver, delivery, ttn, estimate prices, ...) is built in step 6.8 of ../../../CLAUDE.md.

const findItem = (items, orderId) => items.find((i) => String(i.order_id) === String(orderId));

export const deliveryHandlers = [
    http.get(`${API}/delivery/nova_poshta/item/`, withAuth(({ request }) => {
        const item = findItem(getCollection('npItems', []), new URL(request.url).searchParams.get('order_id'));
        return item ? HttpResponse.json([item]) : notFound();
    })),

    http.post(`${API}/delivery/nova_poshta/item/`, withAuth(async ({ request }) => {
        const { order_id, ...fields } = await request.json();
        const items = getCollection('npItems', []);
        let item = findItem(items, order_id);
        if (!item) {
            item = { id: nextId(items), order_id: Number(order_id), created: nowIso() };
            items.push(item);
        }
        Object.assign(item, fields, { modified: nowIso() });
        saveCollection('npItems');
        return HttpResponse.json(item);
    })),
];
