// Nova Poshta behind the mock backend: a snapshot of the real directory of cities and branches (the service
// itself is never called), delivery items of orders ("Доставка Нова Пошта", CRM-private `ego-demo:crm:npItems`), shipping cost
// estimates and waybill (ТТН) numbers.
//
// Stored item = the shape the delivery pages read (DeliveryNP.jsx getRequiredNPValues / formValues):
//   { id, order_id, created, modified,
//     receiver: { delivery_receiver: { first_name, last_name, middle_name, phone, city },
//                 city_identifier, address, address_identifier, max_weight_allowed, department_number },
//     specified_weight, delivery_date, with_backward_delivery, backward_amount,
//     delivery: { payer: 'Sender' | 'Recipient', payment_method: 'CASH' | 'NON_CASH', estimate_order_price,
//                 estimate_delivery_price, ttn, comment } }
// `postpaid_amount` ("Сума до сплати") is added when a response is built: what is still unpaid of the declared value.

import { getCollection, saveCollection, nextId } from '../db';
import { SEED_CUSTOMERS, SEED_ORDER_PRODUCTS, SEED_ORDERS, SEED_PAYMENT_BILLS, mulberry32, toIso } from '../shared/seed';

// --- directory -------------------------------------------------------------------------------
// A snapshot of the real Nova Poshta directory (npDirectory.json, made by scripts/fetch-np-directory.mjs):
// 30 cities with their real refs and all their working branches (cargo branches included, no parcel lockers),
// in the shape the location endpoints answer. max_weight_allowed null = no limit.
// Loaded on demand (its own bundle chunk, ~70 KB gzipped): only the delivery endpoints need it, so the first
// page load doesn't carry it. Call loadDirectory() before using anything below.

let NP_CITIES = [];
const WAREHOUSES = new Map();
let directoryPromise = null;

export const loadDirectory = () => (directoryPromise ??= import('./npDirectory.json').then(({ default: directory }) => {
    NP_CITIES = directory.cities;
    const cityNames = new Map(NP_CITIES.map((c) => [c.city_ref, c.city]));
    directory.warehouses.forEach((w) => {
        if (!WAREHOUSES.has(w.city_ref)) WAREHOUSES.set(w.city_ref, []);
        WAREHOUSES.get(w.city_ref).push({ ...w, city: cityNames.get(w.city_ref) });
    });
}));

