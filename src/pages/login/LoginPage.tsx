// src/pages/auth/LoginPage.tsx
import React from 'react';
import {useAuth} from '../../context/auth.context.tsx';
import {useLocation, useNavigate} from 'react-router-dom';
import {Container, Form} from 'react-bootstrap';
import './LoginPage.scss';
import {useError} from "../../context/error.context.tsx";
import {HttpError, InternalServerError} from "http-errors";

export const LoginPage = () => {
    const {login} = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const {showError} = useError();
    const from = (location.state)?.from?.pathname || '/';

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        try {
            await login(email, password);
            navigate(from, {replace: true});
        } catch (error) {
            if (error instanceof HttpError && (error.status || error.message)) {
                showError(error);
            } else {
                console.error("Error logging in:", error);
                showError(InternalServerError("Internal Server Error"));
            }
        }
    };

    return (
        <Container fluid className="login-page px-3">
            <div className="login-container">
                <div className="login-box">
                    <h1 className="text-center mb-4">Welcome Back</h1>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>
                                <i className="fas fa-envelope me-2"></i>
                                Email address
                            </Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                placeholder="Enter your email"
                                required className="form-control-lg"
                            />
                        </Form.Group>

                        <Form.Group className="mb-4">
                            <Form.Label>
                                <i className="fas fa-lock me-2"></i>
                                Password
                            </Form.Label>
                            <Form.Control
                                type="password"
                                name="password"
                                placeholder="Enter your password"
                                required
                                className="form-control-lg"
                            />
                        </Form.Group>

                        <button
                            type="submit"
                            className="btn btn-primary btn-lg w-100 mb-3"
                        >
                            <i className="fas fa-sign-in-alt me-2"></i>
                            Sign In
                        </button>

                        <p className="text-center text-muted">
                            Don't have an account?{' '}
                            <a href="/profile/register" className="text-primary text-decoration-none">
                                Create one
                            </a>
                        </p>
                        <p className="text-center text-muted">
                            <a href="/profile/reset-password" className="text-primary text-decoration-none">
                                Forgot password?
                            </a>
                        </p>
                    </Form>
                </div>
            </div>
        </Container>
    );
};