import {useEffect, useRef, useState} from 'react';
import {Badge, Container, Form, InputGroup} from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import PropertyOverview from '../properties-overview/properties-overview';
import {properties} from '../../../util/TestData';
import {PropertyService} from '../../../services/property-service.ts'
import {BookingService} from "../../../services/booking-service.ts";
import {AmenityType, Property} from "../../../models/Property";
import './PropertyWrapper.scss';
import {Booking} from "../../../models/Booking.ts";
import {useNavigate} from "react-router-dom";
import {useError} from "../../../context/error.context.tsx";
import createHttpError, {HttpError, InternalServerError} from "http-errors";

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

const PropertyWrapper = () => {
    const [filteredProperties, setFilteredProperties] = useState<Property[]>(properties);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAmenities, setSelectedAmenities] = useState<Set<AmenityType>>(new Set());
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(undefined);
    const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
    const [dateError, setDateError] = useState<string | null>(null);
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingBookings, setIsLoadingBookings] = useState(false);
    const allProperties = useRef<Property[]>([]);
    const [propertyBookings, setPropertyBookings] = useState<Booking[]>([]);
    const [guestCount, setGuestCount] = useState<number>(1);
    const navigate = useNavigate();
    const {showError} = useError();


    const minPrice = 0;
    const maxPrice = 500;

    useEffect(() => {
        const loadProperties = async () => {
            try {
                const properties = await PropertyService.fetchProperties();
                allProperties.current = properties;
                setFilteredProperties(properties);
            } catch (error) {
                if (error instanceof HttpError && (error.status || error.message)) {
                    showError(
                        createHttpError(error.status || 500, error.message || 'Internal Server Error'));

                } else {
                    showError(InternalServerError("Internal Server Error"));

                }
                setFilteredProperties([]);
            } finally {
                setIsLoading(false);
            }
        };

        loadProperties().catch(console.error);
    }, []);

    useEffect(() => {
        const fetchBookings = async () => {
            if (selectedProperty) {
                try {
                    const bookings = await BookingService.fetchBookingsByProperty(selectedProperty);
                    setPropertyBookings(bookings);
                } catch (error) {
                    console.error('Error fetching bookings:', error);
                    if (error instanceof HttpError && (error.status || error.message)) {
                        showError(
                            createHttpError(error.status || 500, error.message || 'Internal Server Error'));

                    } else {
                        showError(InternalServerError("Internal Server Error"));

                    }
                    setPropertyBookings([]);
                }
            } else {

                setPropertyBookings([]);
            }
        };

        fetchBookings().catch(console.error);
    }, [selectedProperty]);

    function convertBookingToDateIntervals(booking: Booking) {
        return {
            start: new Date(booking.checkIn),
            end: new Date(booking.checkOut)
        };
    }

    const HandleBooking = () => {
        console.log('Booking property:', selectedProperty);
        if (selectedProperty && startDate && endDate) {
            navigate(`/booking?propertyId=${selectedProperty}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`);
        }
    };

    const isDateRangeValidComparedToExistingBookings = (start: Date | null, end: Date | null, propertyId: string | null, existingBookings: Booking[]) => {
        if (!start || !end || !propertyId || !existingBookings?.length) return true;

        return !existingBookings.some(booking => {
            const bookingStart = new Date(booking.checkIn);
            const bookingEnd = new Date(booking.checkOut);

            return (start <= bookingEnd && start >= bookingStart) ||
                (end <= bookingEnd && end >= bookingStart) ||
                (start <= bookingStart && end >= bookingEnd);
        });
    };

    const filterProperties = async () => {
        let filtered = [...allProperties.current];

        if (searchTerm) {
            filtered = filtered.filter(property =>
                property.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (selectedAmenities.size > 0) {
            filtered = filtered.filter(property =>
                Array.from(selectedAmenities).every(amenity =>
                    property.amenities?.find(a => a.type === amenity)
                )
            );
        }

        // Add guest count filter
        filtered = filtered.filter(property =>
            property.maxGuests >= guestCount
        );


        if (priceRange[0] > minPrice || priceRange[1] < maxPrice) {
            filtered = filtered.filter(property =>
                property.pricePerNight >= priceRange[0] &&
                property.pricePerNight <= priceRange[1]
            );
        }

        if (!selectedProperty && startDate && endDate) {
            const bookings = (await Promise.all(filtered.map(property =>
                BookingService.fetchBookingsByProperty(property.id)
            ))).flat();

            filtered = filtered.filter(property => {
                const propertyBookings = bookings.filter(b => b.property === property.id);
                return isDateRangeValidComparedToExistingBookings(
                    startDate,
                    endDate,
                    property.id,
                    propertyBookings
                );
            });
        }

        setFilteredProperties(filtered);
    };

    const handlePropertySelect = async (propertyId: string) => {

        if (propertyId === selectedProperty || !propertyId) {
            setSelectedProperty(null);
            setDateError(null);
            return;
        }


        setIsLoadingBookings(true);
        console.log('Fetching bookings for property:', propertyId);
        try {
            // Fetch bookings for the new property
            const newPropertyBookings = await BookingService.fetchBookingsByProperty(propertyId);
            setPropertyBookings(newPropertyBookings);
            setSelectedProperty(propertyId);

            // Validate dates for the new property if dates are selected
            if (startDate && endDate) {
                const dateRangeValid = isDateRangeValidComparedToExistingBookings(
                    startDate,
                    endDate,
                    propertyId,
                    newPropertyBookings
                );

                setDateError(
                    !dateRangeValid
                        ? "Selected dates overlap with an existing booking"
                        : null
                );
            }
        } catch (error) {
            console.error('Error fetching bookings:', error);
            setPropertyBookings([]);
        } finally {
            setIsLoadingBookings(false);
            console.log('Bookings fetched');
        }
    };

    const handleDateChange = async (dates: [Date | null, Date | null]) => {
        const [start, end] = dates;
        setStartDate(start ?? undefined);
        setEndDate(end ?? undefined);

        // Clear error if dates are cleared
        if (!start || !end) {
            setDateError(null);
            return;
        }

        // If a property is selected, validate against its bookings
        if (selectedProperty) {
            const dateRangeValid = isDateRangeValidComparedToExistingBookings(
                start,
                end,
                selectedProperty,
                propertyBookings
            );

            setDateError(
                !dateRangeValid
                    ? "Selected dates overlap with an existing booking"
                    : null
            );
        }
    };

    useEffect(() => {
        const applyFilters = async () => {
            await filterProperties();
        };
        applyFilters();
    }, [searchTerm, selectedAmenities, startDate, endDate, priceRange, guestCount]);

    if (isLoading) {
        return (
            <Container className="px-5 py-5 property-wrapper">
                <div className="text-center">
                    <i className="fas fa-spinner fa-spin fa-3x text-primary mb-3"></i>
                    <p>Loading properties...</p>
                </div>
            </Container>
        );
    }

    return (
        <Container className="px-5 py-5 property-wrapper">
            <div className="mb-1 d-flex justify-content-center gap-4">
                <InputGroup style={{width: '400px'}}>
                    <InputGroup.Text>
                        <i className="fas fa-search"></i>
                    </InputGroup.Text>
                    <Form.Control
                        type="text"
                        placeholder="Search properties..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </InputGroup>

                <div className="position-relative">
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
                            onChange={handleDateChange}
                            dateFormat="dd/MM/yyyy"
                            minDate={new Date()}
                            disabled={isLoadingBookings}
                            placeholderText="Select dates"
                            className="form-control"
                            monthsShown={2}
                            excludeDateIntervals={
                                selectedProperty
                                    ? propertyBookings
                                        .filter(booking =>
                                            booking.status === 'confirmed' || booking.status === 'pending'
                                        )
                                        .map(convertBookingToDateIntervals)
                                    : []
                            }
                        />
                        {dateError && (
                            <div className="invalid-feedback">
                                {dateError}
                            </div>
                        )}
                    </div>
                    {isLoadingBookings && (
                        <div
                            className="position-absolute start-0 w-100 text-center"
                            style={{
                                top: 'calc(100% + 0.25rem)',
                                zIndex: 1000
                            }}
                        >
                            <div className="d-flex align-items-center justify-content-center gap-2">
                                <i className="fas fa-spinner fa-spin text-primary"></i>
                                <small className="text-muted">Loading availability...</small>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="mb-4">
                <div className="px-2">
                    <div className="d-flex justify-content-between mb-2">
                        <span>€{priceRange[0]}</span>
                        <span>€{priceRange[1]}</span>
                    </div>
                    <div className="d-flex gap-2">
                        <Form.Range
                            value={priceRange[0]}
                            onChange={(e) => {
                                const value = parseInt(e.target.value);
                                if (value <= priceRange[1]) {
                                    setPriceRange([value, priceRange[1]]);
                                }
                            }}
                            min={minPrice}
                            max={maxPrice}
                            className="w-50"
                        />
                        <Form.Range
                            value={priceRange[1]}
                            onChange={(e) => {
                                const value = parseInt(e.target.value);
                                if (value >= priceRange[0]) {
                                    setPriceRange([priceRange[0], value]);
                                }
                            }}
                            min={minPrice}
                            max={maxPrice}
                            className="w-50"
                        />
                    </div>
                </div>
            </div>

            <div className="mb-4">
                <div className="d-inline-flex flex-wrap gap-3 align-items-center">
                    {Object.values(AmenityType).map((amenity) => (
                        <Form.Check
                            key={amenity}
                            type="checkbox"
                            id={`amenity-${amenity}`}
                            label={
                                <span>
                                <i className={`fas ${getAmenityIcon(amenity)} ms-1 me-2`}></i>
                                    {amenity.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                            }
                            checked={selectedAmenities.has(amenity)}
                            onChange={() => {
                                const updated = new Set(selectedAmenities);
                                if (updated.has(amenity)) {
                                    updated.delete(amenity);
                                } else {
                                    updated.add(amenity);
                                }
                                setSelectedAmenities(updated);
                            }}
                        />
                    ))}
                    <div className="d-inline-flex" style={{width: '250px'}}>
                        <div className="fw-semibold text-dark d-flex align-items-center me-2">
                            Nr. of guests (Min.)
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

            </div>


            {selectedProperty && (
                <div className="mb-4">
                    <Badge
                        bg="primary"
                        className="d-inline-flex align-items-center"
                    >
                        <div>{properties.find(p => p.id === selectedProperty)?.name}</div>
                        <button
                            className="btn btn-link btn-sm text-white"
                            onClick={() => handlePropertySelect('')}
                        >
                            <i className="fa-solid fa-xmark fa-lg"></i>
                        </button>
                    </Badge>
                </div>
            )}

            <PropertyOverview
                properties={filteredProperties}
                propertiesPerPage={6}
                onPropertySelect={handlePropertySelect}
                selectedPropertyId={selectedProperty}
            />

            {selectedProperty && startDate && endDate && !dateError && (
                <div
                    className="position-sticky bottom-0 start-0 w-100 py-3 bg-white border-top shadow-lg"
                    style={{zIndex: 1030, marginTop: 'auto'}}
                >
                    <div className="d-flex justify-content-between align-items-center px-4">
                        <div className="d-flex align-items-center">
                            <i className="fas fa-check-circle text-success me-2"></i>
                            <span className="text-muted">
                            {properties.find(p => p.id === selectedProperty)?.name} •
                                {startDate?.toLocaleDateString()} - {endDate?.toLocaleDateString()}
                        </span>
                        </div>
                        <button
                            className="btn btn-primary d-flex align-items-center gap-2"
                            onClick={HandleBooking}
                        >
                            <i className="fas fa-calendar-check"></i>
                            Book Now - €{properties.find(p => p.id === selectedProperty)?.pricePerNight}/night
                        </button>
                    </div>
                </div>
            )}
        </Container>
    );
};

export default PropertyWrapper;