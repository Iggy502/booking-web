// services/socket.service.ts
import {io, Socket} from 'socket.io-client';
import {Booking, BookingChat} from '../models/Booking';
import {PropertyService} from "./property-service.ts";
import {UserService} from "./user.service.ts";
import {PropertyChat} from "../models/Property.ts";
import {UserChat} from "../models/User.ts";
import {BadRequest} from "http-errors";

class SocketService {
    private static socket: Socket | null = null;

    static initialize(token: string, userId: string) {
        this.socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
            path: '/socket.io',
            auth: {token},
            query: {userId}
        });
        return this.socket;
    }

    static async notifyBookingCreated(booking: Booking) {
        try {
            if (!this.socket) {
                return;
            }

            if (!booking.conversation) {
                throw BadRequest('Conversation not found for booking');
            }

            const propertyRelatedTobooking = await PropertyService.fetchPropertyById(booking.property);
            const userPropertyOwner = await UserService.getUserById(propertyRelatedTobooking.owner);
            const guestUser = await UserService.getUserById(booking.guest);

            const propertyChat: PropertyChat = {
                id: propertyRelatedTobooking.id,
                name: propertyRelatedTobooking.name,
                owner: userPropertyOwner
            }

            const guestChat: UserChat = {
                id: guestUser.id,
                firstName: guestUser.firstName,
                lastName: guestUser.lastName,
                profilePicturePath: guestUser.profilePicturePath
            }

            const bookingChat: BookingChat = {
                id: booking.id,
                property: propertyChat,
                guest: guestChat,
                conversation: booking.conversation

            }

            this.socket.emit('bookingCreated', bookingChat);
        } catch (error: any) {
            console.error("Something went wrong while fetching property or user data for booking", error);
        }

    }

    static disconnect() {
        this.socket?.disconnect();
        this.socket = null;
    }
}

export default SocketService;