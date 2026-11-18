import styles from './bill.module.scss';
import { t } from '../../../../i18n';

const PayType = ({ payType, isFirstBill, auditDates, isDisabled }) => {
    const onChangePay = (value) => {
        if (isFirstBill && value === 'TAX') {
            auditDates({ type: value, method: 'FULL' });
            return;
        }

        if (!isFirstBill && value === 'TAX') {
            auditDates({ type: value, method: 'POSTPAID' });
            return;
        }

        auditDates('type', value);
    }

    return (
        <div className={`${styles.payChanger} ${isDisabled ? styles.disabled : ''}`}>
            <span>{t('Тип оплати')}</span>
            <div className={styles.items}>
                <label className={styles.item}>
                    <input type="radio" checked={payType === 'ONLINE'}
                           onChange={() => onChangePay('ONLINE')} disabled={isDisabled} />
                    <span>{t('Онлайн')}</span>
                </label>
                <label className={styles.item}>
                    <input type="radio" checked={payType === 'IBAN'}
                           onChange={() => onChangePay('IBAN')} disabled={isDisabled} />
                    <span>{t('Р/Р')}</span>
                </label>
                <label className={styles.item}>
                    <input type="radio" checked={payType === 'TAX'}
                           onChange={() => onChangePay('TAX')} disabled={isDisabled} />
                    <span>{t('Наложний платіж')}</span>
                </label>
            </div>
        </div>
    )
}

export default PayType;
