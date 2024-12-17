// src/pages/HomePage/index.tsx
import {Container, Dropdown, Nav, Form} from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import MapView from '../components/mapview/MapView.tsx';
import {bookings, properties} from '../util/TestData.ts';
import React, {useEffect, useState} from 'react';
import "react-datepicker/dist/react-datepicker.css";
import './HomePage.scss';
import '@fortawesome/fontawesome-free/css/all.min.css';
import {Address} from "../services/Mapbox.ts";
import {SearchBox} from "../components/SearchBox/SearchBox.tsx";
import {AmenityType, PropertyResponse} from "../models/Property.ts";
import PropertyOverview from "../components/properties/properties-overview/properties-overview.tsx";

const HomePage = () => {
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(undefined);
    const [selectedLocation, setSelectedLocation] = useState<{ longitude: number, latitude: number } | null>(null);
    const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
    const [dateError, setDateError] = useState<string | null>(null);
    const [activeView, setActiveView] = useState<'map' | 'grid'>('map');
    const [filteredProperties, setFilteredProperties] = useState<PropertyResponse[]>(properties);
    const [selectedAmenities, setSelectedAmenities] = useState<Set<AmenityType>>(new Set());


    interface CustomToggleProps {
        onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
    }

    const CustomToggle = React.forwardRef<HTMLButtonElement, CustomToggleProps>(
        ({onClick}, ref) => (
            <button
                ref={ref}
                onClick={(e) => {
                    e.preventDefault();
                    onClick(e);
                }}
                className="btn btn-outline-secondary"
            >
                <i className="fas fa-filter me-2"></i>
                Amenities
            </button>
        )
    );

    CustomToggle.displayName = 'CustomToggle';


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


    useEffect(() => {
        console.log(startDate, endDate);
    });

    const filterPropertiesOverlappingBookingsStartDateEndDate = (properties: PropertyResponse[], startDate: Date, endDate: Date): PropertyResponse[] => {
        // Return the filtered array instead of just filtering
        return properties.filter(property => {
            const existingBookings = bookings.filter(booking => booking.property === property.id);
            return !existingBookings.some(booking => {
                const bookingStart = new Date(booking.checkIn);
                const bookingEnd = new Date(booking.checkOut);
                return (
                    (startDate <= bookingEnd && startDate >= bookingStart) ||
                    (endDate <= bookingEnd && endDate >= bookingStart) ||
                    (startDate <= bookingStart && endDate >= bookingEnd)
                );
            });
        });
    }


    const handleAddressSelect = (address: Address) => {
        setSelectedLocation({
            longitude: address.longitude,
            latitude: address.latitude
        });
    };

    const handlePropertySelect = (propertyId: string) => {
        setSelectedProperty(propertyId);
    }

    const isDateRangeValid = (start: Date | null, end: Date | null) => {
        if (!start || !end || !selectedProperty) return true;

        const existingBookings = bookings.filter(booking =>
            booking.property === selectedProperty &&
            (booking.status === 'confirmed' || booking.status === 'pending')
        );

        return !existingBookings.some(booking => {
            const bookingStart = new Date(booking.checkIn);
            const bookingEnd = new Date(booking.checkOut);

            return (
                (start <= bookingEnd && start >= bookingStart) ||
                (end <= bookingEnd && end >= bookingStart) ||
                (start <= bookingStart && end >= bookingEnd)
            );
        });
    };

    return (
        <div className="home-page">
            <Container fluid className="px-5 py-5">
                <div className="d-flex mb-2 justify-content-center">
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


                <div className="d-flex my-2 justify-content-center align-items-center gap-4 w-100 flex-wrap pb-2">

                    {/* Selected property banner */}
                    <div className="selected-property-banner mb-2 position-relative mt-2">
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
                    <SearchBox onAddressSelect={handleAddressSelect}/>
                    <div className="date-picker-container">
                        <DatePicker
                            showIcon={true}
                            icon="fa fa-calendar-alt"
                            selectsRange={true}
                            startDate={startDate}
                            endDate={endDate}
                            onChange={(dates: [Date | null, Date | null]) => {
                                const [start, end] = dates;
                                if (isDateRangeValid(start, end)) {
                                    console.log("Selected dates are valid");
                                    setStartDate(start ?? undefined);
                                    setEndDate(end ?? undefined);
                                    setDateError(null);

                                    if (start && end && !selectedProperty) {
                                        setFilteredProperties(filterPropertiesOverlappingBookingsStartDateEndDate(properties, start, end));
                                    } else if (!start && !end) {
                                        setFilteredProperties(properties);
                                    }

                                } else {
                                    console.log("Selected dates overlap with an existing booking");
                                    setDateError("Selected dates overlap with an existing booking");
                                    setStartDate(undefined);
                                    setEndDate(undefined);
                                }
                            }}
                            dateFormat="dd/MM/yyyy"
                            minDate={new Date()}
                            placeholderText="Select check-in and check-out dates"
                            className={`form-control ${dateError ? 'is-invalid' : ''}`}
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
                            <div className="invalid-feedback d-block">
                                {dateError}
                            </div>
                        )}
                    </div>
                    <Dropdown>
                        <Dropdown.Toggle as={CustomToggle} id="amenities-dropdown">
                            {/* Toggle is handled by CustomToggle */}
                        </Dropdown.Toggle>

                        <Dropdown.Menu className="p-3" style={{minWidth: '250px'}}>
                            <h6 className="mb-3">Filter by Amenities</h6>
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
                        </Dropdown.Menu>
                    </Dropdown>
                </div>

                {activeView === 'map' ? (
                    <MapView
                        properties={filteredProperties}
                        selectedLocation={selectedLocation}
                        handlePropertySelect={handlePropertySelect}
                    />
                ) : (
                    <PropertyOverview
                        properties={filteredProperties}
                        propertiesPerPage={5}
                    />
                )}
            </Container>
        </div>
    );
};

export default HomePage;