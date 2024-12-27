import {Booking, BookingCreate, BookingResponse} from "../models/Booking.ts";
import {bookings} from "../util/TestData.ts";
import createHttpError, {HttpError} from "http-errors";
import axios, {AxiosError} from "axios";

export class BookingService {

    private static readonly BASE_URL = '/bookings';

    static async fetchBookings(): Promise<Booking[]> {
        await new Promise(resolve => setTimeout(resolve, 500));

        return bookings.filter(booking => booking.status !== 'cancelled');
    }

    static async createBooking(booking: BookingCreate): Promise<Booking> {
        const url = `${process.env.SERVER_HOST}${this.BASE_URL}/`;

        try {
            const response = await axios.post<BookingResponse>(url, booking);
            return this.convertBookingToBookingWithDates(response.data);
        } catch (error: any) {
            console.error("Error creating booking:", error);
            throw this.convertApiError(error as AxiosError<HttpError>);
        }
    }

    static fetchBookingById = async (bookingId: string): Promise<Booking> => {
        const url = `${process.env.SERVER_HOST}${this.BASE_URL}/${bookingId}`;

        try {
            const response = await axios.get<BookingResponse>(url);
            return this.convertBookingToBookingWithDates(response.data);
        } catch (error: any) {
            console.error("Error creating booking:", error);
            throw this.convertApiError(error as AxiosError<HttpError>);
        }
    };


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

    static async fetchBookingsByUser(userId: string): Promise<Booking[]> {
        const url = `${process.env.SERVER_HOST}${this.BASE_URL}/user/${userId}`;

        console.log("Fetching bookings for user:", userId);

        try {
            const response = await axios.get<BookingResponse[]>(url);
            console.log("Bookings retieved for user:", response.data);
            return response.data.map(this.convertBookingToBookingWithDates);
        } catch (error: any) {
            console.error("Error creating booking:", error);
            throw this.convertApiError(error as AxiosError<HttpError>);
        }

    }

    //ideally should be a 'GET' request
    //but since we are passing an array of property ids, we are using a 'POST' request, to clutter the URL
    static async searchBookingsByPropertyIds(propertyIds: string[]): Promise<Booking[]> {
        const url = `${process.env.SERVER_HOST}${this.BASE_URL}/search`;

        try {

            if (propertyIds.length === 0) {
                throw createHttpError(400);
            }

            const response = await axios.post<BookingResponse[]>(url, propertyIds);
             console.log("Bookings retrieved for property ids:", response.data);
            return response.data.map(this.convertBookingToBookingWithDates);

        } catch (error: any) {
            console.log("Error searching bookings by property ids:", error);
            throw this.convertApiError(error as AxiosError<HttpError>);
        }
    }

    static async getTotalPriceForPropertyStartDateEndDate(propertyId: string, startDate: Date, endDate: Date): Promise<number> {
        await new Promise(resolve => setTimeout(resolve, 500));
        const booking = bookings.find(booking => booking.property === propertyId && booking.checkIn === startDate && booking.checkOut === endDate);
        return booking ? booking.totalPrice : 0;
    }


    static convertApiError(error: AxiosError<HttpError>): HttpError {

        const errorConvertedToHttpError = createHttpError(error.response?.status || error.response?.data.status || 500);
        errorConvertedToHttpError.message = error.response?.data.message || errorConvertedToHttpError.message;

        return errorConvertedToHttpError;

    }

    static convertBookingToBookingWithDates(booking: BookingResponse): Booking {
        return {
            ...booking,
            checkIn: new Date(booking.checkIn),
            checkOut: new Date(booking.checkOut)
        };
    }


}