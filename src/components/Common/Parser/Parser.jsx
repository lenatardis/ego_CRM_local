import React, { useEffect, useRef, useState } from "react";
import parserData from './parserData.json';

import styles from './Parser.module.scss';
import closeCross from '../../../assets/icons/closeCross.svg';
import arrowDown from '../../../assets/icons/arrowDown.svg';
import plusIcon from '../../../assets/icons/plus.svg';
import paste from '../../../assets/icons/pasteIcon.svg';
import editIcon from '../../../assets/icons/editIcon.svg';
import applyIcon from '../../../assets/icons/statusBrown.svg';
import { getAccessToken } from "../../../utils/authTokens";
import { getCities } from "../../../api/novaPoshtaApi";
import { useIsDesktop } from "../../../hooks/useIsDesktop";
import InfoHint from "../ProductItem/InfoHint/InfoHint";

// const smoothScrollToBottom = (duration = 150) => {
//     const start = window.scrollY;
//     const end = document.documentElement.scrollHeight - window.innerHeight - 1;
//     const distance = end - start;
//     const step = distance / (duration / 16);

//     const scroll = () => {
//         window.scrollBy(0, step);
//         if (window.scrollY < end) {
//             requestAnimationFrame(scroll);
//         }
//     };

//     scroll();
// };

