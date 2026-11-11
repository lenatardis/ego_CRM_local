import React, { useEffect, useRef, useState } from "react";
import styles from './Menu.module.scss';
import { Link, useParams } from 'react-router-dom';
import mainIcon from '../../assets/icons/mainIcon.svg';
import mainBrownIcon from '../../assets/icons/mainBrownIcon.svg';
import fabricsBrownIcon from '../../assets/icons/fabricsBrownIcon.svg';
import fabricsIcon from '../../assets/icons/fabricsIcon.svg';
import novaMailIcon from '../../assets/icons/novaPoshta.svg';
import ukrMailIcon from '../../assets/icons/ukrPoshta.svg';
import productsIcon from '../../assets/icons/products.svg';
import productsBrownIcon from '../../assets/icons/productsBrown.svg';
import storageBrownIcon from '../../assets/icons/storageBrownIcon.svg';
import storageIcon from '../../assets/icons/storageIcon.svg';
import authIcon from '../../assets/icons/auth.svg';
import { useLocation, useNavigate } from "react-router";
import statusIcon from "../../assets/icons/statusWhite.svg";
import statusBrownIcon from "../../assets/icons/statusBrown.svg";
import arrIcon2 from "../../assets/icons/arrowDownWhite.svg";
import logoutIcon from '../../assets/icons/logout.svg';
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { setIsActivePopup } from "../../store/main-slice";
import GlobalPopup from "../Common/GlobalPopup/GlobalPopup";
import DeliveryChange from "../ClientPage/Popups/DeliveryChange/DeliveryChange";
import { getGeneralOrderId, getUser } from "../../store/selectors";
import { getAccessToken } from "../../utils/authTokens";
import { setNewOrder } from "../../api/ordersApi";
import { logout } from "../../store/account-slice";
import { useIsDesktop } from "../../hooks/useIsDesktop";
import MobileBar, { getPageTitle, useMobileMenu } from "./MobileBar";

