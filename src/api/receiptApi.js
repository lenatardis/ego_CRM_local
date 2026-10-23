import { baseUrl } from "./apiConfig";
import { refreshAccessToken } from "./authApi";

export const setCheckboxReceipt = async (payment_id, payment_type) => {
    try {
        const response = await fetch(`${baseUrl}checkbox/receipt/`, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                payment_id: payment_id,
                payment_type: payment_type,
            })
        });
        return response.json();
    } catch (error) {
        console.log(error);
    }
}

export const setReceipt = async (formData) => {
    try {
        const response = await fetch(`${baseUrl}receipt/`, {
            method: "POST",
            body: formData
        });
        return response.json();
    } catch (error) {
        console.log(error);
    }
}

export const approveReceipt = async (token, formData) => {
    try {
        const response = await fetch(`${baseUrl}receipt/approved/`, {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
            body: formData
        });
        if (response.status === 401) {
            refreshAccessToken().then((res) => {
                if (res) {
                    return approveReceipt(res.access, formData).then((result) => {
                        return result;
                    });
                }
            })
        } else {
            return response.json();
        }
    } catch (error) {
        console.log(error);
    }
}