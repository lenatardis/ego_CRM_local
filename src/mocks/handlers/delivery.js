import { http, HttpResponse } from 'msw';
import { API, withAuth, isSet, notFound } from './utils';
import { loadCustomers, loadOrders, loadPaymentBills, nowIso } from '../data/orders';
import {
    applyItemFields, emptyItem, estimateDeliveryPrice, findNpItem, loadDirectory, loadNpItems, newTtn, nextNpItemId, saveNpItems,
    searchCities, searchWarehouses, serializeNpItem, waybillErrors, waybillHtml,
} from '../data/novaPoshta';

// Nova Poshta delivery (src/api/novaPoshtaApi.js; DeliveryNP*, OrderCreate, Products, OrderStatus, Parser):
//   GET    delivery/nova_poshta/item/?order_id=        -> [item], or 404 { detail } when the order has none yet
//   POST   delivery/nova_poshta/item/ { order_id, ...flat fields } -> item (upsert keyed by order; 400 { errors })
//   POST   delivery/nova_poshta/waybill/ { nova_poshta_id }        -> item with delivery.ttn (400 { errors })
//   POST   delivery/nova_poshta/waybill/update/ { nova_poshta_id } -> item, same ttn, recalculated
//   GET    delivery/nova_poshta/waybill/:id/pdf/       -> { url } of a printable waybill (OrderActions.jsx opens it)
//   DELETE delivery/nova_poshta/:id/                   -> item without its waybill (not used by the pages)
//   GET    delivery/nova_poshta/location/city/?city=   -> { cities: [{ city, city_ref, area, settlement_type }] }
//   GET    delivery/nova_poshta/location/warehouse/?city_ref&find_by_string -> { warehouses: [...] }
// Ukrposhta pages have no API of their own (city lookups reuse location/city/; the original page never saves).

const badRequest = (errors) => HttpResponse.json({ errors }, { status: 400, statusText: 'Bad Request' });

/** The order and its suborders: their totals make the declared value, their paid bills what's left to pay. */
const orderGroup = (orderId) => {
    const orders = loadOrders();
    const order = orders.find((o) => String(o.id) === String(orderId));
    if (!order) return null;
    return { order, all: [order, ...orders.filter((o) => o.general_order_id === order.id)] };
};

const respond = (item, status = 200) => {
    const group = orderGroup(item.order_id);
    const orderIds = group ? group.all.map((o) => o.id) : [item.order_id];
    return HttpResponse.json(serializeNpItem(item, { bills: loadPaymentBills(), orderIds }), { status });
};

const replaceItem = (item) => {
    const items = loadNpItems();
    const index = items.findIndex((i) => i.id === item.id);
    if (index === -1) items.push(item);
    else items[index] = item;
    saveNpItems();
};

/** A new item starts with the order's customer as the receiver and the order total as the declared value. */
const newItemFor = (group) => {
    const customer = loadCustomers().find((c) => c.id === group.order.customer_id);
    const item = emptyItem(nextNpItemId(), group.order.id, nowIso());
    if (customer) {
        Object.assign(item.receiver.delivery_receiver, {
            first_name: customer.first_name, last_name: customer.last_name, middle_name: customer.middle_name, phone: customer.phone,
        });
    }
    item.delivery.estimate_order_price = group.all.reduce((s, o) => s + (Number(o.payment?.final_amount) || 0), 0);
    return item;
};

const today = () => nowIso().slice(0, 10);

export const deliveryHandlers = [
    http.get(`${API}/delivery/nova_poshta/item/`, withAuth(async ({ request }) => {
        await loadDirectory();
        const orderId = new URL(request.url).searchParams.get('order_id');
        const item = findNpItem((i) => String(i.order_id) === String(orderId));
        return item ? HttpResponse.json([serializeNpItem(item, {
            bills: loadPaymentBills(),
            orderIds: orderGroup(orderId)?.all.map((o) => o.id) ?? [item.order_id],
        })]) : notFound();
    })),

    http.post(`${API}/delivery/nova_poshta/item/`, withAuth(async ({ request }) => {
        await loadDirectory();
        const { order_id, ...fields } = await request.json();
        const group = orderGroup(order_id);
        if (!group) return notFound();

        const existing = findNpItem((i) => i.order_id === group.order.id);
        const { item, errors } = applyItemFields(existing ?? newItemFor(group), fields);
        if (errors) return badRequest(errors);

        item.modified = nowIso();
        if (item.delivery.ttn) item.delivery.estimate_delivery_price = estimateDeliveryPrice(item);
        replaceItem(item);
        return respond(item, existing ? 200 : 201);
    })),

    http.post(`${API}/delivery/nova_poshta/waybill/`, withAuth(async ({ request }) => {
        await loadDirectory();
        const { nova_poshta_id } = await request.json();
        const item = findNpItem((i) => String(i.id) === String(nova_poshta_id));
        if (!item) return notFound();
        const errors = waybillErrors(item);
        if (Object.keys(errors).length) return badRequest(errors);

        const next = structuredClone(item);
        next.delivery.ttn = next.delivery.ttn ?? newTtn();
        next.delivery_date = next.delivery_date ?? today();
        next.delivery.estimate_delivery_price = estimateDeliveryPrice(next);
        next.modified = nowIso();
        replaceItem(next);
        return respond(next);
    })),

    http.post(`${API}/delivery/nova_poshta/waybill/update/`, withAuth(async ({ request }) => {
        await loadDirectory();
        const { nova_poshta_id } = await request.json();
        const item = findNpItem((i) => String(i.id) === String(nova_poshta_id));
        if (!item) return notFound();
        if (!item.delivery.ttn) return badRequest({ ttn: ['ТТН ще не створено.'] });
        const errors = waybillErrors(item);
        if (Object.keys(errors).length) return badRequest(errors);

        const next = structuredClone(item);
        next.delivery_date = next.delivery_date ?? today();
        next.delivery.estimate_delivery_price = estimateDeliveryPrice(next);
        next.modified = nowIso();
        replaceItem(next);
        return respond(next);
    })),

    http.get(`${API}/delivery/nova_poshta/waybill/:id/pdf/`, withAuth(async ({ params }) => {
        await loadDirectory();
        const item = findNpItem((i) => String(i.id) === String(params.id));
        if (!item?.delivery.ttn) return notFound();
        // handlers run in the page, so the waybill can be handed over as a blob URL of this origin
        const url = URL.createObjectURL(new Blob([waybillHtml(item, item.order_id)], { type: 'text/html' }));
        return HttpResponse.json({ url });
    })),

    http.delete(`${API}/delivery/nova_poshta/:id/`, withAuth(async ({ params }) => {
        await loadDirectory();
        const item = findNpItem((i) => String(i.id) === String(params.id));
        if (!item) return notFound();
        const next = structuredClone(item);
        Object.assign(next.delivery, { ttn: null, estimate_delivery_price: null });
        replaceItem(next);
        return respond(next);
    })),

    http.get(`${API}/delivery/nova_poshta/location/city/`, withAuth(async ({ request }) => {
        await loadDirectory();
        const query = new URL(request.url).searchParams.get('city');
        return HttpResponse.json({ cities: isSet(query) ? searchCities(query) : [] });
    })),

    http.get(`${API}/delivery/nova_poshta/location/warehouse/`, withAuth(async ({ request }) => {
        await loadDirectory();
        const q = new URL(request.url).searchParams;
        return HttpResponse.json({ warehouses: searchWarehouses(q.get('city_ref'), q.get('find_by_string')) });
    })),
];
