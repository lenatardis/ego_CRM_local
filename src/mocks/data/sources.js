// Order (lead) sources, owned by the ERP (../../../CLAUDE.md, "Cross-app contract"): the ERP's Sources page edits
// the shared `sources` collection (seed: the shared catalog's DEMO_SOURCES), the CRM only reads it — re-read on every
// access, because the ERP may change it in another tab. A deleted source (`deleted_at`) is no longer offered for
// orders, but the orders that have it keep showing it ("Існуючі замовлення збережуть джерело", the ERP's warning).

import { getSharedCollection } from '../db';
import { DEMO_SOURCES } from '../shared/catalog/pricelists';

export const loadSources = () => getSharedCollection('sources', DEMO_SOURCES);

/** GET orders/source/: the sources a manager can pick for an order. */
export const activeSources = () => loadSources()
    .filter((s) => !s.deleted_at)
    .sort((a, b) => a.id - b.id)
    .map(({ id, name }) => ({ id, name }));

/** { id, name } of any source, deleted ones included (an order keeps its source), or null. */
export const findSource = (id, sources = loadSources()) => {
    const source = sources.find((s) => String(s.id) === String(id));
    return source ? { id: source.id, name: source.name } : null;
};

export const isActiveSource = (id) => loadSources().some((s) => String(s.id) === String(id) && !s.deleted_at);
