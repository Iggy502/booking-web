import React from 'react';
import {Alert, Container} from 'react-bootstrap';
import {useError} from '../context/error.context.tsx';
import './ErrorBanner.scss';

const ErrorBanner: React.FC = () => {
    const {error, clearError} = useError();

    if (!error) return null;

    return (
        <div className="error-banner">
            <Container>
                <Alert
                    variant="danger"
                    onClose={clearError}
                    dismissible
                    className="error-alert"
                >
                    <div className="d-flex align-items-center justify-content-center gap-2">
                        <div className="error-icon">
                            <i className="fas fa-exclamation-circle"></i>
                        </div>
                        <div className="error-content">
                            <span className="error-status">Error {error.status}</span>
                            <span className="error-separator">|</span>
                            <span className="error-message">{error.message}</span>
                        </div>
                    </div>
                </Alert>
            </Container>
        </div>
    );
};

export default ErrorBanner;