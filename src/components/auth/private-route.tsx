import {Navigate, useLocation} from 'react-router-dom';
import {useAuth} from '../../context/auth.context.tsx';
import {Container, Spinner} from "react-bootstrap";

interface PrivateRouteProps {
    children: React.ReactNode;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({children}) => {
    const { userInfo, isAuthenticated, isInitialized } = useAuth();
    const location = useLocation();

    if (!isInitialized) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
                <Spinner animation="border" role="status" variant="primary">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </Container>
        );
    }

    if (!userInfo || !isAuthenticated) {
        return <Navigate to="/login" state={{from: location}} replace/>;
    }

    return <>{children}</>;
};