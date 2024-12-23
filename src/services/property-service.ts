// src/services/PropertyService.ts
import {Property, PropertyCreate} from '../models/Property';
import {properties} from '../util/TestData';
import {ServerError} from "../context/error.context.tsx";

export class PropertyService {
    static async fetchProperties(): Promise<Property[]> {

        await new Promise(resolve => setTimeout(resolve, 500));

        return properties.filter(property => property.available);
    }

    static async fetchPropertyById(id: string): Promise<Property | undefined> {
        await new Promise(resolve => setTimeout(resolve, 500));

        // throw NotFound('Property not found');

        return properties.find(property => property.id === id);
    }

    static async fetchPropertiesByOwner(ownerId: string): Promise<Property[]> {
        await new Promise(resolve => setTimeout(resolve, 500));
        return properties.filter(property => property.owner === ownerId);
    }


    static async createProperty(property: PropertyCreate): Promise<Property> {
        await new Promise(resolve => setTimeout(resolve, 500));
        const response: Property = {...property, id: (properties.length + 1).toString()};
        properties.push(response);
        return response;
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