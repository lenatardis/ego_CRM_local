import { http, HttpResponse } from 'msw';
import { API, withAuth, isSet, notFound } from './utils';
import { nextId } from '../db';
import { loadOrders, nowIso } from '../data/orders';
import {
    COMPONENT_TYPE_LIST, DEMO_COMPONENT_TEMPLATES, FABRIC_TYPE_LIST, KIT_SIZE_LIST, fabricTotalLength,
    findComponentTemplate, findFabric, findKitTemplate, kitOptions, kitTemplatesFor, serializeComponent,
    serializeKitVariant,
} from '../data/catalog';
import {
    computeKitPrice, findOrderProduct, loadOrderProducts, saveOrderProducts, serializeKitForEdit,
} from '../data/orderProducts';

// Kit calculator (src/api/calculatorApi.js, components/AuthorizedPage/Calculator/):
//   GET    calculator/kit/templates/size/[?order_product_id]
//          -> { fabric_types, kit_template_size }; for a saved kit also { kit: [kit], kit_comment, kit_options }
//             with `selected` flags (FabricType.jsx setObject)
//   GET    calculator/kit/templates/?fabric_id&kit_template_size_id[&source_id] -> { kit: [variant], kit_options },
//          404 when there is no kit for the fabric and size ("За вибраними даними комплекту не існує")
//   GET    calculator/kit/components/additional/?page&fabric_id&source_id&search&component_type
//          -> { custom_components, total_pages, component_types }
//   GET    calculator/kit/components/type_templates/ -> [{ id, name, mono_fabric_type }]
//   POST   calculator/kit/            -> { order_product_id, kit_id, price } (Calculator.jsx calcSave)
//   PATCH  calculator/kit/:id/        -> { order_product_id, kit_id, price }
//   POST   calculator/kit/split/ { kit_template_id | kit_id, source_id } -> [{ id, components: [size variants] }]
//   DELETE calculator/kit/components/:id/?kit_id= -> { kit: [kit] }
// Prices follow the order's source (data/catalog.js priceFor). Fabric consumption is sent in cm and
// returned in m (Calculator.jsx shows Math.round(count * 100) cm).

const PAGE_SIZE = 10;

const idList = (v) => (isSet(v) ? String(v).split(',').filter(Boolean).map(Number) : []);
const badRequest = (body) => HttpResponse.json(body, { status: 400, statusText: 'Bad Request' });
const findOrder = (id) => loadOrders().find((o) => String(o.id) === String(id)) || null;
const findKitRecord = (id) => {
    const record = findOrderProduct(id);
    return record?.kit ? record : null;
};
const cmToM = (v) => Math.round(Number(v) || 0) / 100;

const toComponent = (c, isCustom, previous = null) => ({
    component_template_id: Number(c.component_template_id ?? c.id),
    option: Array.isArray(c.option) ? c.option : previous?.option ?? [],
    comment: c.comment !== undefined ? c.comment || null : previous?.comment ?? null,
    custom_size: c.custom_size !== undefined ? c.custom_size || null : previous?.custom_size ?? null,
    mono_fabric_type: c.mono_fabric_type !== undefined ? c.mono_fabric_type || null : previous?.mono_fabric_type ?? null,
    is_custom: isCustom,
});

const kitResponse = (record, status = 200) =>
    HttpResponse.json({ order_product_id: record.id, kit_id: record.id, price: record.kit.price }, { status });

