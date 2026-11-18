import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import en from './en';
import {
    DELIVERY_PARSER_HINT,
    DELIVERY_PARSER_HINT_EN,
    ORDER_PARSER_HINT,
    ORDER_PARSER_HINT_EN,
} from '../components/Common/Parser/parserHints';

// Demo build (2026-11-18): English version of the CRM.
// Keys are the original Ukrainian texts: t('Усі замовлення'). Ukrainian needs no dictionary (a missing key is
// shown as is), English is in ./en.js; an English text that's still missing falls back to the Ukrainian one.
// The same works for messages the mock backend sends (`detail`, errors): t(message) translates them.
// The language is shared with the ERP (same origin, same key) and remembered, Ukrainian by default.

export const LANGUAGES = ['uk', 'en'];
export const LANG_STORAGE_KEY = 'ego-demo:lang';
const DEFAULT_LANG = 'uk';

const readStoredLang = () => {
    try {
        const lang = window.localStorage.getItem(LANG_STORAGE_KEY);
        return LANGUAGES.includes(lang) ? lang : DEFAULT_LANG;
    } catch {
        return DEFAULT_LANG;
    }
};

const applyToDocument = (lang) => {
    document.documentElement.lang = lang;
};

i18n
    .use(initReactI18next)
    .init({
        resources: {
            en: {
                translation: {
                    ...en,
                    [ORDER_PARSER_HINT]: ORDER_PARSER_HINT_EN,
                    [DELIVERY_PARSER_HINT]: DELIVERY_PARSER_HINT_EN,
                },
            },
        },
        lng: readStoredLang(),
        fallbackLng: false,
        // Ukrainian sentences contain ':' and '.', so keys are never split into namespaces / nested paths
        keySeparator: false,
        nsSeparator: false,
        returnEmptyString: false,
        interpolation: {escapeValue: false},
        react: {useSuspense: false},
    });

applyToDocument(i18n.language);

export const setLanguage = (lang) => {
    if (!LANGUAGES.includes(lang) || lang === i18n.language) return;
    try {
        window.localStorage.setItem(LANG_STORAGE_KEY, lang);
    } catch {
        // private window / blocked storage: the language just isn't remembered
    }
    i18n.changeLanguage(lang);
};

i18n.on('languageChanged', applyToDocument);

// the ERP (or another CRM tab) switched the language
window.addEventListener('storage', (e) => {
    if (e.key === LANG_STORAGE_KEY && LANGUAGES.includes(e.newValue) && e.newValue !== i18n.language) {
        i18n.changeLanguage(e.newValue);
    }
});

// for code outside React components (api modules, helpers)
export const t = (...args) => i18n.t(...args);

export default i18n;