const MainMenu = () => {
    const [isDeliveryMenu, setIsDeliveryMenu] = useState(false);
    const [ordersAccordionOpen, setOrdersAccordionOpen] = useState(false);
    const [storageAccordionOpen, setStorageAccordionOpen] = useState(false);

    const { pathname } = useLocation();
    const [showPopup, setShowPopup] = useState(false);
    const [showPagePopup, setShowPagePopup] = useState(false);
    const [isDeliveryNP, setIsDeliveryNP] = useState(pathname.startsWith('/deliveryUKR') ? false : true);

    const { id } = useAppSelector(getUser);
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const prevIsDeliveryMenuRef = useRef(false);

    const params = useParams();
    const orderId = params.id || pathname.match(/\/[^/]+\/(\d+)/)?.[1] || pathname.match(/^\/(\d+)$/)?.[1] || '';
    const generalOrderId = useAppSelector(getGeneralOrderId);

    const isDesktop = useIsDesktop();
    // Demo build: below 1024 px this menu is a slide-out opened from the top bar (MobileBar)
    const [isMobileOpen, setIsMobileOpen] = useMobileMenu(isDesktop);
    const closeMobileMenu = () => setIsMobileOpen(false);

    const isAllOrdersActive = !isDeliveryMenu && pathname === '/';

    const onOrder = () => {
        closeMobileMenu();

        if (id) {
            const accessToken = getAccessToken();
            setNewOrder(accessToken, { manager: id }).then((response) => {
                if (response && response.id) {
                    setIsDeliveryMenu(true);
                    navigate(`/order/${response.id}`, { state: { isNewOrder: true } });
                }
            });
        }
    };

    useEffect(() => {
        if (/\/[^/]+\/(\d+)/.test(pathname) || pathname.startsWith('/calculator')) {
            setIsDeliveryMenu(true);
        } else {
            setIsDeliveryMenu(false);
        }
    }, [pathname]);

    useEffect(() => {
        if (isDeliveryMenu && !prevIsDeliveryMenuRef.current) {
            setOrdersAccordionOpen(true);
        }
        prevIsDeliveryMenuRef.current = isDeliveryMenu;
    }, [isDeliveryMenu]);

    const changeDelivery = () => {
        closeMobileMenu();
        setShowPopup(true);
        dispatch(setIsActivePopup(true));
    };

    const onConfirm = () => {
        setIsDeliveryNP(!isDeliveryNP);
        const deliveryPath = pathname.startsWith('/deliveryNP') ? '/deliveryUKR/' : '/deliveryNP/';
        dispatch(setIsActivePopup(false));
        setShowPopup(false);
        navigate(deliveryPath + orderId);
    };

    const onCancel = () => {
        dispatch(setIsActivePopup(false));
        setShowPopup(false);
    };

    const checkPageNav = () => {
        closeMobileMenu();
        setShowPagePopup(true);
        dispatch(setIsActivePopup(true));
    };

    const onPageConfirm = () => {
        dispatch(setIsActivePopup(false));
        setShowPagePopup(false);
        onOrder();
    };

    const onPageCancel = () => {
        dispatch(setIsActivePopup(false));
        setShowPagePopup(false);
    };


    const onLogOut = () => {
        closeMobileMenu();
        dispatch(logout());
        window.location.reload();
    };

    const desktopMenuLinks = (
        <>
            <button onClick={() => checkPageNav()} className={styles.userMenu__link}>
                <img src={authIcon} alt="" />
                <span>Замовлення +</span>
            </button>

            <div className={styles.accordionBlock}>
                <div
                    className={`${styles.desktopAccordionHead} ${isAllOrdersActive ? styles.userMenu__linkActive : styles.userMenu__link}`}
                    onClick={() => {
                        closeMobileMenu();
                        navigate('/');
                    }}
                >
                    <div className={styles.desktopAccordionLabel}>
                        <img src={isAllOrdersActive ? mainBrownIcon : mainIcon} alt="" />
                        <span>Усі замовлення</span>
                    </div>
                </div>

                {isDeliveryMenu && (
                    <div
                        className={`${styles.desktopAccordionHead} ${styles.userMenu__link}`}
                        onClick={() => setOrdersAccordionOpen((prev) => !prev)}
                    >
                        <div className={styles.desktopAccordionLabel}>
                            <img src={mainIcon} alt="" />
                            <span>Деталі</span>
                        </div>

                        <img
                            src={arrIcon2}
                            alt=""
                            className={`${styles.accordionArrow} ${ordersAccordionOpen ? styles.accordionArrowOpen : ''}`}
                        />
                    </div>
                )}

                {isDeliveryMenu && (
                    <div className={`${styles.accordionBody} ${ordersAccordionOpen ? styles.accordionBodyOpen : ''}`}>
                        <Link
                            to={`/order/${generalOrderId ? generalOrderId : orderId}`}
                            className={`${pathname.startsWith('/order/') ? styles.userMenu__linkActive : styles.userMenu__link} ${styles.innerShift}`}
                            onClick={() => closeMobileMenu()}
                        >
                            <img src={pathname.startsWith('/order/') ? mainBrownIcon : mainIcon} alt="" />
                            <span className={generalOrderId ? styles.backToMain : ''}>
                                {generalOrderId ? 'Головне замовлення' : 'Замовлення'}
                            </span>
                        </Link>

                      
                        <Link
                            to={`/products/${orderId}`}
                            className={`${pathname.startsWith('/products/') ? styles.userMenu__linkActive : styles.userMenu__link} ${styles.innerShift}`}
                            onClick={() => closeMobileMenu()}
                        >
                            <img src={pathname.startsWith('/products/') ? productsBrownIcon : productsIcon} alt="" />
                            <span>Товари</span>
                        </Link>

                          {!generalOrderId && (
                            <>
                                {isDeliveryNP ? (
                                    <Link
                                        to={`/deliveryNP/${orderId}`}
                                        onClick={() =>
                                            pathname.startsWith('/deliveryNP/') || pathname.startsWith('/deliveryUKR/')
                                                ? changeDelivery()
                                                : closeMobileMenu()
                                        }
                                        className={`${pathname.startsWith('/deliveryNP/') || pathname.startsWith('/deliveryUKR/')
                                            ? styles.userMenu__linkActive
                                            : styles.userMenu__link} ${styles.innerShift}`}
                                    >
                                        <img src={novaMailIcon} alt="" />
                                        <span>Доставка</span>
                                    </Link>
                                ) : (
                                    <Link
                                        to={`/deliveryUKR/${generalOrderId ? generalOrderId : orderId}`}
                                        onClick={() =>
                                            pathname.startsWith('/deliveryNP') || pathname.startsWith('/deliveryUKR')
                                                ? changeDelivery()
                                                : closeMobileMenu()
                                        }
                                        className={`${pathname.startsWith('/deliveryNP') || pathname.startsWith('/deliveryUKR')
                                            ? styles.userMenu__linkActive
                                            : styles.userMenu__link} ${styles.innerShift}`}
                                    >
                                        <img src={ukrMailIcon} alt="" />
                                        <span>Доставка</span>
                                    </Link>
                                )}
                            </>
                        )}

                        <Link
                            to={`/order_status/${orderId}`}
                            className={`${pathname.startsWith('/order_status/') ? styles.userMenu__linkActive : styles.userMenu__link} ${styles.innerShift}`}
                            onClick={() => closeMobileMenu()}
                        >
                            <img src={pathname.startsWith('/order_status/') ? statusBrownIcon : statusIcon} alt="" />
                            <span>Статус</span>
                        </Link>
                    </div>
                )}
            </div>

            <div className={styles.accordionBlock}>
                <div
                    className={`${styles.desktopAccordionHead} ${styles.userMenu__link}`}
                    onClick={() => setStorageAccordionOpen((prev) => !prev)}
                >
                    <div className={styles.desktopAccordionLabel}>
                        <img src={storageIcon} alt="" />
                        <span>Склад</span>
                    </div>

                    <img
                        src={arrIcon2}
                        alt=""
                        className={`${styles.accordionArrow} ${storageAccordionOpen ? styles.accordionArrowOpen : ''}`}
                    />
                </div>

                <div className={`${styles.accordionBody} ${storageAccordionOpen ? styles.accordionBodyOpen : ''}`}>
                    <Link
                        to={isDeliveryMenu ? `/fabrics/${orderId}` : '/fabrics/'}
                        className={`${pathname.startsWith('/fabrics/') || pathname === '/fabrics/' ? styles.userMenu__linkActive : styles.userMenu__link} ${styles.innerShift}`}
                        onClick={() => closeMobileMenu()}
                    >
                        <img src={pathname.startsWith('/fabrics/') || pathname === '/fabrics/' ? fabricsBrownIcon : fabricsIcon} alt="" />
                        <span>Тканини</span>
                    </Link>

                    <Link
                        to={isDeliveryMenu ? `/storage/${orderId}` : '/storage/'}
                        className={`${pathname.startsWith('/storage/') || pathname === '/storage/' ? styles.userMenu__linkActive : styles.userMenu__link} ${styles.innerShift}`}
                        onClick={() => closeMobileMenu()}
                    >
                        <img src={pathname.startsWith('/storage/') || pathname === '/storage/' ? storageBrownIcon : storageIcon} alt="" />
                        <span>Продукція</span>
                    </Link>
                </div>
            </div>

        </>
    );

    return (
        <>
            {!isDesktop && (
                <MobileBar title={getPageTitle(pathname, true)} isOpen={isMobileOpen} setIsOpen={setIsMobileOpen} />
            )}
            <div
                className={`menu ${styles.userMenu} ${styles.mainDesktopMenu} ${isDesktop ? styles.swipeMenu : styles.sideMenu} ${isMobileOpen ? styles.sideMenuOpen : ''}`}
            >
                <div className={styles.desktopMenuWrap}>
                    {desktopMenuLinks}
                </div>

                <div className={styles.btnWrap}>
                    <a className={`${styles.userMenu__link} ${styles.ERP}`} href="/ego_ERP_local/">
                        <span>Перейти в ERP</span>
                    </a>

                    <button
                        onClick={onLogOut}
                        className={`${styles.userMenu__link} ${styles.logoutLink}`}
                    >
                        <img src={logoutIcon} alt="" />
                        <span>Вийти</span>
                    </button>
                </div>
            </div>

            {showPopup && (
                <GlobalPopup
                    title={'Зміна доставки'}
                    onClose={() => setShowPopup(false)}
                    {...(isDesktop ? { centeredPopup: true } : {})}
                >
                    <DeliveryChange onConfirm={onConfirm} onCancel={onCancel} />
                </GlobalPopup>
            )}

            {showPagePopup && (
                <GlobalPopup
                    title={'Перехід на сторінку Замовлення +'}
                    onClose={() => setShowPagePopup(false)}
                    {...(isDesktop ? { centeredPopup: true } : {})}
                >
                    <DeliveryChange onConfirm={onPageConfirm} onCancel={onPageCancel} orderPageCheck />
                </GlobalPopup>
            )}
        </>
    );
};

export default MainMenu;
