import React from "react";
import styles from './DeliveryChange.module.scss';

const DeliveryChange = ({onConfirm, onCancel, orderPageCheck}) => {
    return (
        <div className={styles.delivery}>
            <h2>{!orderPageCheck ? 'Ви бажаєте змінити службу доставки?' : 'Ви бажаєте перейти на сторінку створення нового замовлення?'}</h2>
            <button onClick={onConfirm} className={`${styles.btn} ${styles.confirmBtn}`}>
                <span>Підтвердити</span>
            </button>
            <button onClick={onCancel} className={styles.btn}>Скасувати</button>
        </div>
    )
}

export default DeliveryChange;