import React from "react";
import styles from './ClientInfo.module.scss'
import OrderInfoBlock from "../../../Common/OrderInfoBlock/OrderInfoBlock";
import { t } from '../../../../i18n';

const ClientInfo = ({clientInfo}) => {
    return (
        <div className={styles.info}>
           <OrderInfoBlock url={clientInfo.url} departmentNumber={clientInfo.department_number} ttn={clientInfo.ttn}/>
            <div className={styles.info__customer}>
                {clientInfo?.first_name && (
                    <p><span>{t('Ім\'я:')} </span>{clientInfo.first_name}</p>
                )}
                {clientInfo?.last_name && (
                    <p><span>{t('Прізвище:')} </span>{clientInfo.last_name}</p>
                )}
                {clientInfo?.middle_name && (
                    <p><span>{t('По батькові:')} </span>{clientInfo.middle_name}</p>
                )}
                {clientInfo?.phone && (
                    <p><span>{t('Телефон замовника:')} </span>{clientInfo.phone}</p>
                )}
                {clientInfo?.city && (
                    <p><span>{t('Місто:')} </span>{clientInfo.city}</p>
                )}
            </div>
        </div>
    )
}

export default ClientInfo;