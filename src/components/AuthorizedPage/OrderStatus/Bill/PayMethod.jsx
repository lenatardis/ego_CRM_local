import styles from './bill.module.scss';

const PAY_METHODS = [
    { value: 'FULL', label: 'Вся сума' },
    { value: 'PREPAYMENT', label: 'Передоплата' },
    { value: 'POSTPAID', label: 'Дооплата' },
];

const getAvailableMethods = (payType, isFirstBill) => {
    if (payType === 'TAX' && isFirstBill) return ['FULL'];
    if (!isFirstBill) return ['POSTPAID'];
    return ['FULL', 'PREPAYMENT'];
};

const isMethodDisabled = (method, isDisabled, isFullDisabled) => {
    return isDisabled || (method === 'FULL' && isFullDisabled);
};

const getMethodClass = (method, isDisabled, isFullDisabled) => {
    const isMethodFullDisabled = method === 'FULL' && isFullDisabled && !isDisabled;
    return `${styles.item} ${isMethodFullDisabled ? styles.disabled : ''}`;
};

export const PayMethod = ({ payMethod, payType, isFirstBill, auditDates, isDisabled, isFullDisabled }) => {
    const availableMethods = getAvailableMethods(payType, isFirstBill);

    return (
        <div className={`${styles.payChanger} ${isDisabled ? styles.disabled : ''}`}>
            <span>Метод оплати</span>
            <div className={styles.items}>
                {PAY_METHODS.filter(({ value }) => availableMethods.includes(value)).map(({ value, label }) => (
                    <label key={value} className={getMethodClass(value, isDisabled, isFullDisabled)}>
                        <input
                            type="radio"
                            checked={payMethod === value}
                            onChange={() => auditDates('method', value)}
                            disabled={isMethodDisabled(value, isDisabled, isFullDisabled)}
                        />
                        <span>{label}</span>
                    </label>
                ))}
            </div>
        </div>
    );
};