// Base configuration for API connection
// You can easily update the base URL depending on your environment

export const API_BASE_URL = 'http://127.0.0.1:8000/api'; // Updated to Python FastAPI backend

export const endpoints = {
    auth: {
        login: `${API_BASE_URL}/login`,
        register: `${API_BASE_URL}/register`
    }
};