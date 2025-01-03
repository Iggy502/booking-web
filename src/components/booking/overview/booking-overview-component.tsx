import {useEffect, useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Badge, Container, Pagination, Spinner, Table} from 'react-bootstrap';
import {BookingService} from '../../../services/booking-service';
import {PropertyService} from '../../../services/property-service';
import {Booking, BookingStatus} from '../../../models/Booking';
import {PropertyViewModel} from '../../../models/Property';
import {useError} from '../../../context/error.context';
import './booking-overview-component.scss';
import {useAuth} from "../../../context/auth.context.tsx";
import {Unauthorized} from "http-errors";

const ITEMS_PER_PAGE = 10;

const BookingOverviewComponent = () => {
    const navigate = useNavigate();
    const {showError} = useError();
    const [bookings, setBookings] = useState<Array<Omit<Booking, 'property'> & ({
        property: PropertyViewModel | undefined
    })>>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const {userInfo} = useAuth();

    useEffect(() => {
        const fetchBookingsAndProperties = async () => {
            try {


                if (!userInfo) {
                    throw Unauthorized('User not authenticated');
                }

                const userBookings = await BookingService.fetchBookingsByUserGuest(userInfo.id);
                console.log(`bookings: ${userBookings}`);
                const propertyIds = [...new Set(userBookings.map(booking => booking.property))];
                const properties = await PropertyService.fetchPropertiesByIds(propertyIds);
                const propertyMap = new Map(properties.map(property => [property.id, property]));

                const bookingsWithProperties = userBookings.map(booking => ({
                    ...booking,
                    property: propertyMap.get(booking.property)
                }));

                setBookings(bookingsWithProperties);
            } catch (error: any) {
                console.error('Error fetching bookings:', error);
                showError(error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBookingsAndProperties();
    }, [userInfo, showError]);

    const totalPages = Math.ceil(bookings.length / ITEMS_PER_PAGE);
    const paginatedBookings = bookings.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const getStatusBadgeVariant = (status: BookingStatus) => {
        switch (status.toLowerCase()) {
            case 'confirmed':
                return 'success';
            case 'pending':
                return 'warning';
            case 'cancelled':
                return 'danger';
            default:
                return 'secondary';
        }
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
            <Container className="booking-table-container py-5 text-center">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </Container>
        );
    }

    if (bookings.length === 0) {
        return (
            <Container className="booking-table-container py-5">
                <div className="empty-state">
                    <i className="fas fa-calendar-alt fa-3x"></i>
                    <h3>No Bookings Found</h3>
                    <p>You haven't made any bookings yet.</p>
                </div>
            </Container>
        );
    }

    return (
        <Container className="booking-table-container py-5">
            <h1 className="mb-4">Your Bookings</h1>
            <div className="table-wrapper">
                <div className="table-responsive">
                    <Table hover className="align-middle">
                        <thead>
                        <tr>
                            <th>Property</th>
                            <th>Location</th>
                            <th>Check-in</th>
                            <th>Check-out</th>
                            <th>Guests</th>
                            <th>Status</th>
                            <th>Total Price</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {paginatedBookings.map((booking) => (
                            <tr key={booking.id}>
                                <td className="property-cell">
                                    <div className="d-flex align-items-center">
                                        <img
                                            src={booking.property?.imagePaths?.[0]}
                                            alt={booking.property?.name}
                                            className="property-image me-3"
                                        />
                                        <div className="text-truncate property-name">
                                            {booking.property?.name}
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    {booking.property?.address.city}, {booking.property?.address.country}
                                </td>
                                <td>
                                    {new Date(booking.checkIn).toLocaleDateString()}
                                </td>
                                <td>
                                    {new Date(booking.checkOut).toLocaleDateString()}
                                </td>
                                <td>
                                    {booking.numberOfGuests}
                                </td>
                                <td>
                                    <Badge bg={getStatusBadgeVariant(booking.status)}>
                                        {booking.status}
                                    </Badge>
                                </td>
                                <td>
                                    €{booking.totalPrice}
                                </td>
                                <td>
                                    <button
                                        className="btn btn-outline-primary btn-sm"
                                        onClick={() => navigate(`/bookings/${booking.id}`)}
                                    >
                                        View Details
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </Table>
                </div>
            </div>
            {totalPages > 1 && paginationElement}
        </Container>
    );
};

export default BookingOverviewComponent;