import React from "react";
import {useTranslation} from "react-i18next";
import styles from './LanguageSwitcher.module.scss';
import {LANGUAGES, setLanguage} from "../../../i18n";

// Demo build (2026-11-18): UA / EN switch – start page card and both menus. The choice is shared with the ERP.
// `onRequestSwitch(lang)` (optional): called instead of switching, e.g. to ask first (staff menu, calculator).
const LABELS = {uk: 'UA', en: 'EN'};
const NAMES = {uk: 'Українська', en: 'Англійська'};

const LanguageSwitcher = ({className = '', dark = false, onRequestSwitch}) => {
    const {t, i18n} = useTranslation();

    return (
        <div
            className={`${styles.switcher} ${dark ? styles.dark : ''} ${className}`}
            role="group"
            aria-label={t('Мова')}
        >
            {LANGUAGES.map((lang) => (
                <button
                    key={lang}
                    type="button"
                    lang={lang}
                    className={`${styles.option} ${i18n.language === lang ? styles.active : ''}`}
                    aria-pressed={i18n.language === lang}
                    title={t(NAMES[lang])}
                    onClick={() => {
                        if (lang === i18n.language) return;
                        if (onRequestSwitch) onRequestSwitch(lang);
                        else setLanguage(lang);
                    }}
                >
                    {LABELS[lang]}
                </button>
            ))}
        </div>
    );
};

export default LanguageSwitcher;
