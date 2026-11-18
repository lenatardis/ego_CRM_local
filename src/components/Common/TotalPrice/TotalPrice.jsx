import styles from './TotalPrice.module.scss';
import {useIsDesktop} from "../../../hooks/useIsDesktop";
import { t } from '../../../i18n';

const TotalPrice = ({ totalPrice, priceWithDiscount }) => {
    const isDesktop = useIsDesktop();
    return (
        <div className={styles.totalPrice}>
            {!isDesktop && (totalPrice > priceWithDiscount) && (
                <p className={`${styles.oldPriceValue} ${styles.price}`}>{totalPrice || 0} {t('грн')}</p>
            )}
            <div className={styles.priceInfo}>
                <p className={styles.priceText}>{t('Ціна замовлення:')}</p>
                {isDesktop && (totalPrice > priceWithDiscount) && (
                    <p className={`${styles.oldPriceValue} ${styles.price}`}>{totalPrice || 0} {t('грн')}</p>
                )}
                <span className={`${styles.totalPriceValue} ${styles.price}`}>{priceWithDiscount || 0} {t('грн')}</span>
            </div>
        </div>
    )
}

export default TotalPrice;