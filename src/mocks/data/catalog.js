// ERP-owned catalog as the CRM reads it: fabrics, warehouse items (finished products), calculator templates
// and their prices for an order source. Built from the catalog seed shared with the ERP (../shared/catalog/,
// identical in both repos) and served read-only (workspace CLAUDE.md, "Cross-app contract"); catalog
// changes made in the ERP demo are not visible here.

import { DEMO_FABRICS, FABRIC_TAGS, FABRIC_TYPES } from '../shared/catalog/fabrics';
import { DEMO_PRODUCTS, PRODUCT_CATEGORIES } from '../shared/catalog/products';
import {
    DEMO_COMPONENT_OPTION_TEMPLATES, DEMO_COMPONENT_TEMPLATES, DEMO_COMPONENT_TYPES, DEMO_KIT_OPTION_TEMPLATES,
    DEMO_KIT_SIZES, DEMO_KIT_TEMPLATES,
} from '../shared/catalog/calculatorTemplates';
// prices.js also runs the fabric arrivals seed, which adds rolls / units to the fabrics and products above,
// so the remainders here are the ones the ERP demo starts with
import { COMPONENT_WORK } from '../shared/catalog/prices';
import { fabricTotalLength, priceFor, productTypeOfFabric } from '../shared/catalog/pricing';

export { DEMO_FABRICS, DEMO_PRODUCTS, DEMO_KIT_TEMPLATES, DEMO_COMPONENT_TEMPLATES, DEMO_KIT_SIZES };

export const findFabric = (id) => DEMO_FABRICS.find((f) => String(f.id) === String(id)) || null;
export const findProduct = (id) => DEMO_PRODUCTS.find((p) => String(p.id) === String(id)) || null;
export const findKitTemplate = (id) => DEMO_KIT_TEMPLATES.find((k) => String(k.id) === String(id)) || null;
export const findComponentTemplate = (id) => DEMO_COMPONENT_TEMPLATES.find((c) => String(c.id) === String(id)) || null;
const findKitSize = (id) => DEMO_KIT_SIZES.find((s) => s.id === id) || null;
const findComponentType = (id) => DEMO_COMPONENT_TYPES.find((t) => t.id === id) || null;

// --- prices ----------------------------------------------------------------------------------
// priceFor(owner, id, sourceId): source pricelist -> default list -> null; and the fabric -> product type link
// for kits. Both shared with the seed, which prices the seed orders' carts the same way (../shared/catalog/pricing.js).

export { priceFor, productTypeOfFabric, fabricTotalLength };

// --- fabrics ---------------------------------------------------------------------------------

const fabricTypeImage = (typeId) => DEMO_FABRICS.find((f) => f.type.id === typeId)?.images[0] ?? '';

/** Fabric types with an image (a fabric of that type), as the Fabrics page filter and the calculator show them. */
export const FABRIC_TYPE_LIST = FABRIC_TYPES.map(({ id, type }) => ({ id, type, image: fabricTypeImage(id) }));

export const FABRIC_TAG_LIST = FABRIC_TAGS;

/** A fabric as GET products/fabric/ lists it (FabricItem.jsx; the calculator uses it as the kit's fabric). */
export const serializeFabric = (f) => ({
    id: f.id,
    name: f.name,
    code: f.name,
    description: f.description,
    type: { id: f.type.id, type: f.type.type },
    type_id: f.type.id,
    tags: f.tags,
    mono_fabric_type: f.mono_fabric_type,
    is_available: f.is_available,
    images: f.images,
    image: f.images[0] ?? '',
    total_length: fabricTotalLength(f),
});

/** Fabric meters a kit template takes (ERP cost seed: meters per component + the template's extra consumption). */
export const kitTemplateMeters = (t) =>
    t.component_ids.reduce((sum, id) => sum + (COMPONENT_WORK[id]?.meters ?? 1), 0) + Number(t.additional_fabric_consumption_price || 0) / 10;

/**
 * Kit templates a fabric is sewn into (public fabric card), with the default price and how many kits its
 * remainder is enough for; templates without a price aren't offered to customers.
 */
export const availableKitTemplates = (fabric) => {
    const productType = productTypeOfFabric(fabric);
    return DEMO_KIT_TEMPLATES
        .filter((t) => t.fabric_type_id === productType)
        .map((t) => ({
            id: t.id,
            name: t.name,
            price: priceFor('kit_template', t.id, null),
            count: Math.floor(fabricTotalLength(fabric) / kitTemplateMeters(t)),
        }))
        .filter((t) => t.price !== null);
};

// --- warehouse items -------------------------------------------------------------------------

export const CATEGORY_LIST = PRODUCT_CATEGORIES;

export const findVariant = (product, typeId) => product?.types.find((t) => String(t.id) === String(typeId)) || null;

export const sizeLabel = (size) => `${size.width}x${size.length}`;

/**
 * Sizes of a product with their colors, as StorageItem.jsx / UserPage/Fabric.jsx read them. `price` is
 * { sell_price } (or null without a price) in lists — the storage popup reads price.sell_price — and a plain
 * number on the public product card.
 */
