import React from "react";
import styles from './ContactsContent.module.scss';
import phoneIcon from '../../../../assets/icons/phone.svg';
import mailIcon from '../../../../assets/icons/mail.svg';
import webIcon from '../../../../assets/icons/web.svg';
import copyIcon from '../../../../assets/icons/copy.svg';
import {CopyToClipboard} from "react-copy-to-clipboard";

const ContactsContent = ({phone, email, site}) => {
    return (
        <div className={styles.content}>
            <div className={styles.content__box}>
                <span className={styles.content__title}>Телефон</span>
                <div className={styles.content__field}>
                    <div className={styles.content__leftField}>
                        <img src={phoneIcon} alt=""/>
                        <span>{phone}</span>
                    </div>
                    <CopyToClipboard text={phone} className="click-effect">
                        <button tabIndex={0}>
                            <img src={copyIcon} alt=""/>
                        </button>
                    </CopyToClipboard>
                </div>
            </div>
            <div className={styles.content__box}>
                <span className={styles.content__title}>Email</span>
                <div className={styles.content__field}>
                    <div className={styles.content__leftField}>
                        <img src={mailIcon} alt=""/>
                        <span>{email}</span>
                    </div>
                    <CopyToClipboard text={email} className="click-effect">
                        <button tabIndex={0}>
                            <img src={copyIcon} alt=""/>
                        </button>
                    </CopyToClipboard>
                </div>
            </div>
            <div className={styles.content__box}>
                <span className={styles.content__title}>Сайт</span>
                <div className={styles.content__field}>
                    <div className={styles.content__leftField}>
                        <img src={webIcon} alt=""/>
                        <span>{site}</span>
                    </div>
                    <CopyToClipboard text={site} className="click-effect">
                        <button tabIndex={0}>
                            <img src={copyIcon} alt=""/>
                        </button>
                    </CopyToClipboard>
                </div>
            </div>
        </div>
    )
}

export default ContactsContent;