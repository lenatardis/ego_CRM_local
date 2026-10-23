import React from "react";
import styles from './Callback.module.scss';

const CallbackWorkTime = ({workingDay, workingStartTime, workingEndTime, weekend}) => {
    return (
        <div className={styles.workTime}>
            <div className={styles.workTime__left}>
                <span>{workingDay}</span>
                <p>{workingStartTime}-{workingEndTime}</p>
            </div>
            <div className={styles.workTime__right}>
                <span>{weekend}</span>
                <p>Вихідний</p>
            </div>
        </div>
    )
}

export default CallbackWorkTime;