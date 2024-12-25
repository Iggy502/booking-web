import {Booking, BookingCreate, BookingStatus} from "../models/Booking.ts";
import {bookings} from "../util/TestData.ts";
import {ServerError} from "../context/error.context.tsx";
import createHttpError from "http-errors";
import axios from "axios";

export class BookingService {

    private static readonly BASE_URL = '/bookings';

    static async fetchBookings(): Promise<Booking[]> {
        await new Promise(resolve => setTimeout(resolve, 500));

        return bookings.filter(booking => booking.status !== 'cancelled');
    }

    static async createBooking(booking: BookingCreate): Promise<Booking> {
        await new Promise(resolve => setTimeout(resolve, 500));
        const statusConfirmed: BookingStatus = 'confirmed';
        const response = {...booking, id: (bookings.length + 1).toString(), status: statusConfirmed};
        bookings.push(response);
        return response;
    }

    static fetchBookingById = async (bookingId: string): Promise<Booking> => {
        await new Promise(resolve => setTimeout(resolve, 500));

        const res = bookings.find(booking => booking.id === bookingId);

        if (!res) {
            throw {message: 'Booking not found', status: 404} as ServerError;
        }

        return res;
    };


    static async fetchBookingsByProperty(propertyId: string): Promise<Booking[]> {


        const url = `${process.env.SERVER_HOST}${this.BASE_URL}/findByProperty/${propertyId}`;

        try {

            if (!propertyId) {
                throw createHttpError(400);
            }

            const response = await axios.get<Booking[]>(url);
            return response.data;

        } catch (error: any) {
            console.error(error);
            throw createHttpError(error.status || 500, error.message);
        }
    }

    static async fetchBookingsByUser(userId: string): Promise<Booking[]> {
        return bookings.filter(booking => booking.guest === userId);
    }

    //ideally should be a 'GET' request
    //but since we are passing an array of property ids, we are using a 'POST' request, to clutter the URL
    static async searchBookingsByPropertyIds(propertyIds: string[]): Promise<Booking[]> {
        const url = `${process.env.SERVER_HOST}${this.BASE_URL}/search`;

        try {

            if (propertyIds.length === 0) {
                throw createHttpError(400);
            }

            const response = await axios.post<Booking[]>(url, propertyIds);
            return response.data;

        } catch (error: any) {
            console.error(error);
            throw createHttpError(error.status || 500, error.message);
        }
    }

    static async getTotalPriceForPropertyStartDateEndDate(propertyId: string, startDate: Date, endDate: Date): Promise<number> {
        await new Promise(resolve => setTimeout(resolve, 500));
        const booking = bookings.find(booking => booking.property === propertyId && booking.checkIn === startDate && booking.checkOut === endDate);
        return booking ? booking.totalPrice : 0;
    }


}