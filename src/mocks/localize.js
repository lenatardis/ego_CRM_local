import { HttpResponse } from 'msw';
import i18n from '../i18n';
import { localizeCatalogText } from './shared/catalog/en';

// Demo build (2026-11-18): the mock server answers in the visitor's language, as a localized backend would.
// In English, catalog names in JSON responses (fabrics, products, kit templates, components, options, sizes,
// order sources) are translated – only under these keys, so people, addresses and comments stay as entered.
// Delivery (Nova Poshta directory, waybills) is left out: it holds real Ukrainian addresses.
// Messages the mocks send are translated where they are made (t() in the handlers).

const LOCALIZED_KEYS = new Set([
    'name', 'type', 'short_name', 'kit_type', 'fabric_type', 'category', 'color', 'description', 'title', 'value',
]);
const SKIPPED_PATHS = ['/delivery/'];

const localizeDeep = (value, key) => {
    if (Array.isArray(value)) return value.map((item) => localizeDeep(item, key));
    if (value && typeof value === 'object') {
        return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, localizeDeep(v, k)]));
    }
    return LOCALIZED_KEYS.has(key) ? localizeCatalogText(value) : value;
};

/** The response with catalog names in the current language (unchanged in Ukrainian and for non-JSON). */
export const localizeResponse = async (response, request) => {
    if (i18n.language !== 'en' || !(response instanceof Response)) return response;
    if (SKIPPED_PATHS.some((path) => new URL(request.url).pathname.includes(path))) return response;
    if (!(response.headers.get('Content-Type') || '').includes('application/json')) return response;
    const body = await response.clone().json().catch(() => undefined);
    if (body === undefined) return response;
    return HttpResponse.json(localizeDeep(body), {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
    });
};
