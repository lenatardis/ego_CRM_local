import React, { useEffect, useMemo, useState } from "react";
import styles from './Order.module.scss';
import paste from '../../../assets/icons/pasteIcon.svg';
import { useFormik } from 'formik';
import UrgentlyField from "./UrgentlyField";
import { useAppDispatch, useAppSelector } from "../../../hooks/redux";
import { useNavigate } from "react-router";
import { getUser } from "../../../store/selectors";
import Parser from "../../Common/Parser/Parser";
import InputMask from "react-input-mask";
import { getAccessToken } from "../../../utils/authTokens";
import { updateCustomer } from "../../../api/customersApi"
import { updatePayment } from "../../../api/paymentApi";
import { updateOrder } from "../../../api/ordersApi";
import { getDeliverNP, setDeliverNP } from "../../../api/novaPoshtaApi";
import { setIsActivePopup, setIsNotFound } from "../../../store/main-slice";
import { useLocation, useParams } from "react-router-dom";
import GlobalPopup from "../../Common/GlobalPopup/GlobalPopup";
import PopupCheckboxes from "../../Common/PopupCheckboxes/PopupCheckboxes";
import { useIsDesktop } from "../../../hooks/useIsDesktop";
import arrow from "../../../assets/icons/arrowDownGray.svg";
import ArrBack from "../../Common/ArrBack/ArrBack";
import { ORDER_PARSER_HINT } from "../../Common/Parser/parserHints";
import { getServerErrorMessage } from "../../../utils/getServerErrorMessage";

