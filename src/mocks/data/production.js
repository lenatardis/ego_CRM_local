// Production status of order items, owned by the ERP (../../../CLAUDE.md, "Cross-app contract"): the shared
// `production` collection holds one record per ERP manufacturing order — { id, order_id, order_product_id, status } —
// seeded from SEED_PRODUCTION and updated by the ERP as its orders move through production. The CRM only reads it:
// a cart line's "Статус виробництва" (ProductItem `manufacturing: { id, status }`) and the delete guard.
// In the demo only seed orders are in production: the CRM's "На виробництво" button is commented out in the original.

import { getSharedCollection } from '../db';
import { SEED_PRODUCTION } from '../shared/seed';

const PRODUCTION_SEED = SEED_PRODUCTION.map(({ id, order_id, order_product_id, status }) => ({ id, order_id, order_product_id, status }));

// the ERP's labels for its manufacturing statuses (ego_ERP_local src/components/Order/Order.jsx ORDER_STATUS_LABELS)
const STATUS_LABELS = {
    AWAITING_CUTTING: 'Очікує крійки',
    ON_CUT: 'На крійці',
    AWAITING_SEWING: 'Очікує пошиття',
    ON_SEWING: 'На пошитті',
    AWAITING_PACKAGING: 'Очікує пакування',
    ON_PACKAGING: 'На пакуванні',
    SHIPMENT_READY: 'Готово до відправки',
    DELIVERED: 'Доставлено',
};

export const loadProduction = () => getSharedCollection('production', PRODUCTION_SEED);

/** A cart line's `manufacturing` field: { id, status } of its ERP manufacturing order, or null. */
export const manufacturingOf = (orderProductId, production = loadProduction()) => {
    const record = production.find((p) => p.order_product_id === orderProductId);
    return record ? { id: record.id, status: STATUS_LABELS[record.status] ?? record.status } : null;
};
