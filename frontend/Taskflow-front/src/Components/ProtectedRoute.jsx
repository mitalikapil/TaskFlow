import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * ProtectedRoute: Checks if a valid JWT token exists in localStorage.
 * If the token exists, it renders the child component (e.g., DashboardPage).
 * If the token does NOT exist, it redirects the user to the /login page.
 * * @param {object} children - The component(s) that should be protected.
 */
const ProtectedRoute = ({ children }) => {
    // Check for the JWT token saved during login/signup
    const token = localStorage.getItem('trello_clone_token');

    if (!token) {
        // If there is no token, redirect the user to the login page
        // The 'replace' prop ensures the user cannot hit the 'back' button to access the protected page
        return <Navigate to="/login" replace />;
    }

    // If a token exists, render the component the user requested
    return children;
};

export default ProtectedRoute;
