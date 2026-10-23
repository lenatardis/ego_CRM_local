import React, { useState } from "react";
import styles from './Auth.module.scss';
import logo from '../../../assets/img/logoEgo.svg'
import GlobalPopup from "../../Common/GlobalPopup/GlobalPopup";
import AuthForm from "./AuthForm/AuthForm";

import {useAppDispatch} from "../../../hooks/redux";
import {setIsActivePopup} from "../../../store/main-slice";
import {useIsDesktop} from "../../../hooks/useIsDesktop";


const Auth = () => {
    const [authPopup, setAuthPopup] = useState(false);
    const dispatch = useAppDispatch();

    const isDesktop = useIsDesktop();

    const handleOpenAuthPopup = () => {
        setAuthPopup(true);
        dispatch(setIsActivePopup(true));
    }

    return (
        <div className={styles.auth}>
            <div className={styles.auth__logo}>
                <img src={logo} alt=""/>
                <div className={styles.action}>
                    <button onClick={handleOpenAuthPopup}>
                        <span>Вхід</span>
                    </button>
                </div>
            </div>
            {authPopup && (
                <GlobalPopup title={'Введіть логін/пароль'} onClose={() => setAuthPopup(false)} {...(isDesktop ? { centeredPopup: true } : {})}>
                    <AuthForm />
                </GlobalPopup>
            )}
        </div>
    )
}

export default Auth;