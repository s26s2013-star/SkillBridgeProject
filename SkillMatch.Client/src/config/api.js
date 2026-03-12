// Base configuration for API connection
// You can easily update the base URL depending on your environment

export const API_BASE_URL = 'http://localhost:5059/api';

export const endpoints = {
    auth: {
        login: `${API_BASE_URL}/auth/login`,
        register: `${API_BASE_URL}/auth/register`,
    },
};