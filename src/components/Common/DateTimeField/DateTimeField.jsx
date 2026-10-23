import React, {useRef, useState} from "react";
import styles from './DateTimeField.module.scss';
import './DateTimeField.scss'
import arrow from '../../../assets/icons/arrowDownGray.svg';
import {setIsActivePopup} from "../../../store/main-slice";
import {useAppDispatch} from "../../../hooks/redux";
import GlobalPopup from "../GlobalPopup/GlobalPopup";
import {DemoContainer, DemoItem} from '@mui/x-date-pickers/internals/demo';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import {StaticDatePicker} from '@mui/x-date-pickers/StaticDatePicker';
import GlobalCalculator from "../GlobalCalculator/GlobalCalculator";
import dayjs from 'dayjs';
import "dayjs/locale/uk";
import { getFormattedDate } from "../../../utils/getFormattedDate";
import {useIsDesktop} from "../../../hooks/useIsDesktop";

dayjs.locale('uk');

const DateTimeField = ({date, placeholder = 'оплати', auditDates, name = 'prepayment_datetime', isDisabled, dateOnly = false}) => {
    const [popup, setPopup] = useState(null);
    const [hours, setHours] = useState(date ? new Date(date).getHours().toString() : '');
    const [minutes, setMinutes] = useState(date ? new Date(date).getMinutes().toString() : '');
    const dispatch = useAppDispatch();

    const [currentFocus, setCurrentFocus] = useState('hours');
    const [lastEditedInput, setLastEditedInput] = useState('');
    const hoursInputRef = useRef(null);
    const minutesInputRef = useRef(null);

    const isDesktop = useIsDesktop();

    const onShowPopup = (value) => {
        setPopup(value);
        setTimeout(() => {
            dispatch(setIsActivePopup(true))
        }, 30)
    }

    const totalDate = () => {
        let newHours = hours.padStart(2, '0');
        let newMinutes = minutes.padStart(2, '0');
        const newDate = date ? new Date(date) : new Date();
        newDate.setHours(newHours, newMinutes);
        auditDates(name, newDate);
        setPopup(null);
        setCurrentFocus('hours');
        dispatch(setIsActivePopup(false));
    }

    const onSelectDate = (value) => {
        const newDate = new Date();
        newDate.setFullYear(value.$y, value.$M, value.$D);
        newDate.setHours(0, 0, 0, 0);
        auditDates(name, newDate);
    }

    const handleHoursChange = (value) => {
        const potentialNewValue = Number(hours + value).toString();
        const numericValue = parseInt(potentialNewValue);
        if (numericValue <= 23) {
            setHours(potentialNewValue);
            setLastEditedInput('hours');
            if (potentialNewValue.length === 2) {
                minutesInputRef.current.focus();
            }
        }
    }

    const handleHoursDelete = () => {
        let newValue = hours.slice(0, hours.length - 1);
        setHours(newValue);
    }

    const handleMinutesChange = (value) => {
        let potentialNewValue = Number(minutes + value).toString();
        let numericValue = parseInt(potentialNewValue, 10);
        if (numericValue <= 59) {
            setMinutes(potentialNewValue);
            setLastEditedInput('minutes');
        }
    }

    const handleMinutesDelete = () => {
        let newValue = minutes.slice(0, minutes.length - 1);
        setMinutes(newValue);
    }

    const handleChange = (e) => {
        if (currentFocus === 'hours' && hours.length !== 2) {
            handleHoursChange(e.target.textContent)
        } else  if (currentFocus === 'minutes' && minutes.length !== 2) {
            handleMinutesChange(e.target.textContent);
        }
    }

    const handleDelete = () => {
        if (currentFocus === 'hours' || (currentFocus === 'minutes' && minutes.length === 0)) {
            handleHoursDelete();
            hoursInputRef.current.focus();
        } else  if (currentFocus === 'minutes' && minutes.length !== 0) {
            handleMinutesDelete();
        } else if (!currentFocus) {
            if (lastEditedInput === 'hours') {
                handleHoursDelete();
            } else if (lastEditedInput === 'minutes' && minutes.length !== 0) {
                handleMinutesDelete();
            } else if (lastEditedInput === 'minutes' && minutes.length === 0) {
                handleHoursDelete();
            }
        }
    }

    const handleClosePopup = () => {
        setPopup(null);
        setCurrentFocus('hours');
    }

    return (
        <>
            <div className={styles.dateTimeField}>
                <button type='button' onClick={() => onShowPopup('date')} disabled={isDisabled}>
                    <span>{getFormattedDate(date) || `Дата ${placeholder}`}</span>
                    <img src={arrow} alt=""/>
                </button>
                {!dateOnly && (
                    <button type='button' onClick={() => onShowPopup('time')} disabled={isDisabled}>
                        <span>{(!hours ) && (!minutes) ? `Час ${placeholder}` : `${String(hours).padStart(2, '0')} : ${String(minutes).padStart(2, '0')}`}</span>
                        <img src={arrow} alt=""/>
                    </button>
                )}
            </div>
            {popup === 'date' && (
                <GlobalPopup title={'Дата відправки'} onClose={handleClosePopup} {...(isDesktop ? { centeredPopup: true } : {})}>
                    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="uk">
                        <DemoContainer
                            components={[
                                'StaticDatePicker',
                            ]}
                        >
                            <DemoItem>
                                <StaticDatePicker
                                    onChange={(newValue) => onSelectDate(newValue)}
                                    shouldDisableDate={(date) => dayjs(date).isBefore(dayjs(), 'day')}
                                />
                            </DemoItem>
                        </DemoContainer>
                    </LocalizationProvider>
                </GlobalPopup>
            )}
            {popup === 'time' && (
                <GlobalPopup title={'Час оплати'} onClose={handleClosePopup} {...(isDesktop ? { centeredPopup: true } : {})}>
                    <GlobalCalculator handleChange={handleChange} handleDelete={handleDelete} onSubmit={() => totalDate()}>
                        <div className={styles.timeInputWrap}>
                            <input
                                value={hours.padStart(2, '0')}
                                className={`baseInput ${currentFocus === 'hours' ? styles.focus : ''}`}
                                readOnly
                                onFocus={() => setCurrentFocus('hours')}
                                ref={hoursInputRef}
                            />
                            <span>:</span>
                            <input
                                value={minutes.padStart(2, '0')}
                                className={`baseInput ${currentFocus === 'minutes' ? styles.focus : ''}`}
                                readOnly
                                onFocus={() => setCurrentFocus('minutes')}
                                ref={minutesInputRef}
                            />
                        </div>
                    </GlobalCalculator>
                </GlobalPopup>
            )}
        </>
    )
}

export default DateTimeField;