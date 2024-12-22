import {Booking, BookingCreate, BookingStatus} from "../models/Booking.ts";
import {bookings} from "../util/TestData.ts";
import {ServerError} from "../context/error.context.tsx";

export class BookingService {
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
        await new Promise(resolve => setTimeout(resolve, 500));
        return bookings.filter(booking => booking.property === propertyId);
    }

    static async fetchBookingsByUser(userId: string): Promise<Booking[]> {
        await new Promise(resolve => setTimeout(resolve, 500));
        return bookings.filter(booking => booking.guest === userId);
    }


    static async fetchBookingsByPropertyIds(propertyIds: string[]): Promise<Booking[]> {
        await new Promise(resolve => setTimeout(resolve, 500));
        return bookings.filter(booking => propertyIds.includes(booking.property));
    }

    static async getTotalPriceForPropertyStartDateEndDate(propertyId: string, startDate: Date, endDate: Date): Promise<number> {
        await new Promise(resolve => setTimeout(resolve, 500));
        const booking = bookings.find(booking => booking.property === propertyId && booking.checkIn === startDate && booking.checkOut === endDate);
        return booking ? booking.totalPrice : 0;
    }


}