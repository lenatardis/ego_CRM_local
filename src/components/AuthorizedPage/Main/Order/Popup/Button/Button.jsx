import React from "react";
import styles from './Button.module.scss';
import { t } from '../../../../../../i18n';

const OrderButton = ({confirm, action}) => {
    return (
        <a className={`${styles.btn} ${confirm ? styles.confirmBtn : ''}`} onClick={() => action()}>
            <span>{confirm ? t('Підтвердити') : t('Скасувати')}</span>
        </a>
    )
}

export default OrderButton;