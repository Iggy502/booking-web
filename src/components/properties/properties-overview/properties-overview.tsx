import React, {useEffect, useMemo, useState} from 'react';
import {Badge, Card, Carousel, Col, Pagination, Row, Spinner} from 'react-bootstrap';
import {PropertyViewModel} from '../../../models/Property';
import {useNavigate} from 'react-router-dom';
import './properties-overview.scss';

interface PropertyOverviewProps {
    properties: PropertyViewModel[];
    propertiesPerPage: number;
    onPropertySelect?: (propertyId: string) => void;
    selectedPropertyId?: string | null;
}

const PropertyOverview: React.FC<PropertyOverviewProps> = ({
                                                               properties,
                                                               propertiesPerPage,
                                                               onPropertySelect,
                                                               selectedPropertyId
                                                           }) => {
    const [activePage, setActivePage] = useState(1);
    const [imageLoaded, setImageLoaded] = useState<Record<string, boolean>>({});
    const navigate = useNavigate();
    const totalPages = Math.ceil(properties.length / propertiesPerPage);
    const [showSpinners, setShowSpinners] = useState(true);



    const handlePageChange = (pageNumber: number) => {
        setActivePage(pageNumber);
    };

    const startIndex = (activePage - 1) * propertiesPerPage;
    const visibleProperties = properties.slice(startIndex, startIndex + propertiesPerPage);


    useEffect(() => {
        // Reset spinner visibility when properties change
        setShowSpinners(true);

        const timeout = setTimeout(() => {
            setShowSpinners(false);  // Use state instead of ref
        }, 1000);

        return () => {
            clearTimeout(timeout);
        };
    }, [properties]);


    const paginationItems = useMemo(() => {
        if (activePage > totalPages) {
            setActivePage(1);
        }
        const items = [];
        for (let number = 1; number <= totalPages; number++) {
            items.push(
                <Pagination.Item
                    key={number}
                    active={number === activePage}
                    onClick={() => handlePageChange(number)}
                >
                    {number}
                </Pagination.Item>
            );
        }
        return items;
    }, [totalPages, activePage]);

    if (properties.length === 0) {
        return (
            <div className="text-center my-5">
                <i className="fas fa-search fa-3x text-secondary mb-3"></i>
                <h4 className="text-secondary">No properties found matching your criteria</h4>
                <p className="text-muted">Try adjusting your filters or search terms</p>
            </div>
        );
    }

    return (
        <div className="properties-overview">
            <Row xs={1} md={2} lg={3} xl={4} className="g-4">
                {visibleProperties.map((property) => (
                    <Col key={property.id}>
                        <Card className={`h-100 property-card ${selectedPropertyId === property.id ? 'selected' : ''}`}>
                            <div className="card-img-wrapper">
                                <Carousel interval={null}>
                                    {property.imagePaths?.slice(0, 3).map((imagePath, index) => (
                                        <Carousel.Item key={index}>
                                            {!imageLoaded[`${property.id}-${index}`] && showSpinners && (
                                                <div className="spinner-container">
                                                    <Spinner animation="border" role="status">
                                                        <span className="visually-hidden">Loading...</span>
                                                    </Spinner>
                                                </div>
                                            )}
                                            <Card.Img
                                                variant="top"
                                                src={imagePath}
                                                alt={`${property.name} image ${index + 1}`}
                                                onLoad={() => setImageLoaded(prev => ({
                                                    ...prev,
                                                    [`${property.id}-${index}`]: true
                                                }))
                                                }
                                            />
                                        </Carousel.Item>
                                    ))}
                                </Carousel>
                                {selectedPropertyId === property.id && (
                                    <div className="selected-overlay">
                                        <i className="fas fa-check-circle"></i>
                                    </div>
                                )}
                                <Badge bg="primary" className="price-badge">
                                    €{property.pricePerNight}/night
                                </Badge>
                            </div>
                            <Card.Body>
                                <Card.Title className="mb-2">{property.name}</Card.Title>
                                <Card.Text className="location mb-2">
                                    <i className="fas fa-map-marker-alt me-2"></i>
                                    {property.address.city}, {property.address.country}
                                </Card.Text>
                                <Card.Text className="description mb-2 text-muted">
                                    {property.description}
                                </Card.Text>
                                <div className="amenities-preview">
                                    {property.amenities?.slice(0, 3).map((amenity, index) => (
                                        <span key={index} className="amenity-badge">
                                            {amenity.type.replace(/([A-Z])/g, ' $1').trim()}
                                        </span>
                                    ))}
                                    {(property.amenities?.length || 0) > 3 && (
                                        <span className="amenity-badge more">
                                            +{(property.amenities?.length || 0) - 3} more
                                        </span>
                                    )}
                                </div>
                                <div className="mt-3 d-flex gap-2">
                                    <button
                                        className="btn btn-outline-primary btn-sm flex-grow-1"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/properties/${property.id}`);
                                        }}
                                    >
                                        <i className="fas fa-info-circle me-1"></i>
                                        View Details
                                    </button>
                                    <button
                                        className={`btn btn-sm flex-grow-1 ${selectedPropertyId === property.id ? 'btn-primary' : 'btn-outline-secondary'}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onPropertySelect?.(property.id);
                                        }}
                                    >
                                        <i className={`fas ${selectedPropertyId === property.id ? 'fa-check-circle' : 'fa-calendar'} me-1`}></i>
                                        {selectedPropertyId === property.id ? 'Selected' : 'Select'}
                                    </button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-4">
                    <Pagination>
                        <Pagination.Prev
                            onClick={() => handlePageChange(activePage - 1)}
                            disabled={activePage === 1}
                        />
                        {paginationItems}
                        <Pagination.Next
                            onClick={() => handlePageChange(activePage + 1)}
                            disabled={activePage === totalPages}
                        />
                    </Pagination>
                </div>
            )}
        </div>
    );
};

export default PropertyOverview;