export const calculatorHandlers = [
    http.get(`${API}/calculator/kit/templates/size/`, withAuth(({ request }) => {
        const orderProductId = new URL(request.url).searchParams.get('order_product_id');
        if (!isSet(orderProductId)) {
            return HttpResponse.json({ fabric_types: FABRIC_TYPE_LIST, kit_template_size: KIT_SIZE_LIST });
        }

        const record = findKitRecord(orderProductId);
        if (!record) return notFound();
        const sourceId = findOrder(record.order_id)?.source_id ?? null;
        const fabric = findFabric(record.kit.fabric_id);
        const template = findKitTemplate(record.kit.kit_template_id);
        return HttpResponse.json({
            fabric_types: FABRIC_TYPE_LIST.map((t) => ({ ...t, selected: t.id === fabric?.type.id })),
            kit_template_size: KIT_SIZE_LIST.map((s) => ({ ...s, selected: s.id === template?.kit_size_id })),
            kit: [serializeKitForEdit(record, sourceId)],
            kit_comment: record.kit.comment ?? '',
            kit_options: kitOptions(sourceId, record.kit.option ?? []),
        });
    })),

    http.get(`${API}/calculator/kit/templates/`, withAuth(({ request }) => {
        const q = new URL(request.url).searchParams;
        const fabric = findFabric(q.get('fabric_id'));
        const sourceId = q.get('source_id');
        const templates = fabric ? kitTemplatesFor(fabric, q.get('kit_template_size_id')) : [];
        if (!templates.length) return HttpResponse.json({ detail: 'Комплект не знайдено.' }, { status: 404, statusText: 'Not Found' });
        return HttpResponse.json({
            kit: templates.map((t) => serializeKitVariant(t, fabric, sourceId)),
            kit_options: kitOptions(sourceId),
        });
    })),

    http.get(`${API}/calculator/kit/components/additional/`, withAuth(({ request }) => {
        const q = new URL(request.url).searchParams;
        const types = idList(q.get('component_type'));
        const search = (q.get('search') || '').trim().toLowerCase();
        const list = DEMO_COMPONENT_TEMPLATES
            .filter((c) => !types.length || types.includes(c.type_id))
            .filter((c) => !search || c.name.toLowerCase().includes(search));
        const page = Math.max(1, Number(q.get('page')) || 1);
        return HttpResponse.json({
            custom_components: list
                .slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
                .map((c) => serializeComponent(c, q.get('source_id'), { imageArray: true, extra: { is_custom: true } })),
            total_pages: Math.max(1, Math.ceil(list.length / PAGE_SIZE)),
            component_types: COMPONENT_TYPE_LIST.map(({ id, name }) => ({ id, name })),
        });
    })),

    http.get(`${API}/calculator/kit/components/type_templates/`, withAuth(() => HttpResponse.json(COMPONENT_TYPE_LIST))),

    http.post(`${API}/calculator/kit/split/`, withAuth(async ({ request }) => {
        const body = await request.json();
        let componentIds;
        if (isSet(body.kit_id)) {
            const record = findKitRecord(body.kit_id);
            if (!record) return notFound();
            componentIds = record.kit.components.filter((c) => !c.is_custom).map((c) => c.component_template_id);
        } else {
            const template = findKitTemplate(body.kit_template_id);
            if (!template) return notFound();
            componentIds = template.component_ids;
        }
        // each component can be swapped for another size of the same component type
        return HttpResponse.json(componentIds.map((id) => {
            const component = findComponentTemplate(id);
            const variants = DEMO_COMPONENT_TEMPLATES.filter((c) => c.type_id === component.type_id && c.fabric_type_id === component.fabric_type_id);
            return {
                id,
                components: variants.map((c) => {
                    const s = serializeComponent(c, body.source_id, { imageArray: true });
                    return { id: s.id, name: s.name, price: s.price ?? 0, size: s.size, image: s.image };
                }),
            };
        }));
    })),

    http.post(`${API}/calculator/kit/`, withAuth(async ({ request }) => {
        const body = await request.json();
        const order = findOrder(body.order_id);
        if (!order) return notFound();
        const fabric = findFabric(body.fabric_id);
        if (!fabric || fabricTotalLength(fabric) <= 0) {
            return HttpResponse.json({ detail: 'Залишок тканини дорівнює 0.' }, { status: 404, statusText: 'Not Found' });
        }

        const templateComponents = body.template_components ?? [];
        const kit = {
            fabric_id: fabric.id,
            kit_template_id: templateComponents[0]?.kit_template_id ?? null,
            is_split: !!body.is_split,
            price: 0,
            comment: body.comment || null,
            custom_size: body.custom_size || null,
            option: body.option ?? [],
            additional_fabric_consumption_count: cmToM(body.additional_fabric_consumption_count),
            components: [
                ...templateComponents.map((c) => toComponent(c, false)),
                ...(body.additional_components ?? []).map((c) => toComponent(c, true)),
            ],
        };
        if (!kit.components.length) return badRequest({ errors: { detail: 'Комплект порожній.' } });

        const { price, error } = computeKitPrice(kit, order.source_id);
        if (error) return badRequest({ errors: { component_price: error } });
        kit.price = price;

        const items = loadOrderProducts();
        const record = { id: nextId(items), order_id: order.id, created: nowIso(), warehouse_item: null, kit };
        items.push(record);
        saveOrderProducts();
        return kitResponse(record, 201);
    })),

    http.patch(`${API}/calculator/kit/:id/`, withAuth(async ({ params, request }) => {
        const record = findKitRecord(params.id);
        if (!record) return notFound();
        const body = await request.json();
        const order = findOrder(record.order_id);

        // components keep what the form doesn't send (custom flag, comments) from the saved kit
        const previous = [...record.kit.components];
        const takePrevious = (id) => {
            const index = previous.findIndex((c) => c.component_template_id === Number(id));
            return index === -1 ? null : previous.splice(index, 1)[0];
        };
        const components = [
            ...(body.component ?? []).map((c) => {
                const before = takePrevious(c.original_size_id ?? c.id);
                return toComponent(c, before?.is_custom ?? false, before);
            }),
            ...(body.additional_components ?? []).map((c) => toComponent(c, true)),
        ];

        const kit = {
            ...record.kit,
            fabric_id: isSet(body.new_fabric) ? Number(body.new_fabric) : record.kit.fabric_id,
            is_split: body.is_split ?? record.kit.is_split,
            comment: body.comment !== undefined ? body.comment || null : record.kit.comment,
            custom_size: body.custom_size !== undefined ? body.custom_size || null : record.kit.custom_size,
            option: body.option ?? record.kit.option,
            additional_fabric_consumption_count: body.additional_fabric_consumption_count !== undefined
                ? cmToM(body.additional_fabric_consumption_count)
                : record.kit.additional_fabric_consumption_count,
            components,
        };
        const { price, error } = computeKitPrice(kit, order?.source_id ?? null);
        if (error) return badRequest({ errors: { component_price: error } });

        record.kit = { ...kit, price };
        saveOrderProducts();
        return kitResponse(record);
    })),

    http.delete(`${API}/calculator/kit/components/:id/`, withAuth(({ params, request }) => {
        const record = findKitRecord(new URL(request.url).searchParams.get('kit_id'));
        if (!record) return notFound();
        const index = record.kit.components.findIndex((c) => String(c.component_template_id) === String(params.id));
        if (index === -1) return notFound();

        record.kit.components.splice(index, 1);
        const sourceId = findOrder(record.order_id)?.source_id ?? null;
        const { price } = computeKitPrice(record.kit, sourceId);
        if (price !== undefined) record.kit.price = price;
        saveOrderProducts();
        return HttpResponse.json({ kit: [serializeKitForEdit(record, sourceId)] });
    })),
];
