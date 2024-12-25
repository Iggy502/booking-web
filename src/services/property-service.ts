// src/services/PropertyService.ts
import {Property, PropertyCreate} from '../models/Property';
import {properties} from '../util/TestData';
import {ServerError} from "../context/error.context.tsx";
import axios from "axios";
import createHttpError from "http-errors";

export class PropertyService {

    private static BASE_URL = '/properties';


    static async fetchAllProperties(): Promise<Property[]> {
        const url = `${process.env.SERVER_HOST}${this.BASE_URL}/`;

        try {
            const response = await axios.get<Property[]>(url)
            return response.data;
        } catch (error: any) {
            console.error("Error fetching properties:", error);
            throw createHttpError(error.status || 500, error.message);
        }
    }

    static async fetchPropertyById(id: string): Promise<Property | undefined> {
        await new Promise(resolve => setTimeout(resolve, 500));
        return properties.find(property => property.id === id);
    }

    static async fetchPropertiesByOwner(ownerId: string): Promise<Property[]> {
        await new Promise(resolve => setTimeout(resolve, 500));
        return properties.filter(property => property.owner === ownerId);
    }


    static async createProperty(property: PropertyCreate): Promise<Property> {
        const url = `${process.env.SERVER_HOST}${this.BASE_URL}/`;

        try {
            const response = await axios.post<Property>(url, property)
            return response.data;
        } catch (error: any) {
            console.error("Error creating property:", error);
            throw createHttpError(error.status || 500, error.message);
        }

    }

    static async checkAvailability(propertyId: string, checkIn: Date, checkOut: Date): Promise<boolean> {
        await new Promise(resolve => setTimeout(resolve, 500));

        return true;

        // mock error
        // const err: ServerError = {message: 'Failed to check availability', status: 500};
        // throw err;
    }

    static async uploadImages(propertyId: string, images: File[]): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, 500));
        const property = properties.find(property => property.id === propertyId);

        if (!property) {
            const err: ServerError = {message: 'Property not found', status: 404};
            throw err;
        }

        property.imagePaths?.push(...images.map(image => URL.createObjectURL(image)));


        // return images.map(image => URL.createObjectURL(image));
    }

    static async fetchPropertiesByIds(propertyIds: string[]) {
        await new Promise(resolve => setTimeout(resolve, 500));
        return properties.filter(property => propertyIds.includes(property.id));
    }
}