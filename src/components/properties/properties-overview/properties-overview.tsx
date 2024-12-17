import React, { useState, useMemo } from 'react';
import { Container, Row, Col, Pagination } from 'react-bootstrap';
import { PropertyResponse } from '../../../models/Property';
import PropertyCard from '../property-card/property-card.tsx';
import './properties-overview.scss';

interface PropertyOverviewProps {
    properties: PropertyResponse[];
    propertiesPerPage?: number;
    className?: string;
}

const PropertyOverview: React.FC<PropertyOverviewProps> = ({
                                                               properties,
                                                               propertiesPerPage = 6,
                                                               className = ''
                                                           }) => {
    const [currentPage, setCurrentPage] = useState(1);

    // Validate and constrain propertiesPerPage
    const validatedPropertiesPerPage = useMemo(() => {
        const MIN_PROPERTIES = 3;
        const MAX_PROPERTIES = 12;
        return Math.min(Math.max(propertiesPerPage, MIN_PROPERTIES), MAX_PROPERTIES);
    }, [propertiesPerPage]);

    // Calculate total pages
    const totalPages = Math.ceil(properties.length / validatedPropertiesPerPage);

    // Get current properties
    const currentProperties = useMemo(() => {
        const indexOfLastProperty = currentPage * validatedPropertiesPerPage;
        const indexOfFirstProperty = indexOfLastProperty - validatedPropertiesPerPage;
        return properties.slice(indexOfFirstProperty, indexOfLastProperty);
    }, [properties, currentPage, validatedPropertiesPerPage]);

    // Handle page change
    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
        // Scroll to top of container
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Generate pagination items
    const renderPaginationItems = () => {
        const items = [];
        const MAX_VISIBLE_PAGES = 5;

        // Always show first page
        items.push(
            <Pagination.Item
                key={1}
                active={currentPage === 1}
                onClick={() => handlePageChange(1)}
            >
                1
            </Pagination.Item>
        );

        // Calculate range of pages to show
        let startPage = Math.max(2, currentPage - Math.floor(MAX_VISIBLE_PAGES / 2));
        const endPage = Math.min(totalPages - 1, startPage + MAX_VISIBLE_PAGES - 3);

        // Adjust start if we're near the end
        if (totalPages - 1 - endPage < 1) {
            startPage = Math.max(2, totalPages - MAX_VISIBLE_PAGES + 1);
        }

        // Add ellipsis after first page if needed
        if (startPage > 2) {
            items.push(<Pagination.Ellipsis key="ellipsis1" disabled />);
        }

        // Add middle pages
        for (let i = startPage; i <= endPage; i++) {
            items.push(
                <Pagination.Item
                    key={i}
                    active={currentPage === i}
                    onClick={() => handlePageChange(i)}
                >
                    {i}
                </Pagination.Item>
            );
        }

        // Add ellipsis before last page if needed
        if (endPage < totalPages - 1) {
            items.push(<Pagination.Ellipsis key="ellipsis2" disabled />);
        }

        // Always show last page if there's more than one page
        if (totalPages > 1) {
            items.push(
                <Pagination.Item
                    key={totalPages}
                    active={currentPage === totalPages}
                    onClick={() => handlePageChange(totalPages)}
                >
                    {totalPages}
                </Pagination.Item>
            );
        }

        return items;
    };

    return (
        <Container fluid className={`property-overview ${className}`}>
            <Row className="g-4">
                {currentProperties.map((property) => (
                    <Col key={property.id} xs={12} md={6} lg={4} xxl={3}>
                        <PropertyCard property={property} />
                    </Col>
                ))}
            </Row>

            {totalPages > 1 && (
                <Row className="mt-4 mb-3">
                    <Col className="d-flex justify-content-center">
                        <Pagination>
                            <Pagination.Prev
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                            />
                            {renderPaginationItems()}
                            <Pagination.Next
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            />
                        </Pagination>
                    </Col>
                </Row>
            )}
        </Container>
    );
};

export default PropertyOverview;