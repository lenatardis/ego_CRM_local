import BtnGroup from "../Button1/Button";
import Btn from "../Button2/Button";
import Requisites from "../../../Requisites/Requisites";
import { useState } from "react";
import copyIcon from "../../../../../assets/icons/paperclip.svg";
import arrowIcon from "../../../../../assets/icons/arrowDown.svg";
import styles from "./bill.module.scss";
import PaymentInfo from "../PaymentInfo/PaymentInfo";
import { t } from '../../../../../i18n';

export const Bill = ({ bill, number, IBanDetail, onReceiptUpload, isFileUploading, isClientPage = false }) => {
    const status = bill.status === 'PAID'
        ? { title: t('Оплачено'), value: bill.status, color: '#07FA64' }
        : bill.status === 'PAY_WAIT' ? { title: t('Очікує оплати'), value: bill.status, color: '#F5E97B' }
            : { title: t('Не оплачено'), value: bill.status, color: '#F37D76' };

    const shouldShowPaymentWarning =
        isClientPage && bill.type === "ONLINE" && bill.status !== "PAID";
    const [isIBanOpen, setIsIBanOpen] = useState(true);


    return (
        <div className={styles.bill}>
            <div className={styles.bill__head}>
                <div className={styles.sum}>
                    <p className={styles.number}>{t('Рахунок №{{number}}', {number})}</p>
                    <p className={styles.amount}>{bill.prepayment_amount || 0} {t('грн')}</p>
                </div>
                {(bill.receipt_url || bill.customer_receipt) && (
                    <a href={bill.receipt_url || bill.customer_receipt} className={styles.link} target="_blank" rel="noreferrer">
                        <img src={copyIcon} alt="Receipt" />
                        <span>{t('Посилання на чек')}</span>
                    </a>
                )}
                {bill.comment && (
                    <div className={styles.comment}>
                        <textarea
                            placeholder={t('Коментар')}
                            defaultValue={bill.comment}
                            readOnly
                        />
                    </div>
                )}
                <div className={styles.status} style={{ backgroundColor: status.color }}>
                    <span>{status.title}</span>
                </div>
            </div>
            {status.value !== 'PAID' && (
                <div className={styles.bill__body}>
                    {bill.type === 'ONLINE' && (
                        <>
                            <h4>{t('Онлайн')}</h4>
                            <h4>{t('Способи оплати')}</h4>
                            <BtnGroup billId={bill.id} isDisabled={status.value !== 'PAY_WAIT'} />
                            <Btn billId={bill.id} isDisabled={status.value !== 'PAY_WAIT'} />
                        </>
                    )}
                    {bill.type === 'IBAN' && (
                        <>
                            <h4>{t('Р/р')}</h4>
                            {isIBanOpen && (
                                <>
                                    <Requisites detail={IBanDetail} />
                                    <PaymentInfo
                                        receipt={bill?.customer_receipt}
                                        receiptStatus={bill?.customer_receipt_approved}
                                        onReceiptUpload={onReceiptUpload}
                                        isUploading={isFileUploading}
                                    />
                                </>
                            )}
                            <button className={`${styles.openBtn} ${isIBanOpen ? styles.open : ''}`} onClick={() => setIsIBanOpen(!isIBanOpen)}>
                                <img src={arrowIcon} alt="open" />
                            </button>
                        </>
                    )}
                    {bill.type === 'TAX' && <h4>{t('Наложений платіж')}</h4>}
                    {shouldShowPaymentWarning && (
                        <div className={styles.paymentWarning}>
                            <h3>{t('Увага!')}</h3>
                            <p>
                                {t('Після успішної оплати в банківській системі')} <span>{t('обов’язково поверніться назад на сайт, натиснувши кнопку «Повернутися на сайт»')}</span>.
                                {t('Це необхідно для коректного підтвердження платежу та завершення оформлення замовлення.')}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
