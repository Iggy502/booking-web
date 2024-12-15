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


export interface PropertyResponse {
    id: string;
    name: string;
    owner: string;
    description: string;
    address: IAddress;
    pricePerNight: number;
    maxGuests: number;
    available: boolean;
    imagePaths?: string[];
    amenities?: IAmenity[];

}