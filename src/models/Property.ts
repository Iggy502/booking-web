import {UserChat} from "./User.ts";

export interface IAddress {
    street: string;
    city: string;
    country: string;
    postalCode: string;
    latitude?: number;
    longitude?: number;
}

export enum AmenityType {
    Wifi = 'Wifi',
    Parking = 'Parking',
    Pool = 'Pool',
    Gym = 'Gym',
    Restaurant = 'Restaurant',
    Bar = 'Bar',
    Spa = 'Spa',
    PetFriendly = 'PetFriendly',
    RoomService = 'RoomService'
}

export interface IAmenity {
    type: AmenityType;
    description: string;
    amount?: number;
}

interface PropertyBase {
    name: string;
    owner: string;
    description: string;
    address: IAddress;
    pricePerNight: number;
    maxGuests: number;
    available: boolean;
    amenities?: IAmenity[];
}


export interface PropertyViewModel extends PropertyBase {
    id: string;
    imagePaths: string[];
    avgRating?: number;
    totalRatings?: number;
}

export interface PropertyChat {
    id: string;
    name: string;
    owner: UserChat;
}

export interface PropertyCreate extends PropertyBase {

}

export interface PropertyUpdate extends Partial<PropertyBase> {
}