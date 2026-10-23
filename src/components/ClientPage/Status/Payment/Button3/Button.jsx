import React from "react";
import styles from '../Payment.module.scss';
import Iban from "../../../../../assets/img/iban.png";
import {Link} from "react-router-dom";

const Button = ({ orderId }) => {
    return (
        <Link style={{ backgroundColor: '#fff' }} className={styles.paymentBtn} to={`/requisites/${orderId}`}>
            <img src={Iban} alt=""/>
        </Link>
    )
}

export default Button;