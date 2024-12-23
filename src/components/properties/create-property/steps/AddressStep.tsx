import React, {useState} from 'react';
import {Button, Col, Form, Row} from 'react-bootstrap';
import {IAddress} from '../../../../models/Property';
import './AddressStep.scss';

interface AddressStepProps {
    address: IAddress;
    onUpdate: (address: IAddress) => void;
    onNext: () => void;
    onBack: () => void;
}

interface ValidationErrors {
    street?: string;
    city?: string;
    country?: string;
    postalCode?: string;
}

const AddressStep: React.FC<AddressStepProps> = ({
                                                     address,
                                                     onUpdate,
                                                     onNext,
                                                     onBack
                                                 }) => {
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [errors, setErrors] = useState<ValidationErrors>({});

    const validateField = (name: string, value: IAddress[keyof IAddress]): string | undefined => {
        switch (name) {
            case 'street': {
                const street = value as string;
                if (!street.trim()) return 'Street is required';
                if (street.length < 5) return 'Street must be at least 5 characters';
                if (street.length > 100) return 'Street must be less than 100 characters';
                return undefined;
            }
            case 'city': {
                const city = value as string;
                if (!city.trim()) return 'City is required';
                if (city.length < 2) return 'City must be at least 2 characters';
                if (city.length > 50) return 'City must be less than 50 characters';
                return undefined;
            }
            case 'country': {
                const country = value as string;
                if (!country.trim()) return 'Country is required';
                if (country.length < 2) return 'Country must be at least 2 characters';
                if (country.length > 50) return 'Country must be less than 50 characters';
                return undefined;
            }
            case 'postalCode': {
                const postalCode = value as string;
                if (!postalCode.trim()) return 'Postal code is required';
                if (postalCode.length < 4) return 'Postal code must be at least 4 characters';
                if (postalCode.length > 10) return 'Postal code must be less than 10 characters';
                // Optional: Add specific postal code format validation per country
                return undefined;
            }
            default:
                return undefined;
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;

        onUpdate({
            ...address,
            [name]: value
        });

        // Validate field
        const error = validateField(name, value);
        setErrors(prev => ({
            ...prev,
            [name]: error
        }));

        // Mark as touched
        if (!touched[name]) {
            setTouched(prev => ({
                ...prev,
                [name]: true
            }));
        }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setTouched(prev => ({
            ...prev,
            [name]: true
        }));

        const error = validateField(name, value);
        setErrors(prev => ({
            ...prev,
            [name]: error
        }));
    };

    const validateForm = (): boolean => {
        const newErrors: ValidationErrors = {};
        const fields = ['street', 'city', 'country', 'postalCode'] as const;

        fields.forEach(field => {
            const error = validateField(field, address[field]);
            if (error) {
                newErrors[field] = error;
            }
        });

        setErrors(newErrors);
        setTouched(fields.reduce((acc, field) => ({...acc, [field]: true}), {}));

        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (validateForm()) {
            onNext();
        }
    };

    return (
        <Form onSubmit={handleSubmit} className="address-form">
            <Row>
                <Col md={12}>
                    <Form.Group className="mb-4">
                        <Form.Label>Street Address</Form.Label>
                        <Form.Control
                            type="text"
                            name="street"
                            value={address.street}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            isInvalid={touched.street && !!errors.street}
                            placeholder="e.g., 123 Main Street"
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.street}
                        </Form.Control.Feedback>
                        <Form.Text className="text-muted">
                            Enter the complete street address
                        </Form.Text>
                    </Form.Group>
                </Col>
            </Row>

            <Row>
                <Col md={6}>
                    <Form.Group className="mb-4">
                        <Form.Label>City</Form.Label>
                        <Form.Control
                            type="text"
                            name="city"
                            value={address.city}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            isInvalid={touched.city && !!errors.city}
                            placeholder="e.g., Amsterdam"
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.city}
                        </Form.Control.Feedback>
                        <Form.Text className="text-muted">
                            Enter the city name
                        </Form.Text>
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-4">
                        <Form.Label>Country</Form.Label>
                        <Form.Control
                            type="text"
                            name="country"
                            value={address.country}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            isInvalid={touched.country && !!errors.country}
                            placeholder="e.g., Netherlands"
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.country}
                        </Form.Control.Feedback>
                        <Form.Text className="text-muted">
                            Enter the country name
                        </Form.Text>
                    </Form.Group>
                </Col>
            </Row>

            <Row>
                <Col md={6}>
                    <Form.Group className="mb-4">
                        <Form.Label>Postal Code</Form.Label>
                        <Form.Control
                            type="text"
                            name="postalCode"
                            value={address.postalCode}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            isInvalid={touched.postalCode && !!errors.postalCode}
                            placeholder="e.g., 1234 AB"
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.postalCode}
                        </Form.Control.Feedback>
                        <Form.Text className="text-muted">
                            Enter the postal/zip code
                        </Form.Text>
                    </Form.Group>
                </Col>
            </Row>

            <div className="step-navigation">
                <Button
                    variant="outline-secondary"
                    onClick={onBack}
                    className="px-4"
                >
                    Back
                </Button>
                <Button
                    type="submit"
                    variant="primary"
                    className="px-4"
                >
                    Continue to Amenities
                </Button>
            </div>
        </Form>
    );
};

export default AddressStep;