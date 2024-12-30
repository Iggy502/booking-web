import React, {useCallback, useState} from 'react';
import {Container} from 'react-bootstrap';
import {useNavigate} from 'react-router-dom';
import {PropertyCreate} from '../../../models/Property';
import BasicInfoStep from './steps/BasicInfoStep';
import AddressStep from './steps/AddressStep';
import AmenitiesStep from './steps/AmenitiesStep';
import ImageUploadStep from './steps/ImageUploadStep';
import {PropertyService} from "../../../services/property-service.ts";
import './create-property-component.scss';
import {useAuth} from "../../../context/auth.context.tsx";
import {Unauthorized} from "http-errors";

enum StepEnum {
    BASIC_INFO = 0,
    ADDRESS = 1,
    AMENITIES = 2,
    IMAGES = 3
}

const STEPS = [
    {number: 1, label: 'Basic Information'},
    {number: 2, label: 'Address'},
    {number: 3, label: 'Amenities'},
    {number: 4, label: 'Images'}
];

const CreatePropertyComponent: React.FC = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState<StepEnum>(StepEnum.BASIC_INFO);
    const [propertyImages, setPropertyImages] = useState<File[]>([]);
    const [property, setProperty] = useState<Omit<PropertyCreate, 'owner'>>({
        name: '',
        description: '',
        pricePerNight: 0,
        maxGuests: 1,
        available: true,
        address: {
            street: '',
            city: '',
            country: '',
            postalCode: '',
        },
        amenities: [],
    });
    const {userInfo} = useAuth();

    const handleNext = () => {
        setCurrentStep(prev => prev + 1);
    };

    const handleBack = () => {
        setPropertyImages([]); // Clear images when going back
        setCurrentStep(prev => prev - 1);
    };

    const handlePropertyUpdate = (updates: Partial<PropertyCreate>) => {
        setProperty(prev => ({
            ...prev,
            ...updates
        }));
    };

    const handleImagesUpdate = useCallback((files: File[]) => {
        setPropertyImages(files);
        console.log('images updated:', files);
    }, []);

    const handleSubmit = async () => {
        try {

            if (!userInfo) {
                throw Unauthorized('User not authenticated. Cannot create property');
            }

            const propertyWithOwner = {...property, owner: userInfo.id};

            const createdProperty = await PropertyService.createProperty(propertyWithOwner);


            console.log(`attempting to upload images for property with ${propertyImages.length} images, images: ${propertyImages}`);

            // Then upload images if there are any
            if (propertyImages.length > 0) {
                await PropertyService.uploadImages(createdProperty.id, propertyImages);
            }

            // Navigate to property list on success
            navigate('/properties/my-properties');
        } catch (error) {
            console.error('Failed to create property:', error);
        }
    };

    function handleImageRemove(fileName?: string) {

        if (!fileName) return;

        console.log('removing image:', fileName);

        setPropertyImages(prev => prev.filter(file => file.name !== fileName));
    }

    const renderStep = () => {
        switch (currentStep) {
            case StepEnum.BASIC_INFO:
                return (
                    <BasicInfoStep
                        property={property}
                        onUpdate={handlePropertyUpdate}
                        onNextAction={{actionName: "Continue to Address", action: handleNext}}
                    />
                );
            case StepEnum.ADDRESS:
                return (
                    <AddressStep
                        address={property.address}
                        onUpdate={(address) => handlePropertyUpdate({address})}
                        onNextAction={{actionName: "Continue to Amenities", action: handleNext}}
                        onBackAction={{actionName: "Back", action: handleBack}}
                    />
                );
            case StepEnum.AMENITIES:
                return (
                    <AmenitiesStep
                        amenities={property.amenities || []}
                        onUpdate={(amenities) => handlePropertyUpdate({amenities})}
                        onNextAction={{actionName: "Continue to Images", action: handleNext}}
                        onBackAction={{actionName: "Back", action: handleBack}}
                    />
                );
            case StepEnum.IMAGES:
                return (
                    <ImageUploadStep
                        onUpdateAll={handleImagesUpdate}
                        onRemove={handleImageRemove}
                        onNextAction={{actionName: "Submit", action: handleSubmit}}
                        onBackAction={{actionName: "Back", action: handleBack}}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <Container className="property-stepper py-5">
            <h1 className="mb-4">Create New Property</h1>

            <div className="stepper-header">
                {STEPS.map((step, index) => (
                    <div
                        key={step.number}
                        className={`step ${
                            currentStep === index
                                ? 'active'
                                : currentStep > index
                                    ? 'completed'
                                    : ''
                        }`}
                    >
                        <div className="step-number">
                            {currentStep > index ? '✓' : step.number}
                        </div>
                        <div className="step-label">{step.label}</div>
                    </div>
                ))}
            </div>

            <div className="step-content">
                {renderStep()}
            </div>
        </Container>
    );
};

export default CreatePropertyComponent;