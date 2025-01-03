import React, {useEffect, useState} from 'react';
import {Alert, Button, Card, Form, Spinner} from 'react-bootstrap';
import {Edit, Star, ThumbsUp, Trash} from 'lucide-react';
import {PropertyService} from '../../../../services/property-service.ts';
import {useAuth} from '../../../../context/auth.context.tsx';
import {CreateRatingRequest, RatingViewModel, UpdateRatingRequest} from '../../../../models/Rating.ts';
import './property-ratings.component.scss';

interface PropertyRatingsProps {
    propertyId: string;
}

const PropertyRatings: React.FC<PropertyRatingsProps> = ({propertyId}) => {
    const {userInfo} = useAuth();
    const [ratings, setRatings] = useState<RatingViewModel[]>([]);
    const [isAddingReview, setIsAddingReview] = useState(false);
    const [editingRating, setEditingRating] = useState<string | null>(null);
    const [formData, setFormData] = useState({rating: 0, review: ''});
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchRatings();
    }, [propertyId]);

    const fetchRatings = async () => {
        try {
            setIsLoading(true);
            const fetchedRatings = await PropertyService.fetchRatingForProperty(propertyId);
            setRatings(fetchedRatings);
        } catch (error) {
            setError('Failed to load reviews');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (!userInfo) return;

            if (editingRating) {
                const updateRequest: UpdateRatingRequest = {
                    id: editingRating,
                    ...formData
                };
                await PropertyService.updateRatingForProperty(updateRequest);
            } else {
                const createRequest: CreateRatingRequest = {
                    propertyId,
                    userId: userInfo.id,
                    ...formData,
                };
                const updatedRatings = await PropertyService.createRatingForProperty(createRequest);
                setRatings(updatedRatings);
            }

            setIsAddingReview(false);
            setEditingRating(null);
            setFormData({rating: 0, review: ''});
            await fetchRatings();
        } catch (error) {
            setError('Failed to submit review');
        }
    };

    const handleDeleteRating = async (ratingId: string) => {
        try {
            const updatedRatings = await PropertyService.deleteRatingForProperty(ratingId);
            setRatings(updatedRatings);
        } catch (error) {
            setError('Failed to delete review');
        }
    };

    const handleEditRating = (rating: RatingViewModel) => {
        setFormData({
            rating: rating.rating,
            review: rating.review
        });
        setEditingRating(rating.id);
        setIsAddingReview(true);
    };

    const handleToggleHelpful = async (ratingId: string) => {
        try {
            await PropertyService.toggleRatingHelpful(ratingId);
            await fetchRatings();
        } catch (error) {
            setError('Failed to mark review as helpful');
        }
    };

    const RatingStars: React.FC<{
        value: number;
        isInteractive?: boolean;
        onSelect?: (value: number) => void;
    }> = ({value, isInteractive = false, onSelect}) => (
        <div className="d-flex align-items-center">
            {[1, 2, 3, 4, 5].map((star) => (
                <Button
                    key={star}
                    variant="link"
                    className="p-0 me-1"
                    onClick={isInteractive ? () => onSelect?.(star) : undefined}
                    disabled={!isInteractive}
                >
                    <Star
                        size={20}
                        className={star <= value ? 'text-warning' : 'text-secondary'}
                        fill={star <= value ? 'currentColor' : 'none'}
                    />
                </Button>
            ))}
        </div>
    );

    if (isLoading) {
        return (
            <div className="text-center p-5">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </div>
        );
    }

    return (
        <div className="ratings-container">
            {error && <Alert variant="danger" className="mb-3">{error}</Alert>}

            <div className="mb-4 d-flex justify-content-between align-items-center">
                <div>
                    {ratings.length > 0 && (
                        <div className="d-flex align-items-center">
                            <RatingStars
                                value={ratings.reduce((acc, r) => acc + r.rating, 0) / ratings.length}
                            />
                            <span className="ms-2 text-muted">
                ({ratings.length} review{ratings.length !== 1 ? 's' : ''})
              </span>
                        </div>
                    )}
                </div>
                {userInfo && !ratings.find(r => r.user.id === userInfo.id) && !isAddingReview && (
                    <Button variant="primary" onClick={() => setIsAddingReview(true)}>
                        Write a Review
                    </Button>
                )}
            </div>

            {isAddingReview && (
                <Card className="mb-4">
                    <Card.Body>
                        <h4>{editingRating ? 'Edit Review' : 'Write a Review'}</h4>
                        <Form onSubmit={handleSubmitReview}>
                            <Form.Group className="mb-3">
                                <Form.Label>Rating</Form.Label>
                                <RatingStars
                                    value={formData.rating}
                                    isInteractive
                                    onSelect={(value) => setFormData(prev => ({...prev, rating: value}))}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Review</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={4}
                                    value={formData.review}
                                    onChange={(e) => setFormData(prev => ({...prev, review: e.target.value}))}
                                    required
                                    minLength={10}
                                    maxLength={1000}
                                />
                            </Form.Group>
                            <div className="d-flex gap-2">
                                <Button
                                    type="submit"
                                    variant="primary"
                                    disabled={!formData.rating || !formData.review}
                                >
                                    {editingRating ? 'Update Review' : 'Submit Review'}
                                </Button>
                                <Button
                                    variant="secondary"
                                    onClick={() => {
                                        setIsAddingReview(false);
                                        setEditingRating(null);
                                        setFormData({rating: 0, review: ''});
                                    }}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </Form>
                    </Card.Body>
                </Card>
            )}

            {ratings.map((rating) => (
                <Card key={rating.id} className="mb-3">
                    <Card.Body>
                        <div className="d-flex justify-content-between">
                            <div className="d-flex gap-3">
                                {rating.user.profilePicturePath && (
                                    <img
                                        src={rating.user.profilePicturePath}
                                        alt={`${rating.user.firstName} ${rating.user.lastName}`}
                                        className="rounded-circle"
                                        style={{width: '48px', height: '48px', objectFit: 'cover'}}
                                    />
                                )}
                                <div>
                                    <h5 className="mb-1">
                                        {rating.user.firstName} {rating.user.lastName}
                                    </h5>
                                    <div className="text-muted small">
                                        {new Date(rating.createdAt).toLocaleDateString()}
                                    </div>
                                    <RatingStars value={rating.rating}/>
                                </div>
                            </div>
                            {userInfo?.id === rating.user.id && (
                                <div className="d-flex gap-2">
                                    <Button
                                        variant="outline-primary"
                                        size="sm"
                                        onClick={() => handleEditRating(rating)}
                                    >
                                        <Edit size={16}/>
                                    </Button>
                                    <Button
                                        variant="outline-danger"
                                        size="sm"
                                        onClick={() => handleDeleteRating(rating.id)}
                                    >
                                        <Trash size={16}/>
                                    </Button>
                                </div>
                            )}
                        </div>
                        <p className="mt-3 mb-2">{rating.review}</p>
                        <Button
                            variant="link"
                            className="p-0 text-muted"
                            onClick={() => handleToggleHelpful(rating.id)}
                            disabled={!userInfo || userInfo.id === rating.user.id}
                        >
                            <ThumbsUp size={16} className="me-2"/>
                            Helpful · {rating.helpful}
                        </Button>
                    </Card.Body>
                </Card>
            ))}

            {ratings.length === 0 && !isAddingReview && (
                <Alert variant="info">
                    No reviews yet. Be the first to review this property!
                </Alert>
            )}
        </div>
    );
};

export default PropertyRatings;