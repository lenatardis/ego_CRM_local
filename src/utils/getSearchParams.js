export const getSearchParams = (params) => {
    let searchParams = '';
    for (const [key, value] of Object.entries(params)) {
        if (!value || (Array.isArray(value) && !value.length)) continue;
        searchParams += `${key}=${value}&`;
    }
    return searchParams.slice(0, -1);
}