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
import arrIcon from "../../assets/icons/arrowDown.svg";
import arrIcon2 from "../../assets/icons/arrowDownWhite.svg";
import backIcon from "../../assets/icons/back.svg";
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

const MainMenu = () => {
    const [isDeliveryMenu, setIsDeliveryMenu] = useState(false);
    const [ordersAccordionOpen, setOrdersAccordionOpen] = useState(false);
    const [storageAccordionOpen, setStorageAccordionOpen] = useState(false);

    const { pathname } = useLocation();
    const [menuPosition, setMenuPosition] = useState(2);
    const [touchStartX, setTouchStartX] = useState(0);
    const [touchEndX, setTouchEndX] = useState(0);
    const [showPopup, setShowPopup] = useState(false);
    const [showPagePopup, setShowPagePopup] = useState(false);
    const [isDeliveryNP, setIsDeliveryNP] = useState(pathname.startsWith('/deliveryUKR') ? false : true);

    const { id } = useAppSelector(getUser);
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const menuRef = useRef(null);
    const leftHiddenLinkRef = useRef(null);
    const rightHiddenLinkRef = useRef(null);
    const prevIsDeliveryMenuRef = useRef(false);

    const params = useParams();
    const orderId = params.id || pathname.match(/\/[^/]+\/(\d+)/)?.[1] || pathname.match(/^\/(\d+)$/)?.[1] || '';
    const generalOrderId = useAppSelector(getGeneralOrderId);

    const isDesktop = useIsDesktop();

    const isAllOrdersActive = !isDeliveryMenu && pathname === '/';

    const onOrder = () => {
        resetHiddenButtons();

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
        if (isDesktop && isDeliveryMenu && !prevIsDeliveryMenuRef.current) {
            setOrdersAccordionOpen(true);
        }
        prevIsDeliveryMenuRef.current = isDeliveryMenu;
    }, [isDeliveryMenu, isDesktop]);

    const changeDelivery = () => {
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

    /* mobile swipe */
    const handleTouchStart = (e) => {
        setTouchStartX(e.targetTouches[0].clientX);
        setTouchEndX(e.targetTouches[0].clientX);
    };

    const handleTouchMove = (e) => {
        setTouchEndX(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = () => {
        if (touchStartX - touchEndX > 50 && menuPosition < 3) {
            setMenuPosition((prev) => prev + 1);
        }

        if (touchStartX - touchEndX < -50 && menuPosition === 3) {
            setMenuPosition(2);
        }
    };

    const resetHiddenButtons = () => {
        setMenuPosition(2);
    };

    const onLogOut = () => {
        resetHiddenButtons();
        dispatch(logout());
        window.location.reload();
    };

    const onReturn = () => {
        resetHiddenButtons();
        navigate(-1);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target) &&
                (!leftHiddenLinkRef.current || !leftHiddenLinkRef.current.contains(event.target)) &&
                (!rightHiddenLinkRef.current || !rightHiddenLinkRef.current.contains(event.target))
            ) {
                setMenuPosition(2);
            }
        };

        document.addEventListener('touchstart', handleClickOutside);

        return () => {
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, []);

    const mobileMenuLinks = !isDeliveryMenu
        ? (
            <>
                <Link
                    to={'/'}
                    className={pathname === '/' ? styles.userMenu__linkActive : styles.userMenu__link}
                    onClick={() => resetHiddenButtons()}
                >
                    <img src={pathname === '/' ? mainBrownIcon : mainIcon} alt="" />
                    <span>Усі замовлення</span>
                </Link>

                <Link
                    to={'/fabrics/'}
                    className={pathname === '/fabrics/' ? styles.userMenu__linkActive : styles.userMenu__link}
                    onClick={() => resetHiddenButtons()}
                >
                    <img src={pathname === '/fabrics/' ? fabricsBrownIcon : fabricsIcon} alt="" />
                    <span>Тканини</span>
                </Link>

                <Link
                    to={'/storage/'}
                    className={pathname === '/storage/' ? styles.userMenu__linkActive : styles.userMenu__link}
                    onClick={() => resetHiddenButtons()}
                >
                    <img src={pathname === '/storage/' ? storageBrownIcon : storageIcon} alt="" />
                    <span>Склад</span>
                </Link>

                <button onClick={() => checkPageNav()} className={styles.userMenu__link}>
                    <img src={authIcon} alt="" />
                    <span>Замовлення +</span>
                </button>
            </>
        )
        : (
            <>
                <Link
                    to={`/order/${generalOrderId ? generalOrderId : orderId}`}
                    className={`${pathname.startsWith('/order/') ? styles.userMenu__linkActive : styles.userMenu__link} ${styles.innerShift}`}
                    onClick={() => resetHiddenButtons()}
                >
                    <img src={pathname.startsWith('/order/') ? mainBrownIcon : mainIcon} alt="" />
                    <span className={generalOrderId ? styles.backToMain : ''}>
                        {generalOrderId ? 'Головне замовлення' : 'Замовлення'}
                    </span>
                </Link>

              
                <Link
                    to={`/products/${orderId}`}
                    className={`${pathname.startsWith('/products/') ? styles.userMenu__linkActive : styles.userMenu__link} ${styles.innerShift}`}
                    onClick={() => resetHiddenButtons()}
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
                                        : resetHiddenButtons()
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
                                        : resetHiddenButtons()
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
                    onClick={() => resetHiddenButtons()}
                >
                    <img src={pathname.startsWith('/order_status/') ? statusBrownIcon : statusIcon} alt="" />
                    <span>Статус</span>
                </Link>
            </>
        );

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
                        resetHiddenButtons();
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
                            onClick={() => resetHiddenButtons()}
                        >
                            <img src={pathname.startsWith('/order/') ? mainBrownIcon : mainIcon} alt="" />
                            <span className={generalOrderId ? styles.backToMain : ''}>
                                {generalOrderId ? 'Головне замовлення' : 'Замовлення'}
                            </span>
                        </Link>

                      
                        <Link
                            to={`/products/${orderId}`}
                            className={`${pathname.startsWith('/products/') ? styles.userMenu__linkActive : styles.userMenu__link} ${styles.innerShift}`}
                            onClick={() => resetHiddenButtons()}
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
                                                : resetHiddenButtons()
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
                                                : resetHiddenButtons()
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
                            onClick={() => resetHiddenButtons()}
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
                        onClick={() => resetHiddenButtons()}
                    >
                        <img src={pathname.startsWith('/fabrics/') || pathname === '/fabrics/' ? fabricsBrownIcon : fabricsIcon} alt="" />
                        <span>Тканини</span>
                    </Link>

                    <Link
                        to={isDeliveryMenu ? `/storage/${orderId}` : '/storage/'}
                        className={`${pathname.startsWith('/storage/') || pathname === '/storage/' ? styles.userMenu__linkActive : styles.userMenu__link} ${styles.innerShift}`}
                        onClick={() => resetHiddenButtons()}
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
            <div
                className={`menu ${styles.userMenu} ${styles.swipeMenu} ${isDesktop ? styles.mainDesktopMenu : ''}`}
                style={
                    isDesktop
                        ? {}
                        : {
                            left: menuPosition === 1
                                ? 'calc(50% + 67px)'
                                : menuPosition === 3
                                    ? 'calc(50% - 67px)'
                                    : '50%'
                        }
                }
                onTouchStart={isDesktop ? undefined : handleTouchStart}
                onTouchMove={isDesktop ? undefined : handleTouchMove}
                onTouchEnd={isDesktop ? undefined : handleTouchEnd}
                ref={menuRef}
            >
                {isDesktop ? (
                    <div className={styles.desktopMenuWrap}>
                        {desktopMenuLinks}
                    </div>
                ) : (
                    mobileMenuLinks
                )}

                {isDesktop && (
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
                )}
            </div>

            {!isDesktop && (
                <div className={styles.back}>
                    <button
                        onClick={null}
                        className={styles.hiddenLeftLink}
                        style={{ left: menuPosition === 1 ? '0' : '-67px' }}
                        ref={leftHiddenLinkRef}
                    >
                        <img src={arrIcon} alt="" className={styles.rotated} />
                    </button>

                    <button
                        onClick={() => isDeliveryMenu ? onReturn() : onLogOut()}
                        className={`${styles.hiddenRightLink} ${isDeliveryMenu ? styles.returnLink : styles.logoutLink}`}
                        style={{ right: menuPosition === 3 ? '0' : '-67px' }}
                        ref={rightHiddenLinkRef}
                    >
                        <img src={isDeliveryMenu ? backIcon : logoutIcon} alt="" />
                        <span>{isDeliveryMenu ? 'Назад' : 'Вийти'}</span>
                    </button>
                </div>
            )}

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