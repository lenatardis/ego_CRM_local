import { http, HttpResponse } from 'msw';
import { API, withLatency } from './utils';
import { CALL_REASONS, COMPANY, PAYMENT_DETAILS, WORK_SCHEDULE, addCallOrder } from '../data/general';
import { nowIso } from '../data/orders';

// Public reference endpoints of the client pages (src/api/generalApi.js), sent without a token:
//   GET  general/company/                  -> [company]       (Contacts.jsx)
//   GET  general/work_schedule/            -> [schedule]      (Callback.jsx)
//   GET  general/call_order/reason/        -> [{ id, name }]  (CallbackForm.jsx)
//   POST general/call_order/ { name, phone, reason: [id] } -> the request (400 { errors } when incomplete)
//   GET  general/payment_details/?order=   -> [requisites]    (Status.jsx, IBAN bills)

const PHONE = /^\+380\d{9}$/;

export const generalHandlers = [
    http.get(`${API}/general/company/`, withLatency(() => HttpResponse.json([COMPANY]))),

    http.get(`${API}/general/work_schedule/`, withLatency(() => HttpResponse.json([WORK_SCHEDULE]))),

    http.get(`${API}/general/call_order/reason/`, withLatency(() => HttpResponse.json(CALL_REASONS))),

    http.get(`${API}/general/payment_details/`, withLatency(() => HttpResponse.json([PAYMENT_DETAILS]))),

    http.post(`${API}/general/call_order/`, withLatency(async ({ request }) => {
        const { name, phone, reason } = await request.json();
        const errors = {};
        if (!String(name ?? '').trim()) errors.name = ["Це поле обов'язкове."];
        if (!PHONE.test(String(phone ?? ''))) errors.phone = ['Введіть номер у форматі +380XXXXXXXXX.'];
        const reasons = Array.isArray(reason) ? reason.map(Number) : [];
        if (!reasons.length || reasons.some((id) => !CALL_REASONS.some((r) => r.id === id))) {
            errors.reason = ['Оберіть причину звернення.'];
        }
        if (Object.keys(errors).length) {
            return HttpResponse.json({ errors }, { status: 400, statusText: 'Bad Request' });
        }
        const record = addCallOrder({ name: name.trim(), phone, reason: reasons }, nowIso());
        return HttpResponse.json(record, { status: 201 });
    })),
];
