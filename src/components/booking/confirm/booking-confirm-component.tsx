import React, {useEffect, useState} from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {Card, Col, Container, Row} from 'react-bootstrap';
import {PropertyService} from '../../../services/property-service.ts';
import {AmenityType, PropertyViewModel} from '../../../models/Property.ts';
import {useError} from '../../../context/error.context.tsx';
import {BookingService} from "../../../services/booking-service.ts";
import './booking-confirm-component.scss'
import {BookingCreate} from "../../../models/Booking.ts";
import {BadRequest, Unauthorized} from "http-errors";
import {useAuth} from "../../../context/auth.context.tsx";

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

const BookingConfirmComponent: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [property, setProperty] = useState<PropertyViewModel | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedGuests, setSelectedGuests] = useState<number>(1);
    const [hasError, setHasError] = useState(false);
    const {showError} = useError();
    const {userInfo} = useAuth();

    const propertyId = searchParams.get('propertyId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    useEffect(() => {
        const fetchProperty = async () => {
            if (!propertyId || !startDate || !endDate) return;
            setHasError(false);

            PropertyService.checkAvailability(propertyId, new Date(startDate), new Date(endDate))
                .then((available) => {
                    if (!available) {
                        throw BadRequest('Property is not available for selected dates');
                    }
                    return PropertyService.fetchPropertyById(propertyId);
                }).then((propertyData) => {
                setProperty(propertyData);
            }).catch((error: any) => {
                console.error("Error fetching property:", error);
                showError(error);
            }).finally(
                () => setIsLoading(false)
            )
        };

        fetchProperty();
    }, [propertyId, startDate, endDate, showError]);


    if (!propertyId || !startDate || !endDate) {
        return (
            <Container className="py-5">
                <Card className="text-center p-5 shadow-sm">
                    <Card.Body>
                        <img
                            src="https://i.ytimg.com/vi/CzmXjvj4dik/maxresdefault.jpg"
                            alt="Missing Information"
                            className="mb-4 illustration"
                        />
                        <h2>Invalid Booking Request</h2>
                        <p className="text-muted mb-4">Missing required booking information. Please select a property
                            and
                            dates first.</p>
                        <button
                            className="btn custom-btn-green"
                            onClick={() => navigate('/')}
                        >
                            <i className="fas fa-home me-2"></i>
                            Return to Homepage
                        </button>
                    </Card.Body>
                </Card>
            </Container>
        );
    }

    if (isLoading) {
        return (
            <Container className="py-5">
                <div className="text-center">
                    <i className="fas fa-spinner fa-spin fa-3x spinner-custom mb-3"></i>
                    <p>Loading booking details...</p>
                </div>
            </Container>
        );
    }

    if (hasError || !property) {
        return (
            <Container className="py-5">
                <Card className="text-center p-5 shadow-sm">
                    <Card.Body>
                        <img
                            src="https://i.ytimg.com/vi/CzmXjvj4dik/maxresdefault.jpg"
                            alt="Error Loading Data"
                            className="mb-4 illustration"
                        />
                        <h2>Oops! Something went wrong</h2>
                        <p className="text-muted mb-4">We couldn't load the booking details. Please try again later.</p>
                        <div className="d-flex gap-3 justify-content-center">
                            <button
                                className="btn custom-btn-green"
                                onClick={() => window.location.reload()}
                            >
                                <i className="fas fa-redo me-2"></i>
                                Try Again
                            </button>
                            <button
                                className="btn btn-outline-secondary"
                                onClick={() => navigate('/')}
                            >
                                <i className="fas fa-home me-2"></i>
                                Return to Homepage
                            </button>
                        </div>
                    </Card.Body>
                </Card>
            </Container>
        );
    }

    const checkInDate = new Date(startDate);

    const checkOutDate = new Date(endDate);


    console.log(`checkInDate: ${checkInDate} and checkOutDate: ${checkOutDate} inside confirm booking component`);
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    const totalPrice = (property?.pricePerNight ?? 0) * nights;


    const handleConfirmBooking = async () => {
        try {

            if (!userInfo) {
                throw Unauthorized('User not authenticated');
            }

            const bookingData: BookingCreate = {
                property: property.id,
                checkIn: checkInDate,
                guest: userInfo.id,
                checkOut: checkOutDate,
                numberOfGuests: selectedGuests,
                totalPrice: totalPrice
            };

            const newBooking = await BookingService.createBooking(bookingData);
            navigate(`/bookings/${newBooking.id}`);
        } catch (error: any) {
            console.error("Error creating booking:", error);
            showError(error);
        }
    };


    return (
        <Container fluid className="py-5 booking-page">
            <h1 className="text-center w-100 mb-4">Confirm Your Booking</h1>
            <Row className="justify-content-center">
                <Col md={8}>
                    <Card className="shadow-sm">
                        <Card.Header className="custom-header py-3">
                            <h3 className="mb-0">Booking Details</h3>
                        </Card.Header>
                        <Card.Body className="p-4">
                            <Row className="mb-4">
                                <Col>
                                    <h4 className="mb-3">{property.name}</h4>
                                    <p className="text-muted mb-2">
                                        <i className="fas fa-map-marker-alt me-2"></i>
                                        {property.address.street}, {property.address.city}, {property.address.country}
                                    </p>
                                    <p className="text-muted mb-0 d-flex align-items-center">
                                        <i className="fas fa-user me-2"></i>
                                        {property.maxGuests}
                                    </p>
                                </Col>
                            </Row>

                            <Row className="mb-4">
                                <Col>
                                    <h5 className="mb-3">Amenities</h5>
                                    <div className="d-flex flex-wrap gap-3">
                                        {property.amenities?.map((amenity) => (
                                            <div
                                                key={amenity.type}
                                                className="amenity-item d-flex align-items-center"
                                            >
                                                <i className={`fas ${getAmenityIcon(amenity.type)} me-2`}></i>
                                                <span>{amenity.type.replace(/([A-Z])/g, ' $1').trim()}</span>
                                            </div>
                                        ))}
                                    </div>
                                </Col>
                            </Row>

                            <Row className="mb-4">
                                <Col md={6}>
                                    <div className="date-section">
                                        <label className="d-block mb-2">Check-in</label>
                                        <div className="d-flex align-items-center">
                                            <i className="fas fa-calendar-check me-2 custom-text-green"></i>
                                            <span className="date-value">
                                                {checkInDate.toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </Col>
                                <Col md={6}>
                                    <div className="date-section">
                                        <label className="d-block mb-2">Check-out</label>
                                        <div className="d-flex align-items-center">
                                            <i className="fas fa-calendar-times me-2 custom-text-green"></i>
                                            <span className="date-value">
                                                {checkOutDate.toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </Col>
                            </Row>

                            <Row className="mb-4">
                                <Col>
                                    <div className="guest-section">
                                        <h5 className="mb-3">Number of Guests</h5>
                                        <div className="guest-selector">
                                            <button
                                                className="btn btn-outline-secondary"
                                                onClick={() => setSelectedGuests(prev => Math.max(1, prev - 1))}
                                                disabled={selectedGuests <= 1}
                                            >
                                                <i className="fas fa-minus"></i>
                                            </button>
                                            <div className="guest-count">
                                                <div className="count">{selectedGuests}</div>
                                                <div className="label">
                                                    {selectedGuests === 1 ? 'Guest' : 'Guests'}
                                                </div>
                                            </div>
                                            <button
                                                className="btn btn-outline-secondary"
                                                onClick={() => setSelectedGuests(prev => Math.min(property.maxGuests, prev + 1))}
                                                disabled={selectedGuests >= property.maxGuests}
                                            >
                                                <i className="fas fa-plus"></i>
                                            </button>
                                        </div>
                                        <div className="text-muted small mt-2">
                                            <i className="fas fa-info-circle me-1"></i>
                                            Maximum {property.maxGuests} guests allowed
                                        </div>
                                    </div>
                                </Col>
                            </Row>

                            <div className="price-section pt-4 mt-4">
                                <Row className="align-items-center">
                                    <Col>
                                        <div className="d-flex flex-column gap-2">
                                            <div className="price-item d-flex align-items-center">
                                                <i className="fas fa-moon me-2 custom-text-green"></i>
                                                <span className="label">{nights} nights</span>
                                            </div>
                                            <div className="price-item d-flex align-items-center">
                                                <i className="fas fa-euro-sign me-2 custom-text-green"></i>
                                                <span className="label">{property.pricePerNight} per night</span>
                                            </div>
                                        </div>
                                    </Col>
                                    <Col className="text-end">
                                        <label className="d-block text-uppercase mb-1">Total Price</label>
                                        <div className="total-price">€{totalPrice}</div>
                                    </Col>
                                </Row>
                            </div>
                        </Card.Body>
                        <Card.Footer className="bg-light p-4">
                            <div className="d-grid gap-2">
                                <button className="btn custom-btn-green btn-lg"
                                        onClick={() => handleConfirmBooking()}>
                                    <i className="fas fa-check-circle me-2"></i>
                                    Confirm Booking
                                </button>
                            </div>
                        </Card.Footer>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default BookingConfirmComponent;