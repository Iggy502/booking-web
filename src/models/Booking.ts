export type BookingStatus = 'pending' | 'confirmed' | 'cancelled';

export interface Booking {
    id: string;
    property: string;
    guest: string;
    checkIn: Date;
    checkOut: Date;
    totalPrice: number;
    status: BookingStatus;
    numberOfGuests: number;
}


export interface BookingCreate extends Omit<Booking, 'id' | 'status'> {
}




