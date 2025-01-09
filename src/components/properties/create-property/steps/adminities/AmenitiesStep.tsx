import React, {useState} from 'react';
import {Button, Card, Col, Form, Row} from 'react-bootstrap';
import {AmenityType, IAmenity} from '../../../../../models/Property.ts';
import './AmenitiesStep.scss';

interface AmenitiesStepProps {
    amenities: IAmenity[];
    onUpdate: (amenities: IAmenity[]) => void;
    onNextAction?: { actionName: string, action: () => void };
    onBackAction?: { actionName: string, action: () => void };
    readOnly?: boolean;
}

interface ValidationErrors {
    [key: string]: string | undefined;
}

const AmenitiesStep: React.FC<AmenitiesStepProps> = ({
                                                         amenities,
                                                         onUpdate,
                                                         onNextAction,
                                                         onBackAction,
                                                         readOnly = false
                                                     }) => {
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [errors, setErrors] = useState<ValidationErrors>({});

    // Create a map of selected amenities for easier lookup
    const selectedAmenities = new Map(
        amenities.map(amenity => [amenity.type, amenity.description])
    );

    const validateDescription = (description: string): string | undefined => {
        if (!description.trim()) {
            return 'Description is required for selected amenity';
        }
        if (description.length < 10) {
            return 'Description must be at least 10 characters';
        }
        if (description.length > 200) {
            return 'Description must be less than 200 characters';
        }
        return undefined;
    };

    const handleAmenityToggle = (type: AmenityType) => {
        if (readOnly) return;

        let newAmenities: IAmenity[];

        if (selectedAmenities.has(type)) {
            newAmenities = amenities.filter(a => a.type !== type);
            // Remove error if it exists
            setErrors(prev => {
                const newErrors = {...prev};
                delete newErrors[type];
                return newErrors;
            });
        } else {
            // Add amenity with empty description
            newAmenities = [...amenities, {type, description: ''}];
        }

        onUpdate(newAmenities);
    };

    const handleDescriptionChange = (type: AmenityType, description: string) => {
        if (readOnly) return;

        const newAmenities = amenities.map(amenity =>
            amenity.type === type ? {...amenity, description} : amenity
        );

        // Validate and set error
        const error = validateDescription(description);
        setErrors(prev => ({
            ...prev,
            [type]: error
        }));

        onUpdate(newAmenities);

        // Mark as touched
        if (!touched[type]) {
            setTouched(prev => ({
                ...prev,
                [type]: true
            }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: ValidationErrors = {};
        let hasErrors = false;

        amenities.forEach(amenity => {
            const error = validateDescription(amenity.description);
            if (error) {
                newErrors[amenity.type] = error;
                hasErrors = true;
            }
        });

        setErrors(newErrors);
        // Mark all as touched
        const newTouched = amenities.reduce((acc, amenity) => ({
            ...acc,
            [amenity.type]: true
        }), {});
        setTouched(newTouched);

        return !hasErrors;
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (validateForm() && onNextAction) {
            onNextAction.action();
        }
    };

    // Group amenities by category
    const amenityCategories = {
        'Essential Amenities': [AmenityType.Wifi, AmenityType.Parking],
        'Leisure & Recreation': [AmenityType.Pool, AmenityType.Gym, AmenityType.Spa],
        'Food & Beverage': [AmenityType.Restaurant, AmenityType.Bar, AmenityType.RoomService],
        'Additional Services': [AmenityType.PetFriendly]
    };

    return (
        <Form onSubmit={handleSubmit} className="amenities-form">
            <div className="mb-4">
                <p className="text-muted">
                    Select and describe the amenities available at your property.
                    {!readOnly && ' Detailed descriptions help guests understand what to expect.'}
                </p>
            </div>

            {Object.entries(amenityCategories).map(([category, categoryAmenities]) => (
                <Card key={category} className="mb-4">
                    <Card.Header>{category}</Card.Header>
                    <Card.Body>
                        <Row className="g-3">
                            {categoryAmenities.map(amenityType => (
                                <Col md={6} key={amenityType}>
                                    <div className="amenity-item">
                                        <Form.Check
                                            type="checkbox"
                                            id={`amenity-${amenityType}`}
                                            label={amenityType.replace(/([A-Z])/g, ' $1').trim()}
                                            checked={selectedAmenities.has(amenityType)}
                                            onChange={() => handleAmenityToggle(amenityType)}
                                            disabled={readOnly}
                                            className="mb-2"
                                        />
                                        {selectedAmenities.has(amenityType) && (
                                            <Form.Group>
                                                <Form.Control
                                                    as="textarea"
                                                    rows={2}
                                                    placeholder={`Describe your ${amenityType.toLowerCase()} amenity...`}
                                                    value={selectedAmenities.get(amenityType) || ''}
                                                    onChange={(e) => handleDescriptionChange(amenityType, e.target.value)}
                                                    isInvalid={touched[amenityType] && !!errors[amenityType]}
                                                    readOnly={readOnly}
                                                    plaintext={readOnly}
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors[amenityType]}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        )}
                                    </div>
                                </Col>
                            ))}
                        </Row>
                    </Card.Body>
                </Card>
            ))}

            {(onNextAction || onBackAction) && (
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
            )}
        </Form>
    );
};

export default AmenitiesStep;