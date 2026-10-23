import React from "react";
import styles from './Button.module.scss';

const OrderButton = ({confirm, action}) => {
    return (
        <a className={`${styles.btn} ${confirm ? styles.confirmBtn : ''}`} onClick={() => action()}>
            <span>{confirm ? 'Підтвердити' : 'Скасувати'}</span>
        </a>
    )
}

export default OrderButton;