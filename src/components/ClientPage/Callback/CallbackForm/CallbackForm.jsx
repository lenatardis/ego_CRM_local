import React, {useEffect, useState} from "react";
import styles from './CallbackForm.module.scss';
import {setIsActivePopup} from "../../../../store/main-slice";
import {useAppDispatch} from "../../../../hooks/redux";
import GlobalPopup from "../../../Common/GlobalPopup/GlobalPopup";
import PopupCheckboxes from "../../../Common/PopupCheckboxes/PopupCheckboxes";
import InputMask from "react-input-mask";
import { getReason, setCallOrder } from "../../../../api/generalApi";

const initialCallbackData = {
    name: '',
    phone: '',
    reason: []
}

const CallbackForm = () => {
    const dispatch = useAppDispatch();
    const [chooseList, setChooseList] = useState(null)
    const [callbackData, setCallbackData] = useState(initialCallbackData);
    const validPhone = callbackData.phone.replace(/[ _()-]/g, '');
    const [isLoading, setIsLoading] = useState(false);
    const [optionsPopup, setOptionsPopup] = useState(false);

    useEffect(() => {
        if (chooseList === null) {
            getReason().then((result) => {
                if (result && result.length > 0) {
                    const newArray = result.map((item) => {
                        return {title: item.name, value: item.id}
                    })
                    setChooseList(newArray);
                }
            });
        }
    }, [])

    const onSubmit = () => {
        const { name, reason } = callbackData;
        if (name.length > 2 && validPhone.length > 7 && reason.length > 0) {
            const arrayForSend = reason.map((item) => item.value);
            setIsLoading(true);
            setCallOrder(name, validPhone, arrayForSend).then((res) => {
                setCallbackData(initialCallbackData);
            }).finally(() => {
                setIsLoading(false);
            })
        }
    }

    const handleOpenOptionsPopup = () => {
        setOptionsPopup(true);
        dispatch(setIsActivePopup(true));
    }

    return (
        <div className={styles.CallbackForm}>
            <input
                type="text"
                placeholder={'Ім’я'}
                value={callbackData.name}
                onChange={(e) => {
                    const { value } = e.target;
                    if (/[^a-zа-яґєії+\-' ]+/ig.test(value) && value !== '') {
                        return;
                    }
                    setCallbackData(prevData => ({ ...prevData, name: value }));
                }}
            />
            <InputMask
                mask="+38 (099) 999-99-99"
                value={callbackData.phone}
                onChange={(e) => setCallbackData(prevData => ({ ...prevData, phone: e.target.value }))}
            >
                {(inputProps) => (
                    <input
                        {...inputProps}
                        placeholder={"Номер телефону"}
                        className={"baseInput"}
                        aria-label={"phone"}
                        id="phone"
                        name="phone"
                    />
                )}
            </InputMask>
            <button className={styles.buttonField} onClick={handleOpenOptionsPopup}
                    type='button'>
                <span>{'Звернення у зв\'язку з'}</span>
            </button>
            <button onClick={() => onSubmit()} type='submit' className={styles.action}
                    disabled={!callbackData.name.length || validPhone.length !== 13 || !callbackData.phone.length || isLoading}>
                <span>Замовити дзвінок</span>
            </button>
            {optionsPopup && (
                <GlobalPopup title={'Причина звернення'} onClose={() => setOptionsPopup(false)} centeredPopup>
                    {chooseList && chooseList.length > 0 && (
                        <PopupCheckboxes
                            values={callbackData.reason}
                            setValues={(value) => setCallbackData(prevData => ({ ...prevData, reason: value }))}
                            chooseList={chooseList}
                        />
                    )}
                </GlobalPopup>
            )}
        </div>
    )
}

export default CallbackForm;