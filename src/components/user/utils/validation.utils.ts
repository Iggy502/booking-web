import {isValidPhoneNumber} from "react-phone-number-input";

export const VALIDATORS = {
    // Email regex that follows RFC 5322 standards
    EMAIL_REGEX: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,

    // Phone regex for Belgian numbers (mobile and fixed line)
    PHONE_REGEX: /^(?:(?:\+|00)32|0)[-.\s]?(?:\d[-.\s]?){8,9}$/,

    // Name validation - letters, spaces, hyphens, apostrophes
    NAME_REGEX: /^[a-zA-ZÀ-ÿ'\- ]{2,50}$/,

    PHONE_PREFIX: '32'
};

export interface ValidationError {
    [key: string]: string;
}

export const validateFormFields = (fields: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    password?: string;
    confirmPassword?: string;
}): ValidationError => {
    const errors: ValidationError = {};

    console.log(fields);

    // First Name validation
    if (!fields.firstName) {
        errors.firstName = 'First name is required';
    } else if (!VALIDATORS.NAME_REGEX.test(fields.firstName)) {
        errors.firstName = 'First name can only contain letters, hyphens, and apostrophes';
    }

    // Last Name validation
    if (!fields.lastName) {
        errors.lastName = 'Last name is required';
    } else if (!VALIDATORS.NAME_REGEX.test(fields.lastName)) {
        errors.lastName = 'Last name can only contain letters, hyphens, and apostrophes';
    }

    // Email validation
    if (!fields.email) {
        errors.email = 'Email is required';
    } else if (!VALIDATORS.EMAIL_REGEX.test(fields.email)) {
        errors.email = 'Please enter a valid email address';
    }



    // Phone validation
    if (!fields.phone) {
        errors.phone = 'Phone number is required';
    } else if (!isValidPhoneNumber(fields.phone)) {
        errors.phone = 'Please enter a valid phone number (e.g., +32 470123456)';
    }

    // Password validation (if present in fields)
    if (fields.password !== undefined) {
        if (!fields.password) {
            errors.password = 'Password is required';
        } else if (fields.password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
        } else if (!/\d/.test(fields.password)) {
            errors.password = 'Password must contain at least one number';
        } else if (!/[A-Z]/.test(fields.password)) {
            errors.password = 'Password must contain at least one uppercase letter';
        } else if (!/[a-z]/.test(fields.password)) {
            errors.password = 'Password must contain at least one lowercase letter';
        }

        // Confirm password validation
        if (fields.confirmPassword !== undefined) {
            if (!fields.confirmPassword) {
                errors.confirmPassword = 'Please confirm your password';
            } else if (fields.password !== fields.confirmPassword) {
                errors.confirmPassword = 'Passwords do not match';
            }
        }
    }

    return errors;
};