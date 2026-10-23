import React from "react";
import styles from './PopupCheckboxes.module.scss';
import Preloader from "../Preloader/Preloader";

const PopupCheckboxes = ({values, setValues, chooseList, isRadio = false, isLoading = false, statusCaption}) => {
    const handleChange = (value) => {
        if (values.length) {
            const isItemValue = values.find((item) => item.value === value.value);
            if (isItemValue) {
                const newArray = values.filter((item) => item.value !== value.value);
                setValues([...newArray]);
            } else {
                setValues([...values, value])
            }
        } else {
            const newArray = [value];
            setValues(newArray)
        }
    }

    const setItem = (value) => {
        setValues(value);
    }

    return (
        <div className={styles.popupCheckboxes}>
            {chooseList && (
                chooseList.map((item, index) => (
                    <div className={styles.wrap} key={index}>
                    <div key={index} className={`${styles.customCheckbox} ${item?.disabled || isLoading ? styles.disabled : ''}`}>
                        <input name={isRadio ? 'radioField' : null} type={isRadio ? 'radio' : 'checkbox'}
                               onChange={() => isRadio ? setItem(item) : handleChange(item)}
                               disabled={!!item?.disabled || item.price === 0}
                               checked={isRadio ? values === item.value || values === item.title : values?.some((element) => element.value === item.value)} />
                        <span/>
                        <p>{item.title}</p>
                        {item.price && (<>({item.price} грн)</>)}

                        {item.price === 0 && (
                            <p className={styles.notCheck}>Ви не можете вибрати опцію без ціни, бо вона не вказана в списку цін</p>
                        )}
                    </div>
                        {statusCaption && ( item?.value === 'PAY_WAIT' && item?.disabled) && <div className={styles.caption}>{statusCaption}</div>}
                    </div>
                ))
            )}
            {isLoading && <Preloader />}
        </div>
    )
}

export default PopupCheckboxes;