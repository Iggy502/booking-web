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


export interface Property extends PropertyBase {
    id: string;
    imagePaths: string[];
}


export interface PropertyCreate extends PropertyBase {

}

export interface PropertyUpdate extends Partial<PropertyBase> {
}