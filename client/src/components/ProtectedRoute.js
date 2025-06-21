import React from 'react';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children, allowedRoles }) {
    const { currentUser, loading } = useAuth();

    // Show loading while checking authentication
    if (loading) {
        return <div>Loading...</div>;
    }

    // Check if user is logged in
    if (!currentUser) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <h2>Authentication Required</h2>
                <p>Please log in to access this page.</p>
            </div>
        );
    }

    // Check role-based permissions
    if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <h2>Access Denied</h2>
                <p>You don't have permission to view this page.</p>
                <p>Your role: <strong>{currentUser.role}</strong></p>
                <p>Required roles: <strong>{allowedRoles.join(', ')}</strong></p>
            </div>
        );
    }

    return children;
}

export default ProtectedRoute;
