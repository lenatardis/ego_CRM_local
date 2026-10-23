// Orders, customers and payments behind the mock backend.
//
// Orders, customers and payment bills are shared with the ERP demo (../../../CLAUDE.md, "Cross-app contract"):
// they live in the shared store in the seed's record shape (ids for related records, payment embedded in
// the order) and are expanded into the nested objects the components read when a response is built.
// Collections are re-read on every request because the ERP may change them in another tab.

import { getCollection, getSharedCollection, saveCollection, saveSharedCollection, nextId } from '../db';
import {
    SEED_CUSTOMERS, SEED_MANAGERS, SEED_ORDERS, SEED_PAYMENT_BILLS, SEED_SOURCES, money, toIso,
} from '../shared/seed';

export const loadOrders = () => getSharedCollection('orders', SEED_ORDERS);
export const saveOrders = (orders) => saveSharedCollection('orders', orders);
export const loadCustomers = () => getSharedCollection('customers', SEED_CUSTOMERS);
export const saveCustomers = (customers) => saveSharedCollection('customers', customers);
export const loadPaymentBills = () => getSharedCollection('paymentBills', SEED_PAYMENT_BILLS);

export const nowIso = () => toIso(new Date());

// order sources are owned by the ERP; the CRM serves them read-only (GET orders/source/)
export const SOURCES = SEED_SOURCES.map(({ id, name }) => ({ id, name }));
export const findSource = (id) => SOURCES.find((s) => String(s.id) === String(id)) || null;

const findManager = (id) => SEED_MANAGERS.find((m) => String(m.id) === String(id)) || null;

// --- recent views ("history" tab), CRM-private: { [managerId]: [orderId, newest first] } -------

const RECENT_VIEWS_LIMIT = 10;

// a fresh demo already has some history: each manager's newest orders
const seedRecentViews = () => Object.fromEntries(SEED_MANAGERS.map((m) => [
    m.id,
    SEED_ORDERS.filter((o) => o.manager_id === m.id).slice(-6).reverse().map((o) => o.id),
]));

export const getRecentViewIds = (managerId) => getCollection('recentViews', seedRecentViews())[managerId] ?? [];

export const addRecentView = (managerId, orderId) => {
    const views = getCollection('recentViews', seedRecentViews());
    const ids = (views[managerId] ?? []).filter((id) => id !== orderId);
    views[managerId] = [orderId, ...ids].slice(0, RECENT_VIEWS_LIMIT);
    saveCollection('recentViews');
};

// --- response shapes -------------------------------------------------------------------------

/** Newest created first (ids break ties), as the order lists show them. */
export const byNewest = (a, b) => b.created.localeCompare(a.created) || b.id - a.id;

const toNumber = (v) => (v === null || v === undefined || v === '' ? null : Number(v));
/** Decimal fields come back as strings with two decimals, as DRF serializes them. */
export const toMoney = (v) => (toNumber(v) === null || Number.isNaN(toNumber(v)) ? null : money(toNumber(v)));

const alreadyPaid = (orderId, bills) => money(
    bills
        .filter((b) => b.order_id === orderId && b.status === 'PAID')
        .reduce((sum, b) => sum + Number(b.prepayment_amount), 0),
);

export const serializePayment = (order, bills = loadPaymentBills()) =>
    order.payment ? { ...order.payment, already_paid_amount: alreadyPaid(order.id, bills) } : null;

/** Item counts of an order's cart. TODO steps 6.6 / 6.7: count order products and kits once they are mocked. */
const itemCounts = () => ({ warehouse_item_count: 0, kit_count: 0 });

/** An order as GET orders/, GET orders/:id/ and POST orders/ return it. */
export const serializeOrder = (order, ctx = {}) => {
    const orders = ctx.orders ?? loadOrders();
    const customers = ctx.customers ?? loadCustomers();
    const bills = ctx.bills ?? loadPaymentBills();

    const manager = findManager(order.manager_id);
    const customer = customers.find((c) => c.id === order.customer_id) ?? null;
    const general = order.general_order_id ? orders.find((o) => o.id === order.general_order_id) : null;

    return {
        id: order.id,
        created: order.created,
        modified: order.modified,
        status: order.status,
        is_general: order.is_general,
        is_immediate: order.is_immediate,
        is_favourite: order.is_favourite,
        comment: order.comment,
        order_hash: order.order_hash,
        general_order: general
            ? { id: general.id, status: general.status, payment: serializePayment(general, bills) }
            : null,
        sub_orders_count: order.is_general ? orders.filter((o) => o.general_order_id === order.id).length : 0,
        ...itemCounts(order),
        source: findSource(order.source_id),
        manager: manager
            ? { id: manager.id, username: manager.username, first_name: manager.first_name, last_name: manager.last_name, middle_name: '' }
            : null,
        customer,
        payment: serializePayment(order, bills),
    };
};

/** Serializes several orders, reading the shared collections once. */
export const serializeOrders = (list, orders = loadOrders()) => {
    const ctx = { orders, customers: loadCustomers(), bills: loadPaymentBills() };
    return list.map((o) => serializeOrder(o, ctx));
};

// --- changes ---------------------------------------------------------------------------------

const randomHash = () => Array.from({ length: 32 }, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('');

/** A new order record in the shared shape; customer and payment are attached later by their own upserts. */
export const makeOrder = (orders, fields) => {
    const now = nowIso();
    return {
        id: nextId(orders),
        created: now,
        modified: now,
        status: 'NEW',
        is_general: true,
        general_order_id: null,
        is_immediate: false,
        is_favourite: false,
        comment: null,
        order_hash: randomHash(),
        manager_id: null,
        customer_id: null,
        source_id: null,
        payment: null,
        ...fields,
    };
};

export const nextPaymentId = (orders) => orders.reduce((max, o) => Math.max(max, o.payment?.id ?? 0), 0) + 1;

/**
 * Drops an order, its suborders and their payment bills from the shared store, and the CRM-private records
 * keyed by them (new ids are max + 1, so a later order may get a deleted order's id).
 */
export const deleteOrderCascade = (orderId) => {
    const orders = loadOrders();
    const removed = new Set(orders.filter((o) => o.id === orderId || o.general_order_id === orderId).map((o) => o.id));
    saveOrders(orders.filter((o) => !removed.has(o.id)));
    const bills = loadPaymentBills();
    if (bills.some((b) => removed.has(b.order_id))) {
        saveSharedCollection('paymentBills', bills.filter((b) => !removed.has(b.order_id)));
    }

    const views = getCollection('recentViews', seedRecentViews());
    Object.keys(views).forEach((managerId) => {
        views[managerId] = views[managerId].filter((id) => !removed.has(id));
    });
    saveCollection('recentViews');
    // TODO steps 6.6–6.8: also drop the order products, kits and delivery data of removed orders
    const npItems = getCollection('npItems', []);
    npItems.splice(0, npItems.length, ...npItems.filter((i) => !removed.has(i.order_id)));
    saveCollection('npItems');
};
