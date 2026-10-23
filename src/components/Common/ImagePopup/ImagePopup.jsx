import React from "react";
import styles from './ImagePopup.module.scss';
import closeIcon from '../../../assets/icons/closeCross.svg';

const ImagePopup = ({ onClose = () => {}, img, isShowImagePopup}) => {


    const close = (e) => {
        e.stopPropagation();
        onClose();
    }

    const popupClass = isShowImagePopup
        ? `${styles.imagePopupActive}`
        : `${styles.imagePopup}`;

    return (
        <>
            <div className={styles.outer} onClick={(e) => close(e)}></div>
            <div className={popupClass}>
                <button className={styles.closeBtn} onClick={(e) => close(e)}>
                    <img src={closeIcon} alt="" />
                </button>
                <img className={styles.image} src={img} alt=""/>
            </div>
        </>

    )
}

export default ImagePopup;