const normalize = (s) => String(s || '').trim().toLowerCase().replace(/[’`]/g, "'");

/** Cities whose name, or a word of it, starts with the query ("Ріг" finds Кривий Ріг); whole-name matches first. */
export const searchCities = (query) => {
    const q = normalize(query);
    if (!q) return [];
    const starts = NP_CITIES.filter((c) => normalize(c.city).startsWith(q));
    const wordStarts = NP_CITIES.filter((c) => !starts.includes(c) && normalize(c.city).split(/[\s-]+/).some((w) => w.startsWith(q)));
    return [...starts, ...wordStarts];
};

/** Branches of a city, optionally narrowed by number or address text. */
export const searchWarehouses = (cityRef, search) => {
    const list = WAREHOUSES.get(cityRef) ?? [];
    const q = normalize(search);
    if (!q) return list;
    return list.filter((w) => w.number === q || normalize(w.address).includes(q));
};

const findWarehouse = (addressRef) => {
    for (const list of WAREHOUSES.values()) {
        const found = list.find((w) => w.address_ref === addressRef);
        if (found) return found;
    }
    return null;
};

// --- tariffs and waybills --------------------------------------------------------------------

/**
 * Rough Nova Poshta branch-to-branch estimate (UAH): by weight, plus 0.5% of the declared value and,
 * for cash on delivery, the money transfer fee (20 UAH + 2%).
 */
export const estimateDeliveryPrice = (item) => {
    const weight = Number(item.specified_weight) || 0;
    const declared = Number(item.delivery.estimate_order_price) || 0;
    const base = weight <= 2 ? 80 : weight <= 10 ? 110 : weight <= 30 ? 160 : 160 + Math.ceil(weight - 30) * 5;
    const insurance = Math.max(0, declared * 0.005);
    const cod = item.with_backward_delivery ? 20 + (Number(item.backward_amount) || 0) * 0.02 : 0;
    return Math.round(base + insurance + cod);
};

const ttnFrom = (rand) => `2045${Array.from({ length: 10 }, () => Math.floor(rand() * 10)).join('')}`;
export const newTtn = () => ttnFrom(Math.random);

/** Missing fields for a waybill, as { field: [message] } (DeliveryNP.jsx marks those inputs). */
export const waybillErrors = (item) => {
    const r = item.receiver;
    const required = {
        first_name: r.delivery_receiver.first_name,
        last_name: r.delivery_receiver.last_name,
        middle_name: r.delivery_receiver.middle_name,
        phone: r.delivery_receiver.phone,
        city: r.delivery_receiver.city,
        address: r.address,
        specified_weight: item.specified_weight,
    };
    const errors = {};
    Object.entries(required).forEach(([key, value]) => {
        if (!value) errors[key] = ['This field may not be blank.'];
    });
    if (!(Number(item.delivery.estimate_order_price) > 0)) errors.estimate_order_price = ['Оголошена вартість повинна бути більше 0.'];
    return errors;
};

// --- items -----------------------------------------------------------------------------------

export const emptyItem = (id, orderId, now, fields = {}) => ({
    id,
    order_id: orderId,
    created: now,
    modified: now,
    receiver: {
        delivery_receiver: { first_name: null, last_name: null, middle_name: null, phone: null, city: null },
        city_identifier: null,
        address: null,
        address_identifier: null,
        max_weight_allowed: null,
        department_number: null,
    },
    specified_weight: null,
    delivery_date: null,
    with_backward_delivery: false,
    backward_amount: null,
    delivery: {
        payer: 'Recipient',
        payment_method: 'NON_CASH',
        estimate_order_price: 0,
        estimate_delivery_price: null,
        ttn: null,
        comment: null,
    },
    ...fields,
});

// Seed: orders already handed over (or ready) to Nova Poshta have their delivery filled in and a waybill.
const buildSeed = () => {
    const rand = mulberry32(25102026);
    const pick = (arr) => arr[Math.floor(rand() * arr.length)];
    const customers = new Map(SEED_CUSTOMERS.map((c) => [c.id, c]));
    const items = [];

    SEED_ORDERS.filter((o) => ['SHIPMENT_READY', 'DELIVERED'].includes(o.status)).forEach((order) => {
        const customer = customers.get(order.customer_id);
        const city = rand() < 0.3 ? NP_CITIES[0] : pick(NP_CITIES);
        const branches = WAREHOUSES.get(city.city_ref).filter((w) => w.max_weight_allowed === null || w.max_weight_allowed >= 30);
        const branch = pick(branches);
        // ~1.8 kg per kit, ~2.5 kg per pillow / blanket, plus packaging
        const lines = SEED_ORDER_PRODUCTS.filter((p) => p.order_id === order.id);
        const weight = Math.round((lines.reduce((s, p) => s + (p.kit ? 1.8 : 2.5), 0) + 0.3) * 100) / 100;
        const shipped = new Date(new Date(order.created).getTime() + (5 + Math.floor(rand() * 8)) * 24 * 60 * 60 * 1000);
        const unpaid = Number(order.payment.final_amount) - paidOf([order.id]);
        const cod = order.payment.type === 'POSTPAID' && unpaid > 0;

        const item = emptyItem(items.length + 1, order.id, order.created, {
            specified_weight: weight,
            delivery_date: toIso(shipped).slice(0, 10),
            with_backward_delivery: cod,
            backward_amount: cod ? unpaid : null,
        });
        Object.assign(item.receiver, {
            delivery_receiver: {
                first_name: customer.first_name,
                last_name: customer.last_name,
                middle_name: customer.middle_name,
                phone: customer.phone,
                city: city.city,
            },
            city_identifier: city.city_ref,
            address: branch.address,
            address_identifier: branch.address_ref,
            max_weight_allowed: branch.max_weight_allowed,
            department_number: branch.number,
        });
        Object.assign(item.delivery, {
            payer: rand() < 0.25 ? 'Sender' : 'Recipient',
            payment_method: cod ? 'CASH' : 'NON_CASH',
            estimate_order_price: Number(order.payment.final_amount),
            ttn: ttnFrom(rand),
        });
        item.delivery.estimate_delivery_price = estimateDeliveryPrice(item);
        items.push(item);
    });
    return items;
};

let seedCache = null;
// the seed places deliveries at directory branches: loadDirectory() must have run (the handlers await it)
export const loadNpItems = () => getCollection('npItems', (seedCache ??= buildSeed()));
export const saveNpItems = () => saveCollection('npItems');

export const findNpItem = (predicate) => loadNpItems().find(predicate) || null;
export const nextNpItemId = () => nextId(loadNpItems());

export const deleteNpItemsOf = async (orderIds) => {
    await loadDirectory();
    const items = loadNpItems();
    items.splice(0, items.length, ...items.filter((i) => !orderIds.has(i.order_id)));
    saveNpItems();
};

/** Sum of the PAID bills of the given orders (seed bills; the order-status page keeps them current). */
const paidOf = (orderIds, bills = SEED_PAYMENT_BILLS) => bills
    .filter((b) => orderIds.includes(b.order_id) && b.status === 'PAID')
    .reduce((s, b) => s + Number(b.prepayment_amount), 0);

/** The item as the delivery pages read it, with "Сума до сплати" = declared value minus what's paid. */
export const serializeNpItem = (item, { bills, orderIds } = {}) => ({
    ...item,
    postpaid_amount: Math.max(0, (Number(item.delivery.estimate_order_price) || 0) - paidOf(orderIds ?? [item.order_id], bills)),
});

// --- applying a POST delivery/nova_poshta/item/ body ----------------------------------------

const RECEIVER_PERSON = ['first_name', 'last_name', 'middle_name', 'phone', 'city'];
const RECEIVER_FIELDS = {
    city_ref: 'city_identifier',
    address: 'address',
    address_ref: 'address_identifier',
    max_weight_allowed: 'max_weight_allowed',
    warehouse_number: 'department_number',
};
const DELIVERY_FIELDS = ['payment_method', 'estimate_order_price', 'comment'];
const TOP_FIELDS = ['delivery_date', 'with_backward_delivery', 'backward_amount'];

const blankToNull = (v) => (v === '' || v === undefined ? null : v);

/**
 * Applies the flat fields DeliveryNP / OrderCreate / Products send to an item (a copy). Returns
 * { item } or { errors } — weight is checked against the chosen branch (NovaPoshtaWeight.jsx messages).
 */
export const applyItemFields = (item, body) => {
    const next = structuredClone(item);
    RECEIVER_PERSON.filter((k) => k in body).forEach((k) => {
        next.receiver.delivery_receiver[k] = blankToNull(body[k]);
    });
    Object.entries(RECEIVER_FIELDS).filter(([k]) => k in body).forEach(([k, field]) => {
        next.receiver[field] = blankToNull(body[k]);
    });
    // a branch picked from the directory brings its own weight limit
    if (body.address_ref) {
        next.receiver.max_weight_allowed = findWarehouse(body.address_ref)?.max_weight_allowed ?? next.receiver.max_weight_allowed;
    }
    DELIVERY_FIELDS.filter((k) => k in body).forEach((k) => {
        next.delivery[k] = k === 'estimate_order_price' ? Number(body[k]) || 0 : blankToNull(body[k]);
    });
    if ('paid_by_the_sender' in body) next.delivery.payer = body.paid_by_the_sender ? 'Sender' : 'Recipient';
    TOP_FIELDS.filter((k) => k in body).forEach((k) => {
        next[k] = k === 'with_backward_delivery' ? !!body[k] : k === 'backward_amount' ? (Number(body[k]) || null) : blankToNull(body[k]);
    });
    if (next.with_backward_delivery === false) next.backward_amount = null;

    if ('specified_weight' in body && isFinite(parseFloat(body.specified_weight))) {
        const weight = Math.round(parseFloat(body.specified_weight) * 100) / 100;
        if (!next.receiver.address_identifier) {
            return { errors: { specified_weight: ['Спочатку оберіть відділення.'] } };
        }
        if (next.receiver.max_weight_allowed && weight > Number(next.receiver.max_weight_allowed)) {
            return { errors: { specified_weight: [`Вага перевищує допустиму для відділення (${next.receiver.max_weight_allowed} кг).`] } };
        }
        next.specified_weight = weight;
    } else if ('specified_weight' in body) {
        next.specified_weight = null;
    }
    return { item: next };
};

// --- printable waybill -----------------------------------------------------------------------

const escapeHtml = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/** A printable "Експрес-накладна" page for an item with a waybill (stands in for the service's PDF). */
export const waybillHtml = (item, orderId) => {
    const r = item.receiver;
    const p = r.delivery_receiver;
    const row = (label, value) => `<tr><th>${escapeHtml(label)}</th><td>${escapeHtml(value)}</td></tr>`;
    return `<!doctype html><html lang="uk"><head><meta charset="utf-8"><title>ТТН ${escapeHtml(item.delivery.ttn)}</title>
<style>body{font:14px/1.45 Arial,sans-serif;margin:32px;color:#222}h1{font-size:20px;margin:0 0 4px}
.ttn{font:bold 28px monospace;letter-spacing:2px;margin:12px 0 20px}table{border-collapse:collapse;width:100%;max-width:640px}
th,td{border:1px solid #bbb;padding:6px 10px;text-align:left;vertical-align:top}th{width:45%;background:#f4f4f4;font-weight:normal}
.note{color:#777;font-size:12px;margin-top:16px}@media print{.note{display:none}}</style></head><body>
<h1>Експрес-накладна</h1><div>Замовлення №${escapeHtml(orderId)}</div><div class="ttn">${escapeHtml(item.delivery.ttn)}</div>
<table>${[
        row('Відправник', 'Ego Textile'),
        row('Отримувач', [p.last_name, p.first_name, p.middle_name].filter(Boolean).join(' ')),
        row('Телефон отримувача', p.phone),
        row('Місто', p.city),
        row('Відділення', r.address),
        row('Вага, кг', item.specified_weight),
        row('Оголошена вартість, грн', item.delivery.estimate_order_price),
        row('Платник доставки', item.delivery.payer === 'Sender' ? 'Відправник' : 'Отримувач'),
        row('Форма оплати', item.delivery.payment_method === 'CASH' ? 'Готівкова' : 'Безготівкова'),
        row('Зворотна доставка (наложений платіж), грн', item.with_backward_delivery ? item.backward_amount : '—'),
        row('Дата відправки', item.delivery_date ?? '—'),
        row('Орієнтовна вартість доставки, грн', item.delivery.estimate_delivery_price),
    ].join('')}</table>
<p class="note">Демо-накладна: сформована в браузері, сервіс Нової Пошти не викликався.</p></body></html>`;
};
