export const parseResponseSafely = async (response) => {
    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
        try {
            return await response.json();
        } catch {
            return null;
        }
    }

    try {
        const text = await response.text();
        return text ? { _serverError: text } : null;
    } catch {
        return null;
    }
};