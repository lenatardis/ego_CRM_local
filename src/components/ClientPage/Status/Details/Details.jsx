import React from "react";
import styles from './Details.module.scss';
import DetailsInput from "./DetailsInput/DetailsInput";

const Details = ({orderId}) => {
    return (
        <div className={styles.details}>
            <div className={styles.details__titleBlock}>
                <h3>Детальна інформація</h3>
            </div>
            <DetailsInput orderId={orderId}/>
        </div>
    )
}

export default Details;