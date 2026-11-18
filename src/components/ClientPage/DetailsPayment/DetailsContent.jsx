import React from "react";
import styles from './DetailsPayment.module.scss';
import errorIcon from '../../../assets/icons/notificationRed.svg'
import copyIcon from "../../../assets/icons/copy.svg";
import {CopyToClipboard} from "react-copy-to-clipboard";
import { t } from '../../../i18n';


const DetailsContent = () => {
    return (
        <div className={styles.content}>
            <p className={styles.content__title}>
                {t('Банк отримувача:')}
            </p>
            <p className={styles.content__text}>
                {t('Призначення платежу:')}
            </p>
            <p className={styles.content__error}>
                <img src={errorIcon} alt=""/>
                <span>{t('Обов\'язково скопіюйте призначення платежу')}</span>
            </p>
            <div className={styles.content__wrapper}>
                <div className={styles.content__box}>
                    <div className={styles.content__field}>
                        <p>{t('Оплата за товар')}</p>
                        <CopyToClipboard text={t('Оплата за товар')} className="click-effect">
                            <button tabIndex={0}>
                                <img src={copyIcon} alt=""/>
                            </button>
                        </CopyToClipboard>
                    </div>
                </div>
                <div className={styles.content__box}>
                    <span className={styles.content__label}>{t('Назва отримувача:')}</span>
                    <div className={styles.content__field}>
                        <p>{t('ФОП Демо Ego Textile')}</p>
                        <CopyToClipboard text={t('ФОП Демо Ego Textile')} className="click-effect">
                            <button tabIndex={0}>
                                <img src={copyIcon} alt=""/>
                            </button>
                        </CopyToClipboard>
                    </div>
                </div>
                <div className={styles.content__box}>
                    <span className={styles.content__label}>{t('Код ЄДРПОУ:')}</span>
                    <div className={styles.content__field}>
                        <p>0000000000</p>
                        <CopyToClipboard text={'0000000000'} className="click-effect">
                            <button tabIndex={0}>
                                <img src={copyIcon} alt=""/>
                            </button>
                        </CopyToClipboard>
                    </div>
                </div>
                <div className={styles.content__box}>
                    <span className={styles.content__label}>{t('Рахунок отримувача:')}</span>
                    <div className={styles.content__field}>
                        <p>UA000000000000000000000000000</p>
                        <CopyToClipboard text={'UA000000000000000000000000000'} className="click-effect">
                            <button tabIndex={0}>
                                <img src={copyIcon} alt=""/>
                            </button>
                        </CopyToClipboard>
                    </div>
                </div>
                <div className={styles.content__box}>
                    <span className={styles.content__label}>{t('Код ЄДРПОУ:')}</span>
                    <div className={styles.content__field}>
                        <p>00000000000000000000</p>
                        <CopyToClipboard text={'00000000000000000000'} className="click-effect">
                            <button tabIndex={0}>
                                <img src={copyIcon} alt=""/>
                            </button>
                        </CopyToClipboard>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DetailsContent;