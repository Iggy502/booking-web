import {UserViewModel} from "./User.ts";
import {PropertyViewModel} from "./Property.ts";

export interface RatingViewModel {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    helpful: number;
    review: string;
    rating: number;
    user: Pick<UserViewModel, 'id' | 'firstName' | 'lastName' | 'profilePicturePath'>
    property: Pick<PropertyViewModel, 'id' | 'name' | 'avgRating' | 'totalRatings'>;
}

export interface CreateRatingRequest {
    propertyId: string;
    userId: string;
    rating: number;
    review: string;
}

export interface UpdateRatingRequest extends Pick<CreateRatingRequest, 'review' | 'rating'> {
    id: string;

}