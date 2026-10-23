import React from "react";
import styles from './Link.module.scss'

const Link = ({ receiptUrl }) => {
    return (
        <a className={styles.link} href={receiptUrl} target="_blank">Посилання на чек</a>
    )
}

export default Link;