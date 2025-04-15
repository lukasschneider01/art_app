import axios from 'axios';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'https://art-app.onrender.com'
});

// Add request interceptor for auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['x-auth-token'] = token;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;