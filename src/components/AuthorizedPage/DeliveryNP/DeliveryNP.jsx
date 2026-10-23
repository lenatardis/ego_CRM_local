import React, { useEffect, useState } from "react";
import styles from './DeliveryNP.module.scss';
import { useFormik } from "formik";
import { useIsDesktop } from "../../../hooks/useIsDesktop";
import { useNavigate } from "react-router";
import './delivery.scss'
import NovaPoshtaCities from "./NovaPoshtaCities/NovaPoshtaCities";
import NovaPoshtaDepartments from "./NovaPoshtaDepartments/NovaPoshtaDepartments";
import NovaPoshtaWeight from "./NovaPoshtaWeight/NovaPoshtaWeight";
import DeliveryIPay from "./DeliveryIPay/DeliveryIPay";
import copyIcon from "../../../assets/icons/copy.svg";
import { CopyToClipboard } from "react-copy-to-clipboard";
import Parser from "../../Common/Parser/Parser";
import InputMask from "react-input-mask";
import { getAccessToken } from "../../../utils/authTokens";
import { setDeliverNP, setDeliverNPTTN, updateDeliveryNPTTN } from "../../../api/novaPoshtaApi";
import DateTimeField from "../../Common/DateTimeField/DateTimeField";
import { BackwardDelivery } from "./BackwardDelivery/BackwardDelivery";
import { PaymentMethod } from "./PaymentMethod/PaymentMethod";
import ArrBack from "../../Common/ArrBack/ArrBack";
import { DELIVERY_PARSER_HINT } from "../../Common/Parser/parserHints";
import { getServerErrorMessage } from "../../../utils/getServerErrorMessage";
import InfoHint from "../../Common/ProductItem/InfoHint/InfoHint";
import { getOrderInfo, getSuborders } from "../../../api/ordersApi";



