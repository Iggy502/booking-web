import React, {useEffect, useRef, useState} from 'react';
import {Alert, Button, Card, Container, Modal} from 'react-bootstrap';
import {X} from 'lucide-react';
import ImageUploadStep, {ImageUploadStepRef} from '../create-property/steps/ImageUploadStep';
import {PropertyService} from '../../../services/property-service';
import {useError} from "../../../context/error.context.tsx";
import {useParams} from "react-router-dom";
import {BadRequest} from "http-errors";
import {useAuth} from "../../../context/auth.context.tsx";


const EditPropertyImages: React.FC = () => {


    const {id: propertyId} = useParams<{ id: string }>();

    const [error, setError] = useState<string | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const {userInfo, isAuthenticated} = useAuth();
    const [isDeleting, setIsDeleting] = useState(false);
    const [imagePaths, setImagePaths] = useState<string[]>([]);
    const {showError} = useError()
    const imageUploadRef = useRef<ImageUploadStepRef>(null);

    const handleDeleteClick = (imagePath: string) => {
        setSelectedImage(imagePath);
        setShowDeleteModal(true);
    };


    useEffect(() => {
        const fetchImages = async () => {
            try {

                if (!userInfo) {
                    return;
                }

                if (!propertyId) {
                    throw BadRequest('Property ID is required');
                }

                const imagePaths = await PropertyService.fetchPropertyImages(propertyId);
                setImagePaths(imagePaths);
            } catch (error) {
                setError('Failed to fetch images. Please try again.');
                console.error('Error fetching images:', error);
            }
        };
        fetchImages();
    }, [propertyId, userInfo]);


    if (!propertyId || !imagePaths) {
        return (
            <Container className="py-5">
                <Alert variant="danger">Not found</Alert>
            </Container>
        );
    }


    const handleDeleteConfirm = async () => {
        if (!selectedImage) return;

        try {
            setIsDeleting(true);
            await PropertyService.deletePropertyImage(propertyId, selectedImage);
            const imagePaths = await PropertyService.fetchPropertyImages(propertyId);
            setImagePaths(imagePaths);
        } catch (error: any) {
            showError(error);
            console.error('Error deleting image:', error);
        } finally {
            setIsDeleting(false);
            setShowDeleteModal(false);
            setSelectedImage(null);
        }
    };

    const handleUpload = async (files: File[]) => {
        try {
            setError(null);
            await PropertyService.uploadImages(propertyId, files);
            const imagePaths = await PropertyService.fetchPropertyImages(propertyId);
            setImagePaths(imagePaths);
            console.log(`remaining space before clear ${6 - imagePaths.length}`);
            imageUploadRef.current?.clearAll();
            console.log(`remaining space after clear ${6 - imagePaths.length}`);

        } catch (error: any) {
            showError(error);
            console.error('Error uploading images:', error);
        }
    };

    return (
        <Container className={"mt-4"}>
            <div className="property-images">
                {error && (
                    <Alert variant="danger" onClose={() => setError(null)} dismissible>
                        {error}
                    </Alert>
                )}

                {/* Current Images with Delete */}

                {imagePaths.length > 0 && (
                    <Card className="">
                        <Card.Header>
                            <h5 className="mb-0">Current Images</h5>
                        </Card.Header>
                        <Card.Body>
                            <div className="image-grid">
                                {imagePaths.map((imagePath, index) => (
                                    <div key={index} className="image-container">
                                        <img src={imagePath} alt={`Property ${index + 1}`}/>
                                        <button
                                            className="delete-button"
                                            onClick={() => handleDeleteClick(imagePath)}
                                            title="Delete image"
                                            disabled={isDeleting}
                                        >
                                            <X size={20}/>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </Card.Body>
                    </Card>
                )}

                {/* Image Upload Step */}
                <Card>
                    <Card.Header>
                        <h5 className="mb-0">Add New Images</h5>
                    </Card.Header>
                    <Card.Body>
                        <ImageUploadStep
                            ref={imageUploadRef}
                            onUpdateNew={handleUpload}
                            maxFiles={{amount: 6 - imagePaths.length, errorMessage: "You can only upload 6 images"}}
                        />
                    </Card.Body>
                </Card>

                {/* Delete Confirmation Modal */}
                <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Delete Image</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        Are you sure you want to delete this image? This action cannot be undone.
                    </Modal.Body>
                    <Modal.Footer>
                        <Button
                            variant="secondary"
                            onClick={() => setShowDeleteModal(false)}
                            disabled={isDeleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="danger"
                            onClick={handleDeleteConfirm}
                            disabled={isDeleting}
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        </Container>
    );
};

export default EditPropertyImages;