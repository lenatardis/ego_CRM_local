import React from "react";
import styles from './SentToProduction.module.scss';
import doneIcon from "../../../../assets/icons/done.svg";
import { t } from '../../../../i18n';

const SentToProduction = () => {

    return (
        <div className={styles.sent}>
            <img src={doneIcon} className={styles.sent__check} alt=""/>
            <h2>{t('Відправлено на виробництво')}</h2>
            <h3>{t('Замовлення № 091273')}</h3>
            <a href="#" className={styles.sent__back}>{t('Повернутись')}</a>
        </div>
    )
}

export default SentToProduction;