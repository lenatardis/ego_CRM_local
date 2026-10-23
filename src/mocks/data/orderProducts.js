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
// Seed: SEED_ORDER_PRODUCTS from the shared seed — the seed orders' amounts, bills and bank payments are
// derived from these carts, priced like the CRM prices them (the Products page recomputes the order's
// amount from its cart, Products.jsx, so they must agree).

import { getCollection, saveCollection, nextId } from '../db';
import { SEED_ORDER_PRODUCTS, SEED_SOURCES } from '../shared/seed';
import {
    componentOptions, componentPrice, findComponentTemplate, findFabric, findKitTemplate, findProduct, findVariant,
    kitOptions, kitSizeName, kitTemplatePrice, serializeComponent, serializeFabric, sizeLabel,
} from './catalog';
import { manufacturingOf } from './production';

// --- seed: the carts of the shared seed orders (../shared/seed.js), whose totals the order amounts are --

export const loadOrderProducts = () => getCollection('orderProducts', SEED_ORDER_PRODUCTS);
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
    // `manufacturing`: the ERP's production of this line, if any (./production.js)
    const base = { id: p.id, order: p.order_id, created: p.created, warehouse_item: null, kit: null, manufacturing: manufacturingOf(p.id) };

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
