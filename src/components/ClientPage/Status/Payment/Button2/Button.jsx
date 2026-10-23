import React from "react";
import styles from '../Payment.module.scss';
import mono from '../../../../../assets/icons/monobank.png';
import { sendPayMonobank } from "../../../../../api/paymentApi";

const Button = ({billId, isDisabled}) => {
    const onSend = () => {
        if (billId) (
            sendPayMonobank(billId).then((response) => {
                if (response && response.invoice_url) {
                    window.location.href = response.invoice_url;
                }
            })
        )
    }

    return (
        <button className={styles.paymentBtn} onClick={() => onSend()} disabled={isDisabled}>
            <img src={mono} alt=""/>
        </button>
    )
}

export default Button;