import React from "react";
import TotalPrice from "../../../Common/TotalPrice/TotalPrice";
import styles from './Price.module.scss'
import { t } from '../../../../i18n';

const PriceInfo = ({payment}) => {

    return (
        <div className={styles.price}>
            <TotalPrice totalPrice={payment?.amount} priceWithDiscount={payment?.final_amount} />
            <div className={styles.info}>
                <div className={styles.row}>
                    <span>{t('Залишилося оплатити:')}</span>
                    <span className={styles.value}>{(payment?.final_amount - payment?.already_paid_amount) || 0} {t('грн')}</span>
                </div>
                <div className={styles.row}>
                    <span>{t('Вже оплачено:')}</span>
                    <span className={styles.value}>{payment?.already_paid_amount || 0} {t('грн')}</span>
                </div>
            </div>
        </div>
    )
}

export default PriceInfo;