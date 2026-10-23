import React, {useEffect, useState} from "react";
import styles from './Contacts.module.scss';
import logo from "../../../assets/img/logoEgo.svg";
import ContactsContent from "./ContactsContent/ContactsContent";
import ContactsAbout from "./ContactsAbout";
import Preloader from "../../Common/Preloader/Preloader";
import { getCompanyInfo } from "../../../api/generalApi";

const Contacts = () => {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (data === null) {
            getCompanyInfo().then((res) => {
                if (res && res[0].id) {
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
        <div className={styles.contacts}>
            <div className={styles.contacts__logo}>
                <img src={logo} alt=""/>
            </div>
            <h2>Контакти</h2>
            {data && (
                <ContactsContent phone={data.phone} email={data.email} site={data.site}/>
            )}
            <ContactsAbout/>
        </div>
    )
}

export default Contacts;