import React, { useState } from "react";
import styles from './DeliveryUKR.module.scss';
import { useFormik } from "formik";
import { useParams } from "react-router-dom";
import ArrBack from "../../Common/ArrBack/ArrBack";
import UkrPoshtaCities from "./UkrPoshtaCities/UkrPoshtaCities";
import UkrPoshtaRegion from "./UkrPoshtaRegion/UkrPoshtaRegion";
import UkrPoshtaArea from "./UkrPoshtaArea/UkrPoshtaArea";
import UkrPoshtaIndex from "./UkrPoshtaIndex/UkrPoshtaIndex";
import DeliveryIPay from "../DeliveryNP/DeliveryIPay/DeliveryIPay";
import { useNavigate } from "react-router";
import { CopyToClipboard } from "react-copy-to-clipboard";
import copyIcon from "../../../assets/icons/copy.svg";
import Parser from "../../Common/Parser/Parser";
import InputMask from "react-input-mask";
import { useIsDesktop } from "../../../hooks/useIsDesktop";
import { DELIVERY_PARSER_HINT } from "../../Common/Parser/parserHints";

const DeliveryUKR = () => {
    const { id } = useParams();
    const [city, setCity] = useState('');
    const [regionValue, setRegionValue] = useState('');
    const [areaValue, setAreaValue] = useState('');
    const [indexValue, setIndexValue] = useState('');
    const [isIPay, setIsIPay] = useState(false);
    const [cityValue, setCityValue] = useState('');

    // const formValues = {
    //     first_name: deliveryOrder?.receiver?.delivery_receiver?.first_name || '',
    //     last_name: deliveryOrder?.receiver?.delivery_receiver?.last_name || '',
    //     phone: deliveryOrder?.receiver?.delivery_receiver?.phone || '',
    //     declared_order_price: deliveryOrder?.delivery?.estimate_order_price || '',
    //     declared_delivery_price: deliveryOrder?.delivery?.estimate_delivery_price || '',
    //     ttn: deliveryOrder?.delivery?.ttn || '',
    //     comment: deliveryOrder?.delivery?.comment || '',
    // }
    const { isSubmitting, setSubmitting, handleSubmit, handleChange, values, setValues, setFieldValue } = useFormik({
        initialValues: {
            first_name: '',
            last_name: '',
            phone: '',
            street: '',
            house: '',
            apartment: '',
            declaredValueUKR: '',
            deliveryCostUKR: '',
            ttnUKR: '',
            commentUKR: '',
        },

        onSubmit: (values) => {
            const sanitizedValues = {
                ...values,
                phone: sanitizePhone(values.phone),
            };
            console.log(sanitizedValues);
        },
    });

    const handleValidChange = (key, value) => {
        if (/[^a-zа-яґєії+\-' ]+/ig.test(value) && value !== '') {
            return;
        }
        setFieldValue(key, value);
    }

    const sanitizePhone = (phone) => {
        return phone.replace(/[()-]/g, '');
    };

    const handleSetValues = (newValues) => {
        const { city, region, area, index, ...newFormValues } = newValues;
        setValues(prevValues => ({
            ...prevValues,
            ...newFormValues
        }));
        setCityValue(prevCity => city !== undefined ? city : prevCity);
        setRegionValue(prevRegion => region !== undefined ? region : prevRegion);
        setAreaValue(prevArea => area !== undefined ? area : prevArea);
        setIndexValue(prevIndex => index !== undefined ? index : prevIndex);
    }
    const isDesktop = useIsDesktop();
    const navigate = useNavigate();
    const nextPage = () => {
        if (id) {
            navigate(`/order_status/${id}`);
        }
    }

    return (
        <div className={`${styles.deliveryUKR} deliveryUKR`}>
            <div className={styles.deliveryUKRWrap}>
                <form onSubmit={handleSubmit}>
                    <div className={styles.deliveryUKR__content}>
                        <div className={styles.deliveryUKR__row}>
                            <div className={styles.inputWrap}>
                                <label className={styles.formLabel}><span>Ім`я</span>&nbsp;<span className={styles.desktop_visible}>Отримувача</span></label>
                                <div className="baseInputContainer">
                                    <span className="coloredLabel colored--first_name"></span>
                                    <input
                                        placeholder={'Ім`я'}
                                        className={'baseInput'}
                                        id="first_name"
                                        name="first_name"
                                        type="text"
                                        onChange={(e) => handleValidChange(e.target.name, e.target.value)}
                                        value={values.first_name}
                                    />
                                </div>
                            </div>
                            <div className={styles.inputWrap}>
                                <label className={styles.formLabel}><span>Прізвище</span>&nbsp;<span className={styles.desktop_visible}>Отримувача</span></label>
                                <div className="baseInputContainer">
                                    <span className="coloredLabel colored--last_name"></span>
                                    <input
                                        placeholder={'Прізвище'}
                                        className={'baseInput'}
                                        id="last_name"
                                        name="last_name"
                                        type="text"
                                        onChange={(e) => handleValidChange(e.target.name, e.target.value)}
                                        value={values.last_name}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className={styles.inputWrap}>
                            <label className={styles.formLabel}><span>Телефон</span>&nbsp;<span className={styles.desktop_visible}> Отримувача</span>   </label>
                            <div className="baseInputContainer">
                                <span className="coloredLabel colored--phone"></span>
                                <InputMask
                                    mask="+38 (099) 999-99-99"
                                    value={values.phone}
                                    onChange={handleChange}
                                    onBlur={() => setFieldValue('phone', sanitizePhone(values.phone))}
                                >
                                    {(inputProps) => (
                                        <input
                                            {...inputProps}
                                            placeholder={'Телефон'}
                                            className={'baseInput'}
                                            aria-label={"phone"}
                                            id="phone"
                                            name="phone"
                                        />
                                    )}
                                </InputMask>
                            </div>
                        </div>
                        <div className={styles.inputWrap}>
                            <label className={styles.formLabel}>Місто або населений пункт</label>
                            <UkrPoshtaCities city={city} setCity={setCity} />
                        </div>
                        <div className={styles.inputWrap}>
                            <label className={styles.formLabel}>Область або регіон</label>
                            <UkrPoshtaRegion region={regionValue} setRegion={setRegionValue} />
                        </div>
                        <div className={styles.inputWrap}>
                            <label className={styles.formLabel}>Район (опціонально)</label>
                            <UkrPoshtaArea area={areaValue} setArea={setAreaValue} />
                        </div>
                        <div className={styles.inputWrap}>
                            <label className={styles.formLabel}>Поштовий індекс</label>
                            <UkrPoshtaIndex index={indexValue} setIndex={setIndexValue} />
                        </div>




                        <div className={styles.inputWrap}>
                            <label className={styles.formLabel}>Вулиця</label>
                            <input
                                placeholder={'Вулиця'}
                                className={'baseInput'}
                                id="street"
                                name="street"
                                type="text"
                                onChange={handleChange}
                                value={values.street}
                            />
                        </div>
                        <div className={styles.deliveryUKR__row}>
                            <div className={styles.inputWrap}>
                                <label className={styles.formLabel}>Будинок</label>
                                <input
                                    placeholder={'Будинок'}
                                    className={'baseInput'}
                                    id="house"
                                    name="house"
                                    type="number"
                                    onChange={handleChange}
                                    value={values.house}
                                />
                            </div>
                            <div className={styles.inputWrap}>
                                <label className={styles.formLabel}>Квартира</label>
                                <input
                                    placeholder={'Квартира'}
                                    className={'baseInput'}
                                    id="apartment"
                                    name="apartment"
                                    type="number"
                                    onChange={handleChange}
                                    value={values.apartment}
                                />
                            </div>

                        </div>
                        <DeliveryIPay isIPay={isIPay} setIsIPay={setIsIPay} />
                        <div className={styles.inputWrap}>
                            <label className={styles.formLabel}>Оголошена вартість</label>
                            <input
                                placeholder={'Оголошена вартість'}
                                className={'baseInput'}
                                id="declaredValueUKR"
                                name="declaredValueUKR"
                                type="number"
                                onChange={handleChange}
                                value={values.declaredValueUKR}
                            />
                        </div>
                        <div className={`${styles.closedInput} ${styles.inputWrap}`}>
                            <label className={styles.formLabel}>Орієнтовна Вартість Доставки</label>
                            <input
                                placeholder={'Орієнтовна Вартість Доставки'}
                                className={'baseInput'}
                                id="deliveryCostUKR"
                                name="deliveryCostUKR"
                                type="number"
                                onChange={handleChange}
                                value={values.deliveryCostUKR}
                                readOnly
                            />
                        </div>
                        <div className={styles.inputWrap}>
                            <label className={styles.formLabel}>Номер ТТН</label>
                            <div className={styles.transportNumber}>
                                <input
                                    placeholder={'ТТН'}
                                    className={'baseInput'}
                                    id="ttnUKR"
                                    name="ttnUKR"
                                    type="number"
                                    value={values.ttnUKR}
                                    readOnly
                                />
                                <CopyToClipboard text={values.ttnUKR} className={`${styles.copyButton} click-effect`}>
                                    <button type='button' tabIndex={0}>
                                        <img src={copyIcon} alt="" />
                                    </button>
                                </CopyToClipboard>
                            </div>
                        </div>

                        <div className={styles.inputWrap}>
                            <label className={styles.formLabel}>Коментар</label>
                            <textarea
                                cols="30"
                                rows="10"
                                placeholder={'Коментар'}
                                id="commentUKR"
                                name="commentUKR"
                                onChange={handleChange}
                                value={values.commentUKR}
                            />
                        </div>
                        <div className={styles.action}>
                            <button className={'globalBtn'} type='submit' disabled={isSubmitting}>
                                <span>Створити ТТН</span>
                            </button>
                        </div>
                    </div>
                </form>
                <Parser
                    values={{
                        first_name: values.first_name,
                        last_name: values.last_name,
                        phone: values.phone,
                        city: cityValue,
                        region: regionValue,
                        area: areaValue,
                        index: indexValue,
                    }}
                    setValues={handleSetValues}
                    parserStyles={{ backgroundColor: '#EDD593' }}
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

export default DeliveryUKR;