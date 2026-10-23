import React, { useEffect, useRef, useState } from "react";
import styles from './Products.module.scss';
import ProductActions from "./ProductActions/ProductActions";
import DiscountField from "../../Common/DiscountField/DiscountField";
import CartProducts from "./CartProducts/CartProducts";
import TotalPrice from "../../Common/TotalPrice/TotalPrice";
import Preloader from "../../Common/Preloader/Preloader";
import ArrBack from "../../Common/ArrBack/ArrBack";
import { setGeneralOrderId, setIsNotFound } from "../../../store/main-slice";
import { useParams } from "react-router-dom";
import NotFound from "../../Common/NotFound/NotFound";
import { useAppDispatch } from "../../../hooks/redux";
import { useNavigate } from "react-router";
import { getAccessToken } from "../../../utils/authTokens";
import { getOrderInfo, getSuborders, removeOrder } from "../../../api/ordersApi";
import { getCartOrder } from "../../../api/productsApi";
import { updatePayment } from "../../../api/paymentApi";
import { setDeliverNP } from "../../../api/novaPoshtaApi";
import { getPriceWithDiscount } from "../../../utils/getPriceWithDiscount";
import { Suborder } from "../Main/Order/Suborder";
import { useIsDesktop } from "../../../hooks/useIsDesktop";

