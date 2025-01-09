import React, {useState} from 'react';
import {Container, Form} from 'react-bootstrap';
import {UserService} from '../../../../services/user.service.ts';
import {useError} from '../../../../context/error.context.tsx';
import {BadRequest} from "http-errors";
import {useNavigate, useParams} from 'react-router-dom';
import '../password-reset.scss';

export const ResetPasswordConfirm = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const {showError} = useError();
    const navigate = useNavigate();
    const {token} = useParams<{ token: string }>();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            if (password !== confirmPassword) {
                throw BadRequest('Passwords do not match');
            }

            if (!token) {
                throw BadRequest('Invalid token');
            }

            await UserService.resetPassword(token, password);
            navigate('/login', {
                state: {
                    message: 'Password reset successful. Please login with your new password.'
                }
            });
        } catch (error: any) {
            showError(error);
        }
    };

    return (
        <Container fluid className="password-reset-page px-3">
            <div className="password-reset-container">
                <div className="password-reset-box">
                    <h1 className="text-center mb-4">Set New Password</h1>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>
                                <i className="fas fa-lock me-2"></i>
                                New Password
                            </Form.Label>
                            <Form.Control
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter new password"
                                required
                                className="form-control-lg"
                            />
                        </Form.Group>

                        <Form.Group className="mb-4">
                            <Form.Label>
                                <i className="fas fa-lock me-2"></i>
                                Confirm Password
                            </Form.Label>
                            <Form.Control
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm new password"
                                required
                                className="form-control-lg"
                            />
                        </Form.Group>

                        <button
                            type="submit"
                            className="btn btn-primary btn-lg w-100 mb-3"
                        >
                            <i className="fas fa-key me-2"></i>
                            Reset Password
                        </button>
                    </Form>
                </div>
            </div>
        </Container>
    );
};