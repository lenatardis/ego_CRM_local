import { baseUrl } from "./apiConfig";
import { getRefreshToken, removeAuthTokens, setNewAccessToken, setTokens } from "../utils/authTokens";

export const refreshAccessToken = async () => {
    try {
        const refreshToken = getRefreshToken();
        if (refreshToken) {
            const response = await fetch(`${baseUrl}users/token/refresh/`, {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    refresh: refreshToken,
                })
            });
            const newAccessToken = response.json();

            newAccessToken.then((res) => {
                if (res?.access) {
                    setNewAccessToken(res.access);
                } else {
                    removeAuthTokens();
                    window.location.reload();
                }
            })
            return newAccessToken;
        }
    } catch (error) {
        if (error) {
            removeAuthTokens();
        }
    }
}

export const login = async (name, password) => {
    try {
        const response = await fetch(`${baseUrl}users/token/`, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: name,
                password: password,
            })
        });

        const res = await response.json();

        if (res && res.access && res.refresh) {
            setTokens(res.access, res.refresh);
            return res;
        }

        if (res?.user) {
            const userError = Array.isArray(res.user)
                ? res.user[0]
                : res.user;

            return {
                error:
                    userError === 'Username or Password is incorrect'
                        ? 'Логін чи пароль невірні'
                        : userError || 'Логін чи пароль невірні',
            };
        }

        if (res?.detail) {
            return {
                error:
                    res.detail === 'Username or Password is incorrect'
                        ? 'Логін чи пароль невірні'
                        : res.detail,
            };
        }

        return {
            error: 'Не вдалося авторизуватися',
        };
    } catch (error) {
        console.log(error);

        return {
            error: 'Сервер недоступний',
        };
    }
};

export const getUserInfo = async (token) => {
    try {
        const response = await fetch(`${baseUrl}users/`, {
            method: "GET",
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
        });
        if (response && response.statusText === 'Unauthorized') {
            return refreshAccessToken().then((res) => {
                if (res?.access) {
                    return getUserInfo(res.access).then((result) => {
                        return result;
                    });
                } else {
                    removeAuthTokens();
                }
            });
        } else {
            return response.json();
        }

    } catch (error) {
        console.log(error);
    }
}

export const updateUserInfo = async (token, id, password) => {
    try {
        const response = await fetch(`${baseUrl}users/${id}/`, {
            method: "PATCH",
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                password: password,
            })
        });
        if (response && response.statusText === 'Unauthorized') {
            return updateUserInfo().then((res) => {
                if (res?.access) {
                    return updateUserInfo(res.access).then((result) => {
                        return result;
                    });
                } else {
                    removeAuthTokens();
                }
            });
        } else {
            return response.json();
        }

    } catch (error) {
        console.log(error);
    }
}