const Parser = ({ values, setValues, updateData = () => {}, parserStyles = {}, hintText = "" }) => {
    const clientTextRef = useRef('');
    const [textareaValue, setTextareaValue] = useState('');
    const [isParsed, setIsParsed] = useState(false);
    const [isEdit, setIsEdit] = useState(true);
    const [isAddValue, setIsAddValue] = useState(false);
    const [newValue, setNewValue] = useState({});
    const isDesktop = useIsDesktop();
    const [isParserOpen, setIsParserOpen] = useState(() => isDesktop);

    const initialValues = {
        ...(values?.first_name !== undefined && { first_name: { value: values.first_name, label: 'Ім\'я' } }),
        ...(values?.last_name !== undefined && { last_name: { value: values.last_name, label: 'Прізвище' } }),
        ...(values?.middle_name !== undefined && { middle_name: { value: values.middle_name, label: 'По батькові' } }),
        ...(values?.phone !== undefined && { phone: { value: values.phone, label: 'Телефон' } }),
        ...(values?.city !== undefined && { city: { value: values.city, label: 'Місто' } }),
        ...(values?.region !== undefined && { region: { value: values.region, label: 'Область' } }),
        ...(values?.area !== undefined && { area: { value: values.area, label: 'Район' } }),
        ...(values?.index !== undefined && { index: { value: values.index, label: 'Індекс' } })
    };

    useEffect(() => {
        setIsParserOpen(isDesktop);
    }, [isDesktop]);

    const parseFullName = () => {
        const middleNameRe = /[а-яґєії]+(ович|івна|ївна|ич|іч)/i;
        const validSymbolsRe = /[^а-яґєії'\- ]/gi;
        const client = {};
        const textArr = clientTextRef.current.trim().split(/[,\s\n]+/);
        for (let i = 0; i < textArr.length; i++) {
            const word = textArr[i].toLowerCase().replace(validSymbolsRe, '');
            if (parserData?.firstNames && (word in parserData.firstNames)) {
                client.first_name = { value: parserData.firstNames[word], label: 'Ім\'я' };
                if (i > 0) {
                    let lastName = textArr[i - 1].replace(validSymbolsRe, '');
                    lastName = lastName.charAt(0).toUpperCase() + lastName.slice(1);
                    client.last_name = { value: lastName, label: 'Прізвище' };
                }
            }
        }
        if ('middle_name' in initialValues) {
            const matchedMiddleName = clientTextRef.current.replace(validSymbolsRe, '').match(middleNameRe);
            let middleName = matchedMiddleName && matchedMiddleName[0] ? matchedMiddleName[0] : '';
            middleName = middleName.charAt(0).toUpperCase() + middleName.slice(1).toLowerCase();
            client.middle_name = { value: middleName, label: 'По батькові' };
        }
        return client;
    };

    const parsePhone = () => {
        const phoneRe = /(?:\+?38)?(0\d{2}\d{7})/;
        const parsedPhone = clientTextRef.current.replace(/[-\s\n()]/g, "").match(phoneRe);
        return parsedPhone?.length && parsedPhone[1]
            ? { value: '+38' + parsedPhone[1], label: 'Телефон' }
            : { value: '', label: 'Телефон' };
    };

    const parseCity = async (text) => {
        const validText = text.replace(/[^а-яґєії'\-.\s\n]/gi, '');
        const cityRe = /(?:місто |м\. ?|м\.)([а-яґєії]+)/i;

        const accessToken = getAccessToken();
        if (!accessToken) throw new Error('Access token is missing.');

        const villageCandidates = [...validText.matchAll(/(?:село|с\.)\s*([а-яґєіїёєґ']{3,})/gi)]
            .map(match => match[1]?.trim())
            .filter(Boolean);

        for (const village of villageCandidates) {
            try {
                const res = await getCities(accessToken, village);
                const cities = res?.cities;

                if (!Array.isArray(cities)) continue;

                const found = cities.find(c => c.city.toLowerCase() === village.toLowerCase());

                if (found) {
                    updateData({
                        city: found.city,
                        city_ref: found.city_ref,
                        address: null,
                        address_ref: null,
                        max_weight_allowed: null,
                        warehouse_number: null,
                    });
                    return { value: found.city, label: 'Місто' };
                }
            } catch (e) {
                console.error(`API помилка для села ${village}:`, e);
            }
        }

        let words = [];
        const matchedCity = validText.match(cityRe);
        if (matchedCity?.[1]) words.push(matchedCity[1]);

        const cuttedText = validText
            .replace(/,/g, "")
            .replace(/(\s{2,}|\n)/g, " ")
            .trim();

        const sanitizedWords = cuttedText.split(" ").filter(word => {
            const lower = word.toLowerCase();
            return ![
                'область', 'обл', 'телефон', 'тел', 'відділення', 'нова', 'пошта',
                'нп', 'вулиця', 'вул', 'поштомат', 'район', 'р-н', 'рн'
            ].includes(lower) && word.length > 2;
        });

        words.push(...sanitizedWords);
        const uniqueWords = [...new Set(words.map(w => w.trim()).filter(w => w.length > 2))];

        const requestLimit = 10;
        let requestCount = 0;

        for (const word of uniqueWords) {
            const query = word.toLowerCase();
            const res = await getCities(accessToken, query);
            const cities = res?.cities;
            requestCount++;

            if (!Array.isArray(cities)) continue;

            const found = cities.find(c => c.city.toLowerCase() === query);

            if (found) {
                updateData({
                    city: found.city,
                    city_ref: found.city_ref,
                    address: null,
                    address_ref: null,
                    max_weight_allowed: null,
                    warehouse_number: null,
                });
                return { value: found.city, label: 'Місто' };
            }

            if (requestCount >= requestLimit) break;
        }
        return null;
    };

    const parseAddress = () => {
        const regionRe = /[а-яґєії]+ька/i;
        const areaRe = /[а-яґєії]+ький/i;
        const postalCodeRe = /\b\d{5}\b/;
        const validSymbolsRe = /[^а-яґєії0-9'\- \n]/gi;
        const address = {};
        const addressFields = [
            { key: 'region', name: 'Область', regex: regionRe },
            { key: 'area', name: 'Район', regex: areaRe },
            { key: 'index', name: 'Індекс', regex: postalCodeRe }
        ];
        const clientText = clientTextRef.current.replace(validSymbolsRe, '');
        addressFields.forEach(({ key, name, regex }) => {
            if (key in initialValues) {
                const match = clientText.match(regex);
                address[key] = match && match[0] ? { value: match[0], label: name } : { value: '', label: name };
            }
        });
        return address;
    };

    const parseClientText = async () => {
        if (!clientTextRef.current || !parserData) return;

        const { city: _, ...parsedValues } = initialValues;

        const fullName = parseFullName();
        const address = parseAddress();
        Object.assign(parsedValues, fullName);
        Object.assign(parsedValues, address);
        parsedValues.phone = parsePhone();

        const cuttedText = clientTextRef.current
            .replace(parsedValues.first_name?.value, "")
            .replace(parsedValues.last_name?.value, "")
            .replace(parsedValues.middle_name?.value, "");

        const cityParsed = await parseCity(cuttedText);
        if (cityParsed) {
            parsedValues.city = cityParsed;
        }

        const valuesToUpdate = Object.keys(parsedValues).reduce((acc, key) => {
            acc[key] = parsedValues[key].value;
            return acc;
        }, {});

        setValues(valuesToUpdate);
        updateData(valuesToUpdate);
        setIsParsed(true);
        setIsEdit(false);
    };

    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            setIsParsed(false);
            clientTextRef.current = text;
            setTextareaValue(text);
            parseClientText();
        } catch (err) {
            console.error('Failed to read clipboard: ', err);
        }
    };

    const onTextareaChange = (e) => {
        setTextareaValue(e.target.value);
        clientTextRef.current = e.target.value;

        if (!e.target.value) {
            setIsParsed(false);
            return;
        }

        if (isParsed) return;

        parseClientText(e.target.value);
    };

    const handleApplyEdit = () => {
        if (!clientTextRef.current) return;
        setIsEdit(false);
        parseClientText(clientTextRef.current);
    };

    const handleAddWord = (e) => {
        const { value, checked, name } = e.target;
        const updatedNewValue = { ...newValue };
        const valueKey = Object.keys(updatedNewValue)[0];

        if (checked) {
            updatedNewValue[valueKey].push({ id: name, value });
        } else {
            const idx = updatedNewValue[valueKey].findIndex(el => el.id === name);
            updatedNewValue[valueKey].splice(idx, 1);
        }

        setNewValue(updatedNewValue);
    };

    const handleAddValue = (key) => {
        if (isEdit) return;

        if (!isAddValue) {
            setNewValue({ [key]: [] });
            setIsAddValue(true);
        } else {
            const key = Object.keys(newValue)[0];
            if (newValue[key].length) {
                newValue[key].sort((a, b) => Number(a.id) - Number(b.id));
                let value = newValue[key].map(el => el.value).join(" ");
                const validSymbolsRe = /[^а-яґєії'\- ]/gi;
                switch (key) {
                    case 'first_name':
                    case 'last_name':
                    case 'middle_name':
                    case 'city':
                    case 'region':
                    case 'area':
                        value = value.replace(validSymbolsRe, "");
                        break;
                    case 'index':
                        value = value.replace(/[^0-9]/g, "");
                        break;
                    case 'phone':
                        value = value.replace(/[-\s()]/g, "");
                        const idx = value.indexOf('0');
                        if (idx !== -1) {
                            value = '+38' + value.slice(idx);
                        }
                        break;
                    default:
                        break;
                }
                if (key === 'city') {
                    parseCity(value);
                } else {
                    updateData(value, key);
                }
                setValues({ [key]: value });
            }
            setIsAddValue(false);
            setNewValue({});
        }
    };

    const handleRemoveValue = (key) => {
        setValues({ [key]: "" });
        updateData(null, key);
    };

    return (
        <div className={`${styles.parser} ${!isParserOpen ? styles.closeParser : ''}`} style={parserStyles}>
            <div className={styles.parserHead} onClick={() => setIsParserOpen(prev => !prev)}>
                <div className={styles.parserHeadLeft}>
                    <h3>Парсер</h3>
                    {!!hintText && (
                        <span onClick={(e) => e.stopPropagation()}>
                            <InfoHint text={hintText} ariaLabel="Підказка по парсеру" />
                        </span>
                    )}
                </div>
                <img src={arrowDown} className={styles.arrowImg} alt="Arrow down" />
            </div>

            {isParserOpen && (
                <div className={`${styles.parserBody} ${isParserOpen ? styles.parserOpen : ""}`}>
                    <div className={styles.parsedValues}>
                        {Object.entries(initialValues).map(([key, item]) => (
                            item.value ? (
                                <div
                                    key={key}
                                    className={`${styles.parsedValue} ${styles.label} colored--${key}`}
                                >
                                    <span>{item.value}</span>
                                    <button
                                        className={styles.crossSign}
                                        onClick={() => handleRemoveValue(key)}
                                    >
                                        <img src={closeCross} alt="Close cross" />
                                    </button>
                                </div>
                            ) : (
                                <div
                                    key={key}
                                    className={`${styles.parsedValue} ${isEdit || (isAddValue && !newValue[Object.keys(newValue)[0]].length) ? styles.disabled : ""} ${styles.label} colored--${key}`}
                                    onClick={() => handleAddValue(key)}
                                >
                                    <span>{item.label}</span>
                                    <span className={styles.plusSign}><img src={plusIcon} alt="Plus sign" /></span>
                                </div>
                            )
                        ))}
                    </div>
                    <div className={styles.textarea}>
                        {!clientTextRef.current || isEdit ? (
                            <>
                                <textarea
                                    name="clientOrderText"
                                    id="clientOrderText"
                                    onChange={onTextareaChange}
                                    value={textareaValue}
                                />
                                <button className={styles.pasteEditBtn} onClick={handlePaste}>
                                    <img src={paste} alt="" />
                                </button>
                                <button className={styles.applyBtn} onClick={handleApplyEdit}>
                                    <img src={applyIcon} alt="" />
                                </button>
                            </>
                        ) : (
                            <>
                                <div className={styles.wordButtons}>
                                    {clientTextRef.current.trim().split(/[,\s\n]+/).map((word, idx) => (
                                        <label
                                            key={idx}
                                            className={`${styles.wordButton} ${isAddValue ? styles.label : ""}`}
                                        >
                                            {word}
                                            <input
                                                type="checkbox"
                                                name={idx}
                                                value={word}
                                                checked={!!newValue[Object.keys(newValue)[0]]?.find(el => el.id === String(idx))}
                                                onChange={handleAddWord}
                                                disabled={!isAddValue}
                                            />
                                        </label>
                                    ))}
                                </div>
                                <button className={styles.pasteEditBtn} onClick={() => setIsEdit(true)}>
                                    <img src={editIcon} alt="" />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Parser;