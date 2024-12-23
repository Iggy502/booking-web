import React, {createContext, useCallback, useContext, useState} from 'react';
import {HttpError} from "http-errors";

export interface ServerError {
    status: number;
    message: string;
}

interface ErrorContextType {
    showError: (error: HttpError) => void;
    clearError: () => void;
    error: HttpError | null;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

interface ErrorProviderProps {
    children: React.ReactNode;
}

export const ErrorProvider: React.FC<ErrorProviderProps> = ({children}) => {
    const [error, setError] = useState<HttpError | null>(null);

    const showError = useCallback((serverError: HttpError) => {
        setError(serverError);
        setTimeout(() => {
            setError(null);
        }, 5000);
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return (
        <ErrorContext.Provider value={{error, showError, clearError}}>
            {children}
        </ErrorContext.Provider>
    );
};

export const useError = () => {
    const context = useContext(ErrorContext);
    if (context === undefined) {
        throw new Error('useError must be used within an ErrorProvider');
    }
    return context;
};

export default ErrorContext;