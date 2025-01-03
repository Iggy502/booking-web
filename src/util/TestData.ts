import {AmenityType, PropertyViewModel} from "../models/Property.ts";
import {Booking} from "../models/Booking.ts";
import {Conversation} from "../models/Conversation.ts";

export const conversations: Conversation[] = [
    {
        id: "conv_001",
        active: true,
        messages: [
            { from: "owner_456", to: "guest_126", content: "Welcome! Looking forward to hosting you at Coastal Dunes Camp." },
            { from: "guest_126", to: "owner_456", content: "Thanks! What's the best time for check-in?" },
            { from: "owner_456", to: "guest_126", content: "You can check in anytime after 2 PM. I'll send the access code on arrival day." }
        ]
    },
    {
        id: "conv_002",
        active: true,
        messages: [
            { from: "owner_789", to: "guest_129", content: "Hello! Your booking at Flanders Fields is confirmed." },
            { from: "guest_129", to: "owner_789", content: "Great! Are there any good restaurants nearby?" },
            { from: "owner_789", to: "guest_129", content: "Yes, there's a great local place just 5 minutes away. I'll share the details during check-in." }
        ]
    },
    {
        id: "conv_003",
        active: false,
        messages: [
            { from: "owner_112", to: "guest_135", content: "Your Christmas booking is confirmed for Brussels Forest Retreat!" },
            { from: "guest_135", to: "owner_112", content: "Perfect, looking forward to the stay." }
        ]
    }
];

