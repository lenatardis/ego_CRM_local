import React, {useState, useEffect} from "react";
import {useLocation} from "react-router";
import queryString from "query-string";
import PaymentDone from "./PaymentDone/PaymentDone";
import Preloader from "../../Common/Preloader/Preloader";
import { setFinishOrder } from "../../../api/paymentApi";
import { setCheckboxReceipt } from "../../../api/receiptApi";

const FinishOrder = ({ paymentType }) => {
    const [invoice, setInvoice] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isReceiptLoading, setIsReceiptLoading] = useState(true);

    const params = useLocation();
    const urlString = params.search;
    const hash = queryString.parse(urlString);

    useEffect(() => {
        if (urlString && hash?.invoice_id) {
            setFinishOrder(hash?.invoice_id, paymentType).then((resp) => {
                if (resp.id) {
                    const payment_type = paymentType === 'wayforpay' ? 'way_for_pay' : 'monobank';
                    setInvoice({
                        orderUrl: resp?.payment?.free_access_order_url,
                        success: !!resp?.id,
                        receiptUrl: resp?.payment?.receipt_url
                    });
                    if (!resp?.payment?.receipt_url) {
                        setCheckboxReceipt(resp.payment.id, payment_type).then(res => {
                            setInvoice(prevInvoice => ({ ...prevInvoice, receiptUrl: res?.payment?.receipt_url }));
                        }).finally(() => {
                            setIsReceiptLoading(false);
                        });
                    } else {
                        setIsReceiptLoading(false);
                    }
                } else if (resp.errors) {
                    setInvoice(resp.errors);
                }
            }).catch((error) => {
                console.log(error);
            }).finally(() => {
                setIsLoading(false);
            })
        }
    }, [])

    return (
        <div>
            {isLoading ? (
                <Preloader/>
            ) : (
                <PaymentDone
                    orderUrl={invoice?.orderUrl}
                    success={invoice?.success}
                    receiptUrl={invoice?.receiptUrl}
                    isReceiptLoading={isReceiptLoading}
                />
            )}
        </div>
    )
}

export default FinishOrder;