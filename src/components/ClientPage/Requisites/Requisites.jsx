import styles from './Requisities.module.scss';
import {CopyToClipboard} from "react-copy-to-clipboard";
import copyIcon from "../../../assets/icons/copy.svg";

const Requisites = ({ detail }) => {
    return (
        <div className={styles.requisites}>
            <h2>Реквізити для оплати</h2>
            <div className={styles.content}>
                <h3>Банк отримувача:</h3>
                <div className={styles.content__box}>
                    <span className={styles.content__title}>Призначення платежу:</span>
                    <p className={styles.warning}>Обов'язково скопіюйте призначення платежу</p>
                    {detail?.purpose_of_payment && (
                        <div className={styles.content__field}>
                            <div className={styles.content__leftField}>
                                <span>{detail?.purpose_of_payment}</span>
                            </div>
                            <CopyToClipboard text={detail?.purpose_of_payment} className="click-effect">
                                <button tabIndex={0}>
                                    <img src={copyIcon} alt=""/>
                                </button>
                            </CopyToClipboard>
                        </div>
                    )}

                </div>
                <div className={styles.content__box}>
                    <span className={styles.content__title}>Назва отримувача:</span>
                    {detail?.recipient && (
                        <div className={styles.content__field}>
                            <div className={styles.content__leftField}>
                                <span>{detail?.recipient}</span>
                            </div>
                            <CopyToClipboard text={detail?.recipient} className="click-effect">
                                <button tabIndex={0}>
                                    <img src={copyIcon} alt=""/>
                                </button>
                            </CopyToClipboard>
                        </div>
                    )}

                </div>
                <div className={styles.content__box}>
                    <span className={styles.content__title}>Код ЄДРПОУ:</span>
                    {detail?.edrpou_code && (
                        <div className={styles.content__field}>
                            <div className={styles.content__leftField}>
                                <span>{detail?.edrpou_code}</span>
                            </div>
                            <CopyToClipboard text={detail?.edrpou_code} className="click-effect">
                                <button tabIndex={0}>
                                    <img src={copyIcon} alt=""/>
                                </button>
                            </CopyToClipboard>
                        </div>
                    )}
                </div>
                {detail?.recipient_bank_account && (
                    <div className={styles.content__box}>
                        <span className={styles.content__title}>Рахунок отримувача:</span>
                        <div className={styles.content__field}>
                            <div className={styles.content__leftField}>
                                <span>{detail?.recipient_bank_account}</span>
                            </div>
                            <CopyToClipboard text={detail?.recipient_bank_account} className="click-effect">
                                <button tabIndex={0}>
                                    <img src={copyIcon} alt=""/>
                                </button>
                            </CopyToClipboard>
                        </div>
                    </div>
                )}
                {detail?.entrepreneur_code && (
                    <div className={styles.content__box}>
                        <span className={styles.content__title}>або карта ФОП</span>
                        <div className={styles.content__field}>
                            <div className={styles.content__leftField}>
                                <span>{detail?.entrepreneur_code}</span>
                            </div>
                            <CopyToClipboard text={detail?.entrepreneur_code} className="click-effect">
                                <button tabIndex={0}>
                                    <img src={copyIcon} alt=""/>
                                </button>
                            </CopyToClipboard>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Requisites