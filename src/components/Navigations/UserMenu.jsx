import React from "react";
import styles from './Menu.module.scss';
import { Link, useLocation } from 'react-router-dom';
import statusIcon from '../../assets/icons/status.svg';
import contactsIcon from '../../assets/icons/contacts.svg';
import contactsIconBrown from '../../assets/icons/contactsBrown.svg';
import callbackIcon from '../../assets/icons/callback.svg';
import callbackIconBrown from '../../assets/icons/callbackBrown.svg';
import {useIsDesktop} from "../../hooks/useIsDesktop";

const UserMenu = ({ savedOrderHash }) => {
    const { pathname} = useLocation();
    const isDesktop = useIsDesktop();
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
        </>
    )

    return (
        <div className={`menu ${styles.userMenu} ${isDesktop ? styles.mainDesktopMenu : ''}`}>
            {isDesktop ? <>
                <div className={styles.desktopMenuWrap}>{userMenuLinks}</div>
            
            </> : <>{userMenuLinks}</>}
        </div>
    )
}

export default UserMenu;