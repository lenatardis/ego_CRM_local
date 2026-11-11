import React from "react";
import styles from './Menu.module.scss';
import { Link, useLocation } from 'react-router-dom';
import statusIcon from '../../assets/icons/status.svg';
import contactsIcon from '../../assets/icons/contacts.svg';
import contactsIconBrown from '../../assets/icons/contactsBrown.svg';
import callbackIcon from '../../assets/icons/callback.svg';
import callbackIconBrown from '../../assets/icons/callbackBrown.svg';
import authIcon from '../../assets/icons/auth.svg';
import authIconBrown from '../../assets/icons/authBrown.svg';
import {useIsDesktop} from "../../hooks/useIsDesktop";
import MobileBar, { getPageTitle, useMobileMenu } from "./MobileBar";

const UserMenu = ({ savedOrderHash }) => {
    const { pathname} = useLocation();
    const isDesktop = useIsDesktop();
    // Demo build: below 1024 px this menu is a slide-out opened from the top bar (MobileBar), as the staff menu
    const [isMobileOpen, setIsMobileOpen] = useMobileMenu(isDesktop);
    const statusLink = savedOrderHash
        ? `/orders/?order=${encodeURIComponent(savedOrderHash)}`
        : '/orders/';

    const userMenuLinks = (
        <>
            <Link  to={statusLink}
                  className={pathname === '/orders/' ? styles.userMenu__linkActive : styles.userMenu__link}>
                <img src={statusIcon} alt=""/>
                <span>Статус</span>
            </Link>
            <Link  to={'/contacts/'}
                  className={pathname === '/contacts/' ? styles.userMenu__linkActive : styles.userMenu__link}>
                <img src={pathname === '/contacts/' ? contactsIconBrown : contactsIcon} alt=""/>
                <span>Контакти</span>
            </Link>
            <Link to={'/callback/'}
                  className={pathname === '/callback/' ? styles.userMenu__linkActive : styles.userMenu__link}>
                <img src={pathname === '/callback/' ? callbackIconBrown : callbackIcon} alt=""/>
                <span>Дзвінок</span>
            </Link>
            {/* Demo build: the start page with the login form, otherwise reachable only by typing its address */}
            <Link to={'/'}
                  className={pathname === '/' ? styles.userMenu__linkActive : styles.userMenu__link}>
                <img src={pathname === '/' ? authIconBrown : authIcon} alt=""/>
                <span>Вхід</span>
            </Link>
        </>
    )

    return (
        <>
            {!isDesktop && (
                <MobileBar title={getPageTitle(pathname, false)} isOpen={isMobileOpen} setIsOpen={setIsMobileOpen} />
            )}
            <div className={`menu ${styles.userMenu} ${styles.clientMenu} ${isDesktop ? styles.mainDesktopMenu : `${styles.sideMenu} ${isMobileOpen ? styles.sideMenuOpen : ''}`}`}
                 onClick={(e) => { if (e.target.closest('a')) setIsMobileOpen(false); }}>
                <div className={styles.desktopMenuWrap}>{userMenuLinks}</div>
            </div>
        </>
    )
}

export default UserMenu;