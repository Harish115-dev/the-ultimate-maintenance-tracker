// API Base URL
// API Base URL - Dynamic for Dev/Prod
const API_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:5000/api'
    : '/api';

// Get auth token
const getToken = () => localStorage.getItem('token');

// Get current user
const getCurrentUser = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
};

// Check if authenticated
const isAuthenticated = () => !!getToken();

// Logout
const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
};

// Make API request with auth
const apiRequest = async (endpoint, options = {}) => {
    const token = getToken();

    const config = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        }
    };

    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${API_URL}${endpoint}`, config);
        const data = await response.json();

        // Handle 401 (unauthorized)
        if (response.status === 401) {
            logout();
            return;
        }

        if (!data.success && response.status >= 400) {
            throw new Error(data.message || 'Request failed');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};

// Export functions
if (typeof window !== 'undefined') {
    window.getToken = getToken;
    window.getCurrentUser = getCurrentUser;
    window.isAuthenticated = isAuthenticated;
    window.logout = logout;
    window.apiRequest = apiRequest;
    window.API_URL = API_URL;
}
