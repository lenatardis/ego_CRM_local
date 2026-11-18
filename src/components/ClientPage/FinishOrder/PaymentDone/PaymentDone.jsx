import React from "react";
import styles from './PaymentDone.module.scss'
import doneIcon from "../../../../assets/icons/done.svg";
import errorIcon from "../../../../assets/icons/errorIcon.svg";
import Link from "../../Status/Link/Link";
import { CircularProgress } from "@mui/material";
import { t } from '../../../../i18n';

const PaymentDone = ({ orderUrl, success, receiptUrl, isReceiptLoading }) => {
    return (
        <div className={styles.done}>
            {success ? (
                <>
                    <img src={doneIcon} className={styles.done__check} alt=""/>
                    <h2>{t('Оплата успішно проведена!')}<br/>{t('Дякуємо за замовлення!')}</h2>
                </>
            ) : (
                <>
                    <img src={errorIcon} className={styles.done__check} alt=""/>
                    <h2>{t('Сталася якась помилка.')}<br/>{t('Оплату здійснити не вдалося!')}</h2>
                </>
            )}
            {orderUrl && <a href={orderUrl} className={styles.done__back}>{t('Повернутись до замовлення')}</a>}
            {isReceiptLoading && <CircularProgress size="30px" />}
            {!isReceiptLoading && receiptUrl && <Link receiptUrl={receiptUrl} />}
        </div>
    )
}

export default PaymentDone;