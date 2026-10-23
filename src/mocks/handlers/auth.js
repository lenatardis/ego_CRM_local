import { http, HttpResponse } from 'msw';
import { API, withAuth, withLatency, notFound } from './utils';
import { findDemoUserByCredentials, findDemoUserById, makeDemoTokens, parseDemoToken } from '../data/demoUsers';

// Response shapes follow what src/api/authApi.js and src/hooks/useUserAuth.js read:
//   POST  users/token/          -> { access, refresh }, or { detail } on bad credentials
//   POST  users/token/refresh/  -> { access }
//   GET   users/                -> the current user
//   PATCH users/:id/            -> the updated user (Profile.jsx checks `id`); the demo keeps the password as is
export const authHandlers = [
    http.post(`${API}/users/token/`, withLatency(async ({ request }) => {
        const { username, password } = await request.json();
        const user = findDemoUserByCredentials(username, password);

        if (!user) {
            return HttpResponse.json({ detail: 'Username or Password is incorrect' }, { status: 401, statusText: 'Unauthorized' });
        }

        return HttpResponse.json(makeDemoTokens(user.id));
    })),

    http.post(`${API}/users/token/refresh/`, withLatency(async ({ request }) => {
        const { refresh } = await request.json();
        const userId = parseDemoToken(refresh, 'refresh');

        if (!userId || !findDemoUserById(userId)) {
            return HttpResponse.json(
                { detail: 'Token is invalid or expired', code: 'token_not_valid' },
                { status: 401, statusText: 'Unauthorized' },
            );
        }

        return HttpResponse.json({ access: makeDemoTokens(userId).access });
    })),

    http.get(`${API}/users/`, withAuth(({ user }) => HttpResponse.json(user.profile))),

    http.patch(`${API}/users/:id/`, withAuth(({ params, user }) => {
        if (String(params.id) !== String(user.id)) return notFound();
        return HttpResponse.json(user.profile);
    })),
];
