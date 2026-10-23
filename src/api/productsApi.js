import { getSearchParams } from "../utils/getSearchParams";
import { baseUrl } from "./apiConfig";
import { refreshAccessToken } from "./authApi";

export const getStorageProducts = async (token, params = {}) => {
    const q = { ...params };

    const raw = q.source;
    if (raw == null || raw === '' || Number.isNaN(raw)) {
        delete q.source;
    } else {
        q.source = String(raw);
    }

    const searchParams = getSearchParams(q);
    const url = `${baseUrl}products/warehouse-items/?page_size=10${searchParams ? `&${searchParams}` : ''}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
        });

        if (response && response.statusText === 'Unauthorized') {
            return refreshAccessToken().then((res) => {
                if (res) {
                    return getStorageProducts(res.access, params);
                }
            });
        } else {
            return response.json();
        }
    } catch (error) {
        console.log(error);
    }
};


export const getProductDetail = async (id) => {
    try {
        const response = await fetch(`${baseUrl}products/warehouse-items/${id}/` , {
            method: "GET",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
        });
        if (response && response.statusText === 'Unauthorized') {
            return refreshAccessToken().then((res) => {
                if (res) {
                    return getStorageProducts(res.access).then((result) => {
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

export const getFabrics = async (token, filterParams) => {
    const searchParams = getSearchParams(filterParams);
    try {
        const response = await fetch(`${baseUrl}products/fabric/?${searchParams}` , {
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
                    return getFabrics(res.access, filterParams).then((result) => {
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

export const getFabricItem = async (id) => {
    try {
        const response = await fetch(`${baseUrl}products/fabric/${id}/` , {
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

export const getCartOrder = async (token, id) => {
    try {
        const response = await fetch(`${baseUrl}products/order-product/?order=${id}`, {
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
                    return getCartOrder(res.access, id).then((result) => {
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

export const setAddProduct = async (token, orderId, item) => {
    try {
        const response = await fetch(`${baseUrl}products/order-product/` , {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                order: orderId,
                warehouse_item: item,
            })
        });
        if (response && response.statusText === 'Unauthorized') {
            return refreshAccessToken().then((res) => {
                if (res) {
                    return setAddProduct(res.access, orderId, item).then((result) => {
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

export const removeProduct = async (token, id) => {
    try {
        const response = await fetch( `${baseUrl}products/order-product/${id}/` , {
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
                    return removeProduct(res.access, id).then((result) => {
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