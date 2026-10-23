// Order products ("Товар" of an order): warehouse items and kits put together in the calculator. CRM-private
// (`ego-demo:crm:orderProducts`), keyed by the shared order id.
//
// Stored record: { id, order_id, created, warehouse_item, kit } with exactly one of
//   warehouse_item: { product_id, type_id, price, source_id }          (price fixed when added)
//   kit:            { fabric_id, kit_template_id, is_split, price, comment, custom_size, option: [kit option ids],
//                     additional_fabric_consumption_count (m),
//                     components: [{ component_template_id, option, comment, custom_size, mono_fabric_type, is_custom }] }
// The kit's own id is the order product id (calculator/kit/:id/, ?kit_id=).
//
// Seed: every shared seed order gets a cart whose prices add up to its payment.amount — the Products page
// recomputes the order's amount from its cart (Products.jsx), so an empty cart would zero seed orders.

import { getCollection, saveCollection, nextId } from '../db';
import { SEED_ORDERS, SEED_SOURCES, mulberry32 } from '../shared/seed';
import {
    DEMO_FABRICS, DEMO_PRODUCTS, componentOptions, componentPrice, fabricTotalLength, findComponentTemplate,
    findFabric, findKitTemplate, findProduct, findVariant, kitOptions, kitSizeName, kitTemplatePrice,
    priceFor, productTypeOfFabric, serializeComponent, serializeFabric, sizeLabel, DEMO_KIT_TEMPLATES,
} from './catalog';

// --- seed ------------------------------------------------------------------------------------

const buildSeed = () => {
    const rand = mulberry32(24102026);
    const pick = (arr) => arr[Math.floor(rand() * arr.length)];
    const roundTo10 = (n) => Math.round(n / 10) * 10;

    const kitFabrics = DEMO_FABRICS.filter((f) => productTypeOfFabric(f) && fabricTotalLength(f) > 0);
    const variants = DEMO_PRODUCTS.flatMap((p) => p.types.filter((t) => t.quantity > 0).map((t) => ({ product: p, type: t })));

    const items = [];
    const add = (order, fields) => items.push({ id: items.length + 1, order_id: order.id, created: order.created, warehouse_item: null, kit: null, ...fields });

    const makeKit = (price) => {
        const fabric = pick(kitFabrics);
        const template = pick(DEMO_KIT_TEMPLATES.filter((t) => t.fabric_type_id === productTypeOfFabric(fabric)));
        return {
            fabric_id: fabric.id,
            kit_template_id: template.id,
            is_split: false,
            price,
            comment: null,
            custom_size: null,
            option: rand() < 0.2 ? [pick([1, 2, 4])] : [],
            additional_fabric_consumption_count: Number(template.additional_fabric_consumption_price || 0) / 10,
            components: template.component_ids.map((id) => ({
                component_template_id: id, option: [], comment: null, custom_size: null, mono_fabric_type: null, is_custom: false,
            })),
        };
    };

    SEED_ORDERS.forEach((order) => {
        let left = Math.round(Number(order.payment?.amount) || 0);
        if (left <= 0) return;

        // a pillow / blanket from the warehouse now and then, at its price for the order's source
        if (rand() < 0.3) {
            const { product, type } = pick(variants);
            const price = priceFor('warehouse_item_type', type.id, order.source_id);
            if (price && price <= left - 500) {
                add(order, { warehouse_item: { product_id: product.id, type_id: type.id, price, source_id: order.source_id } });
                left -= price;
            }
        }
        // the rest is bedding: one kit, or two for bigger orders; kit prices include options and custom work
        if (left > 3000 && rand() < 0.35) {
            const first = roundTo10(left * (0.4 + rand() * 0.2));
            add(order, { kit: makeKit(first) });
            left -= first;
        }
        add(order, { kit: makeKit(left) });
    });
    return items;
};

let seedCache = null;
const seed = () => (seedCache ??= buildSeed());

export const loadOrderProducts = () => getCollection('orderProducts', seed());
export const saveOrderProducts = () => saveCollection('orderProducts');

export const findOrderProduct = (id) => loadOrderProducts().find((p) => String(p.id) === String(id)) || null;

export const itemCountsOf = (orderId, items = loadOrderProducts()) => {
    const own = items.filter((p) => p.order_id === orderId);
    return {
        warehouse_item_count: own.filter((p) => p.warehouse_item).length,
        kit_count: own.filter((p) => p.kit).length,
    };
};

/** Copies an order's products to another order (duplicate order). */
export const copyOrderProducts = (fromOrderId, toOrderId, created) => {
    const items = loadOrderProducts();
    items.filter((p) => p.order_id === fromOrderId).forEach((p) => {
        items.push({ ...structuredClone(p), id: nextId(items), order_id: toOrderId, created });
    });
    saveOrderProducts();
};

