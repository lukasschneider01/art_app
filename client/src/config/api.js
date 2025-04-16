import axios from 'axios';

// Determine the base URL based on environment
const getBaseUrl = () => {
    // For production
    return 'https://art-app.onrender.com';
};

const api = axios.create({
    baseURL: getBaseUrl(),
    headers: {
        'Content-Type': 'application/json'
    }
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

// Add response interceptor to handle common errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Log the error for debugging
        console.error('API Error:', error);

        // Handle specific error cases
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.log('Response data:', error.response.data);
            console.log('Response status:', error.response.status);
        } else if (error.request) {
            // The request was made but no response was received
            console.log('No response received:', error.request);
        }

        return Promise.reject(error);
    }
);

export default api;