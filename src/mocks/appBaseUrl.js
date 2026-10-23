// Base URL of this app (`homepage` in package.json, '/ego_CRM_local/' on GitHub Pages), with a trailing slash.
// The catalog seed shared with the ERP (shared/catalog/) builds demo media URLs from it; the ERP has its own
// version of this file, so the shared files themselves stay identical and free of bundler globals.
export const APP_BASE_URL = `${process.env.PUBLIC_URL}/`;
