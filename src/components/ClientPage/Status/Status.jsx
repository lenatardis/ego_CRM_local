import React, {useEffect, useState} from "react";
import styles from './Status.module.scss';
import logo from "../../../assets/img/logoEgo.svg";
import Details from "./Details/Details";
import InvoiceInfo from "./InvoiceInfo/InvoiceInfo";
import List from "./List/List";
import Price from "./Price/Price";
import Payment from "./Payment/Payment";
import Preloader from "../../Common/Preloader/Preloader";
import { sendOrderHash } from "../../../api/ordersApi";
import { getPaymentDetail } from "../../../api/generalApi";

const Status = ({ orderHash }) => {
    const [order, setOrder] = useState(null);
    const [warehouseItems, setWarehouseItems] = useState([]);
    const [bills, setBills] = useState([]);
    const [IBanDetail, setIBanDetail] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const generalOrderId = order?.general_order?.id ? order?.general_order?.id : order?.order?.id || null;
    console.log(order?.payment?.status);

      useEffect(() => {
    
        if (orderHash) {
            sendOrderHash(orderHash).then((response) => {
                if (response?.order) {
                    setOrder(response);
                }
                if (response?.products) {
                    const warehouse_items = response.products.map(product => ({ warehouse_item: product }));
                    const kit = response.kits.map(kit => ({ kit: kit }));
                    setWarehouseItems(() => [ ...warehouse_items, ...kit ]);
                }
                if (response?.payment_bills?.length > 0) {
                    setBills(response.payment_bills);
                    if (response?.order?.id && response.payment_bills.find(bill => bill.type === 'IBAN')) {
                        getPaymentDetail(response.order.id).then((result) => {
                            if (result?.length > 0) {
                                setIBanDetail({
                                    ...result[0],
                                    purpose_of_payment: (result[0].purpose_of_payment ?? '') + ', платіж #' + response.payment.id
                                });
                            }
                        })
                    }
                }
            }).catch(err => {
                console.log(err);
            }).finally(() => setIsLoading(false))
        } else {
            setIsLoading(false);
        }
    }, [orderHash]);

    return (
        <>
            {!isLoading && order && (
                <div className={styles.statusWrap}>
                    <div className={styles.status}>
                        <div className={styles.status__logo}>
                            <img src={logo} alt=""/>
                        </div>
                        {order && (
                            <h2>Замовлення № {order.order.id}</h2>
                        )}

                        {order && (
                            <p className={styles.status__date}>
                                {order.order.created.substring(8, 10)}.{order.order.created.substring(5, 7)}.{order.order.created.substring(0, 4)}
                            </p>
                        )}
                        <Details orderId={generalOrderId} />
                        <InvoiceInfo order={order} />
                        <List products={warehouseItems}/>
                        {order?.payment && <Price payment={order.payment}/>}
                        {(order?.payment?.status === "PAY_WAIT" || order?.payment?.status === "PAID" ||order?.payment?.status === "NOT_PAID") && (
                            <Payment
                                bills={bills}
                                setBills={setBills}
                                IBanDetail={IBanDetail}
                                paymentId={order?.payment?.id}
                                isDisabled={(order?.products?.length === 0 && order?.kits?.length === 0) || !order?.payment?.final_amount}
                                isClientPage
                            />
                        )}
                    </div>
                </div>
            )}
            {isLoading && <Preloader/>}
            {!isLoading && !order && (
                <div className={styles.notFound}>
                    <h2 className={styles.message}>Замовлення не знайдено, зверніться до вашого менеджера Ego-textile для уточнення інформації.</h2>
                </div>
            )}
        </>
    )
}

export default Status;