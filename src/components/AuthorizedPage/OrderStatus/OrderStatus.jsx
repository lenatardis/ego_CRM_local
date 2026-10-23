import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import styles from "./OrderStatus.module.scss";
import OrderInfoBlock from "../../Common/OrderInfoBlock/OrderInfoBlock";
import ProductItem from "../../Common/ProductItem/ProductItem";
import OrderActions from "./OrderActions";
import ArrBack from "../../Common/ArrBack/ArrBack";
import { useAppDispatch } from "../../../hooks/redux";
import Preloader from "../../Common/Preloader/Preloader";
import NotFound from "../../Common/NotFound/NotFound";
import { setGeneralOrderId, setIsNotFound } from "../../../store/main-slice";
import { getAccessToken } from "../../../utils/authTokens";
import { getDeliverNP, setDeliverNP } from "../../../api/novaPoshtaApi";
import { getCartOrder, removeProduct } from "../../../api/productsApi";
import { getOrderInfo, getSuborders } from "../../../api/ordersApi";
import {
    createPaymentBill,
    deletePaymentBill,
    getPaymentBills,
    getPayments,
    updatePayment,
    updatePaymentBill,
} from "../../../api/paymentApi";
import { Payment } from "./Payment/Payment";
import { Bill } from "./Bill/Bill";
import { getPriceWithDiscount } from "../../../utils/getPriceWithDiscount";
import { approveReceipt } from "../../../api/receiptApi";
import { getOrderMessageText } from "../../../utils/getOrderMessageText";
import { useIsDesktop } from "../../../hooks/useIsDesktop";

