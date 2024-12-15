import {AmenityType, PropertyResponse} from "../models/Property.ts";
import {IBookingBase} from "../models/Booking.ts";

export const properties: PropertyResponse[] = [
    {
        id: "60d21b4667d0d8992e610c85",
        name: "Ardennes Wilderness Camp",
        owner: "owner_123",
        description: "Secluded camping spot in the heart of the Ardennes forest, perfect for nature lovers.",
        address: {
            street: "Rue de la Forêt 45",
            city: "La Roche-en-Ardenne",
            country: "Belgium",
            postalCode: "6980",
            latitude: 50.1827,
            longitude: 5.5766
        },
        pricePerNight: 75,
        maxGuests: 6,
        available: true,
        imagePaths: [
            "/api/placeholder/800/600",
            "/api/placeholder/800/600"
        ],
        amenities: [
            {type: AmenityType.Wifi, description: "Forest-wide WiFi coverage"},
            {type: AmenityType.Parking, description: "Private parking spot", amount: 2},
            {type: AmenityType.PetFriendly, description: "Dogs allowed on leash"}
        ]
    },
    {
        id: "60d21b4667d0d8992e610c86",
        name: "Coastal Dunes Camp",
        owner: "owner_456",
        description: "Beachside camping with stunning North Sea views.",
        address: {
            street: "Zeedijk 234",
            city: "Ostend",
            country: "Belgium",
            postalCode: "8400",
            latitude: 51.2247,
            longitude: 2.9137
        },
        pricePerNight: 95,
        maxGuests: 4,
        available: true,
        imagePaths: [
            "/api/placeholder/800/600",
            "/api/placeholder/800/600"
        ],
        amenities: [
            {type: AmenityType.Parking, description: "Beachfront parking", amount: 1},
            {type: AmenityType.Wifi, description: "High-speed internet"}
        ]
    },
    {
        id: "60d21b4667d0d8992e610c87",
        name: "Flanders Fields Campsite",
        owner: "owner_789",
        description: "Historical camping location with World War I monuments nearby.",
        address: {
            street: "Ieperstraat 78",
            city: "Ypres",
            country: "Belgium",
            postalCode: "8900",
            latitude: 50.8492,
            longitude: 2.8779
        },
        pricePerNight: 65,
        maxGuests: 8,
        available: true,
        imagePaths: [
            "/api/placeholder/800/600",
            "/api/placeholder/800/600"
        ],
        amenities: [
            {type: AmenityType.Parking, description: "Large parking area", amount: 4},
            {type: AmenityType.Restaurant, description: "On-site food service"}
        ]
    },
    {
        id: "60d21b4667d0d8992e610c88",
        name: "Meuse Valley Resort",
        owner: "owner_101",
        description: "Riverside camping with water sports activities.",
        address: {
            street: "Rue de la Meuse 123",
            city: "Namur",
            country: "Belgium",
            postalCode: "5000",
            latitude: 50.4649,
            longitude: 4.8657
        },
        pricePerNight: 85,
        maxGuests: 5,
        available: true,
        imagePaths: [
            "/api/placeholder/800/600",
            "/api/placeholder/800/600"
        ],
        amenities: [
            {type: AmenityType.Pool, description: "Natural swimming area"},
            {type: AmenityType.PetFriendly, description: "Pet friendly environment"}
        ]
    },
    {
        id: "60d21b4667d0d8992e610c89",
        name: "Brussels Forest Retreat",
        owner: "owner_112",
        description: "Urban camping experience near the capital.",
        address: {
            street: "Avenue de la Forêt de Soignes 67",
            city: "Brussels",
            country: "Belgium",
            postalCode: "1170",
            latitude: 50.8003,
            longitude: 4.4180
        },
        pricePerNight: 70,
        maxGuests: 4,
        available: true,
        imagePaths: [
            "/api/placeholder/800/600",
            "/api/placeholder/800/600"
        ],
        amenities: [
            {type: AmenityType.Wifi, description: "City-wide WiFi access"},
            {type: AmenityType.RoomService, description: "Morning breakfast delivery"}
        ]
    }
];
export const bookings: IBookingBase[] = [
    // Ardennes Wilderness Camp bookings
    {
        id: "booking_001",
        property: "60d21b4667d0d8992e610c85",
        guest: "guest_123",
        checkIn: new Date("2024-06-15"),
        checkOut: new Date("2024-06-20"),
        totalPrice: 375,
        status: "confirmed",
        numberOfGuests: 4
    },
    {
        id: "booking_002",
        property: "60d21b4667d0d8992e610c85",
        guest: "guest_124",
        checkIn: new Date("2024-07-01"),
        checkOut: new Date("2024-07-05"),
        totalPrice: 300,
        status: "pending",
        numberOfGuests: 2
    },
    {
        id: "booking_003",
        property: "60d21b4667d0d8992e610c85",
        guest: "guest_125",
        checkIn: new Date("2024-08-10"),
        checkOut: new Date("2024-08-15"),
        totalPrice: 375,
        status: "cancelled",
        numberOfGuests: 3
    },
    // Coastal Dunes Camp bookings
    {
        id: "booking_004",
        property: "60d21b4667d0d8992e610c86",
        guest: "guest_126",
        checkIn: new Date("2024-07-15"),
        checkOut: new Date("2024-07-20"),
        totalPrice: 475,
        status: "confirmed",
        numberOfGuests: 4
    },
    {
        id: "booking_005",
        property: "60d21b4667d0d8992e610c86",
        guest: "guest_127",
        checkIn: new Date("2024-08-01"),
        checkOut: new Date("2024-08-03"),
        totalPrice: 190,
        status: "pending",
        numberOfGuests: 2
    },
    {
        id: "booking_006",
        property: "60d21b4667d0d8992e610c86",
        guest: "guest_128",
        checkIn: new Date("2024-06-20"),
        checkOut: new Date("2024-06-25"),
        totalPrice: 475,
        status: "cancelled",
        numberOfGuests: 3
    },
    // Flanders Fields Campsite bookings
    {
        id: "booking_007",
        property: "60d21b4667d0d8992e610c87",
        guest: "guest_129",
        checkIn: new Date("2024-06-01"),
        checkOut: new Date("2024-06-07"),
        totalPrice: 455,
        status: "confirmed",
        numberOfGuests: 6
    },
    {
        id: "booking_008",
        property: "60d21b4667d0d8992e610c87",
        guest: "guest_130",
        checkIn: new Date("2024-07-20"),
        checkOut: new Date("2024-07-25"),
        totalPrice: 325,
        status: "pending",
        numberOfGuests: 4
    },
    {
        id: "booking_009",
        property: "60d21b4667d0d8992e610c87",
        guest: "guest_131",
        checkIn: new Date("2024-08-15"),
        checkOut: new Date("2024-08-20"),
        totalPrice: 325,
        status: "cancelled",
        numberOfGuests: 5
    },
    // Meuse Valley Resort bookings
    {
        id: "booking_010",
        property: "60d21b4667d0d8992e610c88",
        guest: "guest_132",
        checkIn: new Date("2024-06-10"),
        checkOut: new Date("2024-06-15"),
        totalPrice: 425,
        status: "confirmed",
        numberOfGuests: 4
    },
    {
        id: "booking_011",
        property: "60d21b4667d0d8992e610c88",
        guest: "guest_133",
        checkIn: new Date("2024-07-05"),
        checkOut: new Date("2024-07-10"),
        totalPrice: 425,
        status: "pending",
        numberOfGuests: 3
    },
    {
        id: "booking_012",
        property: "60d21b4667d0d8992e610c88",
        guest: "guest_134",
        checkIn: new Date("2024-08-20"),
        checkOut: new Date("2024-08-25"),
        totalPrice: 425,
        status: "cancelled",
        numberOfGuests: 5
    },
    // Brussels Forest Retreat bookings
    {
        id: "booking_013",
        property: "60d21b4667d0d8992e610c89",
        guest: "guest_135",
        checkIn: new Date("2024-06-25"),
        checkOut: new Date("2024-06-30"),
        totalPrice: 350,
        status: "confirmed",
        numberOfGuests: 3
    },
    {
        id: "booking_014",
        property: "60d21b4667d0d8992e610c89",
        guest: "guest_135",
        checkIn: new Date("2024-12-25"),
        checkOut: new Date("2024-12-30"),
        totalPrice: 350,
        status: "confirmed",
        numberOfGuests: 3
    },
    {
        id: "booking_015",
        property: "60d21b4667d0d8992e610c89",
        guest: "guest_136",
        checkIn: new Date("2024-07-15"),
        checkOut: new Date("2024-07-20"),
        totalPrice: 350,
        status: "pending",
        numberOfGuests: 2
    },
    {
        id: "booking_016",
        property: "60d21b4667d0d8992e610c89",
        guest: "guest_137",
        checkIn: new Date("2024-08-05"),
        checkOut: new Date("2024-08-10"),
        totalPrice: 350,
        status: "cancelled",
        numberOfGuests: 4
    }
];