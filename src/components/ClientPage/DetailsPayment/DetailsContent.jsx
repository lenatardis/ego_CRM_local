import React from "react";
import styles from './DetailsPayment.module.scss';
import errorIcon from '../../../assets/icons/notificationRed.svg'
import copyIcon from "../../../assets/icons/copy.svg";
import {CopyToClipboard} from "react-copy-to-clipboard";


const DetailsContent = () => {
    return (
        <div className={styles.content}>
            <p className={styles.content__title}>
                Банк отримувача:
            </p>
            <p className={styles.content__text}>
                Призначення платежу:
            </p>
            <p className={styles.content__error}>
                <img src={errorIcon} alt=""/>
                <span>Обов'язково скопіюйте призначення платежу</span>
            </p>
            <div className={styles.content__wrapper}>
                <div className={styles.content__box}>
                    <div className={styles.content__field}>
                        <p>Оплата за товар</p>
                        <CopyToClipboard text={'Оплата за товар'} className="click-effect">
                            <button tabIndex={0}>
                                <img src={copyIcon} alt=""/>
                            </button>
                        </CopyToClipboard>
                    </div>
                </div>
                <div className={styles.content__box}>
                    <span className={styles.content__label}>Назва отримувача:</span>
                    <div className={styles.content__field}>
                        <p>ФОП Демо Ego Textile</p>
                        <CopyToClipboard text={'ФОП Демо Ego Textile'} className="click-effect">
                            <button tabIndex={0}>
                                <img src={copyIcon} alt=""/>
                            </button>
                        </CopyToClipboard>
                    </div>
                </div>
                <div className={styles.content__box}>
                    <span className={styles.content__label}>Код ЄДРПОУ:</span>
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
                    <span className={styles.content__label}>Рахунок отримувача:</span>
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
                    <span className={styles.content__label}>Код ЄДРПОУ:</span>
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