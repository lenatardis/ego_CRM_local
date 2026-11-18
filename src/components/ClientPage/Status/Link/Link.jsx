import React from "react";
import styles from './Link.module.scss'
import { t } from '../../../../i18n';

const Link = ({ receiptUrl }) => {
    return (
        <a className={styles.link} href={receiptUrl} target="_blank">{t('Посилання на чек')}</a>
    )
}

export default Link;