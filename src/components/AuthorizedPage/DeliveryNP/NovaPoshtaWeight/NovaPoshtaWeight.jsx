import React, {useEffect, useRef, useState} from "react";
import styles from './NovaPoshtaWeight.module.scss'
import {setIsActivePopup} from "../../../../store/main-slice";
import {useAppDispatch} from "../../../../hooks/redux";
import GlobalPopup from "../../../Common/GlobalPopup/GlobalPopup";
import GlobalCalculator from "../../../Common/GlobalCalculator/GlobalCalculator";
import {useIsDesktop} from "../../../../hooks/useIsDesktop";

const NovaPoshtaWeight = ({weight, setWeight, auditDates, error, hasDepartment}) => {
    const dispatch = useAppDispatch();
    const [showPopup, setShowPopup] = useState(false);
    const [kg, setKg] = useState('');
    const [g, setG] = useState('');
    const [currentFocus, setCurrentFocus] = useState('kg');
    const [lastEditedInput, setLastEditedInput] = useState('');
    const kgInputRef = useRef(null);
    const gInputRef = useRef(null);

    const isDesktop = useIsDesktop();

    useEffect(() => {
        if (weight) {
            setKg(String(Math.floor(weight)));
            setG(String(Math.round((weight - Math.floor(weight)) * 100)));
        }
    }, [weight])

    const onShowWeight = () => {
        dispatch(setIsActivePopup(true));
        setShowPopup(true);
    }

    const onSetWeight = () => {
        if (kg !== '' || g !== '') {
            setWeight(parseFloat(`${kg}.${g}`));
            auditDates(`${kg}.${g}`, 'specified_weight');
            setShowPopup(false);
        }
    }

    const handleKgChange = (e) => {
        let value = e.target.textContent;
        let potentialNewValue = kg + value;
        if (kg === '0') {
            potentialNewValue = value;
        }
        if (potentialNewValue.length <= 3 && /^\d{1,3}$/.test(potentialNewValue)) {
            let numericValue = parseInt(potentialNewValue, 10);
            if (numericValue <= 999) {
                setKg(potentialNewValue);
                setLastEditedInput('kg');
                if (potentialNewValue.length === 3 || numericValue === 0) {
                    gInputRef.current.focus();
                }
            }
        }
    }

    const handleKgDelete = () => {
        let newValue = kg.slice(0, kg.length - 1);
        setKg(newValue);
    }

    const handleGChange = (e) => {
        let value = e.target.textContent;
        let potentialNewValue = g + value;
        if (potentialNewValue.length <= 2 && /^\d{1,2}$/.test(potentialNewValue)) {
            let numericValue = parseInt(potentialNewValue, 10);
            if (numericValue <= 99) {
                setG(potentialNewValue);
                setLastEditedInput('g');
            }
        }
    }

    const handleGDelete = () => {
        let newValue = g.slice(0, g.length - 1);
        setG(newValue);
    }

    const handleChange = (e) => {
        if ((currentFocus === 'kg' && kg.length !== 3) || (!currentFocus && kg.length !== 3)) {
            handleKgChange(e)
        } else  if (currentFocus === 'g' || (!currentFocus && kg.length === 3) || (currentFocus === 'kg' && kg.length === 3)) {
            handleGChange(e);
        }
    }

    const handleDelete = () => {
        if (currentFocus === 'kg' || (currentFocus === 'g' && g.length === 0)) {
            handleKgDelete();
            kgInputRef.current.focus();
        } else  if (currentFocus === 'g' && g.length !== 0) {
            handleGDelete();
        } else if (!currentFocus) {
            if (lastEditedInput === 'kg') {
                handleKgDelete();
            } else if (lastEditedInput === 'g' && g.length !== 0) {
                handleGDelete();
            } else if (lastEditedInput === 'g' && g.length === 0) {
                handleKgDelete();
            }
        }
    }

    const getFontSize = (value) => {
        return value.length === 3 ? '60px' : '75px';
    }

    return (
        <>
            <div className={styles.weight}>
                <button type='button' className={`${error ? 'baseInputError' : ''}`} onClick={() => onShowWeight()}>
                    {!kg && !g ? <span className={styles.weightText}>Об'ємна вага, кг</span> : <span className={styles.weightText}>{!kg?'0': kg}.{!g?'00':g}</span>}
                </button>
            </div>
            {error && (
                <p className={styles.errorText}>
                    {(Array.isArray(error) ? error[0] : error) === 'This field may not be blank.'
                        ? 'Вкажіть вагу'
                        : !hasDepartment
                            ? 'Для збереження і перевірки ваги спочатку введіть номер відділення!'
                            : 'Вкажіть вагу, яка не перевищує максимальну вагу відділення'
                    }
                </p>
            )}
            {showPopup && (
                <GlobalPopup title={'Об\'ємна вага, кг'} onClose={() => setShowPopup(false)}  {...(isDesktop ? { centeredPopup: true } : {})}>
                    <GlobalCalculator handleChange={handleChange} handleDelete={handleDelete} onSubmit={() => onSetWeight()}>
                        <div className={styles.weightInputWrap}>
                            <input
                                value={kg}
                                className={`baseInput ${currentFocus === 'kg' ? styles.focus : ''}`}
                                type="text"
                                readOnly
                                onFocus={() => setCurrentFocus('kg')}
                                ref={kgInputRef}
                                style={{fontSize: getFontSize(kg)}}
                                placeholder="0"
                            />
                            <span style={{fontSize: getFontSize(kg)}}>.</span>
                            <input
                                value={g}
                                className={`baseInput ${currentFocus === 'g' ? styles.focus : ''}`}
                                type="text"
                                readOnly
                                onFocus={() => setCurrentFocus('g')}
                                ref={gInputRef}
                                style={{fontSize: getFontSize(kg)}}
                                placeholder="00"
                            />
                        </div>
                    </GlobalCalculator>
                </GlobalPopup>
            )}
        </>
    )
}

export default NovaPoshtaWeight;