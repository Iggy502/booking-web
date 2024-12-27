import React, {useState} from 'react';
import './BasicInfoStep.scss';
import {Button, Col, Form, Row} from 'react-bootstrap';
import {PropertyCreate} from '../../../../models/Property';


interface BasicInfoStepProps {
    property: Omit<PropertyCreate, 'owner'>;
    onUpdate: (updates: Partial<PropertyCreate>) => void;
    onNext: () => void;
}

interface ValidationErrors {
    name?: string;
    description?: string;
    pricePerNight?: string;
    maxGuests?: string;
}

const BasicInfoStep: React.FC<BasicInfoStepProps> = ({property, onUpdate, onNext}) => {
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [errors, setErrors] = useState<ValidationErrors>({});

    const validateField = (name: string, value: PropertyCreate[keyof PropertyCreate]): string | undefined => {


        switch (name) {
            case 'name': {
                const name = value as string;

                if (!name.trim()) return 'Property name is required';
                if (name.length < 3) return 'Property name must be at least 3 characters';
                if (name.length > 50) return 'Property name must be less than 50 characters';
                return undefined;
            }

            case 'description': {
                const description = value as string;

                if (!description.trim()) return 'Description is required';
                if (description.length < 20) return 'Description must be at least 20 characters';
                if (description.length > 1000) return 'Description must be less than 1000 characters';
                return undefined;
            }

            case 'pricePerNight': {
                const price = value as number;

                if (!price) return 'Price is required';
                if (isNaN(price) || price <= 0) return 'Price must be greater than 0';
                if (price > 10000) return 'Price must be less than 10,000';
                return undefined;
            }

            case 'maxGuests': {
                const maxGuests = value as number;

                if (!maxGuests) return 'Maximum guests is required';
                if (isNaN(maxGuests) || maxGuests < 1) return 'At least 1 guest must be allowed';
                if (maxGuests > 20) return 'Maximum 20 guests allowed';
                return undefined;
            }

            default:
                return undefined;
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const {name, value} = e.target;

        // Update the property value
        const newValue = name === 'pricePerNight' || name === 'maxGuests'
            ? parseFloat(value) || 0
            : value;

        onUpdate({[name]: newValue});

        // Validate the field
        const error = validateField(name, newValue);
        setErrors(prev => ({
            ...prev,
            [name]: error
        }));

        // Mark field as touched
        if (!touched[name]) {
            setTouched(prev => ({
                ...prev,
                [name]: true
            }));
        }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
        const fields = ['name', 'description', 'pricePerNight', 'maxGuests'];

        fields.forEach(field => {
            const value = property[field as keyof typeof property];
            const error = validateField(field, value);
            if (error) {
                newErrors[field as keyof ValidationErrors] = error;
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
        <Form onSubmit={handleSubmit} className="basic-info-form">
            <Row>
                <Col md={6}>
                    <Form.Group className="mb-4">
                        <Form.Label>Property Name</Form.Label>
                        <Form.Control
                            type="text"
                            name="name"
                            value={property.name}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            isInvalid={touched.name && !!errors.name}
                            placeholder="e.g., Seaside Villa"
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.name}
                        </Form.Control.Feedback>
                        <Form.Text className="text-muted">
                            Choose a unique and descriptive name for your property
                        </Form.Text>
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-4">
                        <Form.Label>Price per Night (€)</Form.Label>
                        <Form.Control
                            type="number"
                            name="pricePerNight"
                            value={property.pricePerNight || ''}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            isInvalid={touched.pricePerNight && !!errors.pricePerNight}
                            min="0"
                            step="0.01"
                            placeholder="e.g., 150"
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.pricePerNight}
                        </Form.Control.Feedback>
                        <Form.Text className="text-muted">
                            Set your nightly rate in euros
                        </Form.Text>
                    </Form.Group>
                </Col>
            </Row>

            <Form.Group className="mb-4">
                <Form.Label>Description</Form.Label>
                <Form.Control
                    as="textarea"
                    name="description"
                    value={property.description}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    isInvalid={touched.description && !!errors.description}
                    rows={4}
                    placeholder="Describe your property's unique features, location, and amenities..."
                />
                <Form.Control.Feedback type="invalid">
                    {errors.description}
                </Form.Control.Feedback>
                <Form.Text className="text-muted">
                    Minimum 20 characters. Include key features and what makes your property special
                </Form.Text>
            </Form.Group>

            <Form.Group className="mb-4">
                <Form.Label>Maximum Guests</Form.Label>
                <Form.Control
                    type="number"
                    name="maxGuests"
                    value={property.maxGuests || ''}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    isInvalid={touched.maxGuests && !!errors.maxGuests}
                    min="1"
                    placeholder="e.g., 4"
                />
                <Form.Control.Feedback type="invalid">
                    {errors.maxGuests}
                </Form.Control.Feedback>
                <Form.Text className="text-muted">
                    Maximum number of guests allowed to stay
                </Form.Text>
            </Form.Group>

            <div className="step-navigation">
                <div>{/* Empty div for spacing */}</div>
                <Button
                    type="submit"
                    variant="primary"
                    className="px-4"
                >
                    Continue to Address
                </Button>
            </div>
        </Form>
    );
};

export default BasicInfoStep;