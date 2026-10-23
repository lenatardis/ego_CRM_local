import {useState} from "react";
import DiscountField from "../../../Common/DiscountField/DiscountField";
import StatusPay from "./StatusPay";
import TotalPrice from "../../../Common/TotalPrice/TotalPrice";
import {getPriceWithDiscount} from "../../../../utils/getPriceWithDiscount";
import styles from "./payment.module.scss";
import {useIsDesktop} from "../../../../hooks/useIsDesktop";

export const Payment = ({payment, handleSaveFinalPrice, handleStatusChange, isPaymentAllowed, orderDiscountCalc = false,
    orderAmount = 0}) => {
    const type = payment?.discount_type;
    const [discountType, setDiscountType] = useState(type);
    const [percentInputValue, setPercentInputValue] = useState(type === 'PERC' ? payment?.discount_amount : 0);
    const [UAHInputValue, setUAHInputValue] = useState(type === 'VAL' ? payment?.discount_amount : 0);
    const [popup, setPopup] = useState(null);
    const isDisabled = payment?.status === 'PAID' || payment?.status === 'PAY_WAIT';
    const statuses = [
        {title: 'В обробці', value: 'IN_PROG'},
        {title: 'Очікує оплати', value: 'PAY_WAIT', disabled: !isPaymentAllowed},
        {title: 'Не оплачено', value: 'NOT_PAID'},
    ];
    const selectedStatus = payment?.status !== 'NONE' ? {
        value: payment.status,
        title: statuses.find((item) => item.value === payment.status)?.title
    } : null;
    const isDesktop = useIsDesktop();

    const handleSubmitDiscount = () => {
        const discountValue = discountType === 'PERC' ? percentInputValue : UAHInputValue;
        const priceWithDiscount = getPriceWithDiscount(payment?.amount, discountType, discountValue);
        handleSaveFinalPrice(priceWithDiscount, discountType, discountValue);
    }

    return (
        <>
            <div className={styles.payment}>
                <TotalPrice totalPrice={payment?.amount} priceWithDiscount={payment?.final_amount}/>
                <DiscountField
                    percentInputValue={percentInputValue}
                    setPercentInputValue={setPercentInputValue}
                    UAHInputValue={UAHInputValue}
                    setUAHInputValue={setUAHInputValue}
                    discountType={discountType}
                    setDiscountType={setDiscountType}
                    popup={popup}
                    setPopup={setPopup}
                    onSubmit={handleSubmitDiscount}
                    isDisabled={isDisabled}
                    orderDiscountCalc={orderDiscountCalc}
                    orderAmount={orderAmount}
                />
                {!isDesktop && (<><StatusPay
                    setPopup={setPopup}
                    popup={popup}
                    status={selectedStatus}
                    chooseList={statuses}
                    updateStatus={handleStatusChange}
                    isDisabled={payment?.status === 'PAID'}
                />
                    <div className={styles.total}>
                        <div className={styles.row}>
                            <span>До сплати замовнику:</span>
                            <span
                                className={styles.value}>{(payment?.final_amount - payment?.already_paid_amount) || 0} грн</span>
                        </div>
                        <div className={styles.row}>
                            <span>Оплачено замовником:</span>
                            <span className={styles.value}>{payment?.already_paid_amount} грн</span>
                        </div>
                    </div>
                </>)}
            </div>
            {isDesktop && (
                <div className={styles.payment}>
                    <StatusPay
                        setPopup={setPopup}
                        popup={popup}
                        status={selectedStatus}
                        chooseList={statuses}
                        updateStatus={handleStatusChange}
                        isDisabled={payment?.status === 'PAID'}
                    />
                    <div className={styles.total}>
                        <div className={styles.row}>
                            <span>До сплати замовнику:</span>
                            <span
                                className={styles.value}>{(payment?.final_amount - payment?.already_paid_amount) || 0} грн</span>
                        </div>
                        <div className={styles.row}>
                            <span>Оплачено замовником:</span>
                            <span className={styles.value}>{payment?.already_paid_amount} грн</span>
                        </div>
                    </div>
                </div>
            )
            }
        </>
    )
}
