import React from "react";
import styles from './FabricPrice.module.scss';

const FabricPrice = ({price, id}) => {
    return (
        <div className={styles.price}>
            <p>Ціна комплекту: </p>
            <span className={styles.price}>{price} грн</span>
        </div>
    )
}

export default FabricPrice