// Base configuration for API connection
// You can easily update the base URL depending on your environment

export const API_BASE_URL = 'https://skillbridgeproject-t80c.onrender.com';

export const endpoints = {
    auth: {
        login: `${API_BASE_URL}/api/login`,
        register: `${API_BASE_URL}/api/register`
    },
    specializations: `${API_BASE_URL}/api/specializations`,
};