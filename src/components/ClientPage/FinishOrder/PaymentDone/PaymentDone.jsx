import React from "react";
import styles from './PaymentDone.module.scss'
import doneIcon from "../../../../assets/icons/done.svg";
import errorIcon from "../../../../assets/icons/errorIcon.svg";
import Link from "../../Status/Link/Link";
import { CircularProgress } from "@mui/material";

const PaymentDone = ({ orderUrl, success, receiptUrl, isReceiptLoading }) => {
    return (
        <div className={styles.done}>
            {success ? (
                <>
                    <img src={doneIcon} className={styles.done__check} alt=""/>
                    <h2>Оплата успішно проведена!<br/>Дякуємо за замовлення!</h2>
                </>
            ) : (
                <>
                    <img src={errorIcon} className={styles.done__check} alt=""/>
                    <h2>Сталася якась помилка.<br/>Оплату здійснити не вдалося!</h2>
                </>
            )}
            {orderUrl && <a href={orderUrl} className={styles.done__back}>Повернутись до замовлення</a>}
            {isReceiptLoading && <CircularProgress size="30px" />}
            {!isReceiptLoading && receiptUrl && <Link receiptUrl={receiptUrl} />}
        </div>
    )
}

export default PaymentDone;