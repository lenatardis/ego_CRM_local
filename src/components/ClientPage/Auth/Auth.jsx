import React from "react";
import styles from './Auth.module.scss';
import logo from '../../../assets/img/logoEgo.svg'
import AuthForm from "./AuthForm/AuthForm";


// Demo build: the login form sits in a card on the page (originally a "Вхід" button opening it in a popup)
const Auth = () => {
    return (
        <div className={styles.auth}>
            <div className={styles.card}>
                <img className={styles.card__logo} src={logo} alt="Ego Textile"/>
                <h1 className={styles.card__title}>Вхід у CRM</h1>
                <p className={styles.card__hint}>
                    Демо-доступ: оберіть менеджера у списку – логін і пароль заповняться самі.
                </p>
                <AuthForm />
            </div>
        </div>
    )
}

export default Auth;
