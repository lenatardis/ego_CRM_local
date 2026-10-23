export const getServerErrorMessage = (response) => {
    if (!response) return '';

    if (typeof response === 'string') return response;

    if (Array.isArray(response)) {
        return response.filter(Boolean).join(', ');
    }

    if (typeof response !== 'object') {
        return '';
    }

    if (response._serverError) return response._serverError;
    if (response.detail) return Array.isArray(response.detail) ? response.detail.join(', ') : String(response.detail);
    if (response.message) return Array.isArray(response.message) ? response.message.join(', ') : String(response.message);
    if (response.error) return Array.isArray(response.error) ? response.error.join(', ') : String(response.error);

    if (response.errors) {
        if (typeof response.errors === 'string') return response.errors;
        if (Array.isArray(response.errors)) return response.errors.filter(Boolean).join(', ');

        if (typeof response.errors === 'object') {
            const nested = Object.entries(response.errors)
                .flatMap(([key, value]) => {
                    if (Array.isArray(value)) {
                        return value.map((item) => `${key}: ${item}`);
                    }
                    if (typeof value === 'string') {
                        return [`${key}: ${value}`];
                    }
                    if (value && typeof value === 'object') {
                        return Object.entries(value).flatMap(([nestedKey, nestedValue]) => {
                            if (Array.isArray(nestedValue)) {
                                return nestedValue.map((item) => `${key}.${nestedKey}: ${item}`);
                            }
                            if (typeof nestedValue === 'string') {
                                return [`${key}.${nestedKey}: ${nestedValue}`];
                            }
                            return [];
                        });
                    }
                    return [];
                })
                .filter(Boolean);

            if (nested.length) return nested.join(' | ');
        }
    }

    const fieldMessages = Object.entries(response)
        .flatMap(([key, value]) => {
            if (key === 'id' || key === 'created' || key === 'modified') return [];

            if (Array.isArray(value)) {
                return value.map((item) => `${key}: ${item}`);
            }

            if (typeof value === 'string' && value.trim()) {
                return [`${key}: ${value}`];
            }

            return [];
        })
        .filter(Boolean);

    if (fieldMessages.length) return fieldMessages.join(' | ');

    return 'Сталася помилка сервера';
};