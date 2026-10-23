import React from "react";
import styles from "./Profile.module.scss";
import closeIcon from "../../../assets/icons/closeCross.svg";
import Button from "../Main/Order/Popup/Button/Button";


const ProfilePopup = ({onClose, handleSubmit}) => {
    return (
        <div className={styles.popupWrapper}>
            <button className={styles.popup__closer} onClick={() => onClose()}/>
            <div className={styles.popup}>
                <div className={styles.popup__header}>
                    <p>Зміна пароля</p>
                    <div className={styles.close} onClick={() => onClose()}>
                        <span>Закрити</span>
                        <button>
                            <img src={closeIcon} alt=""/>
                        </button>
                    </div>
                </div>
                <div className={styles.popup__content}>

                    <div className={styles.cancelOrder}>
                        <p>Ви впевнені що ви хочете змінити пароль ?</p>
                        <Button confirm action={handleSubmit}/>
                        <Button action={onClose}/>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProfilePopup;