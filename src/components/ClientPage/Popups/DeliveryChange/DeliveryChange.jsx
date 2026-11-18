import React from "react";
import styles from './DeliveryChange.module.scss';
import {useTranslation} from "react-i18next";

const DeliveryChange = ({onConfirm, onCancel, orderPageCheck}) => {
    const {t} = useTranslation();
    return (
        <div className={styles.delivery}>
            <h2>{!orderPageCheck ? t('Ви бажаєте змінити службу доставки?') : t('Ви бажаєте перейти на сторінку створення нового замовлення?')}</h2>
            <button onClick={onConfirm} className={`${styles.btn} ${styles.confirmBtn}`}>
                <span>{t('Підтвердити')}</span>
            </button>
            <button onClick={onCancel} className={styles.btn}>{t('Скасувати')}</button>
        </div>
    )
}

export default DeliveryChange;