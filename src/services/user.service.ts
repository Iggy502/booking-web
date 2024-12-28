import {UserViewModel, IUserUpdate} from "../models/User.ts";
import axios, {AxiosError} from "axios";
import createHttpError, {HttpError} from "http-errors";

export class UserService {
    private static BASE_URL_IMAGES = '/images';
    private static BASE_URL_USERS = '/users';

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

        formData.append('image', image);  // This matches multer's expected field name


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

        console.log("Error converting API error:", error.response);

        const errorConvertedToHttpError = createHttpError(error.response?.status || 500);
        errorConvertedToHttpError.message = error.response?.data.message || errorConvertedToHttpError.message;

        console.log("Error converted to HttpError:", errorConvertedToHttpError);
        return errorConvertedToHttpError;

    }


}