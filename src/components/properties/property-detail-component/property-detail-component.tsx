import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Alert, Button, Card, Col, Container, Form, Row } from 'react-bootstrap';
import {AmenityType, Property} from '../../../models/Property';
import { PropertyService } from '../../../services/property-service';
import { useError } from '../../../context/error.context';
import './property-detail-component.scss';



const getAmenityIcon = (type: AmenityType): string => {
    const icons: Record<AmenityType, string> = {
        [AmenityType.Wifi]: 'fa-wifi',
        [AmenityType.Parking]: 'fa-parking',
        [AmenityType.Pool]: 'fa-swimming-pool',
        [AmenityType.Gym]: 'fa-dumbbell',
        [AmenityType.Restaurant]: 'fa-utensils',
        [AmenityType.Bar]: 'fa-martini-glass',
        [AmenityType.Spa]: 'fa-spa',
        [AmenityType.PetFriendly]: 'fa-paw',
        [AmenityType.RoomService]: 'fa-concierge-bell'
    };
    return icons[type] || 'fa-check';
};

const PropertyDetailComponent: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { showError } = useError();
    const [property, setProperty] = useState<Property | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProperty = async () => {
            if (!id) return;

            try {
                const fetchedProperty = await PropertyService.fetchPropertyById(id);
                setProperty(fetchedProperty);
            } catch (error: any) {
                showError(error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProperty();
    }, [id, showError]);

    if (isLoading) {
        return (
            <Container className="py-5 text-center">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </Container>
        );
    }

    if (!property) {
        return (
            <Container className="py-5">
                <Alert variant="danger">
                    Property not found
                </Alert>
            </Container>
        );
    }

    return (
        <Container className="property-detail py-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Property Details</h1>
                <div>
                    <Button
                        variant="outline-primary"
                        className="me-2"
                        onClick={() => navigate(`/properties/edit/${id}`)}
                    >
                        Edit Property
                    </Button>
                    <Button
                        variant="outline-secondary"
                        onClick={() => navigate('/properties')}
                    >
                        Back to Properties
                    </Button>
                </div>
            </div>

            {/* Basic Information */}
            <Card className="mb-4">
                <Card.Header>
                    <h4 className="mb-0">Basic Information</h4>
                </Card.Header>
                <Card.Body>
                    <Row className="g-3">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Property Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={property.name}
                                    readOnly
                                    plaintext
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Price per Night (€)</Form.Label>
                                <Form.Control
                                    type="number"
                                    value={property.pricePerNight}
                                    readOnly
                                    plaintext
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Maximum Guests</Form.Label>
                                <Form.Control
                                    type="number"
                                    value={property.maxGuests}
                                    readOnly
                                    plaintext
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Status</Form.Label>
                                <div>
                                    <span className={`badge bg-${property.available ? 'success' : 'danger'}`}>
                                        {property.available ? 'Available' : 'Unavailable'}
                                    </span>
                                </div>
                            </Form.Group>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Address Information */}
            <Card className="mb-4">
                <Card.Header>
                    <h4 className="mb-0">Location</h4>
                </Card.Header>
                <Card.Body>
                    <Row className="g-3">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Street</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={property.address.street}
                                    readOnly
                                    plaintext
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>City</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={property.address.city}
                                    readOnly
                                    plaintext
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>State/Province</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={property.address.postalCode}
                                    readOnly
                                    plaintext
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Country</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={property.address.country}
                                    readOnly
                                    plaintext
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Postal Code</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={property.address.postalCode}
                                    readOnly
                                    plaintext
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Description */}
            <Card className="mb-4">
                <Card.Header>
                    <h4 className="mb-0">Description</h4>
                </Card.Header>
                <Card.Body>
                    <Form.Group>
                        <Form.Control
                            as="textarea"
                            value={property.description}
                            readOnly
                            plaintext
                        />
                    </Form.Group>
                </Card.Body>
            </Card>

            {/* Amenities */}
            <Card className="mb-4">
                <Card.Header>
                    <h4 className="mb-0">Amenities</h4>
                </Card.Header>
                <Card.Body>
                    <Row className="g-3">
                        {property.amenities?.map((amenity, index) => (
                            <Col key={index} md={4}>
                                <div className="d-flex align-items-center">
                                    <i className={`fas ${getAmenityIcon(amenity.type)} me-2`}></i>
                                    <div>
                                        <div>{amenity.type.replace(/([A-Z])/g, ' $1').trim()}</div>
                                        {amenity.description && (
                                            <small className="text-muted">
                                                {amenity.description}
                                            </small>
                                        )}
                                        {amenity.amount && (
                                            <small className="text-muted ms-1">
                                                (Quantity: {amenity.amount})
                                            </small>
                                        )}
                                    </div>
                                </div>
                            </Col>
                        ))}
                    </Row>
                </Card.Body>
            </Card>

            {/* Images */}
            <Card className="mb-4">
                <Card.Header>
                    <h4 className="mb-0">Property Images</h4>
                </Card.Header>
                <Card.Body>
                    <div className="image-grid">
                        {property.imagePaths.map((imagePath, index) => (
                            <div key={index} className="image-container">
                                <img
                                    src={imagePath}
                                    alt={`Property ${index + 1}`}
                                    className="property-image"
                                />
                            </div>
                        ))}
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default PropertyDetailComponent;