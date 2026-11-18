import styles from "./payment-method.module.scss";
import InfoHint from "../../../Common/ProductItem/InfoHint/InfoHint";
import { t } from '../../../../i18n';

export const PaymentMethod = ({ paymentMethod, onChange, isDisabled }) => {
    return (
        <div className={`${styles.payChanger} ${isDisabled ? styles.disabled : ''}`}>
            <div className={styles.labelRow}>
                <span>{t('Тип оплати')}</span>
                <InfoHint text={t('Готівковий - фізична особа. Безготівковий - оплата на юридичну особу')} size={16} />
            </div>

            <div className={styles.items}>
                <label className={styles.item}>
                    <input
                        type="radio"
                        checked={paymentMethod === 'CASH'}
                        onChange={() => onChange('CASH')}
                        disabled={isDisabled}
                    />
                    <span>{t('Готівковий')}</span>
                </label>
                <label className={styles.item}>
                    <input
                        type="radio"
                        checked={paymentMethod === 'NON_CASH'}
                        onChange={() => onChange('NON_CASH')}
                        disabled={isDisabled}
                    />
                    <span>{t('Безготівковий')}</span>
                </label>
            </div>
        </div>
    );
};