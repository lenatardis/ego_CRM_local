// Mock backend for the portfolio build: the original API is unavailable, so requests made by
// src/api/* are answered in the browser by MSW (Mock Service Worker) using the handlers below.
// Requests without a handler are reported in the console and are not mocked.
import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);

export const startMockBackend = () =>
    worker.start({
        // PUBLIC_URL keeps the worker reachable when the app is served from a sub-path (GitHub Pages)
        serviceWorker: { url: `${process.env.PUBLIC_URL}/mockServiceWorker.js` },
        // only API calls are worth a warning (assets, fonts, dev-server requests pass through silently)
        onUnhandledRequest(request, print) {
            if (new URL(request.url).pathname.includes('/api/v1/')) print.warning();
        },
    });
