import React from "react";
import styles from './Auth.module.scss';
import logo from '../../../assets/img/logoEgo.svg'
import AuthForm from "./AuthForm/AuthForm";
import {useTranslation} from "react-i18next";
import LanguageSwitcher from "../../Common/LanguageSwitcher/LanguageSwitcher";


// Demo build: the login form sits in a card on the page (originally a "Вхід" button opening it in a popup)
const Auth = () => {
    const {t} = useTranslation();

    return (
        <div className={styles.auth}>
            <div className={styles.card}>
                <LanguageSwitcher className={styles.card__lang}/>
                <img className={styles.card__logo} src={logo} alt="Ego Textile"/>
                <h1 className={styles.card__title}>{t('Вхід у CRM')}</h1>
                <p className={styles.card__hint}>
                    {t('Демо-доступ: оберіть менеджера у списку – логін і пароль заповняться самі.')}
                </p>
                <AuthForm />
            </div>
        </div>
    )
}

export default Auth;
