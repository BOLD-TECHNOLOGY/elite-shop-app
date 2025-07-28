import { Navigate, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AppContext } from '../Context/AppContext'; 

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { user, token } = useContext(AppContext);
    const isAuthenticated = !!token && !!user;
    const isLoading = !!token && !user;
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <Navigate 
                to="/login" 
                state={{ from: location }} 
                replace 
            />
        );
    }

    if (allowedRoles.length > 0 && user?.role) {
        const userRole = user.role.toLowerCase();
        const hasPermission = allowedRoles.some(role => 
            role.toLowerCase() === userRole
        );

        if (!hasPermission) {
            return <Navigate to="/unauthorized" replace />;
        }
    }

    return children;
};

export default ProtectedRoute;