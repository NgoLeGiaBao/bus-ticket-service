import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

interface PrivateRouteProps {
    children: JSX.Element;
    allowedRoles: String[]; 
}

const PrivateRoute = ({ children, allowedRoles }: PrivateRouteProps) => {

    const token = useSelector((state: any) => state.user.account.access_token);
    const roleId = useSelector((state: any) => state.user.account.role);

    if (!token) {
        return <Navigate to="/unauthorized" />;
    }

    if (!allowedRoles.includes(roleId)) {
        return <Navigate to="/unauthorized" />;
    }

    return children;
};

export default PrivateRoute;
