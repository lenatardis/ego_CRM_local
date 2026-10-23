import React from "react";
import styles from './SentToProduction.module.scss';
import doneIcon from "../../../../assets/icons/done.svg";

const SentToProduction = () => {

    return (
        <div className={styles.sent}>
            <img src={doneIcon} className={styles.sent__check} alt=""/>
            <h2>Відправлено на виробництво</h2>
            <h3>Замовлення № 091273</h3>
            <a href="#" className={styles.sent__back}>Повернутись</a>
        </div>
    )
}

export default SentToProduction;