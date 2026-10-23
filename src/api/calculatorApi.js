import { baseUrl } from "./apiConfig";
import { refreshAccessToken } from "./authApi";
import { getSearchParams } from "../utils/getSearchParams";

export const createProduct = async (token, id = null) => {
    try {
        const response = await fetch(id ? `${baseUrl}calculator/kit/templates/size/?order_product_id=${id}` : `${baseUrl}calculator/kit/templates/size/`, {
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
                    return createProduct(res.access, id).then((result) => {
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

export const getFabricTemplate = async (token, fabricId, sizeId, sourceID) => {
    try {
        // формуємо URL з параметрами
        let url = `${baseUrl}calculator/kit/templates/?fabric_id=${fabricId}&kit_template_size_id=${sizeId}`;

        if (sourceID != null) {
            url += `&source_id=${sourceID}`;
        }

        const response = await fetch(url, {
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
                    return getFabricTemplate(res.access, fabricId, sizeId, sourceID).then((result) => {
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
};


export const getKitTemplate = async (token) => {
    try {
        const response = await fetch(`${baseUrl}calculator/templates/`, {
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
                    return getKitTemplate(res.access).then((result) => {
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

export const getKitCustomComponents = async (token, params) => {
    const searchParams = getSearchParams(params);
    try {
        const response = await fetch(`${baseUrl}calculator/kit/components/additional/?${searchParams}`, {
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
                    return getKitCustomComponents(res.access, params).then((result) => {
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

export const setKit = async (token, data) => {
    let handleChange = {
        order_id: data.order_id,
        fabric_id: data.fabric_id,
        template_components: data.template_components,
        additional_fabric_consumption_count: data.additional_fabric_consumption_count,
        is_split: data.is_split
    }
    if (data?.comment) {
        handleChange.comment = data.comment;
    }
    if (data?.additional_components && data?.additional_components.length > 0) {
        handleChange.additional_components = data.additional_components;
    }
    if (data?.option && data?.option.length > 0) {
        handleChange.option = data.option;
    }
    if (data?.custom_size && data?.custom_size !== '') {
        handleChange.custom_size = data.custom_size;
    }

    try {
        const response = await fetch(`${baseUrl}calculator/kit/`, {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ...handleChange
            })
        });
        if (response && response.statusText === 'Unauthorized') {
            return refreshAccessToken().then((res) => {
                if (res) {
                    return setKit(res.access, data).then((result) => {
                        return result;
                    });
                }
            });
        } else {
            let result = null;
            try {
                result = await response.json();
            } catch (e) {
                console.log('setKit: failed to parse JSON', e);
            }

            return result
                ? { status: response.status, ...result }
                : { status: response.status };
        }
    } catch (error) {
        console.log(error);
        return { status: 0, error: 'network_error' };
    }
}

export const setUpdateKit = async (token, data, id) => {
    try {
        const response = await fetch(`${baseUrl}calculator/kit/${id}/`, {
            method: "PATCH",
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        if (response && response.statusText === 'Unauthorized') {
            return refreshAccessToken().then((res) => {
                if (res) {
                    return setUpdateKit(res.access, data, id).then((result) => {
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

export const removeKitComponent = async (token, kitId, id) => {
    try {
        const response = await fetch(`${baseUrl}calculator/kit/components/${id}/?kit_id=${kitId}`, {
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
                    return removeKitComponent(res.access, kitId, id).then((result) => {
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

export const setSplitKit = async (token, payload) => {
    try {
        const response = await fetch(`${baseUrl}calculator/kit/split/`, {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })
        if (response && response.statusText === 'Unauthorized') {
            return refreshAccessToken().then((res) => {
                if (res) {
                    return setSplitKit(res.access, payload).then((result) => {
                        return result;
                    });
                }
            });
        } else {
            return response.json();
        }
    } catch (error) {
        console.error(error);
    }
}

export const getMonoFabricTypeTemplates = async (token) => {
    try {
        const response = await fetch(`${baseUrl}calculator/kit/components/type_templates/`, {
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
                    return getMonoFabricTypeTemplates(res.access).then((result) => {
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