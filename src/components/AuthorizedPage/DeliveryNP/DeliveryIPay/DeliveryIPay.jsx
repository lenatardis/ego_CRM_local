import React from "react";
import styles from "./DeliveryIPay.module.scss";
import { t } from '../../../../i18n';


const DeliveryIPay = ({isIPay, auditDates}) => {

    const onChangePay = (value) => {
        auditDates(value, 'paid_by_the_sender');
    }

    return (
        <div className={styles.iPay}>
            <span>{t('Хто оплачує Доставку')} </span>
            <div className={styles.iPay__customCheckbox}>
                <input name={'ipay'} type={'checkbox'} checked={isIPay} onChange={() => onChangePay(!isIPay)} />
                <span/>
                <label htmlFor={'ipay'}>{t('Наша доставка')}</label>
            </div>
        </div>
    )
}

export default DeliveryIPay;