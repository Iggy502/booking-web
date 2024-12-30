// src/contexts/AuthContext.tsx
import React, {createContext, useCallback, useContext, useEffect, useState} from 'react';
import {AccessTokenPayload, AuthService} from '../services/auth.service';
import axios from "axios";

interface AuthContextType {
    isAuthenticated: boolean;
    userInfo: AccessTokenPayload | null;
    refreshUserInfo: () => Promise<void>;
    getAccessTokenCurrentUser: () => Promise<string | null>;
    isInitialized: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
                                                                          children
                                                                      }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
        console.log("checking if authenticated");
        console.log(!!AuthService.getAccessToken());

        return !!AuthService.getAccessToken();
    });

    const [userInfo, setUserInfo] = useState<AccessTokenPayload | null>(null);

    const [isInitialized, setIsInitialized] = useState(false);

    // Function to refresh token and update user info
    const refreshUserInfo = useCallback(async () => {
        try {
            await AuthService.refreshToken();
            const newUserInfo = await AuthService.getUserInfo();
            setUserInfo(newUserInfo);
        } catch (error) {
            console.error("Error refreshing user info:", error);
            throw error;
        }
    }, []);

    const forceLogout = useCallback(() => {
        AuthService.clearTokens();
        setIsAuthenticated(false);
        setUserInfo(null);
    }, []);


    const getAccessTokenCurrentUser = useCallback(async () => {
        if (isAuthenticated) {
            return AuthService.getAccessToken();
        }
        return null;
    }, [isAuthenticated]);


    // Initialize user info when authenticated
    useEffect(() => {
        const initializeUserInfo = () => {
            if (isAuthenticated) {
                try {
                    const info = AuthService.getUserInfo();
                    setUserInfo(info);
                } catch (error) {
                    console.error("Error initializing user info:", error);
                }
            } else {
                setUserInfo(null);
            }
            setIsInitialized(true);
        };

        initializeUserInfo();
    }, [isAuthenticated]);


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

                if (error.response?.data?.code === 'AUTH_USER_NOT_FOUND') {
                    forceLogout();
                    return Promise.reject(error);
                }

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
                        forceLogout();
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
    }, [forceLogout, isAuthenticated]);

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
                userInfo,
                refreshUserInfo,
                isInitialized,
                getAccessTokenCurrentUser,
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
