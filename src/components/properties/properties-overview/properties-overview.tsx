import React, {useMemo, useState} from 'react';
import {Badge, Card, Carousel, Col, Pagination, Row} from 'react-bootstrap';
import {Property} from '../../../models/Property';
import './properties-overview.scss';

interface PropertyOverviewProps {
    properties: Property[];
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
    const totalPages = Math.ceil(properties.length / propertiesPerPage);


    const handlePageChange = (pageNumber: number) => {
        setActivePage(pageNumber);
    };


    const startIndex = (activePage - 1) * propertiesPerPage;
    const visibleProperties = properties.slice(startIndex, startIndex + propertiesPerPage);

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
                        <Card
                            className={`h-100 property-card ${selectedPropertyId === property.id ? 'selected' : ''}`}
                            onClick={(e) => {
                                if (!(e.target as HTMLElement).closest('.carousel-control-next, .carousel-control-prev')) {
                                    onPropertySelect?.(property.id);
                                }
                            }}
                            role="button"
                        >
                            <div className="card-img-wrapper">
                                <Carousel interval={null}>
                                    {property.imagePaths?.slice(0, 3).map((imagePath, index) => (
                                        <Carousel.Item key={index}>
                                            <Card.Img
                                                variant="top"
                                                src={imagePath || '/placeholder-image.jpg'}
                                                alt={`${property.name} image ${index + 1}`}
                                            />
                                        </Carousel.Item>
                                    ))}
                                </Carousel>
                                {selectedPropertyId === property.id && (
                                    <div className="selected-overlay">
                                        <i className="fas fa-check-circle"></i>
                                    </div>
                                )}
                                <Badge
                                    bg="primary"
                                    className="price-badge"
                                >
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
                                            {amenity.type}
                                        </span>
                                    ))}
                                    {(property.amenities?.length || 0) > 3 && (
                                        <span className="amenity-badge more">
                                            +{(property.amenities?.length || 0) - 3} more
                                        </span>
                                    )}
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