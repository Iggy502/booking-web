// src/services/auth.service.ts
import axios from 'axios';
import createHttpError, {HttpError} from "http-errors";
import {jwtDecode} from "jwt-decode";

interface LoginResponse {
    accessToken: string;
}

export interface AccessTokenPayload {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: UserRole[];
}


export interface Session {
    id: string;
    deviceInfo: string;
    lastUsed: Date;
}

enum UserRole {
    USER = 'USER',
    MODERATOR = 'MODERATOR',
    ADMIN = 'ADMIN',
    TEST = 'TEST'
}

export class AuthService {
    private static readonly ACCESS_TOKEN_KEY = 'accessToken';
    private static readonly BASE_URL = '/auth'; // Adjust based on your API base URL

    // Store the access token in localStorage
    private static setAccessToken(token: string): void {
        localStorage.setItem(this.ACCESS_TOKEN_KEY, token);
    }

    static getUserInfo = async (): Promise<AccessTokenPayload | null> => {

        const tokenWithBearer = this.getAccessToken();

        if (!tokenWithBearer) {
            return null;
        }

        const token = tokenWithBearer?.replace('Bearer ', '');

        const accessTokenPayload = jwtDecode<AccessTokenPayload>(token);

        if (!accessTokenPayload) {
            throw this.handleError({status: 401, message: 'Invalid token'});
        }

        return accessTokenPayload;

    }

    // Get the stored access token
    static getAccessToken() {
        return localStorage.getItem(this.ACCESS_TOKEN_KEY);
    }

    // Remove the access token
    private static removeAccessToken(): void {
        localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    }

    // Login user
    static async login(email: string, password: string): Promise<void> {
        try {
            const url = `${process.env.SERVER_HOST}${this.BASE_URL}/login`;
            console.log(`url is ${url}`);


            const response = await axios.post<LoginResponse>(url, {
                email,
                password,
            });
            this.setAccessToken(response.data.accessToken);
        } catch (error) {
            console.error("Error logging in:", error);
            throw this.handleError(error);
        }
    }

    // Refresh access token
    static async refreshToken(): Promise<void> {
        try {
            const response = await axios.post<LoginResponse>(
                `${process.env.SERVER_HOST}${this.BASE_URL}/refresh-token`
            );

            console.log("refresh token response", response);
            this.setAccessToken(response.data.accessToken);
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Logout user
    static async logout(): Promise<void> {
        console.log("Logging out");
        try {
            await axios.post(`${process.env.SERVER_HOST}${this.BASE_URL}/logout`);
            this.removeAccessToken();
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Logout from all devices
    static async logoutAll(): Promise<void> {
        try {
            await axios.post(`${process.env.SERVER_HOST}${this.BASE_URL}/logout-all`);
            this.removeAccessToken();
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // List active sessions
    static async listSessions(): Promise<Session[]> {
        try {
            const response = await axios.get<Session[]>(`${process.env.SERVER_HOST}${this.BASE_URL}/sessions`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    static handleError(error: any): HttpError {
        if (axios.isAxiosError(error)) {
            return createHttpError(error.response?.status || 500, error.response?.statusText || 'Network Error');
        }

        return createHttpError(error.status || 500, error.message);
    }

}