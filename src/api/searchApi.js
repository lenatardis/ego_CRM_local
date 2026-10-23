import { baseUrl } from "./apiConfig";
import { refreshAccessToken } from "./authApi";

export const getSearchResult = async (token, value, is_order= true, is_fabric = true, is_warehouse_item = true, page) => {
    try {
        const response = await fetch(`${baseUrl}search/?query=${value}&is_order=${is_order}&page=${page}&is_fabric=${is_fabric}&is_warehouse_item=${is_warehouse_item}` , {
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
                    return getSearchResult(res.access, value).then((result) => {
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