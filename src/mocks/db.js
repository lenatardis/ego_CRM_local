// Tiny "database" behind the mock backend (MSW handlers).
//
// Each collection starts from its seed data and is written to localStorage only after a handler
// changes it, so read-only collections are always served straight from the seed and changed ones
// survive page reloads. Everything stays in the visitor's own browser.
//
// Two stores, because the ERP demo runs on the same github.io origin (see ../../CLAUDE.md, "Cross-app contract"):
//   - CRM-private collections under `ego-demo:crm:*`;
//   - collections shared with the ERP (orders, customers, payment bills) under `ego-demo:shared:*`.
//     Their seed is identical in both apps, so whichever app writes first, the other reads the same data.
//     Shared collections are re-read from localStorage on every access: the ERP may change them in another tab.

// Bump when CRM-private seed data or record shapes change: previously stored CRM demo data is then discarded.
const DATA_VERSION = 4;
// Bump together with the ERP (same value in both repos) when shared seed data or record shapes change.
const SHARED_DATA_VERSION = 4;

// localStorage can be unavailable (blocked storage, some private modes): fall back to memory only.
const storage = {
    get(key) {
        try {
            return localStorage.getItem(key);
        } catch {
            return null;
        }
    },
    set(key, value) {
        try {
            localStorage.setItem(key, value);
        } catch (error) {
            console.warn('[demo db] Could not persist demo data:', error);
        }
    },
    removeAll(prefix) {
        try {
            Object.keys(localStorage)
                .filter((key) => key.startsWith(prefix))
                .forEach((key) => localStorage.removeItem(key));
        } catch {
            // nothing stored, nothing to remove
        }
    },
};

const readJson = (key) => {
    try {
        return JSON.parse(storage.get(key));
    } catch {
        return null;
    }
};

const ensureVersion = (prefix, version) => {
    const key = `${prefix}version`;
    if (storage.get(key) !== String(version)) {
        storage.removeAll(prefix);
        storage.set(key, String(version));
    }
};

// --- CRM-private collections -----------------------------------------------------------------

const PREFIX = 'ego-demo:crm:';
ensureVersion(PREFIX, DATA_VERSION);

const cache = {};

/** Returns the live collection: stored state if this browser has one, otherwise a fresh copy of the seed. */
export const getCollection = (name, seed) => {
    if (!(name in cache)) {
        cache[name] = readJson(PREFIX + name) ?? structuredClone(seed);
    }
    return cache[name];
};

/** Persists a collection after a handler has changed it. */
export const saveCollection = (name) => {
    if (name in cache) {
        storage.set(PREFIX + name, JSON.stringify(cache[name]));
    }
};

// --- collections shared with the ERP ---------------------------------------------------------

const SHARED_PREFIX = 'ego-demo:shared:';
ensureVersion(SHARED_PREFIX, SHARED_DATA_VERSION);

/** A fresh copy of a shared collection (stored state, otherwise the seed); change it, then saveSharedCollection. */
export const getSharedCollection = (name, seed) => readJson(SHARED_PREFIX + name) ?? structuredClone(seed);

/** Persists a shared collection after a handler has changed it. */
export const saveSharedCollection = (name, items) => {
    storage.set(SHARED_PREFIX + name, JSON.stringify(items));
};

// --- helpers ---------------------------------------------------------------------------------

/** Next free numeric id in a collection of records. */
export const nextId = (items) => items.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;

/** Drops all CRM-private changes made in this browser (shared data is left to both apps). */
export const resetDemoData = () => {
    storage.removeAll(PREFIX);
    storage.set(`${PREFIX}version`, String(DATA_VERSION));
    Object.keys(cache).forEach((name) => delete cache[name]);
};
