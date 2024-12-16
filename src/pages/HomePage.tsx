// src/pages/HomePage/index.tsx
import {Container} from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import MapView from '../components/mapview/MapView.tsx';
import {bookings, properties} from '../util/TestData.ts';
import {useEffect, useState} from 'react';
import "react-datepicker/dist/react-datepicker.css";
import './HomePage.scss';
import '@fortawesome/fontawesome-free/css/all.min.css';
import {Address} from "../services/Mapbox.ts";
import {SearchBox} from "../components/SearchBox/SearchBox.tsx";
import {PropertyResponse} from "../models/Property.ts";

const HomePage = () => {
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(undefined);
    const [selectedLocation, setSelectedLocation] = useState<{ longitude: number, latitude: number } | null>(null);
    const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
    const [dateError, setDateError] = useState<string | null>(null);
    const [filteredProperties, setFilteredProperties] = useState<PropertyResponse[]>(properties);


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
            <Container fluid className="py-4">
                <h1 className="text-center responsive-heading mb-4 ">Find your next camping spot</h1>
                <div className="selected-property-banner mb-4 position-relative ">
                    {selectedProperty && (
                        <div className="">
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
                        </div>
                    )}

                </div>
                <div className="d-flex my-2 justify-content-center align-items-center gap-4 w-100 flex-wrap py-2">
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