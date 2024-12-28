// src/services/PropertyService.ts
import {Property, PropertyCreate, PropertyUpdate} from '../models/Property';
import axios, {AxiosError} from "axios";
import createHttpError, {HttpError} from "http-errors";

export class PropertyService {

    private static BASE_URL_PROPERTIES = '/properties';
    private static BASE_URL_IMAGES = '/images';


    static async fetchAllProperties(): Promise<Property[]> {
        const url = `${process.env.SERVER_HOST}${this.BASE_URL_PROPERTIES}/`;

        try {
            const response = await axios.get<Property[]>(url)
            return response.data;
        } catch (error: any) {
            console.error("Error fetching properties:", error);
            throw this.convertApiError(error as AxiosError<HttpError>);
        }
    }

    static async fetchPropertyById(id: string): Promise<Property> {
        const url = `${process.env.SERVER_HOST}${this.BASE_URL_PROPERTIES}/${id}`;
        console.log("fetching property with url:", url);

        try {
            const response = await axios.get<Property>(url)
            console.log("Property fetched by id:", response.data);
            return response.data;
        } catch (error: any) {
            console.error("Error fetching property for given property id :", error, id);
            throw this.convertApiError(error as AxiosError<HttpError>);
        }
    }

    static async updateProperty(propertyId: string, property: PropertyUpdate): Promise<Property> {

        const url = `${process.env.SERVER_HOST}${this.BASE_URL_PROPERTIES}/${propertyId}`;

        try {
            const response = await axios.put<Property>(url, property)
            return response.data;
        } catch (error: any) {
            console.error("Error updating property:", error);
            throw this.convertApiError(error as AxiosError<HttpError>);
        }


    }

    static async fetchPropertiesForUser(userId: string): Promise<Property[]> {
        const url = `${process.env.SERVER_HOST}${this.BASE_URL_PROPERTIES}/findByUser/${userId}`;

        try {
            const response = await axios.get<Property[]>(url)
            return response.data;
        } catch (error: any) {
            console.error("Error fetching properties for User :", error, userId);
            throw this.convertApiError(error as AxiosError<HttpError>);
        }
    }


    static async createProperty(property: PropertyCreate): Promise<Property> {
        const url = `${process.env.SERVER_HOST}${this.BASE_URL_PROPERTIES}/`;

        try {
            const response = await axios.post<Property>(url, property)
            return response.data;
        } catch (error: any) {
            console.error("Error creating property:", error);
            throw this.convertApiError(error as AxiosError<HttpError>);
        }

    }

    static async checkAvailability(propertyId: string, checkIn: Date, checkOut: Date): Promise<boolean> {
        const url = `${process.env.SERVER_HOST}${this.BASE_URL_PROPERTIES}/checkAvailabilityForPropertyStartAndEndDate/${propertyId}`;

        console.log(`checkavailability with url: ${url} and checkIn: ${checkIn} and checkOut: ${checkOut}`);

        try {
            const response = await axios.get<boolean>(url, {
                params: {
                    checkIn: checkIn.toISOString(),
                    checkOut: checkOut.toISOString()
                }
            });

            return response.data;
        } catch (error: any) {
            console.error("Error checking availability:", error);
            const httpError = this.convertApiError(error as AxiosError<HttpError>);
            console.log("httpError", httpError);
            throw httpError;
        }

    }

    static async uploadImages(propertyId: string, images: File[]): Promise<void> {
        const url = `${process.env.SERVER_HOST}${this.BASE_URL_IMAGES}/property/${propertyId}`;
        const formData = new FormData();

        // Append each image with the field name 'images'
        images.forEach(image => {
            formData.append('images', image);  // This matches multer's expected field name
        });

        try {
            await axios.post(url, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
        } catch (error: any) {
            const httpError = this.convertApiError(error as AxiosError<HttpError>);
            throw httpError;
        }
    }

    static async fetchPropertyImages(propertyId: string): Promise<string[]> {
        const url = `${process.env.SERVER_HOST}${this.BASE_URL_IMAGES}/property/${propertyId}`;
        try {
            const response = await axios.get<string[]>(url);
            return response.data;
        } catch (error: any) {
            console.error("Error fetching property images:", error);
            throw this.convertApiError(error as AxiosError<HttpError>);
        }
    }

    static async fetchPropertiesByIds(propertyIds: string[]) {
        const url = `${process.env.SERVER_HOST}${this.BASE_URL_PROPERTIES}/searchByIds`;

        try {
            const response = await axios.post<Property[]>(url, propertyIds)
            console.log("Properties fetched by ids:", response.data);
            return response.data;
        } catch (error: any) {
            console.error("Error creating property:", error);
            throw this.convertApiError(error as AxiosError<HttpError>);
        }

    }


    //Axios wraps each error response in a different object
    //Convert it back to HttpError as is the type from the server
    static convertApiError(error: AxiosError<HttpError>): HttpError {

        const errorConvertedToHttpError = createHttpError(error.response?.status || 500);
        errorConvertedToHttpError.message = error.response?.data.message || errorConvertedToHttpError.message;

        return errorConvertedToHttpError;

    }

    static async deletePropertyImage(id: string, selectedImage: string) {

        const url = `${process.env.SERVER_HOST}${this.BASE_URL_IMAGES}/property`;

        console.log("deleting image with url: ", url, " and id: ", id, " and selectedImage: ", selectedImage);

        try {
            await axios.delete(url, {data: {propertyId: id, imagePath: selectedImage}});
        } catch (error: any) {
            const httpError = this.convertApiError(error as AxiosError<HttpError>);
            throw httpError;
        }

    }
}