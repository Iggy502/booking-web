import {Container, Dropdown, Form} from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import MapView from '../components/mapview/MapView';
import {PropertyService} from '../services/property-service'
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import "react-datepicker/dist/react-datepicker.css";
import './HomePage.scss';
import '@fortawesome/fontawesome-free/css/all.min.css';
import {Address} from "../services/Mapbox";
import {SearchBox} from "../components/SearchBox/SearchBox";
import {AmenityType, Property} from "../models/Property";
import {Booking} from "../models/Booking";
import {BookingService} from "../services/booking-service";
import {useNavigate} from "react-router-dom";
import {useError} from "../context/error.context.tsx";
import createHttpError, {HttpError} from "http-errors";

interface FilterDropdownProps {
    title: string;
    icon: string;
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

interface BookingsByProperty {
    [propertyId: string]: Booking[];
}

interface PriceRange {
    id: string;
    min: number;
    max: number | null;
    label: string;
}

const priceRanges: PriceRange[] = [
    {id: 'price-0-50', min: 0, max: 50, label: '€0 - €50'},
    {id: 'price-50-100', min: 50, max: 100, label: '€50 - €100'},
    {id: 'price-100-150', min: 100, max: 150, label: '€100 - €150'},
    {id: 'price-150-plus', min: 150, max: null, label: '€150+'}
];

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
    // Core state
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(undefined);
    const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
    const [selectedLocation, setSelectedLocation] = useState<{
        longitude: number | null,
        latitude: number | null
    } | null>(null);

    // Filter state
    const [selectedAmenities, setSelectedAmenities] = useState<Set<AmenityType>>(new Set());
    const [selectedPriceRangeId, setSelectedPriceRangeId] = useState<string | null>(null);
    const [guestCount, setGuestCount] = useState<number>(1);

    const {showError} = useError();

    // Data state
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [properties, setProperties] = useState<Property[]>([]);
    const [bookingsByProperty, setBookingsByProperty] = useState<BookingsByProperty>({});
    const [dateError, setDateError] = useState<string | null>(null);

    const navigation = useNavigate();

    // Initial data fetch
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [propertiesData, bookingsData] = await Promise.all([
                    PropertyService.fetchProperties(),
                    BookingService.fetchBookings()
                ]);

                const bookingsMap = bookingsData.reduce((acc, booking) => {
                    if (!acc[booking.property]) {
                        acc[booking.property] = [];
                    }
                    acc[booking.property].push(booking);

                    return acc;
                }, {} as BookingsByProperty);

