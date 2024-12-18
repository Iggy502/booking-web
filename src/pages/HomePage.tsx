import {Container, Nav, Dropdown, Form} from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import MapView from '../components/mapview/MapView.tsx';
import PropertyOverview from '../components/properties/properties-overview/properties-overview.tsx';
import {bookings, properties} from '../util/TestData';
import React, {useEffect, useState} from 'react';
import "react-datepicker/dist/react-datepicker.css";
import './HomePage.scss';
import '@fortawesome/fontawesome-free/css/all.min.css';
import {Address} from "../services/Mapbox";
import {SearchBox} from "../components/SearchBox/SearchBox";
import {PropertyResponse, AmenityType} from "../models/Property";

interface FilterDropdownProps {
    title: string;
    icon: string;
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const FilterDropdown = React.forwardRef<HTMLButtonElement, FilterDropdownProps>(
    ({onClick, title, icon}, ref) => (
        <button
            ref={ref}
            onClick={(e) => {
                e.preventDefault();
                onClick(e);
            }}
            className="btn btn-outline-secondary d-flex align-items-center gap-2"
        >
            <i className={`fas ${icon}`}></i>
            {title}
        </button>
    )
);

FilterDropdown.displayName = 'FilterDropdown';

const HomePage = () => {
    const [activeView, setActiveView] = useState<'map' | 'grid'>('map');
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(undefined);
    const [selectedLocation, setSelectedLocation] = useState<{
        longitude: number | null,
        latitude: number | null
    } | null>(null);
    const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
    const [dateError, setDateError] = useState<string | null>(null);
    const [selectedAmenities, setSelectedAmenities] = useState<Set<AmenityType>>(new Set());
    const [selectedPriceRange, setSelectedPriceRange] = useState<string | null>(null);
    const [filteredProperties, setFilteredProperties] = useState<PropertyResponse[]>(properties);

    const priceRanges = [
        {id: 'price-0-50', label: '€0 - €50'},
        {id: 'price-50-100', label: '€50 - €100'},
        {id: 'price-100-150', label: '€100 - €150'},
        {id: 'price-150-plus', label: '€150+'}
    ];

    const filterProperties = (
        properties: PropertyResponse[],
        startDate?: Date,
        endDate?: Date,
        amenities?: Set<AmenityType>,
        priceRange?: string | null
    ): PropertyResponse[] => {
        let filtered = [...properties];

        // Only filter by dates if no property is selected
        if (!selectedProperty && startDate && endDate) {
            filtered = filterPropertiesOverlappingBookingsStartDateEndDate(filtered, startDate, endDate);
        }

        if (amenities && amenities.size > 0) {
            filtered = filtered.filter(property =>
                Array.from(amenities).every(amenity =>
                    property.amenities?.find(a => a.type === amenity) !== undefined));

        }

        if (priceRange) {
            switch (priceRange) {
                case 'price-0-50':
                    filtered = filtered.filter(property => property.pricePerNight <= 50);
                    break;
                case 'price-50-100':
                    filtered = filtered.filter(property => property.pricePerNight > 50 && property.pricePerNight <= 100);
                    break;
                case 'price-100-150':
                    filtered = filtered.filter(property => property.pricePerNight > 100 && property.pricePerNight <= 150);
                    break;
                case 'price-150-plus':
                    filtered = filtered.filter(property => property.pricePerNight > 150);
                    break;
            }
        }

        return filtered;
    };

    const filterPropertiesOverlappingBookingsStartDateEndDate = (
        properties: PropertyResponse[],
        startDate: Date,
        endDate: Date
    ): PropertyResponse[] => {
        return properties.filter(property => isDateRangeValid(startDate, endDate, property.id));
    };

    const isDateRangeValid = (start: Date | null, end: Date | null, property: string | null) => {
        if (!start || !end || !property) return true;

        const existingBookings = bookings.filter(booking =>
            booking.property === property &&
            (booking.status === 'confirmed' || booking.status === 'pending')
        );

        return !existingBookings.some(booking => {
            const bookingStart = new Date(booking.checkIn);
            const bookingEnd = new Date(booking.checkOut);

            const result = (start <= bookingEnd && start >= bookingStart) ||
                (end <= bookingEnd && end >= bookingStart) ||
                (start <= bookingStart && end >= bookingEnd);
            console.log("isDateRangeValid", result);
            return result;
        });
    };

    const handleAmenityChange = (amenity: AmenityType) => {
        setSelectedAmenities(prev => {
            const updated = new Set(prev);
            if (updated.has(amenity)) {
                updated.delete(amenity);
            } else {
                updated.add(amenity);
            }
            return updated;
        });
    };

    const handlePriceRangeChange = (rangeId: string) => {
        setSelectedPriceRange(selectedPriceRange === rangeId ? null : rangeId);
    };

    const handleAddressSelect = (address: Address | null) => {
        setSelectedLocation(address ? {
            longitude: address.longitude,
            latitude: address.latitude
        } : null);
    };

    const handlePropertySelect = (propertyId: string) => {
        if (!propertyId) {
            setDateError(null);

        }
        if (propertyId !== selectedProperty) {
            setDateError(!isDateRangeValid(startDate || null, endDate || null, propertyId)
                ? "Selected dates overlap with an existing booking" : null);
        }


        setSelectedProperty(propertyId);
    };

    const clearAllFilters = () => {
        setSelectedPriceRange(null);
        setSelectedAmenities(new Set());
    };

    useEffect(() => {
        setFilteredProperties(filterProperties(
            properties,
            startDate,
            endDate,
            selectedAmenities,
            selectedPriceRange
        ));
    }, [selectedAmenities, selectedPriceRange, startDate, endDate]);

    return (
        <div className="home-page">
            <Container fluid className="px-5 py-5">
                <div className="position-relative mb-3">
                    <div className="d-flex justify-content-between align-items-center">
                        <div className="selected-property-banner">
                            {selectedProperty && (
                                <div className="banner-content">
                                    <i className="fas fa-map-marker-alt me-2"></i>
                                    <span>{properties.find(p => p.id === selectedProperty)?.name}</span>
                                    <button
                                        className="clear-selection ms-3"
                                        onClick={() => handlePropertySelect('')}
                                    >
                                        <i className="fas fa-times"></i>
                                    </button>
                                </div>
                            )}
                        </div>

                        <Nav
                            variant="tabs"
                            activeKey={activeView}
                            onSelect={(k) => setActiveView(k as 'map' | 'grid')}
                            className="view-toggle"
                        >
                            <Nav.Item>
                                <Nav.Link eventKey="map">
                                    <i className="fas fa-map-marked-alt me-2"></i>
                                    Map View
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="grid">
                                    <i className="fas fa-th-large me-2"></i>
                                    Grid View
                                </Nav.Link>
                            </Nav.Item>
                        </Nav>
                    </div>

                    {selectedProperty && startDate && endDate && !dateError && (
                        <div className="position-absolute top-50 start-50 translate-middle">
                            <button
                                className="btn btn-primary d-flex align-items-center gap-2"
                                onClick={() => {/* Add your action here */
                                }}
                            >
                                <i className="fas fa-calendar-check"></i>
                                Book Now
                            </button>
                        </div>
                    )}
                </div>

                <div className="d-flex justify-content-center align-items-center gap-4 flex-wrap pb-4">
                    <SearchBox onAddressSelect={handleAddressSelect}/>
                    <div className={`date-picker-container ${
                        dateError ? 'date-picker-error' :
                            selectedProperty ? 'date-picker-success' : ''
                    }`}>
                        <DatePicker
                            showIcon
                            icon="fa fa-calendar-alt"
                            selectsRange
                            startDate={startDate}
                            endDate={endDate}
                            onChange={(dates: [Date | null, Date | null]) => {
                                const [start, end] = dates;

                                // Always update the dates
                                setStartDate(start ?? undefined);
                                setEndDate(end ?? undefined);

                                // If a property is selected, only handle validation
                                if (selectedProperty) {
                                    if (!start || !end) {
                                        setDateError(null); // Clear error when dates are cleared
                                        return;
                                    }
                                    if (isDateRangeValid(start, end, selectedProperty)) {
                                        setDateError(null);
                                    } else {
                                        setDateError("Selected dates overlap with an existing booking");
                                    }
                                    return;
                                }

                                // If no property is selected, handle filtering
                                // This includes resetting to all properties when dates are cleared
                                if (!start || !end) {
                                    setFilteredProperties(filterProperties(
                                        properties,
                                        undefined,
                                        undefined,
                                        selectedAmenities,
                                        selectedPriceRange
                                    ));
                                } else {
                                    setFilteredProperties(filterProperties(
                                        properties,
                                        start,
                                        end,
                                        selectedAmenities,
                                        selectedPriceRange
                                    ));
                                }
                            }}
                            dateFormat="dd/MM/yyyy"
                            minDate={new Date()}
                            placeholderText="Select dates"
                            className="form-control"
                            monthsShown={2}
                            excludeDateIntervals={
                                (selectedProperty &&
                                    bookings
                                        .filter(booking => booking.property == selectedProperty)
                                        .map(booking => {
                                            return {start: new Date(booking.checkIn), end: new Date(booking.checkOut)};
                                        })
                                ) || []
                            }
                        />
                        {dateError && (
                            <div className="invalid-feedback position-absolute">
                                {dateError}
                            </div>
                        )}
                    </div>

                    <Dropdown>
                        <Dropdown.Toggle
                            as={FilterDropdown}
                            id="filters-dropdown"
                            title="Filters"
                            icon="fa-sliders-h"
                        />

                        <Dropdown.Menu className="filters-dropdown-menu p-3">
                            <div className="d-flex flex-column flex-sm-row">
                                <div className="flex-grow-1 mb-3 mb-sm-0 pe-sm-3 border-sm-end">
                                    <div className="fw-semibold text-dark mb-3">Price per night</div>
                                    {priceRanges.map(range => (
                                        <Form.Check
                                            key={range.id}
                                            type="radio"
                                            name="priceRange"
                                            id={range.id}
                                            label={range.label}
                                            checked={selectedPriceRange === range.id}
                                            onChange={() => handlePriceRangeChange(range.id)}
                                            className="mb-2"
                                        />
                                    ))}
                                </div>

                                <div className="flex-grow-1 ps-sm-3">
                                    <div className="fw-semibold text-dark mb-3">Amenities</div>
                                    {Object.values(AmenityType).map((amenity) => (
                                        <Form.Check
                                            key={amenity}
                                            type="checkbox"
                                            id={`amenity-${amenity}`}
                                            label={amenity.replace(/([A-Z])/g, ' $1').trim()}
                                            checked={selectedAmenities.has(amenity)}
                                            onChange={() => handleAmenityChange(amenity)}
                                            className="mb-2"
                                        />
                                    ))}
                                </div>
                            </div>
                        </Dropdown.Menu>
                    </Dropdown>
                </div>

                {(selectedPriceRange || selectedAmenities.size > 0) && (
                    <div className="d-flex align-items-center gap-2 mb-3">
                        <span className="text-secondary small">Active filters:</span>

                        {selectedPriceRange && (
                            <span className="badge bg-light text-dark d-flex align-items-center gap-2 py-2 px-3">
                            {priceRanges.find(r => r.id === selectedPriceRange)?.label}
                                <button
                                    className="btn btn-link btn-sm p-0 text-dark border-0"
                                    onClick={() => setSelectedPriceRange(null)}
                                >
                                <i className="fas fa-times"></i>
                            </button>
                        </span>
                        )}

                        {Array.from(selectedAmenities).map(amenity => (
                            <span
                                key={amenity}
                                className="badge bg-light text-dark d-flex align-items-center gap-2 py-2 px-3"
                            >
                            {amenity.replace(/([A-Z])/g, ' $1').trim()}
                                <button
                                    className="btn btn-link btn-sm p-0 text-dark border-0"
                                    onClick={() => handleAmenityChange(amenity)}
                                >
                                <i className="fas fa-times"></i>
                            </button>
                        </span>
                        ))}

                        <button
                            className="btn btn-link btn-sm text-secondary p-0"
                            onClick={clearAllFilters}
                        >
                            Clear all
                        </button>
                    </div>
                )}

                {activeView === 'map' ? (
                    <MapView
                        properties={filteredProperties}
                        selectedLocation={selectedLocation}
                        handlePropertySelect={handlePropertySelect}
                    />
                ) : (
                    <PropertyOverview
                        properties={filteredProperties}
                        propertiesPerPage={4}
                    />
                )}
            </Container>
        </div>
    );

};

export default HomePage;