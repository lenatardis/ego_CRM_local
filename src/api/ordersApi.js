import { getSearchParams } from "../utils/getSearchParams";
import { baseUrl } from "./apiConfig";
import { refreshAccessToken } from "./authApi";
import { parseResponseSafely } from "./apiUtils";

export const getOrders = async (token, params) => {
    const searchParams = getSearchParams(params);
    try {
        const response = await fetch(`${baseUrl}orders/?${searchParams}`, {
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
                    return getOrders(res.access, params).then((result) => {
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

export const sendOrderHash = async (hash) => {
    try {
        const response = await fetch(`${baseUrl}orders/free-access/?order_hash=${hash}` , {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
        });
        return response.json();

    } catch (error) {
        console.log(error);
    }
}

export const setOrderDuplicate = async (token, id) => {
    try {
        const response = await fetch( `${baseUrl}orders/duplicate/` , {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                order_id: id,
            })
        });
        if (response && response.statusText === 'Unauthorized') {
            return refreshAccessToken().then((res) => {
                if (res) {
                    return setOrderDuplicate(res.access, id).then((result) => {
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

export const getOrdersRecentViews = async (token, value) => {
    try {
        const response = await fetch( `${baseUrl}orders/recent-views/?manager=${value}` , {
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
                    return getOrdersRecentViews(res.access, value).then((result) => {
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

export const setNewOrder = async (token, payload) => {
    try {
        const response = await fetch(`${baseUrl}orders/` , {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        if (response && response.statusText === 'Unauthorized') {
            return refreshAccessToken().then((res) => {
                if (res) {
                    return setNewOrder(res.access, payload).then((result) => {
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

export const getOrderInfo = async (token, id) => {
    try {
        const response = await fetch(`${baseUrl}orders/${id}/` , {
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
                    return getOrderInfo(res.access, id).then((result) => {
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

export const updateOrder = async (token, orderId, managerId, value) => {
    try {
        const response = await fetch(`${baseUrl}orders/`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id: orderId,
                manager: managerId,
                ...value,
            })
        });

        if (response.status === 401 || response.statusText === 'Unauthorized') {
            return refreshAccessToken().then((res) => {
                if (res) {
                    return updateOrder(res.access, orderId, managerId, value);
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

export const getUserInfoPhone = async (orderId, number) => {
    try {
        const response = await fetch(`${baseUrl}orders/free-access-customer/` , {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                order_id: orderId,
                phone_last_digits: number,
            })
        });
        if (response && response.statusText === 'Unauthorized') {
            return refreshAccessToken().then((res) => {
                if (res) {
                    return getUserInfoPhone(res.access, orderId, number).then((result) => {
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

export const removeOrder = async (token, id) => {
    try {
        const response = await fetch(`${baseUrl}orders/${id}/` , {
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
                    return removeOrder(res.access, id).then((result) => {
                        return result;
                    });
                }
            });
        } else {
            return response.status;
        }
    } catch (error) {
        console.log(error);
    }
}

export const getSuborders = async (token, params) => {
    const searchParams = getSearchParams(params);
    try {
        const response = await fetch(`${baseUrl}orders/sub-orders/?${searchParams}`, {
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
                    return getOrders(res.access, params).then((result) => {
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

export const getSources = async (token) => {
    try {
        const response = await fetch(`${baseUrl}orders/source/` , {
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
                    return getSources(res.access).then((result) => {
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