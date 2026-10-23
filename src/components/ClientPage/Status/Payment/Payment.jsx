import React, { useState } from "react";
import { Bill } from "./Bill/Bill";
import { setReceipt as sendReceipt } from "../../../../api/receiptApi";
import styles from "./Payment.module.scss";

const Payment = ({bills, setBills, IBanDetail, isClientPage = false}) => {
    const [isFileUploading, setIsFileUploading] = useState(false);

    const onReceiptUpload = (billId, file) => {
        const formData = new FormData();
        formData.append("payment", billId);
        formData.append("receipt", file);

        setIsFileUploading(true);
        sendReceipt(formData).then(res => {
            if (res?.customer_receipt) {
                setBills(prevBills => prevBills.map(bill => {
                    if (bill.id === billId) {
                        return { ...res };
                    }
                    return bill;
                }))
            }
        }).finally(() => {
            setIsFileUploading(false);
        })
    }

    return (
        <div className={styles.payment}>
            {bills.length > 0 && (
                <>
                    <h3 className={styles.title}>Список рахунків</h3>
                    {bills.map((bill, idx) => bill.prepayment_amount > 0 && (
                        <Bill
                            key={idx}
                            bill={bill}
                            number={idx + 1}
                            IBanDetail={IBanDetail}
                            onReceiptUpload={(file) => onReceiptUpload(bill.id, file)}
                            isFileUploading={isFileUploading}
                            isClientPage={isClientPage}
                        />
                    ))}
                </>
            )}
        </div>
    )
}

export default Payment;