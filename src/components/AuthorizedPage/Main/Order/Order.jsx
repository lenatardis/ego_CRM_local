import React, { useEffect, useState } from "react";
import styles from './Order.module.scss';
import items from '../../../../assets/icons/itemsIcon.svg'
import menu from '../../../../assets/icons/menuDots.svg'
import { useNavigate } from "react-router";
import OrderMenu from "./OrderMenu";
import CancelOrder from "./Popup/CancelOrder";
import { useAppDispatch, useAppSelector } from "../../../../hooks/redux";
import { removeStateOrder } from "../../../../store/main-slice";
import { getAccessToken } from "../../../../utils/authTokens";
import { getSuborders, removeOrder, setNewOrder } from "../../../../api/ordersApi";
import { setDeliverNP } from "../../../../api/novaPoshtaApi";
import { getFormattedDate } from "../../../../utils/getFormattedDate";
import { Suborder } from "./Suborder";
import { getUser } from "../../../../store/selectors";
import { CircularProgress } from "@mui/material";
import closeIcon from "../../../../assets/icons/closeCross.svg";
import instagramIcon from "../../../../assets/icons/instagram.svg";
import addIcon from "../../../../assets/icons/plusDark.svg";
import arrowIcon from "../../../../assets/icons/arrowDown.svg";
import linkIcon from "../../../../assets/icons/paperclip.svg";
import { useIsDesktop } from "../../../../hooks/useIsDesktop";

