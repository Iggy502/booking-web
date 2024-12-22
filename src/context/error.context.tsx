import React, {createContext, useContext, useState, useCallback} from 'react';

export interface ServerError {
    status: number;
    message: string;
}

interface ErrorContextType {
    showError: (error: ServerError) => void;
    clearError: () => void;
    error: ServerError | null;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

interface ErrorProviderProps {
    children: React.ReactNode;
}

export const ErrorProvider: React.FC<ErrorProviderProps> = ({children}) => {
    const [error, setError] = useState<ServerError | null>(null);

    const showError = useCallback((serverError: ServerError) => {
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