import React from "react";
import styles from './SearchInput.module.scss';
import IconSearch from "../../../../../assets/icons/search.svg";


const SearchInput = ({order}) => {
    const invoiceNumber = order?.nova_poshta_delivery?.delivery?.ttn ? `ТТН ${order.nova_poshta_delivery.delivery.ttn}` : order?.ukr_poshta_delivery?.delivery?.ttn ? `ТТН ${order.ukr_poshta_delivery.delivery.ttn}` : `TTH`

    const invoiceNumberRedirect = () => {
        if (order?.nova_poshta_delivery?.delivery?.ttn) {
            const ttn = order.nova_poshta_delivery.delivery.ttn;
            window.open(`https://novaposhta.ua/tracking/?cargo_number=${ttn}`, '_blank');
        }
    }

    return (
        <label className={styles['search-wrapper']}>
            <input type="text" name="invoice-number" value={invoiceNumber} className="search-input" autoCorrect="off"
                   spellCheck="false" placeholder="ТТН" disabled/>
            <img src={IconSearch} alt="" onClick={() => invoiceNumberRedirect()}/>
        </label>
    )
}

export default SearchInput;