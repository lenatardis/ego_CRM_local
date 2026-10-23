import React, { useState } from "react";
import styles from './AuthForm.module.scss';
import { login } from "../../../../api/authApi";

const AuthForm = () => {
    const [authLogin, setAuthLogin] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState(null);
    const [authError, setAuthError] = useState('');

    const submitForm = (e) => {
        e.preventDefault();
        setAuthError('');

        let hasErrors = false;

        if (!authLogin) {
            setErrors(prevErrors => ({ ...prevErrors, login: 'Required' }));
            hasErrors = true;
        }

        if (!password) {
            setErrors(prevErrors => ({ ...prevErrors, password: 'Required' }));
            hasErrors = true;
        }

        if (hasErrors) return;

        setIsLoading(true);

        login(authLogin, password).then((result) => {
            if (result?.access) {
                window.location.reload();
            } else if (result?.error) {
                setAuthError(result.error);
            }

            setIsLoading(false);
        });
    }

    return (
        <form onSubmit={submitForm} className={styles.authForm}>
            <div className={styles.form}>
                <div className={styles.form__field}>
                    <label htmlFor="login">Логін:</label>
                    <input
                        id={'login'}
                        name={'login'}
                        value={authLogin}
                        className={`baseInput ${errors?.login ? 'baseInputError' : ''}`}
                        type="text"
                        onChange={(e) => setAuthLogin(e.target.value)}
                        onFocus={() => {
                            setErrors(prevErrors => ({ ...prevErrors, login: null }));
                            setAuthError('');
                        }}
                    />
                </div>

                <div className={styles.form__field}>
                    <label htmlFor="password">Пароль:</label>
                    <input
                        id={'password'}
                        name={'password'}
                        value={password}
                        className={`baseInput ${errors?.password ? 'baseInputError' : ''}`}
                        type="password"
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => {
                            setErrors(prevErrors => ({ ...prevErrors, password: null }));
                            setAuthError('');
                        }}
                        autoComplete="on"
                    />
                </div>
            </div>

            {authError && (
                <p className={styles.authError}>
                    {authError}
                </p>
            )}

            <button className={`${styles.action} globalBtn`} disabled={isLoading}>
                <span>Увійти</span>
            </button>
        </form>
    )
}

export default AuthForm;