import React from "react";
import styles from './discountField.module.scss';
import { setIsActivePopup } from "../../../store/main-slice";
import { useAppDispatch } from "../../../hooks/redux";
import GlobalPopup from "../GlobalPopup/GlobalPopup";
import GlobalCalculator from "../GlobalCalculator/GlobalCalculator";
import { useIsDesktop } from "../../../hooks/useIsDesktop";

const DiscountField = ({
    percentInputValue,
    setPercentInputValue,
    UAHInputValue,
    setUAHInputValue,
    discountType,
    setDiscountType,
    onSubmit,
    popup,
    setPopup,
    isDisabled,
    orderDiscountCalc = false,
    orderAmount = 0,
}) => {
    const [UAHDiscountError, setUAHDiscountError] = React.useState('');
    const dispatch = useAppDispatch();
    const isDesktop = useIsDesktop();

   const onSubmitPopup = () => {
    if (
        popup === 'VAL' &&
        orderDiscountCalc &&
        !validateOrderUAHDiscount(UAHInputValue)
    ) {
        return;
    }

    setPopup(null);
    onSubmit();
};

 const onChangeDiscount = (value) => {
    if (value !== discountType) {
        setDiscountType(value);
    }

    setUAHDiscountError('');
    setPopup(value);

    setTimeout(() => {
        dispatch(setIsActivePopup(true));
    }, 30);
};

    const getNumberValue = (value) => {
        const number = Number(value);
        return Number.isFinite(number) ? number : 0;
    };

    const getMaxOrderDiscount = () => {
        return getNumberValue(orderAmount);
    };

    const validateOrderUAHDiscount = (value) => {
        if (!orderDiscountCalc) return true;

        const maxDiscount = getMaxOrderDiscount();

        if (!maxDiscount) return true;

        if (value >= maxDiscount) {
            setUAHDiscountError('Знижка не може бути більшою або дорівнювати сумі замовлення');
            return false;
        }

        setUAHDiscountError('');
        return true;
    };

    const handlePercentChange = (e) => {
        const value = e.target.textContent;
        const potentialNewValue = Number(String(percentInputValue) + value);
        if (potentialNewValue <= 100) {
            setPercentInputValue(potentialNewValue);
        }
    };

    const handlePercentDelete = () => {
        const newValue = Math.floor(percentInputValue / 10);
        setPercentInputValue(newValue);
    };

    const handleUAHChange = (e) => {
        const digit = e.target.textContent;

        const base = UAHInputValue === 0 ? '' : String(UAHInputValue);
        const nextStr = base + digit;

        if (nextStr.length > 5) return;

        const nextVal = Number(nextStr);

        if (nextVal > 99999) return;

        if (!validateOrderUAHDiscount(nextVal)) return;

        setUAHInputValue(nextVal);
    };

   const handleUAHDelete = () => {
    const newValue = Math.floor(UAHInputValue / 10);
    setUAHInputValue(newValue);
    setUAHDiscountError('');
};

    return (
        <div className={styles.discountField}>
            <span>Знижка:</span>
            <div className={`${styles.discountField__wrapper} ${isDisabled ? styles.disabled : ''}`}>
                <label className={styles.field}>
                    <input
                        type="radio"
                        checked={discountType === 'PERC' && percentInputValue !== 0}
                        onClick={() => onChangeDiscount('PERC')}
                        onChange={() => onChangeDiscount('PERC')}
                        disabled={isDisabled}
                    />
                    <span>{percentInputValue} %</span>
                </label>
                <label className={styles.field}>
                    <input
                        type="radio"
                        checked={discountType === 'VAL' && UAHInputValue !== 0}
                        onClick={() => onChangeDiscount('VAL')}
                        onChange={() => onChangeDiscount('VAL')}
                        disabled={isDisabled}
                    />
                    <span>{UAHInputValue} грн</span>
                </label>
            </div>

            {popup === 'PERC' && (
                <GlobalPopup
                    title={'Знижка'}
                    onClose={() => setPopup(null)}
                    {...(isDesktop ? { centeredPopup: true } : {})}
                >
                    <GlobalCalculator
                        handleChange={handlePercentChange}
                        handleDelete={handlePercentDelete}
                        onSubmit={() => onSubmitPopup()}
                    >
                        <div className={styles.percentInputWrap}>
                            <input
                                id='percent_discount'
                                name="percent_discount"
                                value={percentInputValue}
                                className={'baseInput'}
                                type="text"
                                readOnly
                            />
                            <span>%</span>
                        </div>
                    </GlobalCalculator>
                </GlobalPopup>
            )}

            {popup === 'VAL' && (
                <GlobalPopup
                    title={'Знижка'}
                    onClose={() => setPopup(null)}
                    {...(isDesktop ? { centeredPopup: true } : {})}
                >
                    <GlobalCalculator
                        handleChange={handleUAHChange}
                        handleDelete={handleUAHDelete}
                        onSubmit={() => onSubmitPopup()}
                    >
                        <div className={styles.UAHInputWrap}>
                            <input
                                id='uah_discount'
                                name="uah_discount"
                                value={UAHInputValue}
                                className={'baseInput'}
                                type="text"
                                readOnly
                            />
                            <span>&nbsp;грн</span>
                        </div>
                        {UAHDiscountError && (
                            <p className={styles.discountError}>{UAHDiscountError}</p>
                        )}
                    </GlobalCalculator>
                </GlobalPopup>
            )}
        </div>
    );
};

export default DiscountField;