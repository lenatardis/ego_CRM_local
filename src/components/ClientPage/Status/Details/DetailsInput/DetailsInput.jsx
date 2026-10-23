import React, {useState} from "react";
import styles from './DetailsInput.module.scss';
import {useAppDispatch} from "../../../../../hooks/redux";
import {setIsActivePopup} from "../../../../../store/main-slice";
import GlobalPopup from "../../../../Common/GlobalPopup/GlobalPopup";
import ClientInfo from "../../ClientInfo/ClientInfo";
import { getUserInfoPhone } from "../../../../../api/ordersApi";

const DetailsInput = ({orderId}) => {
    const dispatch = useAppDispatch();
    const [phoneDigits, setPhoneDigits] = useState('');
    const [showInfo, setShowInfo] = useState(false);
    const [clientInfo, setClientInfo] = useState(null);
    const [isPhoneError, setIsPhoneError] = useState(false);

    const handleChange = (e) => {
        const value = e.target.value;
        const valid = /^[0-9]*$/;
        if ((value === '' || valid.test(value))) {
            setPhoneDigits(value);
        }
    }

    const sendNumber = (number) => {
        if (orderId) {
            getUserInfoPhone(orderId, number).then(res => {
                if (res?.nova_poshta_delivery && res?.customer) {
                    setClientInfo({
                        ...res.customer,
                        department_number: res.nova_poshta_delivery?.receiver?.department_number,
                        city: res.nova_poshta_delivery?.receiver?.delivery_receiver?.city,
                        ttn: res.nova_poshta_delivery.delivery?.ttn
                    });
                    setIsPhoneError(false);
                    setShowInfo(true);
                    dispatch(setIsActivePopup(true));
                } else if (res.errors) {
                    setIsPhoneError(true);
                }
            })
        }
    }

    const onClose = () => {
        setShowInfo(false)
    }

    return (
        <div className={`${styles.inputBlock} ${isPhoneError ? 'baseInputError' : ''}`}>
            <input type="text" name="order_digits" value={phoneDigits}
                   placeholder="Введіть 4 останніх цифри телефону отримувача"
                   onChange={(e) => handleChange(e)} maxLength="4"/>
            <button className={styles.inputBlock__button} disabled={phoneDigits.length !== 4} onClick={() => sendNumber(phoneDigits)}>
                <span>OK</span>
            </button>
            {showInfo && (
                <GlobalPopup title={'Інформація клієнта'} centeredPopup onClose={() => onClose()}>
                    <ClientInfo clientInfo={clientInfo}/>
                </GlobalPopup>
            )}
        </div>
    )
}

export default DetailsInput;