const DeliveryNP = ({ deliveryOrder, lastOrderId }) => {
    const [cityValue, setCityValue] = useState(deliveryOrder?.receiver?.delivery_receiver?.city || '');
    const [saveData, setSaveData] = useState('');
    const [requiredNPValues, setRequiredNPValues] = useState(null);
    const [oldRequiredNPValues, setOldRequiredNPValues] = useState(null);
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState('');
    const isAllRequiredValuesFilled = requiredNPValues?.first_name &&  requiredNPValues?.middle_name && requiredNPValues?.last_name && requiredNPValues?.phone && requiredNPValues?.city && requiredNPValues?.address && requiredNPValues?.specified_weight && requiredNPValues?.estimate_order_price;
    const caption = '*Для створення ТТН необхідно заповнити всі обов\'язкові поля (з зірочкою)';
    const captionRefresh = '*Для оновлення ТТН необхідно заповнити всі обов\'язкові поля';
    const captionRefresh2 = '*Якщо бажаєте оновити ТТН, внесіть зміни хоча б в одному з полів';
    const captionSum = '*Сума оголошеної вартості повинна бути більше 0. Додайте, будь ласка, товари';
    const navigate = useNavigate();

    const applyServerError = (response) => {
        const message = getServerErrorMessage(response);
        setServerError(message || '');
    };

    const [estimatePriceHintText, setEstimatePriceHintText] = useState('');

    const getNumberValue = (value) => {
        const number = Number(value);
        return Number.isFinite(number) ? number : 0;
    };

    const formatPrice = (value) => {
        return `${getNumberValue(value)} грн`;
    };

    const getEstimatePriceHintText = (generalOrderAmount, suborderAmount, hasSuborder) => {
        if (hasSuborder) {
            return `Оголошена вартість складається із суми основного замовлення (${formatPrice(generalOrderAmount)}) та суми підзамовлення (${formatPrice(suborderAmount)}).`;
        }

        return `Оголошена вартість складається із суми основного замовлення (${formatPrice(generalOrderAmount)}).`;
    };

    const getRequiredNPValues = (updatedDeliveryOrder) => {
        if (!updatedDeliveryOrder) return null;
        console.log(updatedDeliveryOrder);
        console.log('getRequiredNPValues estimate_order_price raw', updatedDeliveryOrder?.delivery?.estimate_order_price);
        return {
            id: updatedDeliveryOrder?.id,
            first_name: updatedDeliveryOrder?.receiver?.delivery_receiver?.first_name || '',
            last_name: updatedDeliveryOrder?.receiver?.delivery_receiver?.last_name || '',
            middle_name: updatedDeliveryOrder?.receiver?.delivery_receiver?.middle_name || '',
            phone: updatedDeliveryOrder?.receiver?.delivery_receiver?.phone || '',
            city: updatedDeliveryOrder?.receiver?.delivery_receiver?.city || '',
            city_ref: updatedDeliveryOrder?.receiver?.city_identifier || '',
            address: updatedDeliveryOrder?.receiver?.address || '',
            address_ref: updatedDeliveryOrder?.receiver?.address_identifier || '',
            max_weight_allowed: updatedDeliveryOrder?.receiver?.max_weight_allowed || '',
            warehouse_number: updatedDeliveryOrder?.receiver?.department_number || '',
            specified_weight: updatedDeliveryOrder?.specified_weight || '',
            payer: updatedDeliveryOrder?.delivery?.payer || '',
            estimate_order_price: updatedDeliveryOrder?.delivery?.estimate_order_price ?? '',
            ...(updatedDeliveryOrder?.with_backward_delivery && { backward_amount: updatedDeliveryOrder?.backward_amount || '' })
        }
    }

    useEffect(() => {
        if (deliveryOrder) {
            console.log('INIT estimate_order_price', deliveryOrder?.delivery?.estimate_order_price);
            const requiredNPValues = getRequiredNPValues(deliveryOrder);
            console.log(requiredNPValues);
            console.log('INIT mapped estimate_order_price', requiredNPValues?.estimate_order_price);
            setRequiredNPValues(requiredNPValues);
            setOldRequiredNPValues(requiredNPValues);
        }
    }, [deliveryOrder])

    useEffect(() => {
        if (!lastOrderId) return;

        const accessToken = getAccessToken();

        Promise.all([
            getOrderInfo(accessToken, lastOrderId),
            getSuborders(accessToken, { general_order: lastOrderId }),
        ])
            .then(([orderResponse, subordersResponse]) => {
                const generalOrderAmount = getNumberValue(orderResponse?.payment?.final_amount);

                const suborder = Array.isArray(subordersResponse)
                    ? subordersResponse[0]
                    : null;

                const hasSuborder = !!suborder?.id;
                const suborderAmount = getNumberValue(suborder?.payment?.final_amount);

                setEstimatePriceHintText(
                    getEstimatePriceHintText(generalOrderAmount, suborderAmount, hasSuborder)
                );
            })
            .catch((error) => {
                console.log(error);
                setEstimatePriceHintText('');
            });
    }, [lastOrderId]);

    const auditDates = (value, fieldName = null) => {
        if (saveData !== value) {
            const accessToken = getAccessToken();
            setServerError('');

            if (fieldName) {
                const processedValue = fieldName === 'phone'
                    ? value.replace(/[ ()_-]/g, '')
                    : ['first_name', 'last_name', 'middle_name'].includes(fieldName)
                        ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
                        : value;

                setDeliverNP(accessToken, lastOrderId, { [fieldName]: processedValue }).then((res) => {
                    if (res?.errors) {
                        setErrors(prevErrors => ({ ...prevErrors, ...res.errors }));
                        applyServerError(res);
                    } else if (res?._serverError || res?.detail || res?.message || res?.error) {
                        applyServerError(res);
                    } else {
                        setRequiredNPValues(getRequiredNPValues(res));
                        setErrors(prevErrors => {
                            const { [fieldName]: _, ...restErrors } = prevErrors;
                            return restErrors;
                        });
                        applyServerError(null);
                    }
                }).catch((e) => {
                    console.log(e);
                    setServerError('Не вдалося зберегти дані доставки');
                });
            } else {
                setDeliverNP(accessToken, lastOrderId, value).then((res) => {
                    if (res.errors) {
                        setErrors(prevErrors => ({ ...prevErrors, ...res.errors }));
                        applyServerError(res);
                    } else if (res?._serverError || res?.detail || res?.message || res?.error) {
                        applyServerError(res);
                    } else {
                        const prevAddressRef = requiredNPValues?.address_ref;
                        const currentSpecifiedWeight = requiredNPValues?.specified_weight || '';
                        const updatedRequiredNPValues = getRequiredNPValues(res);

                        setRequiredNPValues({
                            ...updatedRequiredNPValues,
                            specified_weight: currentSpecifiedWeight || updatedRequiredNPValues?.specified_weight,
                        });

                        setErrors(prevErrors => {
                            const restErrors = { ...prevErrors };
                            Object.keys(value).forEach(key => {
                                if (key in restErrors) {
                                    delete restErrors[key];
                                }
                            });
                            return restErrors;
                        });

                        applyServerError(null);

                        if (
                            currentSpecifiedWeight &&
                            updatedRequiredNPValues?.address_ref &&
                            updatedRequiredNPValues.address_ref !== prevAddressRef
                        ) {
                            setDeliverNP(accessToken, lastOrderId, { specified_weight: currentSpecifiedWeight }).then((weightRes) => {
                                if (weightRes?.errors) {
                                    setErrors(prevErrors => ({ ...prevErrors, ...weightRes.errors }));
                                    applyServerError(weightRes);
                                } else if (weightRes?._serverError || weightRes?.detail || weightRes?.message || weightRes?.error) {
                                    applyServerError(weightRes);
                                } else {
                                    setRequiredNPValues(getRequiredNPValues(weightRes));
                                    setErrors(prevErrors => {
                                        const { specified_weight, ...restErrors } = prevErrors;
                                        return restErrors;
                                    });
                                    applyServerError(null);
                                }
                            }).catch((e) => {
                                console.log(e);
                                setServerError('Не вдалося зберегти вагу доставки');
                            });
                        }
                    }
                }).catch((e) => {
                    console.log(e);
                    setServerError('Не вдалося зберегти дані доставки');
                });
            }
        }
    }
    const formValues = {
        first_name: deliveryOrder?.receiver?.delivery_receiver?.first_name || '',
        last_name: deliveryOrder?.receiver?.delivery_receiver?.last_name || '',
        middle_name: deliveryOrder?.receiver?.delivery_receiver?.middle_name || '',
        phone: deliveryOrder?.receiver?.delivery_receiver?.phone || '',
        declared_order_price: deliveryOrder?.delivery?.estimate_order_price ?? '',
        declared_delivery_price: deliveryOrder?.delivery?.estimate_delivery_price || '',
        ttn: deliveryOrder?.delivery?.ttn || '',
        comment: deliveryOrder?.delivery?.comment || '',
        delivery_date: deliveryOrder?.delivery_date || '',
        with_backward_delivery: deliveryOrder?.with_backward_delivery || false,
        backward_amount: deliveryOrder?.backward_amount || '',
        payment_method: deliveryOrder?.delivery?.payment_method || '',
        postpaid_amount: deliveryOrder?.postpaid_amount || ''
    }

    const { isSubmitting, setSubmitting, handleSubmit, handleChange, values, setValues, setFieldValue } = useFormik({
        initialValues: formValues,

        onSubmit: (e) => {
            getTTN();
        },
    });

    const handleSetValues = (newValues) => {
        const { city, ...newFormValues } = newValues;
        setValues(prevValues => ({
            ...prevValues,
            ...newFormValues
        }));
        setCityValue(prevCity => city !== undefined ? city : prevCity);
    }

    const handleValidChange = (key, value) => {
        if (/[^a-zа-яґєії+\-' ]+/ig.test(value) && value !== '') {
            return;
        }
        setFieldValue(key, value);
    }

    const validateRequiredNPValues = () => {
        const newErrors = {};

        for (const [key, value] of Object.entries(requiredNPValues)) {
            if (!value) {
                newErrors[key] = 'This field may not be blank.';
            }
        }

        if (Object.keys(errors).length > 0 || Object.keys(newErrors).length > 0) {
            setErrors((prevErrors) => ({ ...prevErrors, ...newErrors }));
            return false;
        }

        return true;
    }

    const getTTN = async () => {
        if (!deliveryOrder) return;
        const isValid = validateRequiredNPValues();

        if (!isValid) {
            setSubmitting(false);
            return;
        }

        const accessToken = getAccessToken();
        setServerError('');

        if (values.ttn) {
            try {
                const data = await updateDeliveryNPTTN(accessToken, requiredNPValues.id);

                if (data?.id && data?.delivery?.ttn) {
                    const newValues = {
                        ttn: data.delivery.ttn,
                        declared_delivery_price: data.delivery.estimate_delivery_price,
                        delivery_date: data.delivery_date
                    };

                    setValues((prevValues) => ({
                        ...prevValues,
                        ...newValues
                    }));

                    setRequiredNPValues((prevValues) => ({
                        ...prevValues,
                        estimate_order_price: data.delivery.estimate_order_price
                    }));

                    setOldRequiredNPValues({
                        ...requiredNPValues,
                        estimate_order_price: data.delivery.estimate_order_price
                    });

                    applyServerError(null);
                } else {
                    applyServerError(data);
                }

                setSubmitting(false);
            } catch (error) {
                console.log(error);
                setServerError('Не вдалося оновити ТТН');
                setSubmitting(false);
            }
        } else {
            setDeliverNPTTN(accessToken, requiredNPValues.id)
                .then((response) => {
                    if (response?.id && response?.delivery?.ttn) {
                        const newValues = {
                            ttn: response.delivery.ttn,
                            declared_delivery_price: response.delivery.estimate_delivery_price,
                            delivery_date: response.delivery_date
                        };

                        setValues((prevValues) => ({
                            ...prevValues,
                            ...newValues
                        }));

                        setRequiredNPValues((prevValues) => ({
                            ...prevValues,
                            estimate_order_price: response.delivery.estimate_order_price
                        }));

                        setOldRequiredNPValues({
                            ...requiredNPValues,
                            estimate_order_price: response.delivery.estimate_order_price
                        });

                        applyServerError(null);
                    } else {
                        applyServerError(response);
                    }
                })
                .catch((error) => {
                    console.log(error);
                    setServerError('Не вдалося створити ТТН');
                })
                .finally(() => {
                    setSubmitting(false);
                });
        }
    };

    function areObjectsEqual(obj1, obj2) {
        const obj1Keys = Object.keys(obj1);
        const obj2Keys = Object.keys(obj2);

        if (obj1Keys.length !== obj2Keys.length) {
            return false;
        }

        return obj1Keys.every((key) => obj1[key] === obj2[key]);
    }

    const handlePostpaidAmountChange = (e) => {
        const inputValue = e.target.value;

        if (parseFloat(inputValue) > (parseFloat(formValues.postpaid_amount))) {
            setErrors((prevErrors) => ({
                ...prevErrors,
                postpaid_amount: true,
            }));
        } else {
            setErrors((prevErrors) => {
                const { postpaid_amount, ...restErrors } = prevErrors;
                return restErrors;
            });
            setFieldValue("postpaid_amount", inputValue);
        }
    }

    const isDesktop = useIsDesktop();
    const nextPage = () => {
        if (lastOrderId) {
            navigate(`/order_status/${lastOrderId}`);
        }
    }

    return (
        <div className={`${styles.deliveryNP} deliveryNP`}>
            <div className={styles.deliveryNPWrap}>
                <form onSubmit={handleSubmit}>
                    <div className={styles.deliveryNP__content}>
                        <div className={styles.deliveryNP__row}>
                            <div className={styles.inputWrap}>
                                <label className={styles.formLabel} htmlFor="first_name"><span>Ім'я</span>&nbsp;<span className={styles.desktop_visible}>Отримувача</span><span className={styles.requiredMark}>&nbsp;*</span></label>
                                <div className="baseInputContainer">
                                    <span className="coloredLabel colored--first_name"></span>
                                    <input
                                        placeholder={'Ім`я'}
                                        className={`baseInput ${errors.first_name ? 'baseInputError' : ''}`}
                                        id="first_name"
                                        name="first_name"
                                        type="text"
                                        onChange={(e) => handleValidChange(e.target.name, e.target.value)}
                                        value={values.first_name}
                                        onFocus={(e) => setSaveData(e.target.value)}
                                        onBlur={(e) => auditDates(e.target.value, 'first_name')}
                                    />
                                </div>
                            </div>
                            <div className={styles.inputWrap}>
                                <label htmlFor="last_name" className={styles.formLabel}><span>Прізвище</span>&nbsp;<span className={styles.desktop_visible}>Отримувача</span><span className={styles.requiredMark}>&nbsp;*</span></label>
                                <div className="baseInputContainer">
                                    <span className="coloredLabel colored--last_name"></span>
                                    <input
                                        placeholder={'Прізвище'}
                                        className={`baseInput ${errors.last_name ? 'baseInputError' : ''}`}
                                        id="last_name"
                                        name="last_name"
                                        type="text"
                                        onChange={(e) => handleValidChange(e.target.name, e.target.value)}
                                        value={values.last_name}
                                        onFocus={(e) => setSaveData(e.target.value)}
                                        onBlur={(e) => auditDates(e.target.value, 'last_name')}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className={styles.inputWrap}>
                            <label htmlFor="middle_name" className={styles.formLabel}><span>По батькові</span>&nbsp;<span className={styles.desktop_visible}>Отримувача</span><span className={styles.requiredMark}>&nbsp;*</span></label>
                            <div className="baseInputContainer">
                                <span className="coloredLabel colored--middle_name"></span>
                                <input
                                    placeholder={'По батькові'}
                                    className={`baseInput ${errors.middle_name ? 'baseInputError' : ''}`}
                                    id="middle_name"
                                    name="middle_name"
                                    type="text"
                                    onChange={(e) => handleValidChange(e.target.name, e.target.value)}
                                    value={values.middle_name}
                                    onFocus={(e) => setSaveData(e.target.value)}
                                    onBlur={(e) => auditDates(e.target.value, 'middle_name')}
                                />
                            </div>
                        </div>
                        <div className={styles.inputWrap}>
                            <label htmlFor="phone" className={styles.formLabel}>Телефон<span className={styles.requiredMark}>&nbsp;*</span></label>
                            <div className="baseInputContainer">
                                <span className="coloredLabel colored--phone"></span>
                                <InputMask
                                    mask="+38 (099) 999-99-99"
                                    value={values.phone}
                                    onChange={handleChange}
                                    onFocus={(e) => setSaveData(e.target.value)}
                                    onBlur={(e) => auditDates(e.target.value, 'phone')}
                                >
                                    {(inputProps) => (
                                        <input
                                            {...inputProps}
                                            placeholder={'Телефон'}
                                            className={`baseInput ${errors.phone ? 'baseInputError' : ''}`}
                                            aria-label={"phone"}
                                            id="phone"
                                            name="phone"
                                        />
                                    )}
                                </InputMask>
                            </div>
                        </div>
                        <div className={styles.deliveryNP__row}>
                            <div className={styles.inputWrap}>
                                <label className={styles.formLabel}>Місто доставки<span className={styles.requiredMark}>&nbsp;*</span></label>
                                <NovaPoshtaCities
                                    cityValue={cityValue}
                                    setCityValue={setCityValue}
                                    updateData={auditDates}
                                    error={errors.city}
                                />
                            </div>
                            <div className={styles.inputWrap}>
                                <label className={styles.formLabel}>Відділення<span className={styles.requiredMark}>&nbsp;*</span></label>
                                <NovaPoshtaDepartments
                                    cityId={requiredNPValues?.city_ref}
                                    department={requiredNPValues?.address || ''}
                                    updateData={auditDates}
                                    error={errors.address}
                                />
                            </div>

                        </div>
                        <div className={styles.inputWrap}>
                            <label className={styles.formLabel}>Об'ємна вага, кг<span className={styles.requiredMark}>&nbsp;*</span></label>
                            <NovaPoshtaWeight
                                weight={requiredNPValues?.specified_weight || ''}
                                setWeight={(specified_weight) => setRequiredNPValues(prevValues => ({ ...prevValues, specified_weight }))}
                                auditDates={auditDates}
                                error={errors.specified_weight}
                                hasDepartment={!!requiredNPValues?.address_ref}
                            />
                        </div>

                        <DeliveryIPay isIPay={requiredNPValues?.payer === 'Sender'} auditDates={auditDates} />
                        <div className={styles.inputWrap}>
                            <label className={styles.formLabel}>
                                <span>Оголошена вартість</span>
                                {estimatePriceHintText && (
                                    <>
                                        &nbsp;
                                        <InfoHint text={estimatePriceHintText} />
                                    </>
                                )}
                            </label>
                            <input
                                placeholder={'Оголошена вартість'}
                                className={`baseInput ${errors.estimate_order_price ? 'baseInputError' : ''}`}
                                id="declared_order_price"
                                name="declared_order_price"
                                type="number"
                                onChange={handleChange}
                                value={values.declared_order_price}
                                onFocus={(e) => setSaveData(e.target.value)}
                                onBlur={(e) => auditDates(e.target.value, 'estimate_order_price')}
                                disabled
                            />
                        </div>
                        <div className={styles.paymentRow}>
                            <div className={styles.inputWrap}>
                                <label className={styles.formLabel}>Сума до сплати</label>
                                <input placeholder={'Сума до сплати'} id="postpaid_amount"
                                    className={`baseInput ${errors.postpaid_amount ? 'baseInputError' : ''}`}
                                    name="postpaid_amount"
                                    type="number"
                                    onChange={handlePostpaidAmountChange}
                                    value={values.postpaid_amount}
                                    onFocus={(e) => setSaveData(e.target.value)}
                                    onBlur={(e) => auditDates(e.target.value, 'postpaid_amount')}
                                    disabled
                                />
                            </div>
                            <PaymentMethod
                                paymentMethod={values.payment_method}
                                onChange={(value) => {
                                    setFieldValue('payment_method', value);
                                    auditDates(value, 'payment_method');
                                }}
                            />
                        </div>
                        {values.payment_method === 'CASH' && <div>
                            <BackwardDelivery
                                withBackwardDelivery={values.with_backward_delivery}
                                onChange={(value) => {
                                    if (value) {
                                        setRequiredNPValues(prevValues => ({ ...prevValues, backward_amount: values.backward_amount }));
                                        if (values.backward_amount) auditDates({ 'with_backward_delivery': true, backward_amount: values.backward_amount });
                                    } else {
                                        setRequiredNPValues(prevValues => {
                                            const { backward_amount: _, ...restValues } = prevValues;
                                            return restValues;
                                        });
                                        setErrors(prevErrors => {
                                            const { backward_amount: _, ...restErrors } = prevErrors;
                                            return restErrors;
                                        });
                                        auditDates(value, 'with_backward_delivery');
                                    }
                                    setFieldValue('with_backward_delivery', value);
                                }}
                            />
                        </div>}
                        {values.payment_method === 'CASH' && <div className={styles.inputWrap}>
                            <label className={styles.formLabel}>Сума зворотньої доставки</label>
                            <input
                                placeholder={'Сума зворотньої доставки'}
                                className={`baseInput ${errors.backward_amount ? 'baseInputError' : ''}`}
                                id="backward_amount"
                                name="backward_amount"
                                type="number"
                                onChange={handleChange}
                                value={values.backward_amount}
                                onFocus={(e) => setSaveData(e.target.value)}
                                onBlur={(e) => auditDates({ with_backward_delivery: true, backward_amount: e.target.value })}
                                disabled={!values.with_backward_delivery}
                            />
                        </div>}
                        <div className={styles.inputWrap}>
                            <label className={styles.formLabel}>Дата відправки</label>
                            <DateTimeField
                                date={values?.delivery_date}
                                name="delivery_date"
                                auditDates={(key, value) => {
                                    const date = new Date(value);
                                    const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                                    setFieldValue(key, formattedDate);
                                    auditDates(formattedDate, key);
                                }}
                                dateOnly
                                placeholder="відправки"
                            />
                        </div>
                        <div className={`${styles.closedInput} ${styles.inputWrap}`}>
                            <label className={styles.formLabel}>Орієнтовна вартість доставки</label>
                            <input
                                placeholder={'Орієнтовна Вартість Доставки'}
                                className={'baseInput'}
                                id="declared_delivery_price"
                                name="declared_delivery_price"
                                type="number"
                                value={values.declared_delivery_price}
                                readOnly
                            />
                        </div>
                        <div className={styles.inputWrap}>
                            <label className={styles.formLabel}>Номер ТТН</label>
                            <div className={styles.transportNumber}>
                                <input
                                    placeholder={'ТТН'}
                                    className={'baseInput'}
                                    id="ttn"
                                    name="ttn"
                                    type="number"
                                    value={values.ttn}
                                    readOnly
                                />
                                <CopyToClipboard text={values.ttn} className={`${styles.copyButton} click-effect`}>
                                    <button type='button' tabIndex={0}>
                                        <img src={copyIcon} alt="" />
                                    </button>
                                </CopyToClipboard>
                            </div>
                        </div>
                        <div className={styles.inputWrap}>
                            <label className={styles.formLabel}>Коментар до доставки</label>
                            <textarea
                                cols="30"
                                rows="10"
                                placeholder={'Коментар'}
                                id="comment"
                                name="comment"
                                onChange={handleChange}
                                style={{ fontSize: '1rem' }}
                                value={values.comment}
                                onFocus={(e) => setSaveData(e.target.value)}
                                onBlur={(e) => auditDates(e.target.value || null, 'comment')}
                            />
                        </div>
                        {(!values.ttn && !isAllRequiredValuesFilled && !!values.declared_order_price) && (
                            <p className={styles.caption}>{caption}</p>
                        )}
                        {(!values.ttn && !values.declared_order_price) && (
                            <p className={styles.caption}>{captionSum}</p>
                        )}
                        {(values.ttn && !isAllRequiredValuesFilled) && <p className={styles.caption}>{captionRefresh}</p>}
                        {(values.ttn && isAllRequiredValuesFilled && requiredNPValues && oldRequiredNPValues && areObjectsEqual(requiredNPValues, oldRequiredNPValues)) && <p className={styles.caption}>{captionRefresh2}</p>}
                        {serverError && (
                            <p className={styles.serverError}>ERROR: {serverError}</p>
                        )}
                        <div className={styles.action}>
                            {values.ttn ? (
                                <button
                                    className={'globalBtn'}
                                    type='submit'
                                    disabled={!isAllRequiredValuesFilled
                                        || isSubmitting
                                        || areObjectsEqual(requiredNPValues, oldRequiredNPValues) || !!serverError
                                    }
                                >
                                    <span>Оновити ТТН</span>
                                </button>
                            ) : (
                                <button className={'globalBtn'} type='submit' disabled={!isAllRequiredValuesFilled || isSubmitting  || !!serverError}>
                                    <span>Створити ТТН</span>
                                </button>
                            )}
                        </div>
                    </div>
                </form>
                <Parser
                    values={{
                        first_name: values.first_name,
                        last_name: values.last_name,
                        middle_name: values.middle_name,
                        phone: values.phone,
                        city: cityValue,
                    }}
                    setValues={handleSetValues}
                    updateData={auditDates}
                    parserStyles={{ backgroundColor: '#F0B5B7' }}
                    hintText={DELIVERY_PARSER_HINT}
                />

                {isDesktop && <ArrBack />}
            </div>
            <div className="globalBtnWrap">
                <button className="globalBtn button-xs" onClick={nextPage}>
                    <span>Далі</span>
                </button>
            </div>
        </div>
    )
}

export default DeliveryNP;