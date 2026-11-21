import { t } from '../i18n';

// Demo build (at the user's request): a fully paid order can't go back to "В обробці", so instead of telling to change
// its status the pages say why it is locked, by where the order is now. `fallback`: a paid order not in production yet.
export const getPaidOrderNote = (order, fallback) => {
    if (order?.payment?.status !== "PAID") return null;
    switch (order?.status) {
        case "IN_PRODUCTION":
            return t('Замовлення в процесі виготовлення не підлягає редагуванню');
        case "SHIPMENT_READY":
            return t('Замовлення готове до відправки і не підлягає редагуванню');
        case "DELIVERED":
            return t('Замовлення доставлено і не підлягає редагуванню');
        default:
            return fallback;
    }
};
