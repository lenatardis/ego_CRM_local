import { http, HttpResponse } from 'msw';
import { API, withAuth, withLatency, isSet, notFound } from './utils';
import { nextId } from '../db';
import { loadOrders, nowIso } from '../data/orders';
import {
    CATEGORY_LIST, DEMO_FABRICS, DEMO_PRODUCTS, FABRIC_TAG_LIST, FABRIC_TYPE_LIST, availableKitTemplates, findFabric, findProduct, findVariant, priceFor, productInStock, serializeFabric,
    serializeWarehouseItem,
} from '../data/catalog';
import { findOrderProduct, loadOrderProducts, saveOrderProducts, serializeOrderProduct } from '../data/orderProducts';

// Catalog (read-only, from the seed shared with the ERP) and order carts, following src/api/productsApi.js:
//   GET    products/fabric/?page&search&type&tags&order_by&is_hide_out_of_stock&is_available
//          -> { fabrics, total_pages, fabric_types, tags, order_by }        (Fabrics.jsx, calculator fabric popup)
//   GET    products/fabric/:id/            public -> fabric + available_kit_templates [{ name, price, count }]
//   GET    products/warehouse-items/?page_size&page&search&category&in_stock&source
//          -> { items, total_pages, categories }                          (Storage.jsx, StoragePopup.jsx)
//   GET    products/warehouse-items/:id/   public -> item with sizes[].colors[].price as a number
//   GET    products/order-product/?order=  -> [cart line]
//   POST   products/order-product/ { order, warehouse_item: { template, source, type } } -> cart line
//   DELETE products/order-product/:id/     -> 204
// List filters arrive comma-separated (getSearchParams joins arrays), e.g. type=1,3.

const PAGE_SIZE = 10;

const idList = (v) => (isSet(v) ? String(v).split(',').filter(Boolean).map(Number) : []);
const totalPages = (count, size) => Math.max(1, Math.ceil(count / size));
const pageSlice = (list, page, size) => {
    const current = Math.max(1, Number(page) || 1);
    return list.slice((current - 1) * size, current * size);
};
const matches = (text, search) => !isSet(search) || String(text).toLowerCase().includes(String(search).trim().toLowerCase());

// sort options of the fabric lists (FabricsSort.jsx shows `value`, sends `name` back as order_by)
const FABRIC_ORDER_BY = [
    { name: 'name', value: 'За назвою (А–Я)' },
    { name: '-name', value: 'За назвою (Я–А)' },
    { name: '-total_length', value: 'Спочатку з більшим залишком' },
    { name: 'total_length', value: 'Спочатку з меншим залишком' },
    { name: '-id', value: 'Спочатку нові' },
];
const fabricSorters = {
    name: (a, b) => a.name.localeCompare(b.name, 'uk', { numeric: true }),
    total_length: (a, b) => a.total_length - b.total_length,
    id: (a, b) => a.id - b.id,
};
const sortFabrics = (list, orderBy) => {
    const desc = orderBy?.startsWith('-');
    const sorter = fabricSorters[desc ? orderBy.slice(1) : orderBy] ?? fabricSorters.id;
    const sorted = [...list].sort(sorter);
    return desc ? sorted.reverse() : sorted;
};

export const productHandlers = [
    http.get(`${API}/products/fabric/`, withAuth(({ request }) => {
        const q = new URL(request.url).searchParams;
        const types = idList(q.get('type'));
        const tags = idList(q.get('tags'));
        const search = q.get('search');

        const list = DEMO_FABRICS
            .map(serializeFabric)
            .filter((f) => !types.length || types.includes(f.type.id))
            .filter((f) => !tags.length || f.tags.some((t) => tags.includes(t)))
            .filter((f) => matches(`${f.name} ${f.type.type}`, search))
            .filter((f) => q.get('is_hide_out_of_stock') !== 'true' || f.total_length > 0)
            .filter((f) => q.get('is_available') !== 'true' || f.is_available);

        return HttpResponse.json({
            fabrics: pageSlice(sortFabrics(list, q.get('order_by')), q.get('page'), PAGE_SIZE),
            total_pages: totalPages(list.length, PAGE_SIZE),
            count: list.length,
            fabric_types: FABRIC_TYPE_LIST,
            tags: FABRIC_TAG_LIST,
            order_by: FABRIC_ORDER_BY,
        });
    })),

    http.get(`${API}/products/fabric/:id/`, withLatency(({ params }) => {
        const fabric = findFabric(params.id);
        if (!fabric) return notFound();
        return HttpResponse.json({ ...serializeFabric(fabric), available_kit_templates: availableKitTemplates(fabric) });
    })),

    http.get(`${API}/products/warehouse-items/`, withAuth(({ request }) => {
        const q = new URL(request.url).searchParams;
        const categories = idList(q.get('category'));
        const size = Number(q.get('page_size')) || PAGE_SIZE;

        const list = DEMO_PRODUCTS
            .filter((p) => !categories.length || categories.includes(p.category.id))
            .filter((p) => matches(p.name, q.get('search')))
            .filter((p) => q.get('in_stock') !== 'true' || productInStock(p));

        return HttpResponse.json({
            items: pageSlice(list, q.get('page'), size).map((p) => serializeWarehouseItem(p, q.get('source'))),
            total_pages: totalPages(list.length, size),
            count: list.length,
            categories: CATEGORY_LIST,
        });
    })),

    http.get(`${API}/products/warehouse-items/:id/`, withLatency(({ params }) => {
        const product = findProduct(params.id);
        if (!product) return notFound();
        return HttpResponse.json(serializeWarehouseItem(product, null, { plainPrice: true }));
    })),

    http.get(`${API}/products/order-product/`, withAuth(({ request }) => {
        const orderId = new URL(request.url).searchParams.get('order');
        const list = loadOrderProducts().filter((p) => String(p.order_id) === String(orderId));
        return HttpResponse.json(list.map(serializeOrderProduct));
    })),

    http.post(`${API}/products/order-product/`, withAuth(async ({ request }) => {
        const { order: orderId, warehouse_item: item } = await request.json();
        const order = loadOrders().find((o) => String(o.id) === String(orderId));
        if (!order) return notFound();

        const product = findProduct(item?.template);
        const variant = findVariant(product, item?.type);
        if (!variant) {
            return HttpResponse.json({ errors: { warehouse_item: ['Товар не знайдено.'] } }, { status: 400, statusText: 'Bad Request' });
        }
        const sourceId = isSet(item.source) ? Number(item.source) : order.source_id;
        const price = priceFor('warehouse_item_type', variant.id, sourceId);
        if (price === null) {
            // StorageItem.jsx asks to add a price when it sees this key
            return HttpResponse.json(
                { errors: { 'warehouse item price': ['Ціну для цього товару не знайдено.'] } },
                { status: 400, statusText: 'Bad Request' },
            );
        }

        const items = loadOrderProducts();
        const record = {
            id: nextId(items),
            order_id: order.id,
            created: nowIso(),
            warehouse_item: { product_id: product.id, type_id: variant.id, price, source_id: sourceId },
            kit: null,
        };
        items.push(record);
        saveOrderProducts();
        return HttpResponse.json(serializeOrderProduct(record), { status: 201 });
    })),

    http.delete(`${API}/products/order-product/:id/`, withAuth(({ params }) => {
        const record = findOrderProduct(params.id);
        if (!record) return notFound();
        const items = loadOrderProducts();
        items.splice(items.indexOf(record), 1);
        saveOrderProducts();
        return new HttpResponse(null, { status: 204 });
    })),
];
