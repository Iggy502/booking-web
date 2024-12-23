import React, {useEffect, useMemo, useState} from 'react';
import {Badge, Button, Col, Container, Form, InputGroup, Pagination, Row, Spinner, Table} from 'react-bootstrap';
import {useNavigate} from 'react-router-dom';
import {Property} from '../../../models/Property';
import {PropertyService} from '../../../services/property-service';
import {useError} from '../../../context/error.context';
import {ChevronDown, ChevronUp} from 'lucide-react';
import './my-properties-component.scss';

const ITEMS_PER_PAGE = 10;

type SortField = 'name' | 'pricePerNight' | 'maxGuests' | 'city';
type SortDirection = 'asc' | 'desc';

interface SortConfig {
    field: SortField;
    direction: SortDirection;
}

interface Filters {
    search: string;
    priceMin: string;
    priceMax: string;
    availability: string;
    location: string;
}

const MyPropertiesComponent: React.FC = () => {
    const navigate = useNavigate();
    const {showError} = useError();
    const [properties, setProperties] = useState<Property[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState<SortConfig>({field: 'name', direction: 'asc'});
    const [filters, setFilters] = useState<Filters>({
        search: '',
        priceMin: '',
        priceMax: '',
        availability: 'all',
        location: ''
    });

    const userId = '12345';

    useEffect(() => {
        const fetchProperties = async () => {
            try {
                const userProperties = await PropertyService.fetchPropertiesByOwner(userId);
                setProperties(userProperties);
            } catch (error) {
                showError({
                    status: 500,
                    message: 'Failed to load properties'
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchProperties();
    }, [userId, showError]);

    const handleSort = (field: SortField) => {
        setSortConfig(current => ({
            field,
            direction: current.field === field && current.direction === 'asc' ? 'desc' : 'asc'
        }));
        setCurrentPage(1);
    };

    const handleFilterChange = (field: keyof Filters, value: string) => {

            if (field === 'priceMin' || field === 'priceMax') {
                if ((value && isNaN(parseFloat(value))) || parseFloat(value) < 0) {
                    return;
                }
            }

            setFilters(prev => ({
                ...prev,
                [field]: value
            }));
            setCurrentPage(1);
        }
    ;

    const filteredAndSortedProperties = useMemo(() => {
        let result = [...properties];

        // Apply filters
        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            result = result.filter(property =>
                property.name.toLowerCase().includes(searchTerm) ||
                property.address.city.toLowerCase().includes(searchTerm) ||
                property.address.country.toLowerCase().includes(searchTerm)
            );
        }

        if (filters.priceMin) {
            result = result.filter(property =>
                property.pricePerNight >= parseFloat(filters.priceMin)
            );
        }

        if (filters.priceMax) {
            result = result.filter(property =>
                property.pricePerNight <= parseFloat(filters.priceMax)
            );
        }

        if (filters.availability !== 'all') {
            result = result.filter(property =>
                property.available === (filters.availability === 'available')
            );
        }

        if (filters.location) {
            const locationTerm = filters.location.toLowerCase();
            result = result.filter(property =>
                property.address.city.toLowerCase().includes(locationTerm) ||
                property.address.country.toLowerCase().includes(locationTerm)
            );
        }

        // Apply sorting
        result.sort((a, b) => {
            let compareResult = 0;
            switch (sortConfig.field) {
                case 'name':
                    compareResult = a.name.localeCompare(b.name);
                    break;
                case 'pricePerNight':
                    compareResult = a.pricePerNight - b.pricePerNight;
                    break;
                case 'maxGuests':
                    compareResult = a.maxGuests - b.maxGuests;
                    break;
                case 'city':
                    compareResult = a.address.city.localeCompare(b.address.city);
                    break;
                default:
                    compareResult = 0;
            }
            return sortConfig.direction === 'asc' ? compareResult : -compareResult;
        });

        return result;
    }, [properties, sortConfig, filters]);

    // Pagination logic
    const totalPages = Math.ceil(filteredAndSortedProperties.length / ITEMS_PER_PAGE);
    const paginatedProperties = filteredAndSortedProperties.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const renderSortIcons = (field: SortField) => {
        const isActive = sortConfig.field === field;
        return (
            <div className="sort-icons">
                <ChevronUp
                    className={isActive && sortConfig.direction === 'asc' ? 'active' : ''}
                />
                <ChevronDown
                    className={isActive && sortConfig.direction === 'desc' ? 'active' : ''}
                />
            </div>
        );
    };

    const paginationElement = useMemo(() => {
        const items = [];
        for (let number = 1; number <= totalPages; number++) {
            items.push(
                <Pagination.Item
                    key={number}
                    active={number === currentPage}
                    onClick={() => setCurrentPage(number)}
                >
                    {number}
                </Pagination.Item>
            );
        }
        return (
            <Pagination className="justify-content-center mt-4">
                <Pagination.First onClick={() => setCurrentPage(1)} disabled={currentPage === 1}/>
                <Pagination.Prev onClick={() => setCurrentPage(curr => Math.max(1, curr - 1))}
                                 disabled={currentPage === 1}/>
                {items}
                <Pagination.Next onClick={() => setCurrentPage(curr => Math.min(totalPages, curr + 1))}
                                 disabled={currentPage === totalPages}/>
                <Pagination.Last onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}/>
            </Pagination>
        );
    }, [currentPage, totalPages]);

    if (isLoading) {
        return (
            <Container className="my-properties-container py-5 text-center">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </Container>
        );
    }

    if (properties.length === 0) {
        return (
            <Container className="my-properties-container py-5">
                <div className="empty-state">
                    <i className="fas fa-home fa-3x"></i>
                    <h3>No Properties Found</h3>
                    <p>You haven't listed any properties yet.</p>
                    <Button
                        variant="primary"
                        onClick={() => navigate('/properties/create')}
                    >
                        Create Your First Property
                    </Button>
                </div>
            </Container>
        );
    }

    return (
        <Container className="my-properties-container py-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>My Properties</h1>
                <Button
                    variant="primary"
                    onClick={() => navigate('/properties/create')}
                >
                    Add New Property
                </Button>
            </div>

            {/* Filters */}
            <div className="filters-section mb-4">
                <Row className="g-3">
                    <Col md={4}>
                        <Form.Control
                            type="text"
                            placeholder="Search properties..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                        />
                    </Col>
                    <Col md={4}>
                        <Form.Select
                            value={filters.availability}
                            onChange={(e) => handleFilterChange('availability', e.target.value)}
                        >
                            <option value="all">All Status</option>
                            <option value="available">Available</option>
                            <option value="unavailable">Unavailable</option>
                        </Form.Select>
                    </Col>
                    <Col md={4}>
                        <Form.Control
                            type="text"
                            placeholder="Filter by location..."
                            value={filters.location}
                            onChange={(e) => handleFilterChange('location', e.target.value)}
                        />
                    </Col>
                    <Col md={4}>
                        <InputGroup>
                            <Form.Control
                                type="number"
                                placeholder="Min price"
                                value={filters.priceMin}
                                min={0}
                                onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                            />
                            <Form.Control
                                type="number"
                                placeholder="Max price"
                                value={filters.priceMax}
                                min={0}
                                onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                            />
                        </InputGroup>
                    </Col>
                </Row>
            </div>

            <div className="table-wrapper">
                <Table hover className="align-middle">
                    <thead>
                    <tr>
                        <th onClick={() => handleSort('name')} className="sortable">
                            Property {renderSortIcons('name')}
                        </th>
                        <th onClick={() => handleSort('city')} className="sortable d-none d-md-table-cell">
                            Location {renderSortIcons('city')}
                        </th>
                        <th onClick={() => handleSort('pricePerNight')} className="sortable d-none d-md-table-cell">
                            Price/Night {renderSortIcons('pricePerNight')}
                        </th>
                        <th onClick={() => handleSort('maxGuests')} className="sortable d-none d-md-table-cell">
                            Max Guests {renderSortIcons('maxGuests')}
                        </th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {paginatedProperties.map((property) => (
                        <tr key={property.id}>
                            <td className="property-cell">
                                <div className="d-flex align-items-center">
                                    <img
                                        src={property.imagePaths?.[0] || '/placeholder-property.jpg'}
                                        alt={property.name}
                                        className="property-image me-3"
                                    />
                                    <div className="property-name text-truncate">
                                        {property.name}
                                    </div>
                                </div>
                            </td>
                            <td className="d-none d-md-table-cell">
                                {property.address.city}, {property.address.country}
                            </td>
                            <td className="d-none d-md-table-cell">
                                €{property.pricePerNight}
                            </td>
                            <td className="d-none d-md-table-cell">
                                {property.maxGuests} guests
                            </td>
                            <td>
                                <Badge bg={property.available ? 'success' : 'danger'}>
                                    {property.available ? 'Available' : 'Unavailable'}
                                </Badge>
                            </td>
                            <td>
                                <div className="action-buttons">
                                    <Button
                                        variant="outline-primary"
                                        size="sm"
                                        onClick={() => navigate(`/properties/${property.id}`)}
                                    >
                                        View
                                    </Button>
                                    <Button
                                        variant="outline-secondary"
                                        size="sm"
                                        onClick={() => navigate(`/properties/${property.id}/edit`)}
                                    >
                                        Edit
                                    </Button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </Table>
            </div>

            {totalPages > 1 && paginationElement}
        </Container>
    );
};

export default MyPropertiesComponent;