import { HttpResponse, delay } from 'msw';
import { findDemoUserById, parseDemoToken } from '../data/demoUsers';

// Same path the API layer uses (src/api/apiConfig.js baseUrl, without the trailing slash).
export const API = '/api/v1';

// Small artificial latency so loaders behave as with a real server.
const LATENCY_MS = 250;

/** The demo user behind the request's bearer token, or null. */
export const getRequestUser = (request) => {
    const header = request.headers.get('Authorization') || '';
    const id = header.startsWith('Bearer ') ? parseDemoToken(header.slice(7), 'access') : null;
    return id ? findDemoUserById(id) : null;
};

// Most API functions detect an expired token by `response.statusText === 'Unauthorized'`, some by status 401.
export const unauthorized = () =>
    HttpResponse.json(
        { detail: 'Given token not valid for any token type' },
        { status: 401, statusText: 'Unauthorized' },
    );

export const notFound = () => HttpResponse.json({ detail: 'Not found.' }, { status: 404, statusText: 'Not Found' });

/** Wraps a resolver: adds latency and rejects requests without a valid demo access token. */
export const withAuth = (resolver) => async (info) => {
    await delay(LATENCY_MS);
    const user = getRequestUser(info.request);
    if (!user) return unauthorized();
    return resolver({ ...info, user });
};

/** Adds latency only (for public endpoints: login, token refresh, client pages). */
export const withLatency = (resolver) => async (info) => {
    await delay(LATENCY_MS);
    return resolver(info);
};

export const isSet = (v) => v !== undefined && v !== null && String(v).trim() !== '';

/** "true" / "false" query param -> boolean, anything else -> undefined. */
export const toBoolOrUndefined = (v) => (v === 'true' ? true : v === 'false' ? false : undefined);

/** DRF-style page: { count, next, previous, results }. */
export const paginate = (items, page, pageSize) => {
    const size = Math.max(1, Number(pageSize) || 10);
    const current = Math.max(1, Number(page) || 1);
    const start = (current - 1) * size;
    return {
        count: items.length,
        next: start + size < items.length ? current + 1 : null,
        previous: current > 1 ? current - 1 : null,
        results: items.slice(start, start + size),
    };
};
