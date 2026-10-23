import React from "react";
import styles from './OptionButton.module.scss';

const OptionButton = ({img, action}) => {
    return (
        <button className={styles.btn} onClick={action? () => action() : null}>
            <span className={styles.btn__innerWrap}>
                <span className={styles.btn__plus}>+</span>
                <img src={img} alt=""/>
            </span>
        </button>
    )
}

export default OptionButton;