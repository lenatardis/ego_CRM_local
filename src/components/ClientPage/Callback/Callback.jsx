import React, {useEffect, useState} from "react";
import styles from './Callback.module.scss';
import logo from "../../../assets/img/logoEgo.svg";
import CallbackForm from "./CallbackForm/CallbackForm";
import CallbackWorkTime from "./CallbackWorkTime";
import Preloader from "../../Common/Preloader/Preloader";
import { getWorkSchedule } from "../../../api/generalApi"

const Callback = () => {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (data === null) {
            getWorkSchedule().then((res) => {
                if (res && res[0].weekend) {
                    setData(res[0]);
                }
            }).finally(() => {
                setIsLoading(false);
            })
        }
    }, [])

    if (isLoading) {
        return <Preloader />;
    }

    return (
        <div className={styles.callback}>
            <div className={styles.callback__logo}>
                <img src={logo} alt=""/>
            </div>
            <h2>Замовити дзвінок</h2>
            <CallbackForm/>
            <h2>Години роботи менеджерів</h2>
            {data && (
                <CallbackWorkTime workingDay={data.working_day} workingStartTime={data.working_hours_start}
                                workingEndTime={data.working_hours_end} weekend={data.weekend}/>
            )}

            {/* <p className={styles.callback__text}></p> */}
        </div>
    )
}

export default Callback;