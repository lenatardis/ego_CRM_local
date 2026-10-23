// Local demo users for the portfolio build (the original backend is unavailable).
// CRM users are the sales managers of the shared seed orders (src/mocks/shared/seed.js, SEED_MANAGERS).
// Password is the same as in the ERP demo and satisfies the existing Profile validation (>=10 chars, uppercase).

import { SEED_MANAGERS } from '../shared/seed';

const DEMO_PASSWORD = 'DemoPass123';

const makeUser = (id, username, first_name, last_name) => ({
    id,
    username,
    password: DEMO_PASSWORD,
    // shape of GET users/ as read by account-slice.js (first_name, photo, id, url) and manager objects on orders
    profile: {
        id,
        username,
        first_name,
        last_name,
        middle_name: '',
        email: `${username}@demo.local`,
        photo: null,
        url: null,
    },
});

export const DEMO_USERS = SEED_MANAGERS.map((m) => makeUser(m.id, m.username, m.first_name, m.last_name));

export const findDemoUserByCredentials = (username, password) =>
    DEMO_USERS.find((u) => u.username === username?.trim() && u.password === password) || null;

export const findDemoUserById = (id) =>
    DEMO_USERS.find((u) => String(u.id) === String(id)) || null;

export const makeDemoTokens = (id) => ({
    access: `demo-crm-access-${id}`,
    refresh: `demo-crm-refresh-${id}`,
});

/** User id from a demo token of the given type ('access' | 'refresh'), or null. */
export const parseDemoToken = (token, type) => {
    const match = new RegExp(`^demo-crm-${type}-(\\d+)$`).exec(token || '');
    return match ? match[1] : null;
};
