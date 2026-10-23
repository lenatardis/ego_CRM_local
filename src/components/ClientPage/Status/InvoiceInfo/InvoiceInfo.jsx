import React from "react";
import styles from './InvoiceInfo.module.scss';
import SearchInput from "./Input/SearchInput";

const InvoiceInfo = ({ order }) => {
    const getNumberValue = (value) => {
        const number = Number(value);
        return Number.isFinite(number) ? number : 0;
    };

    const getOrderStatusName = (payment) => {
        if (
            payment?.status === 'PAY_WAIT' &&
            getNumberValue(payment?.already_paid_amount) > 0
        ) {
            return 'Очікує повної оплати';
        }

        switch (payment?.status) {
            case 'PAID': return 'Оплачено';
            case 'IN_PROG': return 'В обробці';
            case 'PAY_WAIT': return 'Очікує оплати';
            case 'NOT_PAID': return 'Не оплачено';
            default:
                console.log(payment?.status);
                break;
        }

        return payment?.status;
    };

    return (
        <div className={styles.invoiceInfo}>
            {order?.payment?.status && order?.payment?.status !== 'NONE' && (
                <div
                    className={`${styles.invoiceInfo__status} ${order.payment.status === 'PAID'
                        ? styles.invoiceInfo__status_paid
                        : order.payment.status === 'NOT_PAID'
                            ? styles.invoiceInfo__status_notPaid
                            : ''
                        }`}
                >
                    <p>{getOrderStatusName(order.payment)}</p>
                </div>
            )}
            <div className={styles.invoiceInfo__search}>
                <SearchInput order={order} />
            </div>
        </div>
    );
};

export default InvoiceInfo;