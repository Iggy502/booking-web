import {UserViewModel, IUserUpdate} from "../models/User.ts";
import axios, {AxiosError} from "axios";
import createHttpError, {HttpError} from "http-errors";

export class UserService {
    private static BASE_URL_IMAGES = '/images';
    private static BASE_URL_USERS = '/users';
    private static BASE_URL_AUTH = '/auth';

    static async getUserById(userId: string): Promise<UserViewModel> {
        const url = `${process.env.SERVER_HOST}${UserService.BASE_URL_USERS}/${userId}`;

        try {
            const response = await axios.get<UserViewModel>(url);
            return response.data;
        } catch (error: any) {
            console.error("Error getting user:", error);
            throw this.convertApiError(error as AxiosError<HttpError>);
        }
    }

    static async createUser(user: IUserUpdate): Promise<UserViewModel> {
        const url = `${process.env.SERVER_HOST}${UserService.BASE_URL_USERS}`;

        try {
            const response = await axios.post<UserViewModel>(url, user);
            return response.data;
        } catch (error: any) {
            console.error("Error creating user:", error);
            throw this.convertApiError(error as AxiosError<HttpError>);
        }
    }

    static async initiatePasswordReset(email: string): Promise<void> {
        const url = `${process.env.SERVER_HOST}${UserService.BASE_URL_AUTH}/initiate-password-reset`;

        try {
            await axios.post(url, {email});
        } catch (error: any) {
            console.error("Error initiating password reset:", error);
            throw this.convertApiError(error as AxiosError<HttpError>);
        }
    }

    static async resetPassword(token: string, newPassword: string): Promise<void> {
        const url = `${process.env.SERVER_HOST}${UserService.BASE_URL_AUTH}/password-reset-confirm/${token}`;

        try {
            await axios.put(url, {
                newPassword
            });
        } catch (error: any) {
            console.error("Error resetting password:", error);
            throw this.convertApiError(error as AxiosError<HttpError>);
        }
    }


    static async editUser(userId: string, user: IUserUpdate): Promise<UserViewModel> {
        const url = `${process.env.SERVER_HOST}${UserService.BASE_URL_USERS}/${userId}`;

        try {
            const response = await axios.put<UserViewModel>(url, user);
            return response.data;
        } catch (error: any) {
            console.error("Error updating user:", error);
            throw this.convertApiError(error as AxiosError<HttpError>);
        }
    }

    static async uploadImage(userId: string, image: File): Promise<void> {
        const url = `${process.env.SERVER_HOST}${this.BASE_URL_IMAGES}/profile/${userId}`;
        const formData = new FormData();

        formData.append('image', image);  // This matches multer's middleware expected field name

        try {
            await axios.post(url, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
        } catch (error: any) {
            console.error("Error uploading image:", error);
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

}