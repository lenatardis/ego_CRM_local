import React from "react";
import styles from './OrderInfoBlock.module.scss';
import {CopyToClipboard} from "react-copy-to-clipboard";
import copyIcon from "../../../assets/icons/copy2.svg";

const OrderInfoBlock = ({url, departmentNumber, ttn}) => {
    return (
        <>
            {(url || departmentNumber || ttn) && (<div className={styles.order}>
                {url && (
                    <a href={url} target={'_blanc'} className={styles.order__instaLink}>інстаграм посилання</a>
                )}
                {departmentNumber && (
                    <p>Нова пошта {departmentNumber}</p>
                )}
                {ttn && (
                    <p className={styles.order__invoice}>
                        <label>
                            <span>{ttn}</span>
                            <CopyToClipboard text={ttn} className="click-effect">
                                <button tabIndex={0}>
                                    <img src={copyIcon} alt=""/>
                                </button>
                            </CopyToClipboard>
                        </label>
                    </p>
                )}
            </div>)}
        </>

    )
}

export default OrderInfoBlock;