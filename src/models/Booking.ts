import {Conversation} from "./Conversation.ts";
import {PropertyChat} from "./Property.ts";
import {UserChat} from "./User.ts";

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled';


interface BookingBase {
    property: string;
    guest: string;
    checkIn: Date;
    checkOut: Date;
    totalPrice: number;
    status: BookingStatus;
    numberOfGuests: number;
    readonly conversation?: Conversation;
}


export interface Booking extends BookingBase {
    id: string;
}

//Initial response will have dates in string format and will be converted in Servcice layer
export interface BookingResponse extends Omit<BookingBase, 'checkOut' | 'checkIn'> {
    id: string;
    checkIn: string;
    checkOut: string;
}


export interface BookingCreate extends Omit<BookingBase, 'status'> {
}

export interface BookingChat {
    id: string;
    property: PropertyChat;
    guest: UserChat;
    conversation: Conversation;
}
