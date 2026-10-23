import React from "react";
import styles from '../Payment.module.scss';
import PaymentGroup from '../../../../../assets/icons/wayforpayLogo.png';
import { sendPayWayForPay } from "../../../../../api/paymentApi";

const Button = ({billId, isDisabled}) => {
    const onSend = () => {
        if (billId) (
            sendPayWayForPay(billId).then((response) => {
                if (response && response.invoice_url) {
                    window.location.href = response.invoice_url;
                }
            })
        )
    }

    return (
       <button className={styles.paymentBtn} onClick={() => onSend()} disabled={isDisabled}>
           <img src={PaymentGroup} alt=""/>
       </button>
    )
}

export default Button;