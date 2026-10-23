import React from "react";
import styles from './CalcButton.module.scss';

const CalcButton = ({action, inPopup, isDisabled, buttonName = "Зберегти"}) => {
    return (
        <button className={`${styles.btn} ${inPopup ? styles.inPopup : ""}`} onClick={() => action()} disabled={isDisabled}>
            <span>{buttonName}</span>
        </button>
    )
}

export default CalcButton;