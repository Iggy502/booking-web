import React, {useState, useMemo} from 'react';
import {Container, Row, Col, Pagination} from 'react-bootstrap';
import {PropertyResponse} from '../../../models/Property';
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

    const PAGINATION_CONFIG = {
        MIN_PER_PAGE: 3,
        MAX_PER_PAGE: 12,
        VISIBLE_PAGE_NUMBERS: 3  // Number of page numbers to show between first and last
    };

    // Validate properties per page
    const validatedPropertiesPerPage = useMemo(() => (
        Math.min(Math.max(propertiesPerPage, PAGINATION_CONFIG.MIN_PER_PAGE), PAGINATION_CONFIG.MAX_PER_PAGE)
    ), [propertiesPerPage]);

    // Calculate total pages
    const totalPages = Math.ceil(properties.length / validatedPropertiesPerPage);

    // Get current page's properties
    const currentProperties = useMemo(() => {
        const startIndex = (currentPage - 1) * validatedPropertiesPerPage;
        const endIndex = startIndex + validatedPropertiesPerPage;
        return properties.slice(startIndex, endIndex);
    }, [properties, currentPage, validatedPropertiesPerPage]);

    // Handle page navigation
    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
        window.scrollTo({top: 0, behavior: 'smooth'});
    };

    // Generate array of page numbers to display
    const getVisiblePageNumbers = () => {
        if (totalPages <= PAGINATION_CONFIG.VISIBLE_PAGE_NUMBERS + 2) {
            // If few pages, show all
            return Array.from({length: totalPages}, (_, i) => i + 1);
        }

        const pageNumbers: (number | 'ellipsis')[] = [1];
        const middleStart = Math.max(2, Math.min(
            currentPage - 1,
            totalPages - PAGINATION_CONFIG.VISIBLE_PAGE_NUMBERS
        ));
        const middleEnd = Math.min(
            middleStart + PAGINATION_CONFIG.VISIBLE_PAGE_NUMBERS - 1,
            totalPages - 1
        );

        // Add first ellipsis if needed
        if (middleStart > 2) {
            pageNumbers.push('ellipsis');
        }

        // Add middle pages
        for (let i = middleStart; i <= middleEnd; i++) {
            pageNumbers.push(i);
        }

        // Add last ellipsis if needed
        if (middleEnd < totalPages - 1) {
            pageNumbers.push('ellipsis');
        }

        // Add last page
        pageNumbers.push(totalPages);

        return pageNumbers;
    };

    const renderPaginationItems = () => {
        return getVisiblePageNumbers().map((pageNumber, index) => {
            if (pageNumber === 'ellipsis') {
                return <Pagination.Ellipsis key={`ellipsis-${index}`} disabled/>;
            }

            return (
                <Pagination.Item
                    key={pageNumber}
                    active={currentPage === pageNumber}
                    onClick={() => handlePageChange(pageNumber)}
                >
                    {pageNumber}
                </Pagination.Item>
            );
        });
    };

    return (
        <Container fluid className={`property-overview ${className}`}>
            {properties.length ? (
                <>
                    <Row className="g-4">
                        {currentProperties.map((property) => (
                            <Col key={property.id} xs={12} md={6} lg={4} xxl={3}>
                                <PropertyCard property={property}/>
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
                </>
            ) : (
                <h1 className="text-center">No properties found</h1>
            )}
        </Container>
    );
};

export default PropertyOverview;