// src/services/mapbox.ts
import axios from "axios";

export interface MapboxFeature {
    place_name: string;
    center: [number, number];
    context: Array<{
        id: string;
        text: string;
    }>;
    place_type: string[];
}

export interface Address {
    streetAndNumber: string;
    place: string;
    region: string;
    postcode: string;
    country: string;
    latitude: number;
    longitude: number;
}

export const getPlaces = async (query: string): Promise<MapboxFeature[]> => {
    try {
        const response = await axios.get(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json`,
            {
                params: {
                    access_token: process.env.MAPBOX_ACCESS_TOKEN,
                    country: 'BE'
                },
                withCredentials: false
            }
        );
        return response.data.features;
    } catch (error) {
        console.error("Error fetching places:", error);
        return [];
    }
};