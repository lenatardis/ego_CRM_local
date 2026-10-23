import React from "react";
import arrow from "../../../../assets/icons/arrowDownGray.svg";
import {useAppDispatch} from "../../../../hooks/redux";
import {setIsActivePopup} from "../../../../store/main-slice";
import GlobalPopup from "../../../Common/GlobalPopup/GlobalPopup";
import PopupCheckboxes from "../../../Common/PopupCheckboxes/PopupCheckboxes";
import styles from './payment.module.scss';
import {useIsDesktop} from "../../../../hooks/useIsDesktop";

const StatusPay = ({ setPopup, popup, status, chooseList, updateStatus, isDisabled }) => {
    const dispatch = useAppDispatch();

    const isDesktop = useIsDesktop();

    const OnButton = (value) => {
        setPopup(value)
        setTimeout(() => {
            dispatch(setIsActivePopup(true))
        }, 30)
    }

    const onChangeStatus = (value) => {
        updateStatus(value.value);
        setPopup(null);
        dispatch(setIsActivePopup(false));
    }

    let statusCaption = chooseList.some((el) => {
        return el.value === 'PAY_WAIT' && el.disabled
    })? '* Заповніть інформацію про клієнта та/або додайте товар(и)' : '';


    return (
        <>
            <button
                className={`${styles.statusPay} ${isDisabled ? styles.disabled : ''}`}
                onClick={() => OnButton('statusPay')} disabled={isDisabled}
            >
                <span style={status ? {color: '#201827'} : null}>{status?.title ?? 'Статус оплати'}</span>
                <img src={arrow} alt=""/>
            </button>
            {popup === 'statusPay' && (
                <GlobalPopup title={'Статус оплати'} onClose={() => setPopup(null)}  {...(isDesktop ? { centeredPopup: true } : {})}>
                    <PopupCheckboxes values={status?.value ?? null} setValues={onChangeStatus} chooseList={chooseList} isRadio statusCaption={statusCaption}/>
                </GlobalPopup>
            )}
        </>
    )
}

export default StatusPay;