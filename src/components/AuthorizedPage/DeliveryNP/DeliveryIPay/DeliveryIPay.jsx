import React from "react";
import styles from "./DeliveryIPay.module.scss";


const DeliveryIPay = ({isIPay, auditDates}) => {

    const onChangePay = (value) => {
        auditDates(value, 'paid_by_the_sender');
    }

    return (
        <div className={styles.iPay}>
            <span>Хто оплачує Доставку </span>
            <div className={styles.iPay__customCheckbox}>
                <input name={'ipay'} type={'checkbox'} checked={isIPay} onChange={() => onChangePay(!isIPay)} />
                <span/>
                <label htmlFor={'ipay'}>Наша доставка</label>
            </div>
        </div>
    )
}

export default DeliveryIPay;