import React from "react";
import styles from './GlobalPopup.module.scss';
import closeIcon from '../../../assets/icons/closeCross.svg';
import {useAppDispatch, useAppSelector} from "../../../hooks/redux";
import {getIsActivePopup} from "../../../store/selectors";
import {setIsActivePopup} from "../../../store/main-slice";

const GlobalPopup = ({children, topPopup, title, onClose = () => {}, isNested = false, centeredPopup}) => {
    const activePopup = useAppSelector(getIsActivePopup);
    const dispatch = useAppDispatch();

    const close = (e) => {
        e.stopPropagation();
        if (!isNested) {
            dispatch(setIsActivePopup(false));
        }
        onClose();
    }

    const popupClass = activePopup
        ? `${styles.globalPopupActive} ${topPopup ? styles.topPopup : ''} ${centeredPopup ? styles.centeredPopup : ''}`
        : `${styles.globalPopup} ${centeredPopup ? styles.centeredPopup : ''}`;

    return (
        <>
            <span className={styles.outer} onClick={(e) => close(e)}></span>
            <div className={`${popupClass} globalPopup`}>
                <div className={styles.header}>
                    <p className={styles.header__title}>{title}</p>
                    <div className={styles.header__close} onClick={(e) => close(e)}>
                        <span>Закрити</span>
                        <button>
                            <img src={closeIcon} alt="" />
                        </button>
                    </div>
                </div>
                <div className={styles.content}>
                    {children}
                </div>
            </div>
        </>
    )
}

export default GlobalPopup;