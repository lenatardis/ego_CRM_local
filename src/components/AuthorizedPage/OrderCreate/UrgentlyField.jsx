import React from "react";
import styles from './Order.module.scss';


const UrgentlyField = ({setIsUrgently, isUrgently, auditDates, isDisabled}) => {

    const onChangeUrgently = (value) => {
        auditDates(value, 'is_immediate', 'order');
        setIsUrgently(value);
    }

    return (
        <div className={`${styles.urgentlyField} ${isDisabled ? styles.disabled : ''}`}>
            <label className={styles.customCheckbox}>
                <input
                    name={'urgentlyField'}
                    type={'checkbox'}
                    checked={isUrgently}
                    onChange={() => onChangeUrgently(!isUrgently)}
                    disabled={isDisabled}
                />
                <span className={styles.checkbox}/>
                <span>Терміново</span>
            </label>
        </div>
    )
}

export default UrgentlyField;