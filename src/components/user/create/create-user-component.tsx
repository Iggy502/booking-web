import React, {useState} from 'react';
import {IUserUpdate} from '../../../models/User.ts';
import {UserService} from '../../../services/user.service.ts';
import {Alert, Button, Card, Col, Container, Form, Row} from 'react-bootstrap';
import {useError} from "../../../context/error.context.tsx";
import {useNavigate} from "react-router-dom";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faHome} from '@fortawesome/free-solid-svg-icons';
import {validateFormFields} from "../utils/validation.utils.ts";
import PhoneInput, {isValidPhoneNumber} from "react-phone-number-input/min";

interface FormData extends IUserUpdate {
    password: string;
    confirmPassword: string;
}

const UserCreateComponent = () => {
    const [formData, setFormData] = useState<FormData>({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });
    const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {showError} = useError();
    const navigate = useNavigate();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setFormErrors(prev => ({
            ...prev,
            [name]: ''
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const errors = validateFormFields(formData);

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const {confirmPassword, ...userData} = formData;
            await UserService.createUser(userData);
            navigate('/login');
        } catch (err: any) {
            showError(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Container className="py-5">
            <Row className="justify-content-center">
                <Col sm={12} md={10} lg={8} xl={6}>
                    <div className="d-flex justify-content-end mb-3">
                        <Button
                            variant="outline-primary"
                            onClick={() => navigate('/')}
                            type="button"
                            className="mx-auto"
                        >
                            <FontAwesomeIcon icon={faHome}/>
                        </Button>
                    </div>
                    <Card>
                        <Card.Header className="bg-white">
                            <Card.Title className="mb-0">Create Account</Card.Title>
                        </Card.Header>
                        <Card.Body>
                            {error && (
                                <Alert variant="danger" dismissible onClose={() => setError(null)}>
                                    {error}
                                </Alert>
                            )}

                            <Form onSubmit={handleSubmit} noValidate>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-4">
                                            <Form.Label>First Name</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="firstName"
                                                value={formData.firstName}
                                                onChange={handleInputChange}
                                                isInvalid={!!formErrors.firstName}
                                                required
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {formErrors.firstName}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>

                                    <Col md={6}>
                                        <Form.Group className="mb-4">
                                            <Form.Label>Last Name</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="lastName"
                                                value={formData.lastName}
                                                onChange={handleInputChange}
                                                isInvalid={!!formErrors.lastName}
                                                required
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {formErrors.lastName}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-4">
                                            <Form.Label>Email</Form.Label>
                                            <Form.Control
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                isInvalid={!!formErrors.email}
                                                required
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {formErrors.email}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>

                                    <Col md={6}>
                                        <Form.Label>Phone</Form.Label>
                                        <PhoneInput
                                            international
                                            defaultCountry="BE"
                                            value={formData.phone}
                                            countries={['BE']}
                                            addInternationalOption={false}
                                            onChange={(value) => {

                                                if ((value && value.length > 3 && !isValidPhoneNumber(value))) {
                                                    setFormErrors(prev => ({
                                                        ...prev,
                                                        phone: 'Invalid phone number'
                                                    }));
                                                } else {
                                                    setFormErrors(prev => ({
                                                        ...prev,
                                                        phone: ''
                                                    }));
                                                }

                                                setFormData(prev => ({
                                                    ...prev,
                                                    phone: value || ''
                                                }));

                                            }}
                                            className={`${formErrors.phone ? 'is-invalid' : ''}`}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {formErrors.phone}
                                        </Form.Control.Feedback>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-4">
                                            <Form.Label>Password</Form.Label>
                                            <Form.Control
                                                type="password"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleInputChange}
                                                isInvalid={!!formErrors.password}
                                                required
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {formErrors.password}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>

                                    <Col md={6}>
                                        <Form.Group className="mb-4">
                                            <Form.Label>Confirm Password</Form.Label>
                                            <Form.Control
                                                type="password"
                                                name="confirmPassword"
                                                value={formData.confirmPassword}
                                                onChange={handleInputChange}
                                                isInvalid={!!formErrors.confirmPassword}
                                                required
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {formErrors.confirmPassword}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <div className="d-flex justify-content-end gap-2 mt-4">
                                    <Button
                                        variant="outline-secondary"
                                        onClick={() => {
                                            setFormData({
                                                firstName: '',
                                                lastName: '',
                                                email: '',
                                                phone: '',
                                                password: '',
                                                confirmPassword: ''
                                            });
                                            setFormErrors({});
                                        }}
                                        type="button"
                                    >
                                        Reset
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Creating...' : 'Create Account'}
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default UserCreateComponent;