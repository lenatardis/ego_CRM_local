import React from "react";
import styles from './DetailsPayment.module.scss';
import logo from "../../../assets/img/logoEgo.svg";
import DetailsContent from "./DetailsContent";

const DetailsPayment = () => {
    return (
        <div className={styles.detailsPayment}>
            <div className={styles.detailsPayment__logo}>
                <img src={logo} alt=""/>
            </div>
            <h2>Реквізити для оплати</h2>
            <DetailsContent />
        </div>
    )
}

export default DetailsPayment;