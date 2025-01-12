import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {Alert, Button, Card, Col, Container, Row, Tab, Tabs} from 'react-bootstrap';
import {PropertyViewModel} from '../../../models/Property';
import {getAmenityIcon, PropertyService} from "../../../services/property-service";
import {useError} from '../../../context/error.context';
import PropertyRatings from './ratings/property-ratings-component.tsx';
import './property-detail-component.scss';

const PropertyDetailComponent: React.FC = () => {
    const {id} = useParams<{ id: string }>();
    const navigate = useNavigate();
    const {showError} = useError();
    const [property, setProperty] = useState<PropertyViewModel | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('details');

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
                <Alert variant="danger">Property not found</Alert>
            </Container>
        );
    }

    const DetailItem = ({label, value}: { label: string; value: React.ReactNode }) => (
        <div className="mb-3">
            <div className="text-muted small">{label}</div>
            <div className="fw-medium">{value}</div>
        </div>
    );

    return (
        <Container className="property-detail py-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>{property.name}</h1>
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
                        onClick={() => navigate('/properties/list')}
                    >
                        Back to Properties
                    </Button>
                </div>
            </div>

            <Tabs
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k || 'details')}
                className="mb-4"
            >
                <Tab eventKey="details" title="Details">
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

                    <Card className="mb-4">
                        <Card.Header>
                            <h4 className="mb-0">Basic Information</h4>
                        </Card.Header>
                        <Card.Body>
                            <Row className="g-4">
                                <Col md={6}>
                                    <DetailItem label="Property Name" value={property.name}/>
                                </Col>
                                <Col md={6}>
                                    <DetailItem label="Price per Night" value={`€${property.pricePerNight}`}/>
                                </Col>
                                <Col md={6}>
                                    <DetailItem label="Maximum Guests" value={property.maxGuests}/>
                                </Col>
                                <Col md={6}>
                                    <DetailItem
                                        label="Status"
                                        value={
                                            <span className={`badge bg-${property.available ? 'success' : 'danger'}`}>
                                                {property.available ? 'Available' : 'Unavailable'}
                                            </span>
                                        }
                                    />
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>

                    <Card className="mb-4">
                        <Card.Header>
                            <h4 className="mb-0">Location</h4>
                        </Card.Header>
                        <Card.Body>
                            <Row className="g-4">
                                <Col md={6}>
                                    <DetailItem label="Street" value={property.address.street}/>
                                </Col>
                                <Col md={6}>
                                    <DetailItem label="City" value={property.address.city}/>
                                </Col>
                                <Col md={6}>
                                    <DetailItem label="Country" value={property.address.country}/>
                                </Col>
                                <Col md={6}>
                                    <DetailItem label="Postal Code" value={property.address.postalCode}/>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>

                    <Card className="mb-4">
                        <Card.Header>
                            <h4 className="mb-0">Description</h4>
                        </Card.Header>
                        <Card.Body>
                            <p className="mb-0">{property.description}</p>
                        </Card.Body>
                    </Card>

                    <Card className="mb-4">
                        <Card.Header>
                            <h4 className="mb-0">Amenities</h4>
                        </Card.Header>
                        <Card.Body>
                            <Row className="g-3">
                                {property.amenities?.map((amenity, index) => (
                                    <Col key={index} md={4}>
                                        <div className="amenity-item d-flex align-items-center">
                                            <i className={`fas ${getAmenityIcon(amenity.type)} me-2`}></i>
                                            <div>
                                                <div>{amenity.type.replace(/([A-Z])/g, ' $1').trim()}</div>
                                                {(amenity.description || amenity.amount) && (
                                                    <small className="text-muted">
                                                        {amenity.description}
                                                        {amenity.amount && (
                                                            <span className="ms-1">(Quantity: {amenity.amount})</span>
                                                        )}
                                                    </small>
                                                )}
                                            </div>
                                        </div>
                                    </Col>
                                ))}
                            </Row>
                        </Card.Body>
                    </Card>
                </Tab>
                <Tab eventKey="reviews" title={`Reviews (${property.totalRatings || 0})`}>
                    <PropertyRatings propertyId={property.id}/>
                </Tab>
            </Tabs>
        </Container>
    );
};

export default PropertyDetailComponent;