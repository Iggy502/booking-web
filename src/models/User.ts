export interface User {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
}


export interface UserViewModel extends User {
    id: string;
    profilePicturePath?: string;
}

export interface IUserCreate extends User {
    password: string;
}

export interface IUserUpdate extends Partial<User> {
    password?: string;
}

export interface UserChat extends Omit<User, 'email' | 'phone'> {
    id: string;
    profilePicturePath?: string;
}