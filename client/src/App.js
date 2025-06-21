import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import StudentPortal from './components/StudentPortal';
import StaffPortal from './components/StaffPortal';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function AppRoutes() {
    const { currentUser } = useAuth();

    if (!currentUser) {
        return <Login />;
    }

    return (
        <Routes>
            <Route 
                path="/" 
                element={
                    currentUser.role === 'student' ? 
                    <Navigate to="/student" /> : 
                    <Navigate to="/staff" />
                } 
            />
            <Route 
                path="/student" 
                element={
                    <ProtectedRoute allowedRoles={['student']}>
                        <StudentPortal />
                    </ProtectedRoute>
                } 
            />
            <Route 
                path="/staff" 
                element={
                    <ProtectedRoute allowedRoles={['staff']}>
                        <StaffPortal />
                    </ProtectedRoute>
                } 
            />
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="App">
                    <AppRoutes />
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
