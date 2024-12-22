import React from 'react';
import {Card, Carousel, Badge} from 'react-bootstrap';
import {Property, AmenityType} from '../../../models/Property.ts';
import './property-card.scss';

interface PropertyCardProps {
    property: Property;
}

const PropertyCard: React.FC<PropertyCardProps> = ({property}) => {
    const defaultImage = "https://via.placeholder.com/300x200";
    const displayImages = property.imagePaths?.slice(0, 3) || [defaultImage];

    const formatAddress = (address: typeof property.address) => {
        return `${address.street}, ${address.city}, ${address.postalCode}, ${address.country}`;
    };

    const getAmenityIcon = (type: AmenityType) => {
        const icons: Record<AmenityType, string> = {
            [AmenityType.Wifi]: 'fa-wifi',
            [AmenityType.Parking]: 'fa-parking',
            [AmenityType.Pool]: 'fa-swimming-pool',
            [AmenityType.Gym]: 'fa-dumbbell',
            [AmenityType.Restaurant]: 'fa-utensils',
            [AmenityType.Bar]: 'fa-glass-martini-alt',
            [AmenityType.Spa]: 'fa-spa',
            [AmenityType.PetFriendly]: 'fa-paw',
            [AmenityType.RoomService]: 'fa-concierge-bell'
        };
        return icons[type] || 'fa-circle';
    };

    return (
        <Card className="property-card h-100">
            <Carousel interval={null} className="property-carousel">
                {displayImages.map((image, index) => (
                    <Carousel.Item key={index}>
                        <div className="carousel-image-container">
                            <img
                                className="d-block w-100"
                                src={image}
                                alt={`${property.name} - Image ${index + 1}`}
                            />
                        </div>
                    </Carousel.Item>
                ))}
            </Carousel>

            <Card.Body>
                <Card.Title className="property-title mb-2">{property.name}</Card.Title>
                <Card.Text className="property-description mb-3">
                    {property.description}
                </Card.Text>

                <div className="property-details mb-3">
                    <div className="location">
                        <i className="fas fa-map-marker-alt me-2"></i>
                        {formatAddress(property.address)}
                    </div>
                    <div className="price mt-2">
                        <i className="fas fa-euro-sign me-2"></i>
                        <span className="amount">{property.pricePerNight}</span>
                        <span className="period"> / night</span>
                    </div>
                    <div className="guests mt-2">
                        <i className="fas fa-users me-2"></i>
                        Max guests: {property.maxGuests}
                    </div>
                </div>

                {property.amenities && property.amenities.length > 0 && (
                    <div className="amenities">
                        <h6 className="mb-2">Amenities:</h6>
                        <div className="amenity-badges">
                            {property.amenities.map((amenity, index) => (
                                <Badge
                                    key={index}
                                    className="amenity-badge me-2 mb-2"
                                    bg="light"
                                    text="dark"
                                >
                                    <i className={`fas ${getAmenityIcon(amenity.type)} me-1`}></i>
                                    {amenity.type}
                                    {amenity.amount && ` (${amenity.amount})`}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}
            </Card.Body>
        </Card>
    );
};

export default PropertyCard;