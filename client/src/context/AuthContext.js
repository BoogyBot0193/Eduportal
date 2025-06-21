import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Get initial state from localStorage
    const getInitialState = () => {
        try {
            const token = localStorage.getItem('token');
            const user = localStorage.getItem('user');
            
            if (token && user) {
                return JSON.parse(user);
            }
        } catch (error) {
            console.error('Error parsing stored user data:', error);
            // Clear corrupted data
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
        return null;
    };

    useEffect(() => {
        const initialUser = getInitialState();
        setCurrentUser(initialUser);
        setLoading(false);
    }, []);

    // Update localStorage whenever currentUser changes
    useEffect(() => {
        if (currentUser) {
            localStorage.setItem('user', JSON.stringify(currentUser));
        } else {
            // Clear storage when user is null
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    }, [currentUser]);

    const login = (token, user) => {
        // Clear any existing data first
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Set new data
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setCurrentUser(user);
    };

    const logout = () => {
        // Completely clear all authentication data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.clear(); // Clear session storage too
        setCurrentUser(null);
        
        // Force a small delay to ensure state updates
        setTimeout(() => {
           window.location.href = 'http://localhost:3000';
        }, 100);
    };

    const getAuthHeader = () => {
        const token = localStorage.getItem('token');
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    const value = {
        currentUser,
        login,
        logout,
        getAuthHeader,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
