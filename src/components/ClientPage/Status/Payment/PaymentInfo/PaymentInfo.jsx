import React, { useEffect, useState } from "react";
import styles from './PaymentInfo.module.scss'
import Attach from "../../../../../assets/icons/attach.svg";

const PaymentInfo = ({ receipt, receiptStatus, onReceiptUpload, isUploading = false }) => {
    const [checked, setChecked] = useState(false);
    const [file, setFile] = useState(null);

    useEffect(() => {
        if (receipt) {
            setChecked(true);
        }
    }, [receipt])

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        const allowedTypes = [
            "application/pdf",
            "image/jpeg",
            "image/png",
            "image/gif",
        ];
        const maxSize = 5 * 1024 * 1024; // 5MB limit

        if (!allowedTypes.includes(selectedFile.type)) {
            alert("Invalid file type. Please upload a PDF, JPG, PNG, or GIF.");
            return;
        }

        if (selectedFile.size > maxSize) {
            alert("File size exceeds the maximum limit of 5MB.");
            return;
        }

        setFile(selectedFile);
    }

    const handleFileUpload = () => {
        if (file) {
            setFile(null);
            onReceiptUpload(file);
        }
    }

    return (
        <div>
          <h3>Повідомити про оплату</h3>
            <div className={styles.btnGroup}>
                <label htmlFor="payment_checkbox" className={styles.checkBtn}>
                    <div className={styles.wrap}>
                        <input type="checkbox" className={styles.checkbox} checked={checked}
                            onChange={(e) => setChecked(e.target.checked)} id="payment_checkbox"
                            disabled={!!receipt && receiptStatus !== 'DECLINED'}/>
                        <span>Я вже оплатив</span>
                    </div>
                </label>
                <label className={`${styles.fileBtn} ${!checked || (!!receipt && receiptStatus !== 'DECLINED') ? styles.disabled : ''}`}>
                    <input
                        type="file"
                        accept="application/pdf, image/jpeg, image/png, image/gif"
                        onChange={handleFileChange}
                        disabled={!checked || (!!receipt && receiptStatus !== 'DECLINED')}
                    />
                    <img src={Attach} alt=""/>
                </label>
                <button className={styles.sendBtn} onClick={handleFileUpload} disabled={!checked || !file || isUploading}>
                    <span>Відправити</span>
                </button>
            </div>
            {receipt && receiptStatus === 'IN_PROC' && (
                 <span className={styles.approvedText}>Чек надіслано, очікуйте зарахування</span>
            )}
            {receipt && receiptStatus === 'DECLINED' && (
                <span className={`${styles.approvedText} ${styles.declined}`}>
                    Чек було відхилено менеджером, надішліть повторно або звяжіться з менеджером
                </span>
            )}
        </div>
    )
}

export default PaymentInfo;