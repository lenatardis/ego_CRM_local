import React from "react";
import styles from './FabricPrice.module.scss';
import { t } from '../../../../i18n';

const FabricPrice = ({price, id}) => {
    return (
        <div className={styles.price}>
            <p>{t('Ціна комплекту:')} </p>
            <span className={styles.price}>{price} {t('грн')}</span>
        </div>
    )
}

export default FabricPrice