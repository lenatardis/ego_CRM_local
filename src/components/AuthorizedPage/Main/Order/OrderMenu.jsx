import React from "react";
import styles from './Order.module.scss';
import removeIcon from '../../../../assets/icons/removeIcon.svg';
import fastenIcon from '../../../../assets/icons/fasten.svg';
import editIcon from '../../../../assets/icons/editIcon.svg';
import copyIcon from '../../../../assets/icons/copy2.svg';
import favoriteIcon from '../../../../assets/icons/favorites.svg';
import closeIcon from '../../../../assets/icons/closeMenu.svg';
import {useAppDispatch, useAppSelector} from "../../../../hooks/redux";
import {removeStateOrder, updateOrders} from "../../../../store/main-slice";
import {getUser} from "../../../../store/selectors";
import { getAccessToken } from "../../../../utils/authTokens";
import { setOrderDuplicate, updateOrder } from "../../../../api/ordersApi";

const OrderMenu = ({setShowMenu, onEditOrder, id, openPopup, isFavorite, tabName, isGeneral}) => {
    const dispatch = useAppDispatch();
    const managerId = useAppSelector(getUser)

    const onDuplicate = () => {
        if (id) {
            const accessToken = getAccessToken();
            setOrderDuplicate(accessToken, id).then((result) => {
                if (result && result.id) {
                    dispatch(updateOrders(result));
                    setShowMenu(false);
                    onEditOrder(result.id);
                }
            })
        }
    }

    const onSetMyOrder = () => {
        if (id && managerId.id) {
            const accessToken = getAccessToken();
            updateOrder(accessToken, id, managerId.id).then((result) => {
                if (result && result.id) {
                    setShowMenu(false)
                }
            })
        }
    }

    const onSetToFavorite = (value) => {
        if (id) {
            const accessToken = getAccessToken();
            updateOrder(accessToken, id, managerId.id, {is_favourite: value}).then((result) => {
                if (result && result.id) {
                    if (!value && tabName === 'favorite') {
                        dispatch(removeStateOrder(id));
                    }
                }
                setShowMenu(false);
            })
        }
    }

    return (
        <>
            <span
                className={styles.menuOuter}
                onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                }}
            />
            <div className={`${styles.menu} ${!isGeneral ? styles.general : ''}`} onClick={(e) => e.stopPropagation()}>
                <div className={styles.menu__actions}>
                    {isGeneral && (
                        <button
                            className={styles.menu__copy}
                            onClick={() => onSetToFavorite(!isFavorite)}
                        >
                            <span>{isFavorite ? "Видалити з обраних" : "Добавити в обране"}</span>
                            <img src={favoriteIcon} alt="" />
                        </button>
                    )}
                    {isGeneral && (
                        <button onClick={() => onSetMyOrder()}>
                            <span>Закріпити за мною</span>
                            <img src={fastenIcon} alt=""/>
                        </button>
                    )}
                    <button onClick={() => onEditOrder(id)}>
                        <span>Редагувати замовлення</span>
                        <img src={editIcon} alt=""/>
                    </button>
                    {isGeneral && (
                        <button className={styles.menu__copy} onClick={() => onDuplicate()}>
                            <span>Дублювати замовлення</span>
                            <img src={copyIcon} alt=""/>
                        </button>
                    )}
                    <button className={styles.menu__remove} onClick={() => openPopup()}>
                        <span>Видалити замовлення</span>
                        <img src={removeIcon} alt=""/>
                    </button>
                </div>
                <button className={styles.menu__close} onClick={() => setShowMenu(false)}>
                    <img src={closeIcon} alt=""/>
                </button>
            </div>
        </>
    )
}

export default OrderMenu;