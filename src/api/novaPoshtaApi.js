import { baseUrl } from "./apiConfig";
import { refreshAccessToken } from "./authApi";
import { parseResponseSafely } from "./apiUtils";

export const getDeliverNP = async (token, value) => {
    try {
        const response = await fetch(`${baseUrl}delivery/nova_poshta/item/?order_id=${value}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
                "Content-Type": "application/json"
            },
        });

        if (response.status === 401 || response.statusText === "Unauthorized") {
            return refreshAccessToken().then((res) => {
                if (res) {
                    return getDeliverNP(res.access, value);
                }

                return { _serverError: "Помилка авторизації" };
            });
        }

        const data = await parseResponseSafely(response);

        if (response.ok) {
            return data;
        }

        return data || { _serverError: `Помилка сервера (${response.status})` };
    } catch (error) {
        console.log(error);
        return { _serverError: "Не вдалося виконати запит. Спробуй ще раз." };
    }
};

export const setDeliverNP = async (token, id, value = null) => {
    try {
        const response = await fetch(`${baseUrl}delivery/nova_poshta/item/`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                order_id: id,
                ...value,
            })
        });

        if (response.status === 401 || response.statusText === 'Unauthorized') {
            return refreshAccessToken().then((res) => {
                if (res) {
                    return setDeliverNP(res.access, id, value);
                }
                return { _serverError: 'Помилка авторизації' };
            });
        }

        const data = await parseResponseSafely(response);

        if (response.ok) {
            return data;
        }

        return data || { _serverError: `Помилка сервера (${response.status})` };
    } catch (error) {
        console.log(error);
        return { _serverError: 'Не вдалося виконати запит. Перевір підключення або спробуй ще раз.' };
    }
};

export const setDeliverNPTTN = async (token, id) => {
    try {
        const response = await fetch( `${baseUrl}delivery/nova_poshta/waybill/` , {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nova_poshta_id: id })
        });
        if (response && response.statusText === 'Unauthorized') {
            return refreshAccessToken().then((res) => {
                if (res) {
                    return setDeliverNPTTN(res.access, id).then((result) => {
                        return result;
                    });
                }
            });
        } else {
            return response.json();
        }
    } catch (error) {
        console.log(error);
    }
}

export const updateDeliveryNPTTN = async (token, id) => {
    try {
        const response = await fetch(`${baseUrl}delivery/nova_poshta/waybill/update/`, {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nova_poshta_id: id })
        });

        if (response.status === 401 || response.statusText === 'Unauthorized') {
            return refreshAccessToken().then((res) => {
                if (res) {
                    return updateDeliveryNPTTN(res.access, id);
                }

                return { _serverError: 'Помилка авторизації' };
            });
        }

        const contentType = response.headers.get('content-type') || '';
        let data = null;

        if (contentType.includes('application/json')) {
            try {
                data = await response.json();
            } catch {
                data = null;
            }
        } else {
            try {
                const text = await response.text();
                data = text ? { _serverError: text } : null;
            } catch {
                data = null;
            }
        }

        if (response.ok) {
            return data;
        }

        return data || { _serverError: `Помилка сервера (${response.status})` };
    } catch (error) {
        console.log(error);
        return { _serverError: 'Не вдалося виконати запит. Спробуй ще раз.' };
    }
}

export const deleteDeliveryNPTTN = async (token, id) => {
    try {
        const response = await fetch( `${baseUrl}delivery/nova_poshta/${id}/` , {
            method: "DELETE",
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
        });
        if (response && response.statusText === 'Unauthorized') {
            return refreshAccessToken().then((res) => {
                if (res) {
                    return deleteDeliveryNPTTN(res.access, id).then((result) => {
                        return result;
                    });
                }
            });
        } else {
            return response.json();
        }

    } catch (error) {
        console.log(error);
    }
}

export const getCities = async (token, value) => {
    try {
        const response = await fetch( `${baseUrl}delivery/nova_poshta/location/city/?city=${value}` , {
            method: "GET",
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
        });
        if (response && response.statusText === 'Unauthorized') {
            return refreshAccessToken().then((res) => {
                if (res) {
                    return getCities(res.access, value).then((result) => {
                        return result;
                    });
                }
            });
        } else {
            return response.json();
        }

    } catch (error) {
        console.log(error);
    }
}

export const getDepartment = async (token, value, searchValue = '') => {
    try {
        const response = await fetch( `${baseUrl}delivery/nova_poshta/location/warehouse/?city_ref=${value}&find_by_string=${searchValue}` , {
            method: "GET",
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
        });
        if (response && response.statusText === 'Unauthorized') {
            return refreshAccessToken().then((res) => {
                if (res) {
                    return getDepartment(res.access, value).then((result) => {
                        return result;
                    });
                }
            });
        } else {
            return response.json();
        }

    } catch (error) {
        console.log(error);
    }
}

export const getNPTTNPDF = async (token, id) => {
    try {
        const response = await fetch( `${baseUrl}delivery/nova_poshta/waybill/${id}/pdf/` , {
            method: "GET",
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
        });
        if (response && response.statusText === 'Unauthorized') {
            return refreshAccessToken().then((res) => {
                if (res) {
                    return getNPTTNPDF(res.access, id).then((result) => {
                        return result;
                    });
                }
            });
        } else {
            return response.json();
        }

    } catch (error) {
        console.log(error);
    }
}