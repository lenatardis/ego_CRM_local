import { useState, useEffect } from "react";
import PayType from "./PayType";
import arrowIcon from "../../../../assets/icons/arrowDown.svg";
import GlobalPopup from "../../../Common/GlobalPopup/GlobalPopup";
import GlobalCalculator from "../../../Common/GlobalCalculator/GlobalCalculator";
import { useAppDispatch } from "../../../../hooks/redux";
import { setIsActivePopup } from "../../../../store/main-slice";
import DateTimeField from "../../../Common/DateTimeField/DateTimeField";
import StatusPay from "../Payment/StatusPay";
import removeIcon from "../../../../assets/icons/removeIcon.svg";
import copyIcon from "../../../../assets/icons/paperclip.svg";
import { PayMethod } from "./PayMethod";
import styles from "./bill.module.scss";
import { useIsDesktop } from "../../../../hooks/useIsDesktop";
import { t } from '../../../../i18n';

export const Bill = ({ bill, number, updateBill, onSubmitPayment, onDelete, isDisabled, isFullDisabled, availableSum }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [popup, setPopup] = useState(null);
    const [sum, setSum] = useState(bill.prepayment_amount || 0);
    useEffect(() => {
        setSum(bill.prepayment_amount || 0);
    }, [bill.prepayment_amount]);
    const status = bill.status === 'PAID' ? { title: t('Оплачено'), value: bill.status, color: '#07FA64' }
        : bill.status === 'PAY_WAIT' ? { title: t('Очікує оплати'), value: bill.status, color: '#F5E97B' }
            : { title: t('Не оплачено'), value: bill.status, color: '#F37D76' };
    const statuses = [
        { title: t('Очікує оплати'), value: 'PAY_WAIT' },
        { title: t('Не оплачено'), value: 'NOT_PAID' },
    ];
    const dispatch = useAppDispatch();
    const disabled = isDisabled || status.value === 'PAID';
    const isDesktop = useIsDesktop();

    const handleSumChange = (e) => {
        const value = e.target.textContent;
        const sumString = String(sum);
        const newSumValue = Number(sumString + value);
        if (newSumValue <= availableSum + bill.prepayment_amount) {
            setSum(newSumValue);
        }
    }

    const handleSumSubmit = () => {
        setPopup(null);
        updateBill('prepayment_amount', sum);
    }

    const handleStatusChange = (value) => {
        updateBill('status', value);
    }

    const handleSubmitPayment = (approved) => {
        setPopup(null);
        dispatch(setIsActivePopup(false));
        onSubmitPayment(bill.id, approved);
    }

    return (
        <>
            <div className={styles.bill}>
                <div className={styles.bill__content}>
                    <div className={styles.head}>
                        <div className={styles.head__top}>
                            <p className={styles.number}>{t('Рахунок №{{number}}', {number})}</p>
                            <p className={styles.sum} style={{ color: !bill.prepayment_amount ? 'red' : 'inherit' }}>
                                {bill.prepayment_amount || 0} {t('грн')}
                            </p>
                        </div>
                        {(bill.receipt_url || (bill.customer_receipt && bill.customer_receipt_approved === 'APPROVED')) && (
                            <div className={styles.receiptBar}>
                                <div>
                                    <span className={styles.checkIcon}></span>
                                    <span className={styles.checkText}>{t('Рахунок підтверджено')}</span>
                                </div>
                                <a href={bill.receipt_url || bill.customer_receipt} className={styles.link}
                                    target="_blank" rel="noreferrer">
                                    <img src={copyIcon} alt="Receipt" />
                                    <span>{t('Посилання на чек')}</span>
                                </a>
                            </div>

                        )}
                        <div className={styles.head__status} style={{ backgroundColor: status.color }}>
                            <span>{status.title}</span>
                        </div>
                        <PayType
                            payType={bill.type}
                            isFirstBill={number === 1}
                            auditDates={updateBill}
                            isDisabled={disabled}
                        />
                        <PayMethod
                            payMethod={bill.method}
                            payType={bill.type}
                            isFirstBill={number === 1}
                            auditDates={updateBill}
                            isDisabled={disabled}
                            isFullDisabled={isFullDisabled}
                        />
                        <div className={styles.sum}>
                            <input
                                className={`baseInput ${disabled || bill.method === 'FULL' ? styles.disabled : ''}`}
                                placeholder={t('Сума')}
                                value={sum ? `${sum}` : ''}
                                onClick={() => {
                                    dispatch(setIsActivePopup(true));
                                    setPopup('sum');
                                }}
                                readOnly
                                disabled={disabled || bill.method === 'FULL'}
                            />
                        </div>
                    </div>
                    <div className={`${styles.body} ${isOpen ? styles.open : ''}`}>
                        <div className={styles.head__comment}>
                            <textarea
                                placeholder={t('Коментар')}
                                defaultValue={bill.comment}
                                onBlur={(e) => {
                                    if (e.target.value === bill.comment) return;
                                    updateBill('comment', e.target.value)
                                }}
                                readOnly={disabled}
                                disabled={disabled}
                            />
                        </div>
                        <DateTimeField
                            date={bill.prepayment_datetime}
                            auditDates={updateBill}
                            isDisabled={disabled}
                        />
                        <div className={`${styles.status} ${disabled ? styles.disabled : ''}`}>
                            <StatusPay
                                popup={popup}
                                setPopup={setPopup}
                                status={status}
                                chooseList={statuses}
                                updateStatus={handleStatusChange}
                            />
                        </div>
                        {bill?.customer_receipt && (
                            <div className={styles.customerReceipt}>
                                <div className={styles.link}>
                                    <img src={copyIcon} alt="receipt" />
                                    <a href={bill.customer_receipt} target="_blank" rel="noreferrer">{t('Квитанція про оплату')}</a>
                                </div>
                                {bill?.customer_receipt_approved === 'IN_PROC' && (
                                    <button
                                        className={styles.approveBtn}
                                        onClick={() => {
                                            dispatch(setIsActivePopup(true));
                                            setPopup('approve');
                                        }}
                                    >
                                        {t('Підтвердити оплату')}
                                    </button>
                                )}
                            </div>
                        )}
                        <button className={styles.deleteBtn} onClick={() => onDelete(bill.id)} disabled={disabled}>
                            <img src={removeIcon} alt="Remove" />
                            <span>{t('Видалити рахунок')}</span>
                        </button>
                    </div>
                </div>
                <button className={`${styles.openBtn} ${isOpen ? styles.open : ''}`} onClick={() => setIsOpen(!isOpen)}>
                    <img src={arrowIcon} alt="open" />
                </button>
            </div>
            {popup === 'sum' && (
                <GlobalPopup title={t('Сума:')} onClose={() => setPopup(null)} {...(isDesktop ? { centeredPopup: true } : {})}>
                    <GlobalCalculator handleChange={handleSumChange} handleDelete={() => setSum(Math.floor(sum / 10))} onSubmit={() => handleSumSubmit(false)}>
                        <div className={styles.sumInputWrap}>
                            <p>{t('Максимально можлива сума:')} {bill.prepayment_amount + availableSum} {t('грн')}</p>
                            <input value={sum} className={'baseInput'} type="text" readOnly />
                            <span>&nbsp;{t('грн')}</span>
                        </div>
                    </GlobalCalculator>
                </GlobalPopup>
            )}
            {popup === 'approve' && (
                <GlobalPopup title={t('Підтвердження оплати:')} onClose={() => setPopup(null)} {...(isDesktop ? { centeredPopup: true } : {})}>
                    <div className={styles.approve}>
                        <p>{t('Ви дійсно підтверджуєте оплату рахунку?')}</p>
                        <div className={styles.actions}>
                            <button className={styles.submit} onClick={() => handleSubmitPayment(true)}>{t('Підтвердити')}</button>
                            <button className={styles.cancel} onClick={() => handleSubmitPayment(false)}>{t('Відхилити')}</button>
                        </div>
                    </div>
                </GlobalPopup>
            )}
        </>
    )
}
