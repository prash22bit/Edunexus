import axios from 'axios';

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
});

API.interceptors.request.use((req) => {
    const user = JSON.parse(localStorage.getItem('lmsUser') || 'null');
    if (user?.token) req.headers.Authorization = `Bearer ${user.token}`;
    return req;
});

API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('lmsUser');
            window.location.href = '/auth';
        }
        return Promise.reject(error);
    }
);

export default API;
