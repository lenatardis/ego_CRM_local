import React from "react";
import styles from './UserHeader.module.scss';
import arrowRight from '../../../../assets/icons/arrowRight.svg';
import {useAppSelector} from "../../../../hooks/redux";
import {getUser} from "../../../../store/selectors";
import {Link} from "react-router-dom";


const UserHeader = () => {
    const user = useAppSelector(getUser);

    return (
        <Link to={`/profile/`} className={styles.userHeader}>
            <div className={styles.userHeader__user}>
                <div className={styles.userHeader__userPhoto}>
                    <img src={user.photo} alt="" />
                </div>
                <p>
                    <span className={styles.name}>{user.name}</span>
                    <span className={styles.role}>Менеджер</span>
                </p>
            </div>
            <img src={arrowRight} alt="" />
        </Link>
    )
}

export default UserHeader;