const OrderStatus = () => {
    const { id: orderId } = useParams();
    const dispatch = useAppDispatch();

    const [isLoading, setIsLoading] = useState(true);
    const [order, setOrder] = useState(null);
    const [bills, setBills] = useState([]);
    const [availableSum, setAvailableSum] = useState(0);
    const [warehouseItems, setWarehouseItems] = useState([]);
    const [deliveryInfo, setDeliveryInfo] = useState(null);
    const [isCartLoaded, setIsCartLoaded] = useState(false);
    const [TTNURL, setTTNURL] = useState(null);

    const paymentSyncQueueRef = useRef(Promise.resolve());
    const lastQueuedSyncKeyRef = useRef(null);
    const [estimateSyncCount, setEstimateSyncCount] = useState(0);
    const isEstimateSyncing = estimateSyncCount > 0;

    const isDesktop = useIsDesktop();

    const requiredPaymentFields = {
        first_name: order?.customer?.first_name,
        last_name: order?.customer?.last_name,
        phone: order?.customer?.phone,
        productsAmount: (order?.kit_count ?? 0) + (order?.warehouse_item_count ?? 0),
    };

    const isDisabled =
        order?.payment?.status === "PAID" ||
        order?.payment?.status === "NOT_PAID" ||
        order?.payment?.status === "PAY_WAIT" ||
        !order?.payment?.final_amount;

    const caption =
        '*Для того щоб додати новий або відредагувати рахунок змініть статус замовлення на "В обробці"';
    const caption2 = "*Доступна сума дорівнює нулю";
    const caption3 = "*Неможливо додати новий рахунок при повному методі оплати";
    const caption4 = "*Для того щоб додати новий рахунок додайте товар(и)";
    const caption5 = "*Максимально можливо створити 2 рахунки";

    const isMaxBillsCountReached = bills.length >= 2;


    const getOrderStatusName = (orderStatus) => {
        switch (orderStatus) {
            case "PAID":
                return "Оплачено";
            case "IN_PROG":
                return "В обробці";
            case "PAY_WAIT":
                return "Очікує оплати";
            case "NOT_PAID":
                return "Не оплачено";
            default:
                console.log(orderStatus);
                break;
        }
        return orderStatus;
    };

    const getOrderGeneralStatusText = (status) => {
        switch (status) {
            case "NEW":
                return "Замовлення створено";
            case "IN_PRODUCTION":
                return "Товари із цього замовлення вже в процесі виготовлення";
            case "SHIPMENT_READY":
                return "Це замовлення готове до відправки";
            case "DELIVERED":
                return "Це замовлення доставлено";
            default:
                console.log(status);
                return status;
        }
    };

    const getNumberValue = (value) => {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
};

  const getPaymentStatusBarText = (payment) => {
        if (
            payment?.status === "PAY_WAIT" &&
            getNumberValue(payment?.already_paid_amount) > 0
        ) {
            return "Очікує повної оплати";
        }

    return getOrderStatusName(payment?.status);
};

    const getWarehouseItemsTotal = (items = []) => {
        return items.reduce((sum, { warehouse_item, kit }) => {
            const price = warehouse_item ? warehouse_item.price : kit?.price;

            return sum + getNumberValue(price);
        }, 0);
    };

    const getDeliveryOrderId = () => {
        return order?.general_order?.id || order?.id;
    };

    const getDeliveryOrderStatus = () => {
        return order?.general_order?.status || order?.status;
    };

    const canUpdateDeliveryEstimateOrderPrice = () => {
        const deliveryOrderStatus = getDeliveryOrderStatus();

        return !["SHIPMENT_READY", "DELIVERED"].includes(deliveryOrderStatus);
    };

    const getRelatedEstimateOrderPrice = async (accessToken) => {
        if (!order?.id) return 0;

        // Ми в головному замовленні: друга половинка — final_amount підзамовлення
        if (order?.is_general) {
            const result = await getSuborders(accessToken, { general_order: order.id });
            const suborder = Array.isArray(result) ? result[0] : null;

            return getNumberValue(suborder?.payment?.final_amount);
        }

        // Ми в підзамовленні: друга половинка — final_amount головного замовлення
        return getNumberValue(order?.general_order?.payment?.final_amount);
    };

    const sendPayment = (payment) => {
        const accessToken = getAccessToken();

        return updatePayment(accessToken, order.id, payment).then((res) => {
            if (res?.id) {
                setOrder((prevOrder) => ({ ...prevOrder, payment: res }));
            }

            return res;
        });
    };

    const mapBillTypeToPaymentType = (billType) => {
        switch (billType) {
            case "ONLINE":
                return "ONLINE";
            case "IBAN":
                return "REQ";
            case "TAX":
                return "POSTPAID";
            default:
                return null;
        }
    };

    const getPaymentTypeFromBills = (updatedBills, { useFirstBillFallback = false } = {}) => {
        if (!updatedBills?.length) return null;

        const [firstBill] = updatedBills;

        if (firstBill?.method === "FULL" || useFirstBillFallback) {
            return mapBillTypeToPaymentType(firstBill?.type);
        }

        if (updatedBills.length > 1) {
            return mapBillTypeToPaymentType(updatedBills[1]?.type);
        }

        return null;
    };

    const syncPaymentTypeFromBills = (updatedBills, options) => {
        const paymentType = getPaymentTypeFromBills(updatedBills, options);

        if (!paymentType || paymentType === order?.payment?.type) return Promise.resolve();

        return sendPayment({ type: paymentType });
    };

    const syncPaymentAndEstimateOrderPrice = (payment, estimateOrderPrice) => {
        if (!order?.id) return Promise.resolve();

        const deliveryOrderId = getDeliveryOrderId();

        if (!deliveryOrderId) return Promise.resolve();

        const syncKey = JSON.stringify({
            orderId: order.id,
            deliveryOrderId,
            payment,
            estimateOrderPrice,
        });

        if (lastQueuedSyncKeyRef.current === syncKey) {
            return paymentSyncQueueRef.current;
        }

        lastQueuedSyncKeyRef.current = syncKey;

        paymentSyncQueueRef.current = paymentSyncQueueRef.current.finally(async () => {
            const accessToken = getAccessToken();
            setEstimateSyncCount((prev) => prev + 1);

            try {
                const paymentResponse = await updatePayment(accessToken, order.id, payment);

                if (paymentResponse?.id) {
                    setOrder((prevOrder) => ({ ...prevOrder, payment: paymentResponse }));
                }

                const currentEstimateOrderPrice = getNumberValue(
                    paymentResponse?.final_amount ?? estimateOrderPrice
                );

                if (canUpdateDeliveryEstimateOrderPrice()) {
                    const relatedEstimateOrderPrice = await getRelatedEstimateOrderPrice(accessToken);

                    const totalEstimateOrderPrice =
                        currentEstimateOrderPrice + relatedEstimateOrderPrice;

                    await setDeliverNP(accessToken, deliveryOrderId, {
                        estimate_order_price: totalEstimateOrderPrice,
                    });
                }
            } catch (err) {
                lastQueuedSyncKeyRef.current = null;
                console.error("Failed to sync payment and estimate_order_price", err);
            } finally {
                if (lastQueuedSyncKeyRef.current === syncKey) {
                    lastQueuedSyncKeyRef.current = null;
                }

                setEstimateSyncCount((prev) => Math.max(0, prev - 1));
            }
        });

        return paymentSyncQueueRef.current;
    };

    const updateAvailableSum = (updatedBills, finalAmount = order?.payment?.final_amount) => {
        const final = Number(finalAmount) || 0;
        const alreadyPaid = Number(order?.payment?.already_paid_amount) || 0;

        const toPaySum = final - alreadyPaid;

        const payWaitSum = (updatedBills ?? []).reduce((acc, el) => {
            if (el?.status === "PAID") return acc;
            return acc + (Number(el?.prepayment_amount) || 0);
        }, 0);

        setAvailableSum(toPaySum - payWaitSum);
    };

    const handleSaveFinalPrice = (finalPrice, discountType, discountValue) => {
        const normalizedDiscountValue = getNumberValue(discountValue);

        const normalizedDiscountType = normalizedDiscountValue > 0 ? discountType : "NONE";
        const normalizedDiscountAmount = normalizedDiscountValue > 0 ? normalizedDiscountValue : 0;

        const normalizedFinalPrice = normalizedDiscountType === "NONE"
            ? getNumberValue(order?.payment?.amount)
            : finalPrice;

        const roundedFinalPrice = Math.ceil(normalizedFinalPrice);

        const payment = {
            final_amount: roundedFinalPrice,
            discount_type: normalizedDiscountType,
            discount_amount: normalizedDiscountAmount,
        };

        updateAvailableSum(bills, roundedFinalPrice);
        syncPaymentAndEstimateOrderPrice(payment, roundedFinalPrice);
    };

    useEffect(() => {
        let accessToken = getAccessToken();

        getOrderInfo(accessToken, orderId)
            .then((response) => {
                if (response?.id) {
                    const generalOrderId = response.general_order?.id || orderId;

                    if (response.general_order) {
                        dispatch(setGeneralOrderId(response.general_order.id));
                    } else {
                        dispatch(setGeneralOrderId(null));
                    }

                    setOrder(response);

                    accessToken = getAccessToken();

                    getCartOrder(accessToken, orderId)
                        .then((resp) => {
                            setWarehouseItems(resp || []);
                        })
                        .finally(() => {
                            setIsCartLoaded(true);
                            setIsLoading(false);
                        });

                    getDeliverNP(accessToken, generalOrderId).then((result) => {
                        if (result && result.length > 0) {
                            setDeliveryInfo(result[0]);
                        }
                    });

                    if (response?.payment?.id) {
                        getPaymentBills(accessToken, response.payment.id)
                            .then((result) => {
                                const billsArr = result ?? [];
                                if (billsArr.length > 0) {
                                    setBills(billsArr);
                                }
                                updateAvailableSum(billsArr, response.payment.final_amount);
                            })
                            .catch((err) => console.log(err));
                    }
                } else {
                    setIsLoading(false);
                    dispatch(setIsNotFound(true));
                }
            })
            .catch((err) => {
                console.log(err);
                setIsLoading(false);
            });
    }, []);

    useEffect(() => {
        if (order?.id && order?.payment && isCartLoaded) {
           const result = getWarehouseItemsTotal(warehouseItems);

            const { discount_type, discount_amount } = order.payment;
            const priceWithDiscount = getPriceWithDiscount(result, discount_type, discount_amount);

            if (result !== Number(order.payment.amount) || priceWithDiscount !== Number(order.payment.final_amount)) {
                syncPaymentAndEstimateOrderPrice(
                    { amount: result, final_amount: priceWithDiscount },
                    priceWithDiscount
                );
            }
        }
    }, [
        order?.id,
        warehouseItems,
        isCartLoaded,
        order?.payment?.amount,
        order?.payment?.final_amount,
        order?.payment?.discount_type,
        order?.payment?.discount_amount
    ]);

    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (!isEstimateSyncing) return;

            e.preventDefault();
            e.returnValue = "";
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [isEstimateSyncing]);

    const handleDeleteItem = (id) => {
        const accessToken = getAccessToken();
        removeProduct(accessToken, id).then((result) => {
            if (result === 204) {
                const newItems = warehouseItems.filter((item) => item.id !== id);
                setWarehouseItems(newItems);

                if (newItems.length === 0) {
                    syncPaymentAndEstimateOrderPrice(
                        { final_amount: null, amount: null, status: "NONE" },
                        0
                    );
                }
            }
        });
    };

    const onCopyAll = async () => {
        const resultText = getOrderMessageText(orderId, order, deliveryInfo, warehouseItems);
        try {
            await navigator.clipboard.writeText(resultText);
        } catch (error) {
            console.log(error);
        }
    };

    const handleAddNewBill = () => {
        if (bills.length >= 2) return;
        const accessToken = getAccessToken();
        let body = null;

        if (bills.length === 0) {
            body = { payment: order.payment.id, method: "PREPAYMENT" };
        } else {
            body = {
                payment: order.payment.id,
                method: "POSTPAID",
                prepayment_amount: Number(order.payment.final_amount) - (Number(bills[0].prepayment_amount) || 0),
            };
        }

        createPaymentBill(accessToken, body)
            .then((resp) => {
                const newBills = [...bills, resp];
                setBills(newBills);
                updateAvailableSum(newBills);
                syncPaymentTypeFromBills(newBills);
            })
            .catch((err) => console.log(err));
    };

    const handleBillUpdate = (id, keyOrPayload, value) => {
        const accessToken = getAccessToken();

        const updates =
            typeof keyOrPayload === "object" && keyOrPayload !== null ? keyOrPayload : { [keyOrPayload]: value };

        const extraFields = updates.method === "FULL" ? { prepayment_amount: Number(order.payment.final_amount) } : {};

        const payload = {
            ...updates,
            ...extraFields,
            payment: order.payment.id,
        };

        updatePaymentBill(accessToken, id, payload)
            .then(async (resp) => {
                if (resp?.id) {
                    let newBills = bills.map((bill) => (bill.id === resp.id ? resp : bill));

                    const isFirstBillUpdated = bills[0]?.id === resp.id;
                    const shouldResetOtherBills =
                        isFirstBillUpdated &&
                        resp.method === "FULL" &&
                        newBills.length > 1;

                    if (shouldResetOtherBills) {
                        const resetBills = await Promise.all(
                            newBills.slice(1).map((bill) =>
                                updatePaymentBill(accessToken, bill.id, {
                                    payment: order.payment.id,
                                    prepayment_amount: 0,
                                })
                            )
                        );

                        newBills = newBills.map((bill) => {
                            const resetBill = resetBills.find((item) => item?.id === bill.id);
                            return resetBill || bill;
                        });
                    }

                    updateAvailableSum(newBills);
                    setBills(newBills);
                    syncPaymentTypeFromBills(newBills);
                }
            })
            .catch((err) => console.log(err))
            .finally(() => setIsLoading(false));
    };

    const handleBillDelete = (id) => {
        const accessToken = getAccessToken();
        deletePaymentBill(accessToken, id).then((status) => {
            if (status === 204) {
                const newBills = bills.filter((bill) => bill.id !== id);

                updateAvailableSum(newBills);
                setBills(newBills);
                syncPaymentTypeFromBills(newBills, { useFirstBillFallback: true });
            }
        });
    };
    const handleBillSubmitPayment = (id, approved) => {
        const accessToken = getAccessToken();
        const formData = new FormData();
        formData.append("payment", id);
        formData.append("is_approved", approved);

        approveReceipt(accessToken, formData)
            .then((resp) => {
                if (resp?.id) {
                    const newBills = bills.map((bill) => (bill.id === resp.id ? resp : bill));
                    updateAvailableSum(newBills);
                    setBills(newBills);

                    getPayments(accessToken, order.id)
                        .then((result) => {
                            if (result?.length > 0) {
                                setOrder((prevOrder) => ({ ...prevOrder, payment: result[0] }));
                            }
                        })
                        .catch((err) => console.log(err));
                }
            })
            .catch((err) => console.log(err));
    };

    if (isLoading) return <Preloader />;
    if (!order) return <NotFound message={`Замовлення №${orderId} не знайдено`} />;

    const desktopSpecialPadding = order?.customer?.url || deliveryInfo?.receiver?.department_number || deliveryInfo?.delivery?.ttn;

    return (
        <div className={styles.orderStatus} style={{ backgroundColor: order?.is_general ? "#D9D1E0" : "#f7eadf" }}>
            <div className={styles.statusWrap}>
                {isDesktop && <ArrBack />}

                <div className={styles.grid}>
                    <div>
                        {order?.id && (
                            <h2 className={desktopSpecialPadding ? styles.desktopSpecialPadding : ""}>
                                {order?.is_general ? "Замовлення" : "Підзамовлення"} № {order.id}
                            </h2>
                        )}
                        <OrderInfoBlock
                            url={order?.customer?.url}
                            departmentNumber={deliveryInfo?.receiver?.department_number}
                            ttn={deliveryInfo?.delivery?.ttn}
                        />
                    </div>
                    <div></div>
                </div>

                <div className={styles.grid}>
                    <div>
                        {order?.status && (
                            <h3><strong>{getOrderGeneralStatusText(order.status)}</strong></h3>
                        )}
                        {order?.payment?.status && order?.payment?.status !== "NONE" && (
                            <div
                                className={`${styles.statusBar} ${order.payment.status === "PAID"
                                    ? styles.paid
                                    : order.payment.status === "NOT_PAID"
                                        ? styles.notPaid
                                        : ""
                                    }`}
                            >
                                <span>
                                    Поточний статус оплати цього замовлення - <strong>{getPaymentStatusBarText(order.payment)}</strong>
                                </span>
                            </div>
                        )}

                        {warehouseItems?.length > 0 &&
                            warehouseItems.map((el, index) => (
                                <ProductItem key={index} item={el} isDisabled={isDisabled} onDelete={handleDeleteItem} sourceName={order?.source?.name} />
                            ))}

                        {isDesktop &&
                            (bills.length > 0 ? (
                                <>
                                    <h3 className={styles.desktopListTitle}>Список рахунків</h3>
                                    <div className={styles.bills}>
                                        {bills.map((el, index) => (
                                            <Bill
                                                key={index}
                                                bill={el}
                                                number={index + 1}
                                                updateBill={(key, value) => handleBillUpdate(el.id, key, value)}
                                                onSubmitPayment={handleBillSubmitPayment}
                                                onDelete={handleBillDelete}
                                                isDisabled={isDisabled}
                                                isFullDisabled={bills.length > 1}
                                                availableSum={availableSum}
                                            />
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <h3>Рахунки відсутні</h3>
                            ))}

                        {isDesktop && order?.payment?.id && (
                            <>
                                <button
                                    className={styles.newBillBtn}
                                    onClick={handleAddNewBill}
                                    disabled={isDisabled || bills[0]?.method === "FULL" || availableSum <= 0 || isMaxBillsCountReached}
                                >
                                    <span>Новий рахунок</span>
                                </button>

                                {(
                                    order?.payment?.status === "NOT_PAID" ||
                                    order?.payment?.status === "PAY_WAIT") && <p className={styles.caption}>{caption}</p>}

                                {availableSum <= 0 && order?.payment?.final_amount ? <p className={styles.caption}>{caption2}</p> : null}

                                {bills[0]?.method === "FULL" && <p className={styles.caption}>{caption3}</p>}

                                {!order?.payment?.final_amount && <p className={styles.caption}>{caption4}</p>}
                                {isMaxBillsCountReached && <p className={styles.caption}>{caption5}</p>}
                            </>
                        )}
                    </div>

                    <div>
                        <OrderActions
                            orderUrl={order?.url}
                            isDisabled={isDisabled}
                            onCopyAll={onCopyAll}
                            ttnURL={TTNURL}
                            deliveryInfo={deliveryInfo}
                            setTTNURL={setTTNURL}
                        />

                        {order?.payment && (
                            <>
                                <h3>Оплата</h3>
                                <Payment
                                    payment={order.payment}
                                    handleSaveFinalPrice={handleSaveFinalPrice}
                                    handleStatusChange={(status) => sendPayment({ status })}
                                    isPaymentAllowed={Object.values(requiredPaymentFields).every((value) => !!value)}
                                    orderDiscountCalc
                                    orderAmount={order?.payment?.amount}
                                />

                                {!isDesktop &&
                                    (bills.length > 0 ? (
                                        <>
                                            <h3>Список рахунків</h3>
                                            <div className={styles.bills}>
                                                {bills.map((el, index) => (
                                                    <Bill
                                                        key={index}
                                                        bill={el}
                                                        number={index + 1}
                                                        updateBill={(key, value) => handleBillUpdate(el.id, key, value)}
                                                        onSubmitPayment={handleBillSubmitPayment}
                                                        onDelete={handleBillDelete}
                                                        isDisabled={isDisabled}
                                                        isFullDisabled={bills.length > 1}
                                                        availableSum={availableSum}
                                                    />
                                                ))}
                                            </div>
                                        </>
                                    ) : (
                                        <h3>Рахунки відсутні</h3>
                                    ))}

                                {!isDesktop && order?.payment?.id && (
                                    <div className={styles.mobileBtnWrap}>
                                        <button
                                            className={`${styles.newBillBtn} ${isDisabled ? styles.disabledMargin : ""}`}
                                            onClick={handleAddNewBill}
                                            disabled={isDisabled || bills[0]?.method === "FULL" || availableSum <= 0 || isMaxBillsCountReached}
                                        >
                                            <span>Новий рахунок</span>
                                        </button>

                                        {(order?.payment?.status === "PAID" ||
                                            order?.payment?.status === "NOT_PAID" ||
                                            order?.payment?.status === "PAY_WAIT") && <p className={styles.caption}>{caption}</p>}

                                        {availableSum <= 0 && order?.payment?.final_amount ? <p className={styles.caption}>{caption2}</p> : null}

                                        {bills[0]?.method === "FULL" && <p className={styles.caption}>{caption3}</p>}

                                        {!order?.payment?.final_amount && <p className={styles.caption}>{caption4}</p>}

                                        {isMaxBillsCountReached && <p className={styles.caption}>{caption5}</p>}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {isEstimateSyncing && (
                    <div className={styles.syncOverlay}>
                        <div className={styles.syncOverlay__box}>
                            Синхронізуємо суму доставки...
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderStatus;