import { getFormattedDate } from "../../../../utils/getFormattedDate";
import styles from "./Order.module.scss";
import removeIcon from "../../../../assets/icons/removeIcon.svg";
import editIcon from "../../../../assets/icons/pencil.svg";
import { Link } from "react-router-dom";
import closeIcon from "../../../../assets/icons/closeCross.svg";
import CancelOrder from "./Popup/CancelOrder";
import React, {useState} from "react";
import {useIsDesktop} from "../../../../hooks/useIsDesktop";

export const Suborder = ({ item, onDelete }) => {
    const isDesktop = useIsDesktop();
    const [isShowPopup, setIsShowPopup] = useState(false);
    const openPopup = () => {
        setIsShowPopup(true);
    }

    const closePopup = () => {
        setIsShowPopup(false);
    }

    const deleteSuborder = () => {
        onDelete(item.id);
        setIsShowPopup(false);
    }

    return (
        <>
            <div className={styles.suborder} onClick={(e) => e.stopPropagation()}>
                <div className={styles.suborder__header}>
                    <span>#{item.id}</span>
                    <span>{getFormattedDate(item.created)}</span>
                </div>
                <div className={styles.suborder__info}>
                    <div>
                        <p>{item?.payment?.final_amount || 0} грн</p>
                    </div>
                    <div>
                        <span className={styles.text}>Всього товарів: {item.warehouse_item_count + item.kit_count}</span>
                    </div>
                </div>
                <hr />
                <div className={styles.actions}>
                    <button className={styles.btn} onClick={openPopup}>
                        <img src={removeIcon} width={12} alt="Remove" />
                        <span>Видалити</span>
                    </button>
                    <a href={`${process.env.PUBLIC_URL}/products/${item.id}`} className={styles.btn} alt="Edit">
                        <img src={editIcon} width={12} alt="Edit" />
                        <span>Змінити</span>
                    </a>
                </div>
            </div>
            {isShowPopup && (
                <>
                    <span
                        className={isShowPopup ? styles.shadowActive : styles.shadowhide}
                        onClick={(e) => {
                            e.stopPropagation();
                            closePopup();
                        }}
                    />
                    <div className={`${isShowPopup ? styles.globalPopupActive : styles.globalPopup} ${
                        isDesktop ? styles.centeredPopup : ''
                    }`}
                         onClick={(e) => e.stopPropagation()}>
                        <div className={styles.header}>
                            <p className={styles.header__title}>Видалення підзамовлення</p>
                            <div className={styles.header__close} onClick={() => closePopup()}>
                                <span>Закрити</span>
                                <button>
                                    <img src={closeIcon} alt=""/>
                                </button>
                            </div>
                        </div>
                        <div className={styles.globalPopup__content}>
                            <CancelOrder onCancel={closePopup} onConfirm={deleteSuborder} suborder/>
                        </div>
                    </div>
                </>
            )}
        </>
    )
}
