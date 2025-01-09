import React, {useEffect, useState} from 'react';
import {Col, Form, Row, Spinner, Button} from 'react-bootstrap';
import {IAddress} from '../../../../../models/Property.ts';
import {getPlaces, MapboxFeature} from '../../../../../services/Mapbox.ts';
import './AddressStep.scss';

interface AddressStepProps {
    address: IAddress;
    onUpdate: (address: IAddress) => void;
    onNextAction?: { actionName: string, action: () => void };
    onBackAction?: { actionName: string, action: () => void };
    readOnlyOptions?: Record<keyof Omit<IAddress, 'latitude' | 'longitude'>, boolean>;
}

interface ValidationErrors {
    street?: string;
    city?: string;
    country?: string;
    postalCode?: string;
    combination?: string;
}

const AddressStep: React.FC<AddressStepProps> = ({
                                                     address,
                                                     onUpdate,
                                                     onNextAction,
                                                     onBackAction,
                                                     readOnlyOptions
                                                 }) => {
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [suggestions, setSuggestions] = useState<MapboxFeature[]>([]);
    const [activeSuggestionField, setActiveSuggestionField] = useState<string | null>(null);
    const [isValidatingAddress, setIsValidatingAddress] = useState(false);

    useEffect(() => {
        const validateAddressCombination = async () => {
            if (address.street && address.city && address.country && address.postalCode) {
                setIsValidatingAddress(true);
                const query = `${address.street}, ${address.city}, ${address.country}, ${address.postalCode}`;
                const places = await getPlaces(query);

                const isValid = places.some(place =>
                    place.place_name.toLowerCase().includes(address.street.toLowerCase()) &&
                    place.place_name.toLowerCase().includes(address.city.toLowerCase()) &&
                    place.place_name.toLowerCase().includes(address.country.toLowerCase()) &&
                    place.place_name.toLowerCase().includes(address.postalCode.toLowerCase())
                );

                setErrors(prev => ({
                    ...prev,
                    combination: isValid ? undefined :
                        'This address combination could not be verified. Please check all fields.'
                }));
                setIsValidatingAddress(false);
            }
        };

        if (errors.street || errors.city || errors.country || errors.postalCode) {
            if(errors.combination) {
                delete errors.combination;
            }
            return;
        }

        const timeoutId = setTimeout(validateAddressCombination, 1000);
        return () => clearTimeout(timeoutId);
    }, [address.street, address.city, address.country, address.postalCode, errors.street, errors.city, errors.country, errors.postalCode]);

    const validateField = (name: string, value: string): string | undefined => {
        switch (name) {
            case 'street': {
                if (!value.trim()) return 'Street is required';
                if (value.length < 5) return 'Street must be at least 5 characters';
                if (value.length > 100) return 'Street must be less than 100 characters';
                const streetRegex = /^[a-zA-Z\s]+\s\d+$/;
                if (!streetRegex.test(value)) return 'Street must contain a name and a number';
                return undefined;
            }
            case 'city': {
                if (!value.trim()) return 'City is required';
                if (value.length < 2) return 'City must be at least 2 characters';
                if (value.length > 50) return 'City must be less than 50 characters';
                return undefined;
            }
            case 'country': {
                if (!value.trim()) return 'Country is required';
                if (value.length < 2) return 'Country must be at least 2 characters';
                if (value.length > 50) return 'Country must be less than 50 characters';
                return undefined;
            }
            case 'postalCode': {
                if (!value.trim()) return 'Postal code is required';
                const belgianPostalCodeRegex = /^\d{4}$/;
                if (!belgianPostalCodeRegex.test(value)) return 'Postal code must be a 4-digit number';
                return undefined;
            }
            default:
                return undefined;
        }
    };

    const getFilteredSuggestions = async (query: string, type: string) => {
        if (query.length > 2) {
            const places = await getPlaces(query);
            switch (type) {
                case 'street':
                    return places.filter(p => p.place_type.includes('address'));
                case 'city':
                    return places.filter(p => p.place_type.includes('place'));
                case 'country':
                    return places.filter(p => p.place_type.includes('country'));
                default:
                    return places;
            }
        }
        return [];
    };

    const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;

        onUpdate({
            ...address,
            [name]: value
        });

        if (!readOnlyOptions?.[name as keyof Omit<IAddress, 'latitude' | 'longitude'>]) {
            const newSuggestions = await getFilteredSuggestions(value, name);
            setSuggestions(newSuggestions);
            setActiveSuggestionField(name);
        }

        const error = validateField(name, value);
        setErrors(prev => ({
            ...prev,
            [name]: error
        }));

        if (!touched[name]) {
            setTouched(prev => ({
                ...prev,
                [name]: true
            }));
        }
    };

    const handleSuggestionClick = (suggestion: MapboxFeature) => {
        if (!activeSuggestionField) return;

        let value = '';
        switch (activeSuggestionField) {
            case 'street':
                value = suggestion.place_name.split(',')[0];
                break;
            case 'city':
            case 'country':
                value = suggestion.place_name.split(',')[0];
                break;
        }

        onUpdate({
            ...address,
            [activeSuggestionField]: value
        });

        setSuggestions([]);
        setActiveSuggestionField(null);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setTimeout(() => {
            setSuggestions([]);
            setActiveSuggestionField(null);
        }, 200);

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

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!validateForm()) return;

        if (errors.combination) {
            const confirmProceed = window.confirm(
                'We could not verify this address combination. Do you want to proceed anyway?'
            );
            if (!confirmProceed) return;
        }

        if (onNextAction) {
            onNextAction.action();
        }
    };

    return (
        <Form onSubmit={handleSubmit} className="address-form">
            <Row>
                <Col md={12}>
                    <Form.Group className="mb-4 position-relative">
                        <Form.Label>Street Address</Form.Label>
                        <Form.Control
                            type="text"
                            name="street"
                            value={address.street}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            isInvalid={touched.street && !!errors.street}
                            placeholder="e.g., 123 Main Street"
                            readOnly={readOnlyOptions?.street}
                            plaintext={readOnlyOptions?.street}
                        />
                        {!readOnlyOptions?.street && activeSuggestionField === 'street' && suggestions.length > 0 && (
                            <ul className="suggestions-list">
                                {suggestions.map((suggestion, index) => (
                                    <li
                                        key={index}
                                        onClick={() => handleSuggestionClick(suggestion)}
                                    >
                                        {suggestion.place_name}
                                    </li>
                                ))}
                            </ul>
                        )}
                        <Form.Control.Feedback type="invalid">
                            {errors.street}
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>
            </Row>

            <Row>
                <Col md={6}>
                    <Form.Group className="mb-4 position-relative">
                        <Form.Label>City</Form.Label>
                        <Form.Control
                            type="text"
                            name="city"
                            value={address.city}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            isInvalid={touched.city && !!errors.city}
                            placeholder="e.g., Amsterdam"
                            readOnly={readOnlyOptions?.city}
                            plaintext={readOnlyOptions?.city}
                        />
                        {!readOnlyOptions?.city && activeSuggestionField === 'city' && suggestions.length > 0 && (
                            <ul className="suggestions-list">
                                {suggestions.map((suggestion, index) => (
                                    <li
                                        key={index}
                                        onClick={() => handleSuggestionClick(suggestion)}
                                    >
                                        {suggestion.place_name}
                                    </li>
                                ))}
                            </ul>
                        )}
                        <Form.Control.Feedback type="invalid">
                            {errors.city}
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-4 position-relative">
                        <Form.Label>Country</Form.Label>
                        <Form.Control
                            type="text"
                            name="country"
                            value={address.country}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            isInvalid={touched.country && !!errors.country}
                            placeholder="e.g., Netherlands"
                            readOnly={readOnlyOptions?.country}
                            plaintext={readOnlyOptions?.country}
                        />
                        {!readOnlyOptions?.country && activeSuggestionField === 'country' && suggestions.length > 0 && (
                            <ul className="suggestions-list">
                                {suggestions.map((suggestion, index) => (
                                    <li
                                        key={index}
                                        onClick={() => handleSuggestionClick(suggestion)}
                                    >
                                        {suggestion.place_name}
                                    </li>
                                ))}
                            </ul>
                        )}
                        <Form.Control.Feedback type="invalid">
                            {errors.country}
                        </Form.Control.Feedback>
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
                            placeholder="e.g., 1234"
                            readOnly={readOnlyOptions?.postalCode}
                            plaintext={readOnlyOptions?.postalCode}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.postalCode}
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>
            </Row>

            {isValidatingAddress && (
                <div className="validation-status">
                    <Spinner animation="border" size="sm"/>
                    Verifying address...
                </div>
            )}

            {errors.combination && !isValidatingAddress && (
                <div className="address-warning">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    {errors.combination}
                </div>
            )}


            <div className="step-navigation">
                {onBackAction && (
                    <Button
                        variant="outline-secondary"
                        onClick={onBackAction.action}
                        className="px-4"
                    >
                        {onBackAction.actionName}
                    </Button>
                )}
                {onNextAction && (
                    <Button
                        type="submit"
                        variant="primary"
                        className="px-4"
                    >
                        {onNextAction.actionName}
                    </Button>
                )}
            </div>

        </Form>
    );
};

export default AddressStep;