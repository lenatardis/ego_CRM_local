import { http, HttpResponse } from 'msw';
import { API, withAuth, isSet, toBoolOrUndefined, notFound } from './utils';
import {
    SOURCES, addRecentView, byNewest, deleteOrderCascade, findSource, getRecentViewIds, loadOrders, makeOrder,
    nextPaymentId, nowIso, saveOrders, serializeOrder, serializeOrders,
} from '../data/orders';

// Response shapes follow src/api/ordersApi.js and the components using it:
//   GET    orders/?page&manager&is_general&is_favourite -> { orders, total_pages } (Main.jsx)
//   GET    orders/recent-views/?manager=                -> { orders, total_pages } (the "history" tab)
//   GET    orders/sub-orders/?general_order=            -> [order] (Order.jsx, Products.jsx, OrderStatus.jsx)
//   GET    orders/source/                               -> [{ id, name }]
//   GET    orders/:id/                                  -> order (also recorded as a recent view)
//   POST   orders/                                      -> order; creates, or updates when the body has `id`
//   POST   orders/duplicate/ { order_id }               -> the new order
//   DELETE orders/:id/                                  -> 204

const PAGE_SIZE = 10;

const pageOf = (list, page) => {
    const current = Math.max(1, Number(page) || 1);
    return {
        orders: list.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE),
        total_pages: Math.max(1, Math.ceil(list.length / PAGE_SIZE)),
    };
};

const findOrder = (orders, id) => orders.find((o) => String(o.id) === String(id));

// POST orders/ body keys -> stored fields (relations are sent as ids)
const ORDER_FIELDS = {
    manager: 'manager_id',
    customer: 'customer_id',
    source: 'source_id',
    general_order: 'general_order_id',
    is_general: 'is_general',
    is_immediate: 'is_immediate',
    is_favourite: 'is_favourite',
    comment: 'comment',
    status: 'status',
};
const ID_FIELDS = ['manager_id', 'customer_id', 'source_id', 'general_order_id'];

/** Stored field values from a request body, or { errors } as DRF would answer them. */
const parseOrderBody = (body, orders) => {
    const fields = {};
    Object.entries(ORDER_FIELDS).forEach(([key, field]) => {
        if (!(key in body)) return;
        const value = body[key];
        fields[field] = ID_FIELDS.includes(field) ? (isSet(value) ? Number(value) : null) : value;
    });
    if (fields.source_id && !findSource(fields.source_id)) {
        return { errors: { source: [`Invalid pk "${body.source}" - object does not exist.`] } };
    }
    if (fields.general_order_id && !findOrder(orders, fields.general_order_id)) {
        return { errors: { general_order: [`Invalid pk "${body.general_order}" - object does not exist.`] } };
    }
    if (fields.comment === '') fields.comment = null;
    return { fields };
};

export const orderHandlers = [
    http.get(`${API}/orders/`, withAuth(({ request }) => {
        const params = new URL(request.url).searchParams;
        const isGeneral = toBoolOrUndefined(params.get('is_general'));
        const isFavourite = toBoolOrUndefined(params.get('is_favourite'));
        const manager = params.get('manager');

        const orders = loadOrders();
        const list = orders
            .filter((o) => isGeneral === undefined || o.is_general === isGeneral)
            .filter((o) => isFavourite === undefined || o.is_favourite === isFavourite)
            .filter((o) => !isSet(manager) || String(o.manager_id) === manager)
            .sort(byNewest);

        const { orders: pageItems, total_pages } = pageOf(list, params.get('page'));
        return HttpResponse.json({ orders: serializeOrders(pageItems, orders), total_pages, count: list.length });
    })),

    http.get(`${API}/orders/recent-views/`, withAuth(({ request, user }) => {
        const manager = new URL(request.url).searchParams.get('manager') || user.id;
        const orders = loadOrders();
        const list = getRecentViewIds(manager).map((id) => findOrder(orders, id)).filter(Boolean);
        return HttpResponse.json({ orders: serializeOrders(list, orders), total_pages: 1, count: list.length });
    })),

    http.get(`${API}/orders/sub-orders/`, withAuth(({ request }) => {
        const generalId = new URL(request.url).searchParams.get('general_order');
        const orders = loadOrders();
        const list = orders.filter((o) => String(o.general_order_id) === String(generalId)).sort(byNewest);
        return HttpResponse.json(serializeOrders(list, orders));
    })),

    http.get(`${API}/orders/source/`, withAuth(() => HttpResponse.json(SOURCES))),

    http.post(`${API}/orders/duplicate/`, withAuth(async ({ request, user }) => {
        const { order_id } = await request.json();
        const orders = loadOrders();
        const original = findOrder(orders, order_id);
        if (!original) return notFound();

        // a copy for the same customer and source, taken by the manager who duplicates it; not paid yet.
        // TODO step 6.6: copy the order products too.
        const copy = makeOrder(orders, {
            is_immediate: original.is_immediate,
            comment: original.comment,
            manager_id: user.id,
            customer_id: original.customer_id,
            source_id: original.source_id,
        });
        if (original.payment) {
            const { amount, final_amount, discount_type, discount_amount } = original.payment;
            copy.payment = {
                id: nextPaymentId(orders),
                status: 'NONE',
                type: null,
                amount,
                final_amount,
                discount_type,
                discount_amount,
                post_paid_amount: null,
                receipt_url: null,
            };
        }
        orders.push(copy);
        saveOrders(orders);
        return HttpResponse.json(serializeOrder(copy, { orders }), { status: 201 });
    })),

    http.get(`${API}/orders/:id/`, withAuth(({ params, user }) => {
        const orders = loadOrders();
        const order = findOrder(orders, params.id);
        if (!order) return notFound();
        addRecentView(user.id, order.id);
        return HttpResponse.json(serializeOrder(order, { orders }));
    })),

    http.post(`${API}/orders/`, withAuth(async ({ request }) => {
        const body = await request.json();
        const orders = loadOrders();
        const { fields, errors } = parseOrderBody(body, orders);
        if (errors) return HttpResponse.json(errors, { status: 400, statusText: 'Bad Request' });

        if (isSet(body.id)) {
            const order = findOrder(orders, body.id);
            if (!order) return notFound();
            Object.assign(order, fields, { modified: nowIso() });
            saveOrders(orders);
            return HttpResponse.json(serializeOrder(order, { orders }));
        }

        const order = makeOrder(orders, fields);
        // a suborder belongs to its general order's customer and source unless the body says otherwise
        if (!order.is_general && order.general_order_id) {
            const general = findOrder(orders, order.general_order_id);
            order.customer_id ??= general.customer_id;
            order.source_id ??= general.source_id;
        }
        orders.push(order);
        saveOrders(orders);
        return HttpResponse.json(serializeOrder(order, { orders }), { status: 201 });
    })),

    http.delete(`${API}/orders/:id/`, withAuth(({ params }) => {
        if (!findOrder(loadOrders(), params.id)) return notFound();
        deleteOrderCascade(Number(params.id));
        return new HttpResponse(null, { status: 204 });
    })),
];
