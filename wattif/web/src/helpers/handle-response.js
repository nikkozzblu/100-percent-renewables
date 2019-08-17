export function handleResponse(response) {
    return response.text().then(text => {
        const data = text && JSON.parse(text);
        if (data.message && data.message !=="Success") {
            if (response.status === 401 || response.status === 403) {
                // auto logout if 401, 403 response returned from api
                sessionStorage.removeItem('user');
                location.reload(true);
            }

            const error = (data && data.message) || response.statusText;
            return Promise.reject(error);
        }

        return data;
    });
}
