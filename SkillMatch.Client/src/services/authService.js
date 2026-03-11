import { endpoints } from '../config/api';

export const authService = {
    async login(email, password) {
        try {
            const response = await fetch(endpoints.auth.login, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                // Return clear error message from API if available
                throw new Error(data.message || 'Login failed. Please check your credentials.');
            }

            // Success: Store token and user data in localStorage
            if (data.token) {
                localStorage.setItem('token', data.token);
            }

            if (data.user) {
                localStorage.setItem('user', JSON.stringify(data.user));
            }

            return data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },


    async register(name, email, password, role) {
        try {
            const response = await fetch(endpoints.auth.register, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password, role })
            });

            // Assuming sometimes register might just return 200 OK without a JSON body
            let data = null;
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                data = await response.json();
            }

            if (!response.ok) {
                throw new Error(data?.message || 'Registration failed. Email might already be in use.');
            }

            return data || { success: true };
        } catch (error) {
            throw error;
        }
    },

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    isAuthenticated() {
        return !!localStorage.getItem('token');
    },

    getCurrentUser() {
        const userStr = localStorage.getItem('user');
        if (!userStr) return null;
        try {
            return JSON.parse(userStr);
        } catch {
            return null;
        }
    }
};
