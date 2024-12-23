import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {Card, Col, Container, Row} from 'react-bootstrap';
import {BookingService} from '../../../services/booking-service';
import {PropertyService} from '../../../services/property-service';
import {Booking} from '../../../models/Booking';
import {Property} from '../../../models/Property';
import {ServerError, useError} from '../../../context/error.context';
import './booking-detail-component.scss';

const BookingDetailComponent: React.FC = () => {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const { showError } = useError();
    const [booking, setBooking] = useState<Booking | null>(null);
    const [property, setProperty] = useState<Property | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!bookingId) return;

            try {
                const bookingData = await BookingService.fetchBookingById(bookingId);
                if (!bookingData) {
                    throw { status: 404, message: 'Booking not found' };
                }
                setBooking(bookingData);

                const propertyData = await PropertyService.fetchPropertyById(bookingData.property);
                if (!propertyData) {
                    throw { status: 404, message: 'Property not found' };
                }
                setProperty(propertyData);
            } catch (error) {
                showError(error as ServerError);
                navigate('/');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [bookingId, showError, navigate]);

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

    if (!booking || !property) return null;

    return (
        <Container className="py-5 booking-overview-page">
            <div className="mb-4">
                <button
                    className="btn btn-link p-0 text-decoration-none back-link"
                    onClick={() => navigate('/bookings')}
                >
                    <i className="fas fa-arrow-left me-2"></i>
                    Back to My Bookings
                </button>
            </div>

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
                        </Col>
                    </Row>

                    <Row className="mb-4">
                        <Col md={6}>
                            <div className="info-section">
                                <h5>Check-in</h5>
                                <div className="d-flex align-items-center">
                                    <i className="fas fa-calendar-check me-2 custom-text-green"></i>
                                    <span className="fs-5">
                                        {new Date(booking.checkIn).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </Col>
                        <Col md={6}>
                            <div className="info-section">
                                <h5>Check-out</h5>
                                <div className="d-flex align-items-center">
                                    <i className="fas fa-calendar-times me-2 custom-text-green"></i>
                                    <span className="fs-5">
                                        {new Date(booking.checkOut).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </Col>
                    </Row>

                    <Row className="mb-4">
                        <Col md={6}>
                            <div className="info-section">
                                <h5>Guests</h5>
                                <div className="d-flex align-items-center">
                                    <i className="fas fa-users me-2 custom-text-green"></i>
                                    <span className="fs-5">{booking.numberOfGuests} guests</span>
                                </div>
                            </div>
                        </Col>
                        <Col md={6}>
                            <div className="info-section">
                                <h5>Status</h5>
                                <div className="d-flex align-items-center">
                                    <i className="fas fa-info-circle me-2 custom-text-green"></i>
                                    <span className={`fs-5 text-capitalize status-${booking.status.toLowerCase()}`}>
                                        {booking.status}
                                    </span>
                                </div>
                            </div>
                        </Col>
                    </Row>

                    <div className="price-section pt-4 mt-4">
                        <Row className="align-items-center">
                            <Col className="text-end">
                                <label className="d-block text-uppercase mb-1">Total Price</label>
                                <div className="total-price">€{booking.totalPrice}</div>
                            </Col>
                        </Row>
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default BookingDetailComponent;