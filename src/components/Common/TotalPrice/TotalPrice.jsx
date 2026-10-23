import styles from './TotalPrice.module.scss';
import {useIsDesktop} from "../../../hooks/useIsDesktop";

const TotalPrice = ({ totalPrice, priceWithDiscount }) => {
    const isDesktop = useIsDesktop();
    return (
        <div className={styles.totalPrice}>
            {!isDesktop && (totalPrice > priceWithDiscount) && (
                <p className={`${styles.oldPriceValue} ${styles.price}`}>{totalPrice || 0} грн</p>
            )}
            <div className={styles.priceInfo}>
                <p className={styles.priceText}>Ціна замовлення:</p>
                {isDesktop && (totalPrice > priceWithDiscount) && (
                    <p className={`${styles.oldPriceValue} ${styles.price}`}>{totalPrice || 0} грн</p>
                )}
                <span className={`${styles.totalPriceValue} ${styles.price}`}>{priceWithDiscount || 0} грн</span>
            </div>
        </div>
    )
}

export default TotalPrice;