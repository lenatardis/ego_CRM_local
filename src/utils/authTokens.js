const ACCESS_TOKEN = 'accessEgoToken';
const REFRESH_TOKEN = 'refreshEgoToken';

export const setTokens = (access, refresh) => {
    localStorage.setItem(ACCESS_TOKEN, access);
    localStorage.setItem(REFRESH_TOKEN, refresh);
}

export const removeAuthTokens = async () => {
    localStorage.removeItem(ACCESS_TOKEN);
    localStorage.removeItem(REFRESH_TOKEN);
}

export const setNewAccessToken = async (token) => {
    localStorage.setItem(ACCESS_TOKEN, token)
}

export const getAccessToken = () => {
    return localStorage.getItem(ACCESS_TOKEN);
};

export const getRefreshToken = () => {
    return localStorage.getItem(REFRESH_TOKEN);
};