const Products = () => {
    const { id } = useParams();
    const dispatch = useAppDispatch();
    const [isLoading, setIsLoading] = useState(true);
    const [order, setOrder] = useState(null);
    const [suborders, setSuborders] = useState([]);
    const [warehouseItems, setWarehouseItems] = useState([]);
    const [discountType, setDiscountType] = useState('');
    const [percentInputValue, setPercentInputValue] = useState(0);
    const [UAHInputValue, setUAHInputValue] = useState(0);
    const [popup, setPopup] = useState(null);
    const [sourceID, setSourceID] = useState(null);
    const [sourceName, setSourceName] = useState(null);
    const isDisabled = order?.payment?.status === 'PAID' || order?.payment?.status === 'PAY_WAIT';
    const isDesktop = useIsDesktop();
    const [isCartLoaded, setIsCartLoaded] = useState(false);
    const paymentSyncQueueRef = useRef(Promise.resolve());
    const lastQueuedSyncKeyRef = useRef(null);
    const [estimateSyncCount, setEstimateSyncCount] = useState(0);
    const isEstimateSyncing = estimateSyncCount > 0;
    const navigate = useNavigate();

     const getNumberValue = (value) => {
        const number = Number(value);
        return Number.isFinite(number) ? number : 0;
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

        return !['SHIPMENT_READY', 'DELIVERED'].includes(deliveryOrderStatus);
    };

    const updateDeliveryEstimateAfterSuborderDelete = async (accessToken) => {
        if (!order?.id || !canUpdateDeliveryEstimateOrderPrice()) return;

        const generalOrderEstimateOrderPrice = getNumberValue(
            order?.payment?.final_amount ?? order?.payment?.amount
        );

        await setDeliverNP(accessToken, order.id, {
            estimate_order_price: generalOrderEstimateOrderPrice,
        });
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


    const handleSaveFinalPrice = () => {
        const rawDiscountValue = discountType === 'PERC' ? percentInputValue : UAHInputValue;
        const discountValue = getNumberValue(rawDiscountValue);

        const normalizedDiscountType = discountValue > 0 ? discountType : 'NONE';
        const normalizedDiscountAmount = discountValue > 0 ? discountValue : 0;

        const priceWithDiscount = normalizedDiscountType === 'NONE'
            ? getNumberValue(order?.payment?.amount)
            : getPriceWithDiscount(order?.payment?.amount, normalizedDiscountType, normalizedDiscountAmount);

        const payment = {
            final_amount: priceWithDiscount,
            discount_type: normalizedDiscountType,
            discount_amount: normalizedDiscountAmount,
        };

        syncPaymentAndEstimateOrderPrice(payment, priceWithDiscount);
    };

    const syncPaymentAndEstimateOrderPrice = (payment, estimateOrderPrice) => {
        if (!order?.id) return Promise.resolve();

        const deliveryOrderId = getDeliveryOrderId();

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
            setEstimateSyncCount(prev => prev + 1);

            try {
                const paymentResponse = await updatePayment(accessToken, order.id, payment);

                if (paymentResponse?.id) {
                    setOrder(prevOrder => ({ ...prevOrder, payment: paymentResponse }));
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
                console.error('Failed to sync payment and estimate_order_price', err);
            } finally {
                if (lastQueuedSyncKeyRef.current === syncKey) {
                    lastQueuedSyncKeyRef.current = null;
                }

                setEstimateSyncCount(prev => Math.max(0, prev - 1));
            }
        });

        return paymentSyncQueueRef.current;
    };

    useEffect(() => {
        let accessToken = getAccessToken();
        getOrderInfo(accessToken, id).then((response) => {
            if (response?.id) {
                if (response.general_order) {
                    dispatch(setGeneralOrderId(response.general_order.id));
                } else {
                    dispatch(setGeneralOrderId(null));
                }


                if (response?.source?.id) {
                    setSourceID(response.source.id);
                    setSourceName(response.source.name);
                } else {
                    setSourceID(null);
                    setSourceName(null);
                }

                const newOrder = response;
                if (!response?.payment) {
                    updatePayment(accessToken, response.id, { 'post_paid_amount': null }).then((res) => {
                        if (res?.id) {
                            newOrder.payment = res;
                        }
                    });
                }
                getSuborders(accessToken, { general_order: response.id }).then(result => {
                    if (result?.length > 0) {
                        setSuborders(result);
                    }
                }).catch(err => console.error(err));
                setOrder(newOrder);
                if (newOrder.payment) {
                    const { discount_type, discount_amount } = newOrder.payment;
                    setDiscountType(discount_type);
                    if (discount_type === 'PERC') {
                        setPercentInputValue(discount_amount || 0);
                    } else {
                        setUAHInputValue(discount_amount || 0);
                    }
                    accessToken = getAccessToken();
                    getCartOrder(accessToken, id).then((items) => {
                        setWarehouseItems(items || []);
                    }).finally(() => {
                        setIsCartLoaded(true);
                        setIsLoading(false);
                    })
                }
            } else {
                setIsLoading(false);
                dispatch(setIsNotFound(true));
            }
        }).catch(err => {
            console.error(err);
            setIsLoading(false);
        }).finally(() => setIsLoading(false))
    }, [])

    useEffect(() => {
        if (order?.id && order?.payment && isCartLoaded) {
           const result = getWarehouseItemsTotal(warehouseItems);
            const { discount_type, discount_amount } = order.payment;
            const priceWithDiscount = getPriceWithDiscount(result, discount_type, discount_amount);

            if (result !== order.payment.amount || priceWithDiscount !== order.payment.final_amount) {
                syncPaymentAndEstimateOrderPrice(
                    { amount: result, final_amount: priceWithDiscount },
                    priceWithDiscount
                );
            }
        }
    }, [order?.id, warehouseItems, isCartLoaded, order?.payment?.amount,
    order?.payment?.final_amount,
    order?.payment?.discount_type,
    order?.payment?.discount_amount]);

    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (!isEstimateSyncing) return;

            e.preventDefault();
            e.returnValue = '';
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [isEstimateSyncing]);

   const refreshSuborderAfterProductAdd = () => {
    const isSuborder = !order?.is_general && order?.general_order;

    if (!isSuborder || !order?.id) {
        return Promise.resolve();
    }

    const accessToken = getAccessToken();

    return new Promise((resolve) => {
        setTimeout(() => {
            Promise.all([
                getOrderInfo(accessToken, order.id),
                getCartOrder(accessToken, order.id),
            ]).then(([orderResponse, cartItems]) => {
                const nextOrder = orderResponse?.id ? orderResponse : order;
                const nextWarehouseItems = cartItems || [];

                if (orderResponse?.id) {
                    setOrder(orderResponse);
                }

                setWarehouseItems(nextWarehouseItems);

                const result = getWarehouseItemsTotal(nextWarehouseItems);

                const discountType = nextOrder?.payment?.discount_type;
                const discountAmount = nextOrder?.payment?.discount_amount;

                const priceWithDiscount = getPriceWithDiscount(
                    result,
                    discountType,
                    discountAmount
                );

                if (
                    result !== getNumberValue(nextOrder?.payment?.amount) ||
                    priceWithDiscount !== getNumberValue(nextOrder?.payment?.final_amount)
                ) {
                    syncPaymentAndEstimateOrderPrice(
                        { amount: result, final_amount: priceWithDiscount },
                        priceWithDiscount
                    );
                }
            }).finally(resolve);
        }, 500);
    });
};
    const handleOrderPayment = (payment) => {
        setOrder(prevOrder => ({ ...prevOrder, payment: payment }));
    }

    const deleteSuborder = (id) => {
        const accessToken = getAccessToken();

        removeOrder(accessToken, id).then(async status => {
            if (status === 204) {
                const newSuborders = suborders.filter(item => item.id !== id);
                setSuborders(newSuborders);

                await updateDeliveryEstimateAfterSuborderDelete(accessToken);
            }
        }).catch(error => {
            console.error('Failed to delete suborder and update estimate_order_price', error);
        });
    };

    if (isLoading) {
        return (
            <Preloader />
        )
    } else if (!order) {
        return (
            <NotFound message={`Замовлення №${id} не знайдено`} />
        )
    }

    const nextPage = () => {
        if (id) {
            navigate(order?.general_order ? `/order_status/${id}` : `/deliveryNP/${id}`);
        }
    }

    return (
        <div className={styles.products} style={{ backgroundColor: order?.is_general ? '#D9D1E0' : '#f7eadf' }}>
            <div className={styles.wrap}>
                {isDesktop && <ArrBack />}
                <div className={styles.grid}>
                    <div><h2 className={styles.products__title}>Товар</h2></div>
                    <div></div>
                </div>
                <div className={`${styles.grid} ${styles.mobileWrap}`}>
                    <div>
                        {!warehouseItems.length && <p>На даний момент немає товарів у замовленні</p>}
                        {warehouseItems && (
                            <CartProducts
                                items={warehouseItems}
                                setItems={setWarehouseItems}
                                setOrderPayment={handleOrderPayment}
                                isDisabled={isDisabled}
                                sourceName={sourceName}
                            />
                        )}
                        {isDesktop && (suborders.length > 0 && (
                            <div className={styles.suborderWrapper}>
                                <h3>Підзамовлення</h3>
                                {suborders.map(item => (
                                    <Suborder key={item.id} item={item} onDelete={deleteSuborder} />
                                ))}
                            </div>
                        ))}
                        {isDesktop && <div className="globalBtnWrap">
                            <button className="globalBtn button-xs" onClick={nextPage}>
                                <span>Далі</span>
                            </button>
                        </div>}
                    </div>
                    <div>
                        <ProductActions
                            order={order}
                            popup={popup}
                            setPopup={setPopup}
                            setOrder={setWarehouseItems}
                            isDisabled={isDisabled}
                            sourceID={sourceID}
                            onAfterProductAdd={refreshSuborderAfterProductAdd}
                        />
                        <TotalPrice totalPrice={order?.payment?.amount}
                            priceWithDiscount={order?.payment?.final_amount} />
                        <DiscountField
                            percentInputValue={percentInputValue}
                            setPercentInputValue={setPercentInputValue}
                            UAHInputValue={UAHInputValue}
                            setUAHInputValue={setUAHInputValue}
                            discountType={discountType}
                            setDiscountType={setDiscountType}
                            onSubmit={handleSaveFinalPrice}
                            popup={popup}
                            setPopup={setPopup}
                            orderId={order?.id}
                            isDisabled={isDisabled}
                            orderDiscountCalc
                            orderAmount={order?.payment?.amount}
                        />
                        {!isDesktop && (suborders.length > 0 && (
                            <div className={styles.suborderWrapper}>
                                <h3>Підзамовлення</h3>
                                {suborders.map(item => (
                                    <Suborder key={item.id} item={item} onDelete={deleteSuborder} />
                                ))}
                            </div>
                        ))}
                        {!isDesktop && <div className="globalBtnWrap">
                            <button className="globalBtn button-xs" onClick={nextPage}>
                                <span>Далі</span>
                            </button>
                        </div>}
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
    )
}

export default Products;