const productSizes = (product, sourceId, plainPrice) => {
    const sizes = [];
    product.types.forEach((t) => {
        let size = sizes.find((s) => s.size_id === t.size.id);
        if (!size) {
            size = { size_id: t.size.id, width: t.size.width, length: t.size.length, colors: [] };
            sizes.push(size);
        }
        const price = priceFor('warehouse_item_type', t.id, sourceId);
        size.colors.push({
            color_id: t.color.id,
            // StorageItem.jsx paints the swatch with `name` as a CSS color
            name: t.color.hex,
            type_id: t.id,
            quantity: t.quantity,
            price: plainPrice ? price : (price === null ? null : { sell_price: price }),
        });
    });
    // the public card (plain prices) shows customers only the variants that have a price
    return plainPrice
        ? sizes.map((s) => ({ ...s, colors: s.colors.filter((c) => c.price !== null) })).filter((s) => s.colors.length)
        : sizes;
};

export const serializeWarehouseItem = (product, sourceId, { plainPrice = false } = {}) => ({
    id: product.id,
    name: product.name,
    category: product.category,
    type: { id: product.category.id, type: product.category.name },
    images: product.images,
    sizes: productSizes(product, sourceId, plainPrice),
});

export const productInStock = (product) => product.types.some((t) => t.quantity > 0);

// --- calculator ------------------------------------------------------------------------------

export const KIT_SIZE_LIST = DEMO_KIT_SIZES.map(({ id, name, short_name }) => ({ id, name, short_name }));

/** Component types with their A/B fabric layout (GET calculator/kit/components/type_templates/). */
export const COMPONENT_TYPE_LIST = DEMO_COMPONENT_TYPES.map(({ id, name, mono_fabric_type, image }) => ({
    id, name, mono_fabric_type, image,
}));

// The calculator marks a missing price with 0 (FabricSizeSecond / ComponentsList / FabricSetItemOptions disable
// zero-priced kits, components and options), unlike the storage popup, which expects null.
const calcPrice = (value) => value ?? 0;

const withSelected = (item, selectedIds) => (selectedIds ? { ...item, selected: selectedIds.includes(item.id) } : item);

/** Options of a component type; `selectedIds` adds `selected` flags (kit edit). */
export const componentOptions = (typeId, sourceId, selectedIds = null) => DEMO_COMPONENT_OPTION_TEMPLATES
    .filter((o) => o.type_id === typeId)
    .map((o) => withSelected({
        id: o.id, name: o.name, description: o.description, price: calcPrice(priceFor('component_option_template', o.id, sourceId)),
    }, selectedIds));

export const kitOptions = (sourceId, selectedIds = null) => DEMO_KIT_OPTION_TEMPLATES.map((o) => withSelected({
    id: o.id, name: o.name, description: o.description, image: o.image, price: calcPrice(priceFor('kit_option_template', o.id, sourceId)),
}, selectedIds));

export const componentPrice = (componentId, sourceId) => priceFor('kit_component_template', componentId, sourceId);
export const kitTemplatePrice = (templateId, sourceId) => priceFor('kit_template', templateId, sourceId);

/**
 * A component template as the calculator reads it. `image` is a string in kits (FabricSizeSecond.jsx
 * passes it on as an <img> src) and an array in the additional-components list and split groups.
 */
export const serializeComponent = (c, sourceId, { imageArray = false, selectedOptionIds = null, extra = {} } = {}) => ({
    id: c.id,
    name: c.name,
    short_name: c.short_name,
    price: calcPrice(componentPrice(c.id, sourceId)),
    size: imageArray ? c.size : { name: c.size },
    image: imageArray ? [c.image] : c.image,
    type_id: c.type_id,
    mono_fabric_type: findComponentType(c.type_id)?.mono_fabric_type ?? null,
    options: componentOptions(c.type_id, sourceId, selectedOptionIds),
    is_custom: false,
    ...extra,
});

/** A kit template for a fabric (GET calculator/kit/templates/ "kit" items). */
export const serializeKitVariant = (t, fabric, sourceId) => {
    const price = kitTemplatePrice(t.id, sourceId);
    return {
        id: t.id,
        name: t.name,
        short_name: t.short_name,
        image: t.image,
        price: price ?? 0,
        starting_price: price ?? 0,
        kit_size: findKitSize(t.kit_size_id),
        fabric: serializeFabric(fabric),
        additional_fabric_consumption_count: Number(t.additional_fabric_consumption_price || 0) / 10,
        components: t.component_ids.map((id) => serializeComponent(findComponentTemplate(id), sourceId)),
    };
};

export const kitTemplatesFor = (fabric, kitSizeId) => {
    const productType = productTypeOfFabric(fabric);
    return DEMO_KIT_TEMPLATES.filter((t) => t.fabric_type_id === productType && String(t.kit_size_id) === String(kitSizeId));
};

export const kitSizeName = (t) => findKitSize(t.kit_size_id)?.name ?? '';
