import React, { useState } from "react";
import styles from './Profile.module.scss';
import ProfilePopup from "./ProfilePopup";
import { useAppSelector } from "../../../hooks/redux";
import { getUser } from "../../../store/selectors";
import { getAccessToken } from "../../../utils/authTokens";
import { updateUserInfo } from "../../../api/authApi";
import Preloader from "../../Common/Preloader/Preloader";

const Profile = () => {
    const user = useAppSelector(getUser);
    const [value, setValue] = useState('');
    const [error, setError] = useState(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isShowConfirm, setIsShowConfirm] = useState(false);
    const accessToken = getAccessToken();

    const handleChange = (val) => {
        if (error) setError(null);
        if (isSuccess) setIsSuccess(false);
        setValue(val);
    };

    const handleSubmit = () => {
        if (value.length < 10 || !/[A-Z]/.test(value)) {
            setError('Пароль має містити щонайменше 10 символів та хоча б одну велику літеру');
            setIsShowConfirm(false);
            return;
        }

        setIsLoading(true);
        updateUserInfo(accessToken, user.id)
            .then((result) => {
                if (result?.id) {
                    setValue('');
                    setIsSuccess(true);
                    setIsShowConfirm(false);
                }
            })
            .finally(() => setIsLoading(false));
    };

    return (
        <div className={styles.profileWrapper}>
            <div className={styles.profile}>

                <div className={styles.profile__header}>
                    <h2>Персональна сторінка</h2>
                </div>

                {user && (
                    <div className={styles.box}>
                        <div className={styles.userName}>
                            <img src={user.photo} alt="User" />
                            <p>{user.name}</p>
                        </div>
                        {user.url && (
                            <a href={user.url} target="_blank" rel="noreferrer" className={styles.userName__url}>
                                {user.url}
                            </a>
                        )}
                    </div>
                )}

                <div className={styles.box}>
                    <form onSubmit={handleSubmit}>
                        <h3>Змінна паролю</h3>
                        <div className="baseInputContainer">
                            <input
                                placeholder="Новий пароль"
                                className={`baseInput ${error ? 'baseInputError' : ''}`}
                                id="password"
                                name="password"
                                type="text"
                                value={value}
                                onChange={(e) => handleChange(e.target.value)}
                            />
                            {error && <p className={styles.errorText}>{error}</p>}
                            {isSuccess && <p className={styles.successText}>Пароль успішно змінено</p>}
                        </div>
                        <div className={styles.profile__action}>
                            <button type="button" onClick={() => setIsShowConfirm(true)}>
                                <span>Змінити</span>
                            </button>
                        </div>
                    </form>
                </div>

                {isShowConfirm && (
                    <ProfilePopup onClose={() => setIsShowConfirm(false)} handleSubmit={handleSubmit} />
                )}

                {isLoading && <Preloader />}

            </div>
        </div>
    );
};

export default Profile;
