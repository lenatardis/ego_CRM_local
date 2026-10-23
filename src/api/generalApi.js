import { baseUrl } from "./apiConfig";
import { refreshAccessToken } from "./authApi";

export const getWorkSchedule = async () => {
    try {
        const response = await fetch(`${baseUrl}general/work_schedule/` , {
            method: "GET",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
        });
        if (response && response.statusText === 'Unauthorized') {
            return refreshAccessToken().then((res) => {
                if (res) {
                    return getWorkSchedule(res.access).then((result) => {
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

export const getPaymentDetail = async (orderId) => {
    try {
        const response = await fetch(`${baseUrl}general/payment_details/?order=${orderId}` , {
            method: "GET",
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

export const getCompanyInfo = async () => {
    try {
        const response = await fetch(`${baseUrl}general/company/` , {
            method: "GET",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
        });
        if (response && response.statusText === 'Unauthorized') {
            return refreshAccessToken().then((res) => {
                if (res) {
                    return getCompanyInfo(res.access).then((result) => {
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

export const getReason = async () => {
    try {
        const response = await fetch(`${baseUrl}general/call_order/reason/` , {
            method: "GET",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
        });
        if (response && response.statusText === 'Unauthorized') {
            return refreshAccessToken().then((res) => {
                if (res) {
                    return getReason(res.access).then((result) => {
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

export const setCallOrder = async (name, phone, reason) => {
    try {
        const response = await fetch(`${baseUrl}general/call_order/` , {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                phone: phone,
                reason: reason,
            })
        });
        return response.json();
    } catch (error) {
        console.log(error);
    }
}