const Order = ({ item, tabName }) => {
    const navigate = useNavigate();
    const [showMenu, setShowMenu] = useState(false);
    const [isShowPopup, setIsShowPopup] = useState(false);
    const [suborders, setSuborders] = useState([]);
    const [suborderCreateError, setSuborderCreateError] = useState('');
    const [subordersCount, setSubordersCount] = useState(item.sub_orders_count || 0);
    const [isSubordersOpen, setIsSubordersOpen] = useState(false);
    const [isSuborderLoading, setIsSuborderLoading] = useState(false);
    const { id: managerId } = useAppSelector(getUser);
    const dispatch = useAppDispatch();
    const isDesktop = useIsDesktop();


    const onEditOrder = () => {
        const path = item.is_general ? `/order/${item.id}` : `/products/${item.id}`;
        navigate(path);
    }

    const openPopup = () => {
        setShowMenu(false);
        setIsShowPopup(true);
    }

    const closePopup = () => {
        setIsShowPopup(false);
    }

    const deleteOrder = () => {
        const accessToken = getAccessToken();
        setShowMenu(false);
        setIsShowPopup(false);
        removeOrder(accessToken, item.id).then((result) => {
            if (result && result === 204) {
                dispatch(removeStateOrder(item.id));
            }
        })
    }

    const handleOpenSuborders = (e) => {
        e.stopPropagation();
        if (!isSubordersOpen && !suborders.length) {
            const accessToken = getAccessToken();
            setIsSuborderLoading(true);
            getSuborders(accessToken, { general_order: item.id }).then(result => {
                if (result?.length > 0) {
                    setSuborders(result);
                    setSubordersCount(result?.length || 0);
                }
            }).finally(() => setIsSuborderLoading(false));
        }
        setIsSubordersOpen(!isSubordersOpen);
    }

    const getSuborderCreateErrorMessage = (response) => {
        const sourceError = Array.isArray(response?.source)
            ? response.source.join(' ')
            : response?.source;

        if (
            typeof sourceError === 'string' &&
            sourceError.includes('Invalid pk') &&
            sourceError.includes('object does not exist')
        ) {
            return 'Вибачте, на жаль, Ви не можете створити підзамовлення, так як було видалено джерело цін головного замовлення.';
        }

        if (sourceError) {
            return sourceError;
        }

        if (response?.detail) {
            return response.detail;
        }

        if (response?.error) {
            return response.error;
        }

        return 'Не вдалося створити підзамовлення.';
    }

    const createSuborder = (e) => {
        e.stopPropagation();

        if (managerId) {
            const accessToken = getAccessToken();
            const params = {
                manager: managerId,
                is_general: false,
                general_order: item.id,
                customer: item.customer.id,
                source: item?.source?.id
            };

            setNewOrder(accessToken, params)
                .then((response) => {
                    if (response?.id) {
                        navigate(`/products/${response.id}`);
                        return;
                    }

                    setSuborderCreateError(getSuborderCreateErrorMessage(response));
                })
                .catch((error) => {
                    setSuborderCreateError(error?.message || 'Не вдалося створити підзамовлення.');
                });
        }
    }

    const getNumberValue = (value) => {
        const number = Number(value);
        return Number.isFinite(number) ? number : 0;
    };

    const canUpdateDeliveryEstimateOrderPrice = () => {
        return !['SHIPMENT_READY', 'DELIVERED'].includes(item?.status);
    };

    const updateDeliveryEstimateAfterSuborderDelete = async (accessToken) => {
        if (!item?.id || !canUpdateDeliveryEstimateOrderPrice()) return;

        const generalOrderEstimateOrderPrice = getNumberValue(
            item?.payment?.final_amount ?? item?.payment?.amount
        );

        await setDeliverNP(accessToken, item.id, {
            estimate_order_price: generalOrderEstimateOrderPrice,
        });
    };

    const deleteSuborder = (id) => {
        const accessToken = getAccessToken();

        removeOrder(accessToken, id).then(async status => {
            if (status === 204) {
                const newSuborders = suborders.filter(item => item.id !== id);

                setSuborders(newSuborders);
                setSubordersCount(newSuborders.length);

                if (newSuborders.length === 0) {
                    setIsSubordersOpen(false);
                }

                await updateDeliveryEstimateAfterSuborderDelete(accessToken);
            }
        }).catch(error => {
            console.error('Failed to delete suborder and update estimate_order_price', error);
        });
    };

    useEffect(() => {
        setSuborders([]);
        setSubordersCount(item.sub_orders_count || 0);
        setIsSubordersOpen(false);
    }, [item])

    return (
        <div className={`${styles.order} ${item.is_general ? styles.general : ''}`} onClick={() => {
            onEditOrder()
        }}>
            <p className={styles.order__header}>
                <span>{!item.is_general ? 'Підзамовлення ' : ''}#{item.id}{item.is_immediate && <span className={styles.immediate}> (термінове)</span>}</span>
                {item?.source?.name && <span>{item.source.name}</span>}
                <span>{getFormattedDate(item.created)}</span>
            </p>
            {item.general_order && (
                <button
                    className={styles.generalOrderLink}
                    onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/order/${item.general_order.id}`);
                    }}
                >
                    <img src={linkIcon} width={12} alt="link" />
                    <span>Головне замовлення</span>
                </button>
            )}
            <div className={styles.content}>
                <div className={styles.content__boxes}>
                    <div className={styles.box}>
                        <span className={styles.box__role}>Замовник</span>
                        {item?.customer?.username && (
                            <a
                                href={item.customer.url}
                                target="_blank"
                                rel="noreferrer"
                                onClick={e => e.stopPropagation()}
                                className={styles.customerLink}
                            >
                                <img src={instagramIcon} alt="instagram" />
                                <p className={styles.box__text}>{item.customer.username}</p>
                            </a>
                        )}
                        {item?.customer && (
                            <p className={styles.box__text}>{item.customer.last_name} {item.customer.first_name} {item.customer.middle_name}</p>
                        )}
                        {item?.customer && item.customer.phone && (
                            <p className={styles.box__phone}>{item.customer.phone}</p>
                        )}
                    </div>
                    <div className={styles.box}>
                        <span className={styles.box__role}>Менеджер</span>
                        <p className={styles.box__text}>{item.managerNickname}</p>
                        {item && item.manager && (
                            <p className={styles.box__text}>{item.manager.username}</p>
                        )}
                        {item && item.manager && (
                            <p className={styles.box__text}>{item.manager.last_name} {item.manager.first_name} {item.manager.middle_name}</p>
                        )}

                    </div>
                </div>
                <div className={styles.content__count}>
                    <img src={items} alt="" />
                    <p>Склад: {item.warehouse_item_count ? item.warehouse_item_count : 0}</p>
                    <p>Виробництво: {item.kit_count ? item.kit_count : 0}</p>
                    <span className={styles.separateLine}></span>
                    <p className={styles.totalCount}>Всього товарів: {(item?.warehouse_item_count || 0) + (item?.kit_count || 0)}</p>
                </div>
            </div>
            <div className={styles.order__footerWrapper}>
                <div className={styles.order__footer}>
                    <span>{item?.payment?.final_amount ? item.payment.final_amount : item?.payment?.amount ? item.payment.amount : 0} грн</span>
                    <div className={styles.actions}>
                        {item.is_general && subordersCount < 1 && (
                            <button
                                className={styles.menuBtn}
                                onClick={createSuborder}
                                title="Додати підзамовлення"
                            >
                                <img src={addIcon} width={16} height={16} alt="" />
                            </button>
                        )}
                        <button className={styles.menuBtn} onClick={(e) => {
                            e.stopPropagation()
                            setShowMenu(true);
                        }}>
                            <img src={menu} alt="" />
                        </button>
                    </div>
                </div>
            </div>
            {item.is_general && subordersCount > 0 && (
                <button
                    className={`${styles.openBtn} ${isSubordersOpen ? styles.open : ''}`}
                    onClick={handleOpenSuborders}
                >
                    <img src={arrowIcon} alt="open" />
                </button>
            )}
            {showMenu && (
                <OrderMenu
                    setShowMenu={setShowMenu}
                    onEditOrder={onEditOrder}
                    id={item.id}
                    openPopup={openPopup}
                    isFavorite={item.is_favourite}
                    tabName={tabName}
                    isGeneral={item.is_general}
                />
            )}
            {isShowPopup && (
                <>
                    <span
                        className={isShowPopup ? styles.shadowActive : styles.shadowhide}
                        onClick={(e) => {
                            e.stopPropagation();
                            closePopup();
                        }}
                    />
                    <div className={`${isShowPopup ? styles.globalPopupActive : styles.globalPopup} ${isDesktop ? styles.centeredPopup : ''
                        }`}
                        onClick={(e) => e.stopPropagation()}>
                        <div className={styles.header}>
                            <p className={styles.header__title}>Видалення замовлення</p>
                            <div className={styles.header__close} onClick={() => closePopup()}>
                                <span>Закрити</span>
                                <button>
                                    <img src={closeIcon} alt="" />
                                </button>
                            </div>
                        </div>
                        <div className={styles.globalPopup__content}>
                            <CancelOrder onCancel={closePopup} onConfirm={deleteOrder} />
                        </div>
                    </div>
                </>
            )}
            {isSubordersOpen && (
                <div className={styles.suborderWrapper}>
                    {isSuborderLoading ? (
                        <div className={styles.loading}>
                            <CircularProgress size={26} color="inherit" />
                        </div>
                    ) : suborders.length > 0 ? (
                        <>
                            <h3>Підзамовлення</h3>
                            {suborders.map(item => (
                                <Suborder key={item.id} item={item} onDelete={deleteSuborder} />
                            ))}
                        </>
                    ) : (
                        <h3>Підзамовлення відсутні</h3>
                    )}
                </div>
            )}
            {suborderCreateError && (
                <>
                    <span
                        className={styles.shadowActive}
                        onClick={(e) => {
                            e.stopPropagation();
                            setSuborderCreateError('');
                        }}
                    />
                    <div
                        className={`${styles.globalPopupActive} ${isDesktop ? styles.centeredPopup : ''}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className={styles.header}>
                            <p className={styles.header__title}>Створення підзамовлення</p>
                            <div className={styles.header__close} onClick={() => setSuborderCreateError('')}>
                                <span>Закрити</span>
                                <button>
                                    <img src={closeIcon} alt="" />
                                </button>
                            </div>
                        </div>
                        <div className={styles.globalPopup__content}>
                            <p>{suborderCreateError}</p>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

export default Order;