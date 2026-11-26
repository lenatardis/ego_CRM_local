import React, { useState } from 'react';
import styles from './PageGuide.module.scss';
import { PAGE_GUIDES } from './pageGuides';
import { t } from '../../../i18n';

// Demo build (2026-11-26, at the user's request): what this page is for, and what to try behind a toggle
// (closed on every visit, not remembered). Each staff page renders it under its "Назад": <PageGuide page="main"/>.
const PageGuide = ({ page }) => {
    const [isOpen, setIsOpen] = useState(false);
    const guide = PAGE_GUIDES[page];
    if (!guide) return null;

    return (
        <div className={`${styles.guide} infoNote`}>
            <p className={styles.guide__summary}>{t(guide.summary)}</p>
            <button type="button" className={styles.guide__toggle} aria-expanded={isOpen}
                    onClick={() => setIsOpen((v) => !v)}>
                {t('Що можна спробувати')}
                <span className={`${styles.guide__arrow} ${isOpen ? styles.guide__arrowOpen : ''}`}>▾</span>
            </button>
            {isOpen && (
                <ul className={styles.guide__tips}>
                    {guide.tips.map((tip) => <li key={tip}>{t(tip)}</li>)}
                </ul>
            )}
        </div>
    );
};

export default PageGuide;
