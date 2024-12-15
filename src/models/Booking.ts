export type BookingStatus = 'pending' | 'confirmed' | 'cancelled';

export interface IBookingBase {
    id: string;
    property: string;
    guest: string;
    checkIn: Date;
    checkOut: Date;
    totalPrice: number;
    status: BookingStatus;
    numberOfGuests: number;
}