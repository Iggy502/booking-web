import {Conversation} from "./Conversation.ts";

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
    readonly conversation?: Conversation;
}


export interface BookingResponse extends Omit<Booking, 'checkOut' | 'checkIn'> {
    checkIn: string;
    checkOut: string;
}


export interface BookingCreate extends Omit<Booking, 'id' | 'status'> {
}

