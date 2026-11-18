import { baseUrl } from "./apiConfig";
import { refreshAccessToken } from "./authApi";
import { parseResponseSafely } from "./apiUtils";
import { t } from '../i18n';

export const updateCustomer = async (token, orderId, value) => {
    try {
        const response = await fetch(`${baseUrl}customers/`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                order_id: orderId,
                ...value,
            })
        });

        if (response.status === 401 || response.statusText === 'Unauthorized') {
            return refreshAccessToken().then((res) => {
                if (res) {
                    return updateCustomer(res.access, orderId, value);
                }
                return { _serverError: t('Помилка авторизації') };
            });
        }

        const data = await parseResponseSafely(response);

        if (response.ok) {
            return data;
        }

        return data || { _serverError: t('Помилка сервера ({{status}})', {status: response.status}) };
    } catch (error) {
        console.log(error);
        return { _serverError: t('Не вдалося виконати запит. Перевір підключення або спробуй ще раз.') };
    }
};