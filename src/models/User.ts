export interface IUser {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    profilePicturePath?: string;
}

export interface IUserCreate extends IUser {
    password: string;
}