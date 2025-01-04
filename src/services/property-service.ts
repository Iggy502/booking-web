// src/services/PropertyService.ts
import {PropertyViewModel, PropertyCreate, PropertyUpdate} from '../models/Property';
import axios, {AxiosError} from "axios";
import createHttpError, {HttpError} from "http-errors";
import {CreateRatingRequest, RatingViewModel, UpdateRatingRequest} from "../models/Rating.ts";

export class PropertyService {

    private static BASE_URL_PROPERTIES = '/properties';
    private static BASE_URL_IMAGES = '/images';


    static async fetchAllProperties(): Promise<PropertyViewModel[]> {
        const url = `${process.env.SERVER_HOST}${this.BASE_URL_PROPERTIES}/`;

        try {
            const response = await axios.get<PropertyViewModel[]>(url)
            return response.data;
        } catch (error: any) {
            console.error("Error fetching properties:", error);
            throw this.convertApiError(error as AxiosError<HttpError>);
        }
    }

    static async fetchPropertyById(id: string): Promise<PropertyViewModel> {
        const url = `${process.env.SERVER_HOST}${this.BASE_URL_PROPERTIES}/${id}`;
        console.log("fetching property with url:", url);

        try {
            const response = await axios.get<PropertyViewModel>(url)
            console.log("Property fetched by id:", response.data);
            return response.data;
        } catch (error: any) {
            console.error("Error fetching property for given property id :", error, id);
            throw this.convertApiError(error as AxiosError<HttpError>);
        }
    }

    static async updateProperty(propertyId: string, property: PropertyUpdate): Promise<PropertyViewModel> {

        const url = `${process.env.SERVER_HOST}${this.BASE_URL_PROPERTIES}/${propertyId}`;

        try {
            const response = await axios.put<PropertyViewModel>(url, property)
            return response.data;
        } catch (error: any) {
            console.error("Error updating property:", error);
            throw this.convertApiError(error as AxiosError<HttpError>);
        }


    }

    static async fetchPropertiesForUser(userId: string): Promise<PropertyViewModel[]> {
        const url = `${process.env.SERVER_HOST}${this.BASE_URL_PROPERTIES}/findByUser/${userId}`;

        try {
            const response = await axios.get<PropertyViewModel[]>(url)
            return response.data;
        } catch (error: any) {
            console.error("Error fetching properties for User :", error, userId);
            throw this.convertApiError(error as AxiosError<HttpError>);
        }
    }


    static async createProperty(property: PropertyCreate): Promise<PropertyViewModel> {
        const url = `${process.env.SERVER_HOST}${this.BASE_URL_PROPERTIES}/`;

        try {
            const response = await axios.post<PropertyViewModel>(url, property)
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
            const response = await axios.post<PropertyViewModel[]>(url, propertyIds)
            console.log("Properties fetched by ids:", response.data);
            return response.data;
        } catch (error: any) {
            console.error("Error creating property:", error);
            throw this.convertApiError(error as AxiosError<HttpError>);
        }

    }

    static async fetchRatingsForProperty(propertyId: string): Promise<RatingViewModel[]> {

        const url = `${process.env.SERVER_HOST}${this.BASE_URL_PROPERTIES}/${propertyId}/ratings`;

        try {
            const response = await axios.get<RatingViewModel[]>(url);
            console.log("Ratings fetched for property:", response.data);
            return response.data;
        } catch (error: any) {
            console.error("Error fetching rating for property:", error);
            throw this.convertApiError(error as AxiosError<HttpError>);
        }
    }

    // returns all ratings with the new rating added to avoid fetching again
    static async createRatingForProperty(rating: CreateRatingRequest): Promise<RatingViewModel[]> {

        const url = `${process.env.SERVER_HOST}${this.BASE_URL_PROPERTIES}/ratings`;

        try {
            const response = await axios.post<RatingViewModel[]>(url, rating);
            return response.data;
        } catch (error: any) {
            console.error("Error creating rating for property:", error);
            throw this.convertApiError(error as AxiosError<HttpError>);
        }
    }

    //response is updated rating
    static async updateRatingForProperty(rating: UpdateRatingRequest): Promise<RatingViewModel> {

        const url = `${process.env.SERVER_HOST}${this.BASE_URL_PROPERTIES}/ratings/${rating.id}`;

        try {
            const response = await axios.put<RatingViewModel>(url, rating);
            return response.data;
        } catch (error: any) {
            console.error("Error updating rating for property:", error);
            throw this.convertApiError(error as AxiosError<HttpError>);
        }
    }

    //response is refresed ratings after deletion
    static async deleteRatingForProperty(ratingId: string): Promise<RatingViewModel[]> {

        const url = `${process.env.SERVER_HOST}${this.BASE_URL_PROPERTIES}/ratings/${ratingId}`;

        try {
            const response = await axios.delete<RatingViewModel[]>(url);
            return response.data;
        } catch (error: any) {
            console.error("Error deleting rating for property:", error);
            throw this.convertApiError(error as AxiosError<HttpError>);
        }
    }

    //response is updated rating
    static async toggleRatingHelpful(ratingId: string): Promise<RatingViewModel> {
        const url = `${process.env.SERVER_HOST}${this.BASE_URL_PROPERTIES}/ratings/${ratingId}/helpful`;

        try {
            const response = await axios.put<RatingViewModel>(url);
            return response.data;
        } catch (error: any) {
            console.error("Error toggling helpful for rating:", error);
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