// Company reference data for the public client pages (contacts, callback, payment requisites) and the callback
// requests customers send. The original values came from the backend's admin; the demo uses made-up company
// details (no real phone numbers, bank accounts or tax codes).

import { getCollection, saveCollection, nextId } from '../db';

// GET general/company/ -> [company] (Contacts.jsx reads [0].id, phone, email, site)
export const COMPANY = {
    id: 1,
    phone: '+38 (000) 000-00-00',
    email: 'demo@ego-textile.example',
    site: `${window.location.origin}${process.env.PUBLIC_URL}/`,
};

// GET general/work_schedule/ -> [schedule] (Callback.jsx needs [0].weekend)
export const WORK_SCHEDULE = {
    id: 1,
    working_day: 'Пн - Пт',
    working_hours_start: '09:00',
    working_hours_end: '18:00',
    weekend: 'Сб - Нд',
};

// GET general/call_order/reason/ -> [{ id, name }] ("Звернення у зв'язку з")
export const CALL_REASONS = [
    { id: 1, name: 'Нове замовлення' },
    { id: 2, name: 'Статус замовлення' },
    { id: 3, name: 'Оплата' },
    { id: 4, name: 'Доставка' },
    { id: 5, name: 'Обмін або повернення' },
    { id: 6, name: 'Інше' },
];

// GET general/payment_details/?order= -> [details] (Status.jsx adds ", платіж #<payment id>" to the purpose)
export const PAYMENT_DETAILS = {
    id: 1,
    purpose_of_payment: 'Оплата за текстильні вироби',
    recipient: 'ФОП Демо Ego Textile',
    edrpou_code: '0000000000',
    recipient_bank_account: 'UA000000000000000000000000000',
    entrepreneur_code: '0000 0000 0000 0000',
};

// callback requests from the "Дзвінок" page, CRM-private (no staff page lists them in the original frontend)
export const loadCallOrders = () => getCollection('callOrders', []);

export const addCallOrder = (fields, created) => {
    const list = loadCallOrders();
    const record = { id: nextId(list), created, ...fields };
    list.push(record);
    saveCollection('callOrders');
    return record;
};
