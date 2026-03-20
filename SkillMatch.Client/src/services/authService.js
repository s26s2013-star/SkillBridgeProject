import { endpoints } from '../config/api';

export const authService = {
    async login(email, password) {
        const response = await fetch(endpoints.auth.login, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email.trim().toLowerCase(),
                password: password.trim(),
            }),
        });

        let data = null;
        const contentType = response.headers.get('content-type');

        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        }

        if (!response.ok) {
            throw new Error(data?.message || 'Invalid email or password.');
        }

        if (!data?.token) {
            throw new Error('Login failed. Token was not returned from server.');
        }

        localStorage.setItem('token', data.token);

        if (data.user) {
            localStorage.setItem('user', JSON.stringify(data.user));
        }

        return data;
    },

    async register(name, email, password, role, major) {
        try {
            const response = await fetch(endpoints.auth.register, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password, role, major })
            });

            // Assuming sometimes register might just return 200 OK without a JSON body
            let data = null;
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                data = await response.json();
            }

        if (!response.ok) {
            throw new Error(data?.message || 'Registration failed.');
        }

        return data || { success: true };
    },

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    isAuthenticated() {
        const token = localStorage.getItem('token');
        return !!token;
    },

    getCurrentUser() {
        const userStr = localStorage.getItem('user');
        if (!userStr) return null;

        try {
            return JSON.parse(userStr);
        } catch {
            localStorage.removeItem('user');
            return null;
        }
    },
};