import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {Alert, Button, Card, Container, Spinner} from 'react-bootstrap';
import {PropertyService} from '../../../services/property-service';
import {IAddress, IAmenity, PropertyCreate, PropertyViewModel} from '../../../models/Property';
import {useError} from '../../../context/error.context';
import BasicInfoStep from '../create-property/steps/BasicInfoStep';
import AddressStep from '../create-property/steps/AddressStep';
import AmenitiesStep from '../create-property/steps/AmenitiesStep';
import './edit-property-component.scss';
import './edit-property-image-component.scss'
import {useAuth} from "../../../context/auth.context.tsx";
import {Forbidden} from "http-errors";

const EditPropertyComponent: React.FC = () => {
    const {id} = useParams<{ id: string }>();
    const navigate = useNavigate();
    const {showError} = useError();

    const [property, setProperty] = useState<PropertyViewModel | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const {userInfo} = useAuth();

    useEffect(() => {
        const fetchProperty = async () => {
            try {
                if (!id) return;
                const fetchedProperty = await PropertyService.fetchPropertyById(id);

                if (fetchedProperty && fetchedProperty.owner !== userInfo?.id) {
                    throw Forbidden();
                }

                setProperty(fetchedProperty);
            } catch (error: any) {
                showError(error);
                navigate('/properties/my-properties');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProperty();
    }, [id, showError, navigate, userInfo]);

    const handleBasicInfoUpdate = (updates: Partial<PropertyCreate>) => {
        if (!property) return;
        setProperty({...property, ...updates});
    };

    const handleAddressUpdate = (address: IAddress) => {
        if (!property) return;
        setProperty({...property, address});
    };

    const handleAmenitiesUpdate = (amenities: IAmenity[]) => {
        if (!property) return;
        setProperty({...property, amenities});
    };

    const handleSave = async () => {
        if (!property || !id) return;


        const {imagePaths, ...propertyWithoutImages} = property;

        setIsSaving(true);
        try {
            await PropertyService.updateProperty(id, propertyWithoutImages);
            navigate('/properties/my-properties');
        } catch (error: any) {
            showError(error);
        } finally {
            setIsSaving(false);
        }
    };

    const basicInfoReadOnlyOptions = {
        name: true,
        description: false,
        pricePerNight: false,
        maxGuests: false,
    };

    const addressReadOnlyOptions = {
        street: false,
        city: false,
        country: false,
        postalCode: false,
    };

    if (isLoading) {
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </Container>
        );
    }

    if (!id) {
        return (
            <Container className="py-5">
                <Alert variant="danger">Property ID not provided</Alert>
            </Container>);
    }

    if (!property) {
        return (
            <Container className="py-5">
                <Alert variant="danger">Property not found</Alert>
            </Container>
        );
    }


    return (
        <Container className="py-5 edit-property-container">
            <h1 className="mb-4">Edit Property</h1>

            <Card className="mb-4">
                <Card.Header>
                    <h2 className="h5 mb-0">Basic Information</h2>
                </Card.Header>
                <Card.Body>
                    <BasicInfoStep
                        property={property}
                        onUpdate={handleBasicInfoUpdate}
                        readOnlyOptions={basicInfoReadOnlyOptions}
                    />
                </Card.Body>
            </Card>

            <Card className="mb-4">
                <Card.Header>
                    <h2 className="h5 mb-0">Address Information</h2>
                </Card.Header>
                <Card.Body>
                    <AddressStep
                        address={property.address}
                        onUpdate={handleAddressUpdate}
                        readOnlyOptions={addressReadOnlyOptions}
                    />
                </Card.Body>
            </Card>

            <Card className="mb-4">
                <Card.Header>
                    <h2 className="h5 mb-0">Amenities</h2>
                </Card.Header>
                <Card.Body>
                    <AmenitiesStep
                        amenities={property?.amenities || []}
                        onUpdate={handleAmenitiesUpdate}
                        readOnly={false}
                    />
                </Card.Body>
            </Card>
            <div className="d-flex justify-content-end">
                <Button
                    variant="secondary"
                    className="me-2"
                    onClick={() => navigate('/properties/my-properties')}
                >
                    Cancel
                </Button>
                <Button
                    variant="primary"
                    onClick={handleSave}
                    disabled={isSaving}
                >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>
        </Container>
    );
};

export default EditPropertyComponent;