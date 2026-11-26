import React, {useState} from "react";
import styles from './Auth.module.scss';
import logo from '../../../assets/img/logoEgo.svg'
import AuthForm from "./AuthForm/AuthForm";
import {useTranslation} from "react-i18next";
import LanguageSwitcher from "../../Common/LanguageSwitcher/LanguageSwitcher";


// Demo build (2026-11-26, at the user's request): a few CRM -> ERP links a visitor might try, collapsed, as examples
const CrossAppIdeas = ({t}) => {
    const [isOpen, setIsOpen] = useState(false);
    const ideas = [
        t('Менеджер створює рахунок – бухгалтер бачить його в ERP і підтверджує оплату.'),
        t('Комплекти, які шиють в ERP, показують тут етап виробництва.'),
        t('Ціни й джерела замовлень задають в ERP – калькулятор CRM рахує за ними.'),
    ];
    return (
        <div className={styles.ideas}>
            <button type="button" className={styles.ideas__toggle} aria-expanded={isOpen}
                    onClick={() => setIsOpen((v) => !v)}>
                <span className={styles.ideas__label}>{t('Що можна спробувати')}</span>
                <span className={`${styles.ideas__arrow} ${isOpen ? styles.ideas__arrowOpen : ''}`}>▾</span>
            </button>
            {isOpen && (
                <div className={styles.ideas__body}>
                    <p>{t('CRM і ERP пов’язані між собою. Наприклад:')}</p>
                    <ul>
                        {ideas.map((idea) => <li key={idea}>{idea}</li>)}
                    </ul>
                    <p>{t('ERP відкривається кнопкою «Перейти в ERP» у меню.')}</p>
                </div>
            )}
        </div>
    );
};

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
                    <br/>{t('Усі дані вигадані.')}
                </p>
                <CrossAppIdeas t={t}/>
                <AuthForm />
            </div>
        </div>
    )
}

export default Auth;