                setProperties(propertiesData);
                setBookingsByProperty(bookingsMap);
            } catch (error) {
                console.error('Failed to fetch initial data:', error);
                if (error instanceof HttpError && (error.status || error.message)) {
                    showError(
                        createHttpError(error.status || 500, error.message)
                    );

                } else {
                    showError(createHttpError.InternalServerError());

                }
            } finally {
                setIsInitialLoading(false);
            }
        };

        fetchInitialData()
    }, []);

    const isDateRangeAvailable = useCallback((
        propertyId: string,
        start: Date,
        end: Date
    ): boolean => {
        const propertyBookings = bookingsByProperty[propertyId] || [];
        return !propertyBookings.some(booking => {
            const bookingStart = new Date(booking.checkIn);
            const bookingEnd = new Date(booking.checkOut);
            return bookingStart <= end && bookingEnd >= start;
        });
    }, [bookingsByProperty]);

    const filteredProperties = useMemo(() => {
        let filtered = [...properties];

        // Apply price filter
        if (selectedPriceRangeId) {
            const range = priceRanges.find(r => r.id === selectedPriceRangeId);
            if (range) {
                filtered = filtered.filter(property => {
                    if (range.max !== null) {
                        return property.pricePerNight >= range.min && property.pricePerNight <= range.max;
                    }
                    return property.pricePerNight >= range.min;
                });
            }
        }

        // Apply amenity filter
        if (selectedAmenities.size > 0) {
            filtered = filtered.filter(property =>
                Array.from(selectedAmenities).every(amenity =>
                    property.amenities?.some(a => a.type === amenity)
                )
            );
        }
        // Apply guest count filter
        filtered = filtered.filter(property =>
            property.maxGuests >= guestCount
        );


        // Apply date availability filter
        if (startDate && endDate && !selectedProperty) {
            filtered = filtered.filter(property =>
                isDateRangeAvailable(property.id, startDate, endDate)
            );
        }

        if (selectedProperty && !filtered.find(p => p.id === selectedProperty)) {
            setSelectedProperty(null);
            setDateError(null);
        }

        return filtered;
    }, [
        properties,
        selectedPriceRangeId,
        selectedAmenities,
        startDate,
        endDate,
        isDateRangeAvailable,
        guestCount
    ]);

    const handlePropertySelect = (propertyId: string | null) => {
        setSelectedProperty(propertyId);
        if (!propertyId) {
            setDateError(null);
            return;
        }

        if (startDate && endDate) {
            const isAvailable = isDateRangeAvailable(propertyId, startDate, endDate);
            setDateError(isAvailable ? null : "Selected dates are not available");
        }
    };

    const handleDateChange = (dates: [Date | null, Date | null]) => {
        const [start, end] = dates;
        setStartDate(start ?? undefined);
        setEndDate(end ?? undefined);

        if (!start || !end) {
            setDateError(null);
            return;
        }

        if (selectedProperty) {
            const isAvailable = isDateRangeAvailable(selectedProperty, start, end);
            setDateError(isAvailable ? null : "Selected dates are not available");
        }
    };

    const handlePriceRangeChange = (rangeId: string) => {
        setSelectedPriceRangeId(selectedPriceRangeId === rangeId ? null : rangeId);
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

    const handleAddressSelect = (address: Address | null) => {
        setSelectedLocation(address ? {
            longitude: address.longitude,
            latitude: address.latitude
        } : null);
    };

    const handleBookNow = useCallback(() => {
        if (selectedProperty && startDate && endDate && !dateError) {
            navigation(`/booking?propertyId=${selectedProperty}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`);
        }
    }, [selectedProperty, startDate, endDate, dateError, navigation]);

    const clearAllFilters = () => {
        setSelectedPriceRangeId(null);
        setSelectedAmenities(new Set());
        setGuestCount(1);
    };

    if (isInitialLoading) {
        return (
            <Container fluid className="px-5 py-5">
                <div className="text-center">
                    <i className="fas fa-spinner fa-spin fa-3x text-primary mb-3"></i>
                    <p>Loading...</p>
                </div>
            </Container>
        );
    }

    return (
        <div className="home-page">
            <Container fluid className="px-5 py-5">
                <h1 className="text-center mb-4">Find Your Perfect Stay</h1>
                <div className="mb-3 gap-3 d-flex justify-content-center">
                    <div className="d-flex justify-content-between align-items-center">
                        <div className="selected-property-banner">
                            {selectedProperty && (
                                <div className="banner-content">
                                    <i className="fas fa-map-marker-alt me-2"></i>
                                    <span>{filteredProperties.find(p => p.id === selectedProperty)?.name}</span>
                                    <button
                                        className="clear-selection ms-3"
                                        onClick={() => handlePropertySelect(null)}
                                    >
                                        <i className="fas fa-times"></i>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {selectedProperty && startDate && endDate && !dateError && (
                        <>
                            <span className="d-flex align-items-center">
                                <i className="fa-solid fa-arrow-right fa-xl" style={{color: "#138663"}}></i>
                            </span>
                            <div className="">
                                <button
                                    className="btn btn-primary d-flex align-items-center gap-2"
                                    onClick={() => {
                                        handleBookNow();
                                    }}
                                >
                                    <i className="fas fa-calendar-check"></i>
                                    Book Now
                                </button>
                            </div>
                        </>
                    )}
                </div>

                <div className="d-flex justify-content-center align-items-center gap-4 flex-wrap mb-4">
                    <SearchBox onAddressSelect={handleAddressSelect}/>
                    <div className={`date-picker-container ${
                        dateError ? 'date-picker-error' :
                            selectedProperty ? 'date-picker-success' : ''
                    }`}>
                        {dateError && (
                            <div className="invalid-feedback d-block">
                                {dateError}
                            </div>
                        )}
                        <DatePicker
                            showIcon
                            icon="fa fa-calendar-alt"
                            selectsRange
                            startDate={startDate}
                            endDate={endDate}
                            onChange={handleDateChange}
                            dateFormat="dd/MM/yyyy"
                            minDate={new Date()}
                            placeholderText="Select dates"
                            className="form-control"
                            monthsShown={2}
                            excludeDateIntervals={
                                selectedProperty ?
                                    (bookingsByProperty[selectedProperty] || [])
                                        .map(booking => ({
                                            start: new Date(booking.checkIn),
                                            end: new Date(booking.checkOut)
                                        }))
                                    : []
                            }
                        />
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
                                <div className="flex-grow-1 gap-3 mb-3 mb-sm-0 pe-sm-3 border-sm-end">
                                    <div className="fw-semibold text-dark mb-3">Price per night</div>
                                    {priceRanges.map(range => (
                                        <Form.Check
                                            key={range.id}
                                            type="radio"
                                            name="priceRange"
                                            id={range.id}
                                            label={range.label}
                                            checked={selectedPriceRangeId === range.id}
                                            onChange={() => handlePriceRangeChange(range.id)}
                                            className="mb-2"
                                        />
                                    ))}
                                    <div className="mt-4">
                                        <div className="fw-semibold text-dark mb-2">Number of
                                            guests (Min.)
                                        </div>
                                        <Form.Select
                                            value={guestCount}
                                            onChange={(e) => setGuestCount(Number(e.target.value))}
                                            className="form-select-sm"
                                            style={{maxWidth: '55px'}}
                                        >
                                            {[1, 2, 3, 4, 5].map(num => (
                                                <option key={num} value={num}>
                                                    {num}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </div>
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
                <div className="d-flex align-items-center gap-2 mb-3" style={{minHeight: '38px'}}>
                    {(selectedPriceRangeId || selectedAmenities.size > 0 || guestCount > 1) && (
                        <>
                            <span className="text-secondary small">Active filters:</span>
                            {selectedPriceRangeId && (
                                <span className="badge bg-light text-dark d-flex align-items-center gap-2 py-2 px-3">
                    {priceRanges.find(r => r.id === selectedPriceRangeId)?.label}
                                    <button
                                        className="btn btn-link btn-sm p-0 text-dark border-0"
                                        onClick={() => setSelectedPriceRangeId(null)}>
                             <i className="fas fa-times"></i>
                    </button>
                </span>
                            )}

                            <span className="badge bg-light text-dark d-flex align-items-center gap-2 py-2 px-3">
                    {guestCount} guests
                    <button
                        className="btn btn-link btn-sm p-0 text-dark border-0"
                        onClick={() => setGuestCount(1)}>
                        <i className="fas fa-times"></i>
                    </button>
                </span>
                            {Array.from(selectedAmenities).map(amenity => (
                                <span key={amenity}
                                      className="badge bg-light text-dark d-flex align-items-center gap-2 py-2 px-3">
                                    {amenity.replace(/([A-Z])/g, ' $1').trim()}
                                    <button
                                        className="btn btn-link btn-sm p-0 text-dark border-0"
                                        onClick={() => handleAmenityChange(amenity)}
                                    >
                        <i className="fas fa-times"></i>
                    </button>
                </span>
                            ))}
                            <button className="btn btn-link btn-sm text-secondary p-0" onClick={clearAllFilters}>
                                Clear all
                            </button>
                        </>
                    )}
                </div>

                <MapView
                    properties={filteredProperties}
                    selectedLocation={selectedLocation}
                    handlePropertySelect={handlePropertySelect}
                />
            </Container>
        </div>
    );
};

export default HomePage;