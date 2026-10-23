import React from "react";
import styles from './GlobalCalculator.module.scss';
import IconDelete from "../../../assets/icons/delete.svg";
import IconConfirm from "../../../assets/icons/checkmark.svg";
import {setIsActivePopup} from "../../../store/main-slice";
import {useAppDispatch} from "../../../hooks/redux";

const GlobalCalculator = ({children, handleChange, handleDelete, onSubmit = null}) => {
    const dispatch = useAppDispatch();

    const submit = () => {
        dispatch(setIsActivePopup(false));
        if (onSubmit) {
            onSubmit();
        }
    }

    return (
        <div className={styles.pinForm}>
            <div className={styles.form}>
                {children}
            </div>
            <div className={styles.grid}>
                <button type={'button'} onClick={handleChange}>7</button>
                <button type={'button'} onClick={handleChange}>8</button>
                <button type={'button'} onClick={handleChange}>9</button>
                <button type={'button'} onClick={handleChange}>4</button>
                <button type={'button'} onClick={handleChange}>5</button>
                <button type={'button'} onClick={handleChange}>6</button>
                <button type={'button'} onClick={handleChange}>1</button>
                <button type={'button'} onClick={handleChange}>2</button>
                <button type={'button'} onClick={handleChange}>3</button>
                <button type={'button'} onClick={handleChange}>0</button>
                <button type={'button'} className={styles.deleteBtn} onClick={handleDelete}><img src={IconDelete} alt=""/></button>
                <button type={'button'} className={styles.confirmBtn} onClick={() => submit()}><img src={IconConfirm} alt=""/></button>
            </div>
        </div>
    )
}

export default GlobalCalculator;