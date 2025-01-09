import React, { useState } from 'react';
import { Container, Form } from 'react-bootstrap';
import { UserService } from '../../../../services/user.service.ts';
import { useError } from "../../../../context/error.context.tsx";
import { HttpError, InternalServerError } from "http-errors";
import '../password-reset.scss';

export const RequestPasswordReset = () => {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const { showError } = useError();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            await UserService.initiatePasswordReset(email);
            setSubmitted(true);
        } catch (error) {
            if (error instanceof HttpError) {
                console.error("Error initiating password reset:", error);
                showError(error);
            } else {
                console.error("Unexpected error:", error);
                showError(InternalServerError("Internal Server Error"));
            }
        }
    };

    if (submitted) {
        return (
            <Container fluid className="password-reset-page px-3">
                <div className="password-reset-container">
                    <div className="password-reset-box">
                        <h1 className="text-center mb-4">Check Your Email</h1>
                        <p className="text-center">
                            We've sent a password reset link to your email address.
                            Please check your inbox and follow the instructions to reset your password.
                        </p>
                        <p className="text-center text-muted mt-4">
                            Didn't receive the email?{' '}
                            <a href="/profile/reset-password" className="text-primary text-decoration-none">
                                Try again
                            </a>
                        </p>
                    </div>
                </div>
            </Container>
        );
    }

    return (
        <Container fluid className="password-reset-page px-3">
            <div className="password-reset-container">
                <div className="password-reset-box">
                    <h1 className="text-center mb-4">Reset Password</h1>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-4">
                            <Form.Label>
                                <i className="fas fa-envelope me-2"></i>
                                Email address
                            </Form.Label>
                            <Form.Control
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                required
                                className="form-control-lg"
                            />
                        </Form.Group>

                        <button
                            type="submit"
                            className="btn btn-primary btn-lg w-100 mb-3"
                        >
                            <i className="fas fa-paper-plane me-2"></i>
                            Send Reset Link
                        </button>

                        <p className="text-center text-muted">
                            Remember your password?{' '}
                            <a href="/login" className="text-primary text-decoration-none">
                                Sign in
                            </a>
                        </p>
                    </Form>
                </div>
            </div>
        </Container>
    );
};