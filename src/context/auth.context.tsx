// src/contexts/AuthContext.tsx
import React, {createContext, useCallback, useContext, useEffect, useState} from 'react';
import {AccessTokenPayload, AuthService} from '../services/auth.service';
import axios from "axios";

interface AuthContextType {
    isAuthenticated: boolean;
    getUserInfo: () => Promise<AccessTokenPayload | null>;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
                                                                          children
                                                                      }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
        return !!AuthService.getAccessToken();
    });


    const getUserInfo = useCallback(() => {
        return AuthService.getUserInfo();
    }, []);

    // Setup axios interceptor for adding the token to requests
    useEffect(() => {
        axios.defaults.withCredentials = true;  // Add this line
        const requestInterceptor = axios.interceptors.request.use((config) => {
            const token = AuthService.getAccessToken();

            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        });


        // Setup axios interceptor for handling token refresh
        const responseInterceptor = axios.interceptors.response.use(
            (response) => response,
            async (error) => {

                console.log("trying to refresh token");
                const originalRequest = error.config;

                if (error.response?.status === 401 && !originalRequest._retry
                    && !originalRequest.url?.includes('/refresh-token')
                    && !originalRequest.url?.includes('/login') && isAuthenticated
                ) {
                    console.log("refreshing token");

                    try {
                        await AuthService.refreshToken();
                        originalRequest._retry = true;
                        return axios(originalRequest);
                    } catch (refreshError) {
                        console.error("Error refreshing token:", refreshError);
                        setIsAuthenticated(false);
                        throw refreshError;
                    }
                }

                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.request.eject(requestInterceptor);
            axios.interceptors.response.eject(responseInterceptor);
        };
    }, []);

    const login = async (email: string, password: string) => {
        await AuthService.login(email, password);
        setIsAuthenticated(true);
    };

    const logout = async () => {
        await AuthService.logout();
        setIsAuthenticated(false);
    };


    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                getUserInfo,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
