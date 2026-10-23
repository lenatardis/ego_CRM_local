import { baseUrl } from "./apiConfig";
import { refreshAccessToken } from "./authApi";
import { parseResponseSafely } from "./apiUtils";

export const getPayments = async (token, orderId) => {
    try {
        const response = await fetch(`${baseUrl}payments/?order_id=${orderId}` , {
            method: "GET",
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        if (response.status === 401) {
            return refreshAccessToken().then((res) => {
                if (res) {
                    return getPayments(res.access, orderId).then((result) => {
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

export const updatePayment = async (token, orderId, value) => {
    try {
        const response = await fetch(`${baseUrl}payments/`, {
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

        if (response.status === 401) {
            return refreshAccessToken().then((res) => {
                if (res) {
                    return updatePayment(res.access, orderId, value);
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

export const sendPayMonobank = async (id) => {
    try {
        const response = await fetch(`${baseUrl}payments_types/monobank/` , {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                payment_bill_id: id,
            })
        });
        return response.json();

    } catch (error) {
        console.log(error);
    }
}

export const sendPayWayForPay = async (id) => {
    try {
        const response = await fetch(`${baseUrl}payments_types/wayforpay/` , {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                payment_bill_id: id,
            })
        });
        return response.json();

    } catch (error) {
        console.log(error);
    }
}

export const setFinishOrder = async (id, paymentType) => {
    try {
        const response = await fetch(`${baseUrl}payments_types/${paymentType}/${id}/successful/` , {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                payment_id: id,
            })
        });
        return response.json();

    } catch (error) {
        console.log(error);
    }
}

export const getPaymentBills = async (token, paymentId) => {
    try {
        const response = await fetch(`${baseUrl}payments_types/payment_bill/?payment_id=${paymentId}` , {
            method: "GET",
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        if (response.status === 401) {
            return refreshAccessToken().then((res) => {
                if (res) {
                    return getPaymentBills(res.access, paymentId).then((result) => {
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

export const createPaymentBill = async (token, body) => {
    try {
        const response = await fetch(`${baseUrl}payments_types/payment_bill/` , {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
        if (response.status === 401) {
            return refreshAccessToken().then((res) => {
                if (res) {
                    return createPaymentBill(res.access, body).then((result) => {
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

export const updatePaymentBill = async (token, id, value) => {
    try {
        const response = await fetch(`${baseUrl}payments_types/payment_bill/${id}/` , {
            method: "PATCH",
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ...value })
        });
        if (response.status === 401) {
            return refreshAccessToken().then((res) => {
                if (res) {
                    return updatePaymentBill(res.access, id, value).then((result) => {
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

export const deletePaymentBill = async (token, id) => {
    try {
        const response = await fetch(`${baseUrl}payments_types/payment_bill/${id}/` , {
            method: "DELETE",
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        if (response.status === 401) {
            return refreshAccessToken().then((res) => {
                if (res) {
                    return deletePaymentBill(res.access, id).then((result) => {
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