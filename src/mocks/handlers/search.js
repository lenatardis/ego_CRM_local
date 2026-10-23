import { http, HttpResponse } from 'msw';
import { API, withAuth } from './utils';
import { byNewest, loadCustomers, loadOrders, serializeOrders } from '../data/orders';
import { findSource, loadSources } from '../data/sources';
import { loadOrderProducts } from '../data/orderProducts';
import { findFabric, findKitTemplate, findProduct } from '../data/catalog';

// Global search on the main page (src/api/searchApi.js, Main/OrderSearchFilters.jsx):
//   GET search/?query&is_order&is_fabric&is_warehouse_item&page
//     -> { orders: { items: [order as in the order list], current_page, total_pages },
//          filter: { is_order, is_fabric, is_warehouse_item } }
// The results are always orders (they replace the order list); the three toggles choose where the query is
// looked for: the order itself ("Замовлення": number, customer, phone, comment, source), its kits
// ("Тканини": fabric code, fabric type, kit name — the cart shows kits by name) and the stock items in its
// cart ("Склад"). `filter` echoes the toggles back — the page shows the toggle buttons from it. Every word of the
// query must match; phone numbers match by digits (the query arrives unencoded, so a typed "+" reaches the server
// as a space).

const PAGE_SIZE = 10;

const normalize = (text) => String(text ?? '').toLowerCase().replace(/ё/g, 'е');
const digits = (text) => String(text ?? '').replace(/\D/g, '');

const orderText = (order, customers, sources) => {
    const customer = customers.find((c) => c.id === order.customer_id);
    const source = findSource(order.source_id, sources);
    return [
        `#${order.id}`, order.id, order.comment, source?.name,
        customer && [customer.first_name, customer.last_name, customer.middle_name, customer.username, customer.phone, digits(customer.phone)],
    ].flat(2).filter(Boolean).join(' ');
};

const cartText = (orderId, cart, scope) => cart
    .filter((p) => p.order_id === orderId)
    .map((p) => {
        if (scope === 'fabric') {
            if (!p.kit) return null;
            const fabric = findFabric(p.kit.fabric_id);
            return [fabric?.name, fabric?.type.type, findKitTemplate(p.kit.kit_template_id)?.name].filter(Boolean).join(' ');
        }
        return p.warehouse_item ? findProduct(p.warehouse_item.product_id)?.name : null;
    })
    .filter(Boolean)
    .join(' ');

export const searchHandlers = [
    http.get(`${API}/search/`, withAuth(({ request }) => {
        const params = new URL(request.url).searchParams;
        const flag = (key) => params.get(key) !== 'false';
        const filter = { is_order: flag('is_order'), is_fabric: flag('is_fabric'), is_warehouse_item: flag('is_warehouse_item') };
        const words = normalize(params.get('query')).split(/\s+/).filter(Boolean);

        const orders = loadOrders();
        const customers = loadCustomers();
        const sources = loadSources();
        const cart = loadOrderProducts();
        const found = words.length === 0 ? [] : orders.filter((order) => {
            const text = normalize([
                filter.is_order && orderText(order, customers, sources),
                filter.is_fabric && cartText(order.id, cart, 'fabric'),
                filter.is_warehouse_item && cartText(order.id, cart, 'warehouse'),
            ].filter(Boolean).join(' '));
            return words.every((word) => text.includes(word));
        }).sort(byNewest);

        const totalPages = Math.max(1, Math.ceil(found.length / PAGE_SIZE));
        const page = Math.min(Math.max(1, Number(params.get('page')) || 1), totalPages);
        return HttpResponse.json({
            orders: {
                items: serializeOrders(found.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), orders),
                current_page: page,
                total_pages: totalPages,
                count: found.length,
            },
            filter,
        });
    })),
];