export const properties: PropertyViewModel[] = [
    // Add these to the properties array
    {
        id: "60d21b4667d0d8992e610c90",
        name: "Antwerp Harbor Glamping",
        owner: "12345",
        description: "Unique glamping experience with views of the Antwerp harbor and the Scheldt river.",
        address: {
            street: "Scheldelaan 405",
            city: "Antwerp",
            country: "Belgium",
            postalCode: "2040",
            latitude: 51.2867,
            longitude: 4.3229
        },
        pricePerNight: 120,
        maxGuests: 4,
        available: true,
        imagePaths: [
            "https://t3.ftcdn.net/jpg/05/39/76/28/360_F_539762817_90lTAPZAQwcS9nMzlfpGW0GW1JIttMTE.jpg",
            "https://t3.ftcdn.net/jpg/05/39/76/28/360_F_539762817_90lTAPZAQwcS9nMzlfpGW0GW1JIttMTE.jpg"
        ],
        amenities: [
            {type: AmenityType.Wifi, description: "High-speed harbor WiFi"},
            {type: AmenityType.RoomService, description: "Local seafood delivery"},
            {type: AmenityType.Parking, description: "Secure parking area", amount: 2}
        ]
    },
    {
        id: "60d21b4667d0d8992e610c91",
        name: "Ghent Canal Camping",
        owner: "12345",
        description: "Peaceful camping site along Ghent's historic waterways, walking distance to medieval city center.",
        address: {
            street: "Voorhoutkaai 43",
            city: "Ghent",
            country: "Belgium",
            postalCode: "9000",
            latitude: 51.0543,
            longitude: 3.7174
        },
        pricePerNight: 85,
        maxGuests: 6,
        available: true,
        imagePaths: [
            "https://t3.ftcdn.net/jpg/05/39/76/28/360_F_539762817_90lTAPZAQwcS9nMzlfpGW0GW1JIttMTE.jpg",
            "https://t3.ftcdn.net/jpg/05/39/76/28/360_F_539762817_90lTAPZAQwcS9nMzlfpGW0GW1JIttMTE.jpg"
        ],
        amenities: [
            {type: AmenityType.Wifi, description: "City WiFi access"},
            {type: AmenityType.PetFriendly, description: "Pet-friendly environment"},
            {type: AmenityType.Restaurant, description: "Belgian cuisine restaurant"}
        ]
    },
    {
        id: "60d21b4667d0d8992e610c92",
        name: "Spa Forest Haven",
        owner: "12345",
        description: "Luxury camping in the woods near the famous thermal city of Spa.",
        address: {
            street: "Route des Sources 67",
            city: "Spa",
            country: "Belgium",
            postalCode: "4900",
            latitude: 50.4851,
            longitude: 5.8638
        },
        pricePerNight: 110,
        maxGuests: 4,
        available: true,
        imagePaths: [
            "https://t3.ftcdn.net/jpg/05/39/76/28/360_F_539762817_90lTAPZAQwcS9nMzlfpGW0GW1JIttMTE.jpg",
            "https://t3.ftcdn.net/jpg/05/39/76/28/360_F_539762817_90lTAPZAQwcS9nMzlfpGW0GW1JIttMTE.jpg"
        ],
        amenities: [
            {type: AmenityType.Wifi, description: "Forest WiFi coverage"},
            {type: AmenityType.RoomService, description: "Spa treatment services"},
            {type: AmenityType.Parking, description: "Forest parking area", amount: 2}
        ]
    },
    {
        id: "60d21b4667d0d8992e610c93",
        name: "Bastogne Historical Camp",
        owner: "12345",
        description: "Historical camping site near the Battle of the Bulge memorials and museums.",
        address: {
            street: "Route de Martelange 21",
            city: "Bastogne",
            country: "Belgium",
            postalCode: "6600",
            latitude: 50.0046,
            longitude: 5.7167
        },
        pricePerNight: 70,
        maxGuests: 8,
        available: true,
        imagePaths: [
            "https://t3.ftcdn.net/jpg/05/39/76/28/360_F_539762817_90lTAPZAQwcS9nMzlfpGW0GW1JIttMTE.jpg",
            "https://t3.ftcdn.net/jpg/05/39/76/28/360_F_539762817_90lTAPZAQwcS9nMzlfpGW0GW1JIttMTE.jpg"
        ],
        amenities: [
            {type: AmenityType.Parking, description: "Historical site parking", amount: 4},
            {type: AmenityType.Restaurant, description: "World War II themed restaurant"},
            {type: AmenityType.PetFriendly, description: "Pet-friendly grounds"}
        ]
    },
    {
        id: "60d21b4667d0d8992e610c85",
        name: "Ardennes Wilderness Camp",
        owner: "12345",
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
            "https://t3.ftcdn.net/jpg/05/39/76/28/360_F_539762817_90lTAPZAQwcS9nMzlfpGW0GW1JIttMTE.jpg",
            "https://t3.ftcdn.net/jpg/05/39/76/28/360_F_539762817_90lTAPZAQwcS9nMzlfpGW0GW1JIttMTE.jpg"
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
            "https://t3.ftcdn.net/jpg/05/39/76/28/360_F_539762817_90lTAPZAQwcS9nMzlfpGW0GW1JIttMTE.jpg",
            "https://t3.ftcdn.net/jpg/05/39/76/28/360_F_539762817_90lTAPZAQwcS9nMzlfpGW0GW1JIttMTE.jpg"
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
            "https://t3.ftcdn.net/jpg/05/39/76/28/360_F_539762817_90lTAPZAQwcS9nMzlfpGW0GW1JIttMTE.jpg",
            "https://t3.ftcdn.net/jpg/05/39/76/28/360_F_539762817_90lTAPZAQwcS9nMzlfpGW0GW1JIttMTE.jpg"
        ],
        amenities: [
            {type: AmenityType.Parking, description: "Large parking area", amount: 4},
            {type: AmenityType.Restaurant, description: "On-site food service"}
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
            "https://t3.ftcdn.net/jpg/05/39/76/28/360_F_539762817_90lTAPZAQwcS9nMzlfpGW0GW1JIttMTE.jpg",
            "https://t3.ftcdn.net/jpg/05/39/76/28/360_F_539762817_90lTAPZAQwcS9nMzlfpGW0GW1JIttMTE.jpg"
        ],
        amenities: [
            {type: AmenityType.Wifi, description: "City-wide WiFi access"},
            {type: AmenityType.RoomService, description: "Morning breakfast delivery"}
        ]
    }
];
export const bookings: Booking[] = [
    // Ardennes Wilderness Camp bookings
    {
        id: "booking_001",
        property: "60d21b4667d0d8992e610c85",
        guest: "guest_123",
        checkIn: new Date("2024-06-15"),
        checkOut: new Date("2024-06-20"),
        totalPrice: 375,
        status: "confirmed",
        numberOfGuests: 4,
        conversation: conversations[0]
    },
    {
        id: "booking_002",
        property: "60d21b4667d0d8992e610c85",
        guest: "guest_124",
        checkIn: new Date("2024-07-01"),
        checkOut: new Date("2024-07-05"),
        totalPrice: 300,
        status: "pending",
        numberOfGuests: 2,
        conversation: conversations[1]
    },
    {
        id: "booking_003",
        property: "60d21b4667d0d8992e610c85",
        guest: "guest_125",
        checkIn: new Date("2024-08-10"),
        checkOut: new Date("2024-08-15"),
        totalPrice: 375,
        status: "cancelled",
        numberOfGuests: 3,
        conversation: conversations[2]
    },
    // Coastal Dunes Camp bookings
    {
        id: "booking_004",
        property: "60d21b4667d0d8992e610c86",
        guest: "guest_126",
        checkIn: new Date("2025-01-15"),
        checkOut: new Date("2025-01-20"),
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