const OrderCreate = ({ order, sourcesList }) => {
    const manager = useAppSelector(getUser);
    const [isUrgently, setIsUrgently] = useState(false);
    const [saveData, setSaveData] = useState('');
    const isDisabled = order?.payment?.status === 'PAID' || order?.payment?.status === 'PAY_WAIT';
    const [errors, setErrors] = useState({});
    const { id } = useParams();
    const [deliveryOrder, setDeliveryOrder] = useState(null);
    const dispatch = useAppDispatch();
    const [popup, setPopup] = useState(null);
    const isDesktop = useIsDesktop();
    const [chosenSource, setChosenSource] = useState(order?.source?.name || '');
    const statusCaption = isDisabled ? '*Для того щоб відредагувати значення змініть статус замовлення на "В обробці"' : null;
    const [serverError, setServerError] = useState('');
    const location = useLocation();
    const isNewOrder = location.state?.isNewOrder;
    const navigate = useNavigate();

    const applyServerError = (response) => {
        const message = getServerErrorMessage(response);
        setServerError(message || '');
    };



    useEffect(() => {
        if (order?.payment) {
            if (isUrgently !== order.is_immediate) {
                setIsUrgently(order.is_immediate);
            }
        }
    }, [order])

    const generateFormValues = (order) => ({
        userUrl: order.customer && order.customer.url ? order.customer.url : '',
        nickName: order.customer && order.customer.username ? order.customer.username : '',
        first_name: order.customer && order.customer.first_name ? order.customer.first_name : '',
        last_name: order.customer && order.customer.last_name ? order.customer.last_name : '',
        middle_name: order.customer && order.customer.middle_name ? order.customer.middle_name : '',
        phone: order.customer && order.customer.phone ? order.customer.phone : '',
        comment: order.comment ? order.comment : '',
        source: order?.source?.id || ''
    })

    const { handleSubmit, handleChange, values, setValues, setFieldValue } = useFormik({
        initialValues: generateFormValues(order),
    });

    //reinitilization of values when creating new order on existing page
    useEffect(() => {
        if (order?.id) {
            if (isNewOrder) {
                setValues({
                    userUrl: '',
                    nickName: '',
                    first_name: '',
                    last_name: '',
                    middle_name: '',
                    phone: '',
                    comment: '',
                    source: ''
                });
                setChosenSource('');
                setErrors({});
                setIsUrgently(false);
            } else {
                setValues(generateFormValues(order));
                setChosenSource(order?.source?.name || '');
                setIsUrgently(order.is_immediate || false);
            }

            if (isNewOrder) {
                window.history.replaceState({}, document.title);
            }
        }
    }, [order?.id]);

    const auditDates = (value, fieldName, type) => {
        const accessToken = getAccessToken();
        setServerError('');

        if (saveData !== value && type === 'customer') {
            const processedValue = fieldName === 'phone'
                ? value.replace(/[ ()_-]/g, '')
                : ['first_name', 'last_name', 'middle_name'].includes(fieldName)
                    ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
                    : value;

            updateCustomer(accessToken, order.id, { [fieldName]: processedValue })
                .then((res) => {
                    if (res?.id) {
                        setErrors(prevErrors => {
                            const { [fieldName]: _, ...restErrors } = prevErrors;
                            return restErrors;
                        });
                        applyServerError(null);
                        updateNP(accessToken, fieldName, processedValue);
                    } else {
                        setErrors(prevErrors => ({
                            ...prevErrors,
                            [fieldName]: res?.[fieldName]?.[0] || 'Invalid'
                        }));
                        applyServerError(res);
                    }
                })
                .catch((e) => {
                    console.log(e);
                    setServerError('Не вдалося зберегти дані');
                });

        } else if (saveData !== value && type === 'payment') {
            updatePayment(accessToken, order.id, { [fieldName]: value })
                .then((res) => {
                    if (res?.id) {
                        applyServerError(null);
                    } else {
                        applyServerError(res);
                    }
                })
                .catch((err) => {
                    console.error(err);
                    setServerError('Не вдалося зберегти дані');
                });

        } else if (saveData !== value && type === 'order') {
            updateOrder(accessToken, order.id, manager.id, { [fieldName]: value })
                .then((res) => {
                    if (res?.id) {
                        applyServerError(null);
                    } else {
                        applyServerError(res);
                    }
                })
                .catch((e) => {
                    console.log(e);
                    setServerError('Не вдалося зберегти дані');
                });
        }
    }

    const handleURLChange = (e) => {
        if (e.target.value) {
            const nickname = e.target.value.match(/(?:https?:\/\/)?(?:www.)?(?:instagram)(?:.com\/)?([@a-zA-Z0-9-_]+)/);
            if (Array.isArray(nickname) && nickname[1]) {
                setFieldValue("nickName", nickname[1]);
            } else {
                setFieldValue("nickName", "");
            }
        } else {
            setFieldValue("nickName", "");
        }

        handleChange(e);
    }

    const updateData = async (value, fieldName = null) => {
        const accessToken = getAccessToken();
        setServerError('');

        if (fieldName) {
            updateCustomer(accessToken, order?.id, { [fieldName]: value })
                .then((res) => {
                    if (res?.id || res?.created) {
                        applyServerError(null);
                    } else {
                        applyServerError(res);
                    }
                })
                .catch((e) => {
                    console.log(e);
                    setServerError('Не вдалося зберегти дані');
                });
        } else {
            try {
                const res = await updateCustomer(accessToken, order?.id, value);

                if (res?.created || res?.id) {
                    applyServerError(null);

                    ['first_name', 'last_name', 'middle_name', 'phone'].forEach((key) => {
                        if (value[key] !== undefined) {
                            updateNP(accessToken, key, value[key]);
                        }
                    });
                } else {
                    applyServerError(res);
                }
            } catch (e) {
                console.log(e);
                setServerError('Не вдалося зберегти дані');
            }
        }
    }

    const updateNP = (accessToken, fieldName, value) => {
        if (
            fieldName === 'first_name' ||
            fieldName === 'last_name' ||
            fieldName === 'phone' ||
            fieldName === 'middle_name'
        ) {
            setDeliverNP(accessToken, id, { [fieldName]: value }).then((res) => {
                if (res?.errors || res?._serverError || res?.detail || res?.message || res?.error) {
                    applyServerError(res);
                } else {
                    console.log('NP field is updated');
                }
            }).catch((e) => {
                console.log(e);
                setServerError('Не вдалося оновити дані доставки');
            });
        }
    }

    const onSubmit = (value) => {
        auditDates(value, 'status', 'order')
    }

    const handleValidChange = (key, value) => {
        if (/[^a-zа-яґєії+\-' ]+/ig.test(value) && value !== '') {
            return;
        }
        setFieldValue(key, value);
    }

    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            setFieldValue("userUrl", text);
            const nickname = text.match(/(?:https?:\/\/)?(?:www.)?(?:instagram)(?:.com\/)?([@a-zA-Z0-9-_]+)/);
            if (Array.isArray(nickname) && nickname[1]) {
                setFieldValue("nickName", nickname[1]);
                updateData({
                    url: text,
                    username: nickname[1]
                })
            } else {
                setFieldValue("nickName", "");
                updateData({
                    url: text,
                    username: ''
                })
            }
        } catch (err) {
            console.error('Failed to read clipboard: ', err);
        }
    }

    useEffect(() => {
        if (id) {
            let accessToken = getAccessToken();
            getDeliverNP(accessToken, id).then((result) => {
                if (result && result.length > 0) {
                    setDeliveryOrder(result[0]);
                } else if (result?.detail) {
                    accessToken = getAccessToken();
                    setDeliverNP(accessToken, id, { 'paid_by_the_sender': false, 'payment_method': 'NON_CASH' }).then((res) => {
                        if (res?.id) {
                            setDeliveryOrder(res);
                        } else {
                            dispatch(setIsNotFound(true));
                        }
                    });
                }
            }).catch(err => {
                console.log(err);
            })
        }
    }, [id]);

    const sources = useMemo(() => {
        if (!sourcesList) return [];
        return sourcesList.map(item => ({
            title: item.name,
            value: item.name
        }));
    }, [sourcesList]);

    const onChangeSource = (value) => {
        setPopup(null);
        dispatch(setIsActivePopup(false));
        const found = sourcesList?.find(item => item.name === value.value);
        const sourceId = found?.id || '';
        auditDates(sourceId, 'source', 'order');
        setChosenSource(value.value);
    }

    const onSourceBtn = () => {
        setSaveData(chosenSource);
        setPopup('source')
        setTimeout(() => {
            dispatch(setIsActivePopup(true))
        }, 30)
    }

    const nextPage = () => {
        if (id) {
            navigate(`/products/${id}`);
        }
    }

    return (
        <div className={styles.order}>
            <div className={styles.orderWrap}>
                {isDesktop && <ArrBack />}
                <form onSubmit={handleSubmit}>
                    <h2 className={styles.order__title}>Замовлення</h2>
                    <div className={styles.order__content}>
                        <p className={styles.order__header}>
                            <span>{order.id}</span>
                            {order && order.created && (
                                <span>{`${order.created.substring(8, 10)}.${order.created.substring(5, 7)}.${order.created.substring(0, 4)}`}</span>
                            )}
                        </p>
                        {statusCaption && <p className={styles.statusCaption}>{statusCaption}</p>}
                        <div className={styles.form}>
                            <div className={styles.inputWrap}>
                                <label for="userUrl" className={styles.form__label}>Посилання на профіль замовника</label>
                                <div className={styles.form__userUrl}>
                                    <input
                                        placeholder={'User URL'}
                                        className={`baseInput ${isDisabled ? styles.disabled : ''}`}
                                        id="userUrl"
                                        name="userUrl"
                                        type="text"
                                        value={values.userUrl}
                                        onChange={handleURLChange}
                                        onFocus={(e) => setSaveData(e.target.value)}
                                        onBlur={(e) => {
                                            const accessToken = getAccessToken();
                                            setServerError('');

                                            updateCustomer(accessToken, order.id, {
                                                url: e.target.value,
                                                username: values.nickName
                                            })
                                                .then((res) => {
                                                    if (res?.id || res?.created) {
                                                        applyServerError(null);
                                                    } else {
                                                        applyServerError(res);
                                                    }
                                                })
                                                .catch((e) => {
                                                    console.log(e);
                                                    setServerError('Не вдалося зберегти дані');
                                                });
                                        }}
                                    />
                                    <button
                                        className={styles.pasteBtn}
                                        type='button'
                                        onClick={handlePaste}
                                        disabled={isDisabled}
                                    >
                                        <img src={paste} alt="" />
                                    </button>
                                </div> </div>
                            <div>
                                <div className={styles.inputWrap}>
                                    <label for="nickName" className={styles.form__label}>Нік замовника</label>
                                    <input
                                        placeholder={'Нік'}
                                        className={`baseInput ${isDisabled ? styles.disabled : ''}`}
                                        aria-label={'username'}
                                        id="nickName"
                                        name="nickName"
                                        type="text"
                                        onChange={(e) => {
                                            handleChange(e)
                                        }}
                                        onFocus={(e) => setSaveData(e.target.value)}
                                        onBlur={(e) => auditDates(e.target.value, 'username', 'customer')}
                                        value={values.nickName}
                                    />
                                </div>
                            </div>
                            <div className={styles.inputWrap}>
                                <label for="sourceBtn" className={styles.form__label}>Джерело замовлення</label>
                                <button id="sourceBtn" className={`${styles.sourceBox}`} onClick={() => onSourceBtn()}>
                                    <span
                                        style={{ 'color': '#201827' }}>{chosenSource ? chosenSource : 'Оберіть джерело замовлення'}</span>
                                    <img src={arrow} alt="" />
                                </button>
                            </div>
                            <div className={styles.form__name}>
                                <div className={styles.inputWrap}>
                                    <label for="first_name" className={styles.form__label}><span>Ім'я</span>&nbsp;<span className={styles.desktop_visible}>замовника</span></label>
                                    <div className="baseInputContainer">
                                        <span className="coloredLabel colored--first_name"></span>
                                        <input
                                            placeholder={'Ім`я'}
                                            className={`baseInput ${isDisabled ? styles.disabled : errors.first_name ? 'baseInputError' : ''}`}
                                            aria-label={'first_name'}
                                            id={'first_name'}
                                            name="first_name"
                                            type="text"
                                            onChange={(e) => handleValidChange(e.target.name, e.target.value)}
                                            onFocus={(e) => setSaveData(e.target.value)}
                                            onBlur={(e) => auditDates(e.target.value, 'first_name', 'customer')}
                                            value={values.first_name}
                                        />
                                    </div>
                                </div>
                                <div className={styles.inputWrap}>
                                    <label for="last_name" className={styles.form__label}><span>Прізвище</span>&nbsp;<span className={styles.desktop_visible}>замовника</span></label>
                                    <div className="baseInputContainer">
                                        <span className="coloredLabel colored--last_name"></span>
                                        <input
                                            placeholder={'Прізвище'}
                                            className={`baseInput ${isDisabled ? styles.disabled : errors.last_name ? 'baseInputError' : ''}`}
                                            aria-label={'last_name'}
                                            id="last_name"
                                            name="last_name"
                                            type="text"
                                            onChange={(e) => handleValidChange(e.target.name, e.target.value)}
                                            onFocus={(e) => setSaveData(e.target.value)}
                                            onBlur={(e) => auditDates(e.target.value, 'last_name', 'customer')}
                                            value={values.last_name}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className={styles.inputWrap}>
                                <label for="middle_name" className={styles.form__label}><span>По батькові</span>&nbsp;<span className={styles.desktop_visible}>замовника</span></label>
                                <div className="baseInputContainer">
                                    <span className="coloredLabel colored--middle_name"></span>
                                    <input
                                        placeholder={'По батькові'}
                                        className={`baseInput ${isDisabled ? styles.disabled : errors.middle_name ? 'baseInputError' : ''}`}
                                        aria-label={'middle_name'}
                                        id="middle_name"
                                        name="middle_name"
                                        type="text"
                                        onChange={(e) => handleValidChange(e.target.name, e.target.value)}
                                        onFocus={(e) => setSaveData(e.target.value)}
                                        onBlur={(e) => auditDates(e.target.value, 'middle_name', 'customer')}
                                        value={values.middle_name}
                                    />
                                </div>
                            </div>
                            <div className={styles.inputWrap}>
                                <label for="phone" className={styles.form__label}><span>Телефон</span>&nbsp;<span className={styles.desktop_visible}>замовника</span></label>
                                <div className="baseInputContainer">
                                    <span className="coloredLabel colored--phone"></span>
                                    <InputMask
                                        mask="+38 (099) 999-99-99"
                                        value={values.phone}
                                        onChange={(e) => handleChange(e)}
                                        onFocus={(e) => setSaveData(e.target.value)}
                                        onBlur={(e) => auditDates(e.target.value, 'phone', 'customer')}
                                    >
                                        {(inputProps) => (
                                            <input
                                                {...inputProps}
                                                placeholder={"Телефон"}
                                                className={`baseInput ${isDisabled ? styles.disabled : errors.phone ? 'baseInputError' : ''}`}
                                                aria-label={"phone"}
                                                id="phone"
                                                name="phone"
                                            />
                                        )}
                                    </InputMask>
                                </div>
                            </div>
                            <div className={styles.inputWrap}>
                                <label className={styles.form__label}>Терміновість замовлення</label>
                                <UrgentlyField setIsUrgently={setIsUrgently} isUrgently={isUrgently} auditDates={auditDates} isDisabled={isDisabled} />
                            </div>
                            <div className={styles.inputWrap}>
                                <label className={styles.form__label}>Коментар до замовлення</label>
                                <textarea
                                    placeholder={'Коментар'}
                                    className={'baseInput'}
                                    aria-label={'comment'}
                                    id="comment"
                                    name="comment"
                                    value={values.comment}
                                    onChange={(e) => {
                                        handleChange(e)
                                    }}
                                    onFocus={(e) => setSaveData(e.target.value)}
                                    onBlur={(e) => auditDates(e.target.value, 'comment', 'order')}
                                />
                            </div>
                            {serverError && <p className={styles.serverError}>{serverError}</p>}
                        </div>
                    </div>
                </form>
                <Parser
                    values={values}
                    setValues={(newValues) => setValues(prevValues => ({ ...prevValues, ...newValues }))}
                    updateData={updateData}
                    hintText={ORDER_PARSER_HINT}
                />
                <div className="globalBtnWrap">
                    <button className="globalBtn button-xs" onClick={nextPage}>
                        <span>Далі</span>
                    </button>
                </div>
            </div>
            {popup === 'source' && (
                <GlobalPopup title={'Джерело замовлення'} onClose={() => setPopup(null)}  {...(isDesktop ? { centeredPopup: true } : {})}>
                    <PopupCheckboxes values={chosenSource ?? null} setValues={onChangeSource} chooseList={sources} isRadio />
                </GlobalPopup>
            )}
        </div>
    )
}

export default OrderCreate;