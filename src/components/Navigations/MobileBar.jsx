import React, { useEffect, useState } from "react";
import { useLocation } from "react-router";
import styles from './Menu.module.scss';
import logo from '../../assets/img/logoEgo.svg';

// Demo build, phones / tablets (< 1024 px), at the user's request (2026-11-11): instead of the bottom bar,
// a top bar (☰, logo, page name) opens the menu as a slide-out from the left, as in the ERP.
// The menu itself is the desktop sidebar (same items); this file holds the bar, the overlay and the open state.

const STAFF_TITLES = [
    [(p) => p === '/', 'Усі замовлення'],
    [(p) => p.startsWith('/fabrics'), 'Тканини'],
    [(p) => p.startsWith('/storage'), 'Продукція'],
    [(p) => p.startsWith('/order/'), 'Замовлення'],
    [(p) => p.startsWith('/products/'), 'Товари'],
    [(p) => p.startsWith('/deliveryNP') || p.startsWith('/deliveryUKR'), 'Доставка'],
    [(p) => p.startsWith('/order_status/'), 'Статус'],
    [(p) => p.startsWith('/calculator'), 'Калькулятор комплекту'],
    [(p) => p.startsWith('/profile'), 'Профіль'],
];

const CLIENT_TITLES = [
    [(p) => p === '/', 'Вхід'],
    [(p) => p.startsWith('/orders'), 'Статус'],
    [(p) => p.startsWith('/contacts'), 'Контакти'],
    [(p) => p.startsWith('/callback'), 'Дзвінок'],
    [(p) => p.startsWith('/details_payment'), 'Реквізити'],
    [(p) => p.includes('/finish-order'), 'Оплата'],
];

export const getPageTitle = (pathname, isStaff) => {
    const found = (isStaff ? STAFF_TITLES : CLIENT_TITLES).find(([test]) => test(pathname));
    return found ? found[1] : 'Ego Textile';
};

// open state of the slide-out: closes on a route change and on Escape; the page behind doesn't scroll while open
export const useMobileMenu = (isDesktop) => {
    const [isOpen, setIsOpen] = useState(false);
    const { pathname } = useLocation();

    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    useEffect(() => {
        if (isDesktop) setIsOpen(false);
    }, [isDesktop]);

    useEffect(() => {
        if (!isOpen) return undefined;
        const onKeyDown = (e) => { if (e.key === 'Escape') setIsOpen(false); };
        window.addEventListener('keydown', onKeyDown);
        document.documentElement.classList.add('menuScrollLock');
        return () => {
            window.removeEventListener('keydown', onKeyDown);
            document.documentElement.classList.remove('menuScrollLock');
        };
    }, [isOpen]);

    return [isOpen, setIsOpen];
};

const MobileBar = ({ title, isOpen, setIsOpen }) => (
    <>
        <div className={styles.mobileBar}>
            <button
                type="button"
                className={styles.mobileBar__toggle}
                onClick={() => setIsOpen(true)}
                aria-label="Відкрити меню"
            >
                <span/><span/><span/>
            </button>
            <img className={styles.mobileBar__logo} src={logo} alt="" width={36} height={36}/>
            <p className={styles.mobileBar__title}>{title}</p>
        </div>
        {isOpen && <div className={styles.mobileOverlay} onClick={() => setIsOpen(false)}/>}
    </>
);

export default MobileBar;
