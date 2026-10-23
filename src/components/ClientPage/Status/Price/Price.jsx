import React from "react";
import TotalPrice from "../../../Common/TotalPrice/TotalPrice";
import styles from './Price.module.scss'

const PriceInfo = ({payment}) => {

    return (
        <div className={styles.price}>
            <TotalPrice totalPrice={payment?.amount} priceWithDiscount={payment?.final_amount} />
            <div className={styles.info}>
                <div className={styles.row}>
                    <span>Залишилося оплатити:</span>
                    <span className={styles.value}>{(payment?.final_amount - payment?.already_paid_amount) || 0} грн</span>
                </div>
                <div className={styles.row}>
                    <span>Вже оплачено:</span>
                    <span className={styles.value}>{payment?.already_paid_amount || 0} грн</span>
                </div>
            </div>
        </div>
    )
}

export default PriceInfo;