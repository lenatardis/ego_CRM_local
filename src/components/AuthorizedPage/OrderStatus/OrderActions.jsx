import React, { useState } from "react";
import styles from './OrderActions.module.scss';
import styles2 from '../Main/Order/Order.module.scss';
import copyIcon from "../../../assets/icons/copy2.svg";
import { CopyToClipboard } from "react-copy-to-clipboard";
import printerIcon from "../../../assets/icons/printer.svg";
import closeIcon from "../../../assets/icons/closeCross.svg";
import CancelOrder from "../Main/Order/Popup/CancelOrder";
import { useIsDesktop } from "../../../hooks/useIsDesktop";
import { getAccessToken } from "../../../utils/authTokens";
import { getNPTTNPDF } from "../../../api/novaPoshtaApi";
import Preloader from "../../Common/Preloader/Preloader";

const OrderActions = ({ orderUrl, isDisabled, onCopyAll, ttnURL, deliveryInfo, setTTNURL }) => {
    const [isShowPopup, setIsShowPopup] = useState(false);
    const [isTTNLoading, setIsTTNLoading] = useState(false);
    const [ttnError, setTtnError] = useState('');

    const openPopup = () => {
        setTtnError('');
        setIsShowPopup(true);
    }

    const closePopup = () => {
        setTtnError('');
        setIsShowPopup(false);
    }

    const getTTNPDF = async () => {
        if (!deliveryInfo?.id) {
            console.log('deliveryInfo.id відсутній', deliveryInfo);
            return null;
        }

        const accessToken = getAccessToken();

        try {
            const response = await getNPTTNPDF(accessToken, deliveryInfo.id);


            if (response?.url) {
                setTTNURL(response.url);
                return response.url;
            }

            return null;
        } catch (error) {
            console.log('TTN PDF error:', error);
            return null;
        }
    };


    const openTTN = async () => {
        if (isTTNLoading) return;

        setTtnError('');
        setIsTTNLoading(true);

        try {
            const url = await getTTNPDF();

            if (url) {
                setIsShowPopup(false);
                window.open(url, '_blank', 'noopener,noreferrer');
            } else {
                setTtnError(
                    'Вибачте, виникла проблема з підключенням до сервісів Нової Пошти. Спробуйте, будь ласка, пізніше.'
                );
            }
        } catch (error) {
            console.log('Open TTN error:', error);
            setTtnError(
                'Вибачте, виникла проблема з підключенням до сервісів Нової Пошти. Спробуйте, будь ласка, пізніше.'
            );
        } finally {
            setIsTTNLoading(false);
        }
    };

    const isDesktop = useIsDesktop();

    return (
        <>
            <div className={styles.orderActions}>
                <div className={styles.row}>
                    <button onClick={onCopyAll} className={`${styles.copyButton} click-effect`} tabIndex={0}>
                        <img src={copyIcon} alt="" />
                        <span>Скопіювати все</span>
                    </button>
                    {/*  <button className={styles.prodLink} disabled={isDisabled}>
                    <span>На виробництво</span>
                </button>*/}
                </div>
                <div className={styles.row}>
                    {orderUrl && (
                        <CopyToClipboard text={orderUrl} className={`${styles.orderLink} click-effect`}>
                            <button tabIndex={0}>
                                <span>Посилання на замовлення</span>
                            </button>
                        </CopyToClipboard>
                    )}
                </div>
                <div className={styles.row}>
                    <button className={`${styles.copyButton} click-effect`} tabIndex={0} onClick={openPopup}>
                        <img src={printerIcon} alt="" />
                        <span>Роздрукувати ТТН</span>
                    </button>
                </div>
            </div>
            {isShowPopup && (
                <>
                    <span
                        className={isShowPopup ? styles2.shadowActive : styles2.shadowhide}
                        onClick={(e) => {
                            e.stopPropagation();
                            closePopup();
                        }}
                    />
                    <div className={`${isShowPopup ? styles2.globalPopupActive : styles2.globalPopup} ${isDesktop ? styles2.centeredPopup : ''
                        }`}
                        onClick={(e) => e.stopPropagation()}>
                        <div className={styles2.header}>
                            <p className={styles2.header__title}>Друк ТТН</p>
                            <div className={styles2.header__close} onClick={() => closePopup()}>
                                <span>Закрити</span>
                                <button>
                                    <img src={closeIcon} alt="" />
                                </button>
                            </div>
                        </div>
                        <div className={styles2.globalPopup__content}>
                            {isTTNLoading ? (
                                <div className={styles.ttnLoader}>
                                    <Preloader />
                                    <p>Завантажуємо ТТН...</p>
                                </div>
                            ) : ttnError ? (
                                <div className={styles.ttnError}>
                                    <p>{ttnError}</p>
                                </div>
                            ) : (
                                <CancelOrder onCancel={closePopup} onConfirm={openTTN} ttn />
                            )}
                        </div>
                    </div>
                </>
            )}
        </>
    )
}

export default OrderActions;