/** Drops the products of removed orders. */
export const deleteOrderProductsOf = (orderIds) => {
    const items = loadOrderProducts();
    items.splice(0, items.length, ...items.filter((p) => !orderIds.has(p.order_id)));
    saveOrderProducts();
};

// --- kit pricing -----------------------------------------------------------------------------

const optionSum = (options, ids) => options.filter((o) => ids.includes(o.id)).reduce((s, o) => s + (o.price ?? 0), 0);

/**
 * Price of a kit for an order source, as the calculator shows it (Calculator.jsx displayPrice): the template's
 * price, or the sum of its components once it is split; plus added components and all chosen options.
 * Returns { price } or { error } when something has no price in the pricelists.
 */
export const computeKitPrice = (kit, sourceId) => {
    const missing = [];
    const priceOf = (value, name) => {
        if (value === null || value === undefined) missing.push(name);
        return value ?? 0;
    };

    let price = 0;
    const template = findKitTemplate(kit.kit_template_id);
    if (!kit.is_split && template) price += priceOf(kitTemplatePrice(template.id, sourceId), template.name);

    kit.components.forEach((c) => {
        const tpl = findComponentTemplate(c.component_template_id);
        if (!tpl) return;
        if (kit.is_split || c.is_custom || !template) price += priceOf(componentPrice(tpl.id, sourceId), tpl.name);
        price += optionSum(componentOptions(tpl.type_id, sourceId), c.option ?? []);
    });
    price += optionSum(kitOptions(sourceId), kit.option ?? []);

    if (missing.length) {
        return { error: `Не вказана ціна в списку цін: ${missing.join(', ')}` };
    }
    return { price };
};

// --- response shapes -------------------------------------------------------------------------

const sourceRef = (id) => {
    const s = SEED_SOURCES.find((x) => String(x.id) === String(id));
    return s ? { id: s.id, name: s.name } : null;
};

/** A cart line as GET products/order-product/ returns it (Common/ProductItem/ProductItem.jsx). */
export const serializeOrderProduct = (p) => {
    const base = { id: p.id, order: p.order_id, created: p.created, warehouse_item: null, kit: null, manufacturing: null };

    if (p.warehouse_item) {
        const product = findProduct(p.warehouse_item.product_id);
        const variant = findVariant(product, p.warehouse_item.type_id);
        return {
            ...base,
            warehouse_item: {
                id: variant?.id ?? p.warehouse_item.type_id,
                template_id: product?.id,
                name: product?.name ?? '',
                image: product?.images[0] ?? '',
                quantity: variant?.quantity ?? 0,
                size: variant ? sizeLabel(variant.size) : '',
                color: variant?.color.name ?? '',
                price: p.warehouse_item.price,
                comment: null,
                source: sourceRef(p.warehouse_item.source_id),
            },
        };
    }

    const { kit } = p;
    const template = findKitTemplate(kit.kit_template_id);
    const fabric = findFabric(kit.fabric_id);
    return {
        ...base,
        kit: {
            id: p.id,
            name: template?.name ?? 'Комплект',
            fabric_image: fabric?.images[0] ?? '',
            price: kit.price,
            fabric: fabric?.name ?? '',
            type: template ? kitSizeName(template) : '',
            component: kit.components.map((c) => {
                const tpl = findComponentTemplate(c.component_template_id);
                return { id: c.component_template_id, name: c.custom_size ? `${tpl?.name ?? ''} (${c.custom_size})` : tpl?.name ?? '' };
            }),
            option: kitOptions(null).filter((o) => (kit.option ?? []).includes(o.id)).map(({ id, name }) => ({ id, name })),
            comment: kit.comment,
        },
    };
};

/** A saved kit as the calculator edit view reads it (createProduct(order_product_id) -> kit[0]). */
export const serializeKitForEdit = (p, sourceId) => {
    const { kit } = p;
    const template = findKitTemplate(kit.kit_template_id);
    const fabric = findFabric(kit.fabric_id);
    const templatePrice = template ? kitTemplatePrice(template.id, sourceId) ?? 0 : 0;
    return {
        id: p.id,
        name: template?.name ?? '',
        short_name: template?.short_name ?? '',
        price: kit.price,
        starting_price: templatePrice,
        is_split: kit.is_split,
        template_size: { id: template?.id ?? null },
        fabric: fabric ? serializeFabric(fabric) : null,
        additional_fabric_consumption_count: kit.additional_fabric_consumption_count ?? 0,
        components: kit.components.map((c) => serializeComponent(findComponentTemplate(c.component_template_id), sourceId, {
            selectedOptionIds: c.option ?? [],
            extra: {
                is_custom: !!c.is_custom,
                comment: c.comment ?? null,
                custom_size: c.custom_size ?? null,
                ...(c.mono_fabric_type ? { mono_fabric_type: c.mono_fabric_type } : {}),
            },
        })),
    };
};
