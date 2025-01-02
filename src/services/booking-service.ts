import {Booking, BookingCreate, BookingResponse} from "../models/Booking.ts";
import {bookings} from "../util/TestData.ts";
import createHttpError, {HttpError} from "http-errors";
import axios, {AxiosError} from "axios";
import {io, Socket} from 'socket.io-client';
import SocketService from "./socket.service.ts";

export class BookingService {
    private static readonly BASE_URL = '/bookings';
    private static socket: Socket | null = null;

    static initializeSocket(token: string) {
        this.socket = io(process.env.SOCKET_URL || 'http://localhost:3001', {
            path: '/socket.io',
            auth: {token}
        });

        this.socket.on('connect', () => {
            console.log('Socket connected');
        });

        this.socket.on('error', (error) => {
            console.error('Socket error:', error);
        });

        return this.socket;
    }

    static async createBooking(booking: BookingCreate): Promise<Booking> {
        const url = `${process.env.SERVER_HOST}${this.BASE_URL}/`;

        try {
            const response = await axios.post<BookingResponse>(url, booking);
            const newBooking = this.convertBookingToBookingWithDates(response.data);

            // Notify socket server about new booking
            if (this.socket?.connected) {
                this.socket.emit('bookingCreated', newBooking);
            }

            //independent so should not be awaited
            SocketService.notifyBookingCreated(newBooking);

            return newBooking;
        } catch (error: any) {
            console.error("Error creating booking:", error);
            throw this.convertApiError(error as AxiosError<HttpError>);
        }
    }

    static async fetchBookingsByUserGuest(userId: string): Promise<Booking[]> {
        const url = `${process.env.SERVER_HOST}${this.BASE_URL}/user/guest/${userId}`;

        try {
            const response = await axios.get<BookingResponse[]>(url);
            console.log("Bookings retrieved for user:", response.data);
            return response.data.map(this.convertBookingToBookingWithDates);
        } catch (error: any) {
            console.error("Error fetching bookings:", error);
            throw this.convertApiError(error as AxiosError<HttpError>);
        }
    }

    static async fetchBookingsByUserGuestOrHost(userId: string): Promise<Booking[]> {
        const url = `${process.env.SERVER_HOST}${this.BASE_URL}/findByUserGuestOrHost/${userId}`;

        try {
            const response = await axios.get<BookingResponse[]>(url);
            return response.data.map(this.convertBookingToBookingWithDates);
        } catch (error: any) {
            console.error("Error fetching bookings:", error);
            throw this.convertApiError(error as AxiosError<HttpError>);
        }
    }

    static async fetchBookingById(bookingId: string): Promise<Booking> {
        const url = `${process.env.SERVER_HOST}${this.BASE_URL}/${bookingId}`;

        try {
            const response = await axios.get<BookingResponse>(url);
            return this.convertBookingToBookingWithDates(response.data);
        } catch (error: any) {
            console.error("Error fetching booking:", error);
            throw this.convertApiError(error as AxiosError<HttpError>);
        }
    }

    static async fetchBookingsByProperty(propertyId: string): Promise<Booking[]> {
        const url = `${process.env.SERVER_HOST}${this.BASE_URL}/findByProperty/${propertyId}`;

        try {
            if (!propertyId) {
                throw createHttpError(400);
            }

            const response = await axios.get<BookingResponse[]>(url);
            return response.data.map(this.convertBookingToBookingWithDates);
        } catch (error: any) {
            throw this.convertApiError(error as AxiosError<HttpError>);
        }
    }

    static async searchBookingsByPropertyIds(propertyIds: string[]): Promise<Booking[]> {
        const url = `${process.env.SERVER_HOST}${this.BASE_URL}/search`;

        try {
            if (propertyIds.length === 0) {
                throw createHttpError(400);
            }

            const response = await axios.post<BookingResponse[]>(url, propertyIds);
            return response.data.map(this.convertBookingToBookingWithDates);
        } catch (error: any) {
            console.log("Error searching bookings by property ids:", error);
            throw this.convertApiError(error as AxiosError<HttpError>);
        }
    }

    static async getTotalPriceForPropertyStartDateEndDate(
        propertyId: string,
        startDate: Date,
        endDate: Date
    ): Promise<number> {
        await new Promise(resolve => setTimeout(resolve, 500));
        const booking = bookings.find(booking =>
            booking.property === propertyId &&
            booking.checkIn === startDate &&
            booking.checkOut === endDate
        );
        return booking ? booking.totalPrice : 0;
    }

    static convertApiError(error: AxiosError<HttpError>): HttpError {
        const errorConvertedToHttpError = createHttpError(
            error.response?.status ||
            error.response?.data.status ||
            500
        );
        errorConvertedToHttpError.message = error.response?.data.message ||
            errorConvertedToHttpError.message;

        return errorConvertedToHttpError;
    }

    static convertBookingToBookingWithDates(booking: BookingResponse): Booking {
        return {
            ...booking,
            checkIn: new Date(booking.checkIn),
            checkOut: new Date(booking.checkOut)
        };
    }

    static disconnectSocket() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }
}