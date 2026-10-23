import React from "react";
import styles from './ProductActions.module.scss';
import copyIcon from "../../../../assets/icons/copy2.svg";
import {CopyToClipboard} from "react-copy-to-clipboard";
import {setIsActivePopup} from "../../../../store/main-slice";
import {useAppDispatch} from "../../../../hooks/redux";
import GlobalPopup from "../../../Common/GlobalPopup/GlobalPopup";
import StoragePopup from "../StoragePopup/StoragePopup";
import {Link} from "react-router-dom";

const ProductActions = ({order, popup, setPopup, setOrder, isDisabled = false,  onAfterProductAdd}) => {
    const dispatch = useAppDispatch();
    const handlePopup = () => {
        setPopup('status');
        dispatch(setIsActivePopup(true));
    }


    return (
        <div className={styles.productActions}>
            <div className={styles.row}>
                <button className={styles.addItem} onClick={() => handlePopup()} disabled={isDisabled}>
                    <span>Додати товар зі складу</span>
                </button>
                <Link to={`/calculator/${order?.id}`} className={`${styles.addSet} ${isDisabled ? styles.disabled : ''}`}>
                    <span>Додати комплект</span>
                </Link>
            </div>
                <div className={styles.row}>
                    {order?.url && (
                    <CopyToClipboard text={order.url} className={`${styles.copyButton} click-effect`}>
                        <button tabIndex={0}>
                            <img src={copyIcon} alt=""/>
                            <span>Скопіювати посилання</span>
                        </button>
                    </CopyToClipboard>
                    )}
                   {/* <button className={styles.prodLink} disabled={isDisabled}>
                        <span>На виробництво</span>
                    </button>*/}
                </div>

            {popup && popup === 'status' && (
                <GlobalPopup topPopup title={'Товар зі складу:'} onClose={() => setPopup(false)}>
                    <StoragePopup orderId={order?.id} setOrder={setOrder} setPopup={setPopup} sourceID={order?.source?.id} onAfterProductAdd={onAfterProductAdd}/>
                </GlobalPopup>
            )}
        </div>
    )
}

export default ProductActions;