import {useEffect, useMemo, useRef, useState} from 'react';
import {Badge, Container, Form, InputGroup} from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import PropertyOverview from '../properties-overview/properties-overview';
import {getAmenityIcon, PropertyService} from '../../../services/property-service.ts'
import {BookingService} from "../../../services/booking-service.ts";
import {AmenityType, PropertyViewModel} from "../../../models/Property";
import './property-grid-selector.scss';
import {Booking} from "../../../models/Booking.ts";
import {useNavigate} from "react-router-dom";
import {useError} from "../../../context/error.context.tsx";


const PropertyGridSelector = () => {
    const [filteredProperties, setFilteredProperties] = useState<PropertyViewModel[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAmenities, setSelectedAmenities] = useState<Set<AmenityType>>(new Set());
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(undefined);
    const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
    const [dateError, setDateError] = useState<string | null>(null);
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingBookings, setIsLoadingBookings] = useState(false);
    const allProperties = useRef<PropertyViewModel[]>([]);
    const [propertyBookings, setPropertyBookings] = useState<Booking[]>([]);
    const [guestCount, setGuestCount] = useState<number>(1);
    const navigate = useNavigate();
    const {showError} = useError();


    const minPrice = 0;
    const maxPrice = 500;

    useEffect(() => {
        const loadProperties = async () => {
            try {
                const properties = await PropertyService.fetchAllProperties();
                allProperties.current = properties;
                setFilteredProperties(properties);
            } catch (error: any) {
                console.error('Error fetching properties:', error);
                showError(error);
                setFilteredProperties([]);
            } finally {
                setIsLoading(false);
            }
        };

        loadProperties();
    }, [showError]);

    useEffect(() => {
        const fetchBookings = async () => {
            if (selectedProperty) {
                try {
                    const bookings = await BookingService.fetchBookingsByProperty(selectedProperty);
                    setPropertyBookings(bookings);
                } catch (error: any) {
                    console.error('Error fetching bookings:', error);
                    showError(error)
                    setPropertyBookings([]);
                }
            } else {

                setPropertyBookings([]);
            }
        };

        fetchBookings()
    }, [selectedProperty, showError]);

    function convertBookingToDateIntervals(booking: Booking) {


        return {
            start: booking.checkIn,
            end: booking.checkOut
        };
    }

    const excludedDateIntervals = useMemo(() => {
        if (!selectedProperty) return [];


        return propertyBookings
            .filter(booking =>
                booking.status === 'confirmed' || booking.status === 'pending'
            )
            .map(convertBookingToDateIntervals);
    }, [selectedProperty, propertyBookings]);

    const HandleBooking = () => {
        console.log('Booking property:', selectedProperty);

        if (selectedProperty && startDate && endDate) {

            const utcStartDate = new Date(Date.UTC(
                startDate.getFullYear(),
                startDate.getMonth(),
                startDate.getDate()
            ));
            const utcEndDate = new Date(Date.UTC(
                endDate.getFullYear(),
                endDate.getMonth(),
                endDate.getDate()
            ));

            navigate(`/bookings/confirm?propertyId=${selectedProperty}&startDate=${utcStartDate.toISOString()}&endDate=${utcEndDate.toISOString()}`);
        }
    };

    const isDateRangeValidComparedToExistingBookings = (start: Date | null, end: Date | null, propertyId: string | null, existingBookings: Booking[]) => {
        if (!start || !end || !propertyId || !existingBookings?.length) return true;


        return !existingBookings.some(booking => {
            const bookingStart = booking.checkIn;
            const bookingEnd = booking.checkOut;

            return !(start > bookingEnd || end < bookingStart);

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

        // setIsLoadingBookings(true);
        console.log('Fetching bookings for property:', propertyId);
        try {

            let hasLoaded = false;

            const loadingTimer = setTimeout(() => {
                if (!hasLoaded) {
                    setIsLoadingBookings(true);
                }
            }, 500);

            const newPropertyBookings = await BookingService.fetchBookingsByProperty(propertyId);
            hasLoaded = true;
            clearTimeout(loadingTimer);

            setPropertyBookings(newPropertyBookings);
            setSelectedProperty(propertyId);

            console.log("selected property is now: ", propertyId);


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

        console.log(`Property wrapper start date: ${start} end date: ${end}`);

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
                            placeholderText="Select dates"
                            className="form-control"
                            monthsShown={2}
                            disabled={isLoadingBookings}
                            excludeDateIntervals={excludedDateIntervals.map(interval => {
                                const startDateInclusive = new Date(interval.start);
                                startDateInclusive.setDate(startDateInclusive.getDate() - 1);

                                return {...interval, start: startDateInclusive};
                            })}
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


            {
                selectedProperty && (
                    <div className="mb-4">
                        <Badge
                            bg="primary"
                            className="d-inline-flex align-items-center"
                        >
                            <div>{filteredProperties.find(property => property.id === selectedProperty)?.name}</div>
                            <button
                                className="btn btn-link btn-sm text-white"
                                onClick={() => handlePropertySelect('')}
                            >
                                <i className="fa-solid fa-xmark fa-lg"></i>
                            </button>
                        </Badge>
                    </div>
                )
            }

            <PropertyOverview
                properties={filteredProperties}
                propertiesPerPage={6}
                onPropertySelect={handlePropertySelect}
                selectedPropertyId={selectedProperty}
            />

            {
                selectedProperty && startDate && endDate && !dateError && (
                    <div
                        className="position-sticky bottom-0 start-0 w-100 py-3 bg-white border-top shadow-lg"
                        style={{zIndex: 1030, marginTop: 'auto'}}
                    >
                        <div className="d-flex justify-content-between align-items-center px-4">
                            <div className="d-flex align-items-center">
                                <i className="fas fa-check-circle text-success me-2"></i>
                                <span className="text-muted">
                            {filteredProperties.find(p => p.id === selectedProperty)?.name} •
                                    {startDate?.toLocaleDateString()} - {endDate?.toLocaleDateString()}
                        </span>
                            </div>
                            <button
                                className="btn btn-primary d-flex align-items-center gap-2"
                                onClick={HandleBooking}
                            >
                                <i className="fas fa-calendar-check"></i>
                                Book Now - €{filteredProperties.find(p => p.id === selectedProperty)?.pricePerNight}/night
                            </button>
                        </div>
                    </div>
                )
            }
        </Container>
    )
        ;
};

export default PropertyGridSelector;