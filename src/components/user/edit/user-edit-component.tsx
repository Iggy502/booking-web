import React, { useState, useRef, useEffect } from 'react';
import { UserViewModel, IUserUpdate } from '../../../models/User.ts';
import { UserService } from '../../../services/user.service.ts';
import ImageUploadStep, { ImageUploadStepRef } from '../../properties/create-property/steps/ImageUploadStep.tsx';
import { Card, Form, Button, Alert, Container, Row, Col } from 'react-bootstrap';
import { useError } from "../../../context/error.context.tsx";
import { useAuth } from "../../../context/auth.context.tsx";
import { Unauthorized } from "http-errors";
import { useParams, useNavigate } from "react-router-dom";
import AvatarEditor from 'react-avatar-editor';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';
import './user-edit-component.scss';

const UserEditComponent = () => {
    const [currentUser, setCurrentUser] = useState<UserViewModel | null>(null);
    const [formData, setFormData] = useState<IUserUpdate>({
        firstName: '',
        lastName: '',
        email: '',
        phone: ''
    });
    const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

    const { userId } = useParams<{ userId: string }>();
    const [previewImage, setPreviewImage] = useState<string>('');
    const [newProfileImage, setNewProfileImage] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [scale, setScale] = useState(1);

    const editorRef = useRef<AvatarEditor>(null);
    const imageUploaderRef = useRef<ImageUploadStepRef>(null);
    const { showError } = useError();
    const { getUserInfo } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            setIsLoading(true);
            try {
                const currUserInfo = await getUserInfo();

                if (!currUserInfo) {
                    throw new Unauthorized('Not authorized');
                }

                if (currUserInfo.id !== userId) {
                    throw new Unauthorized('Only the user can edit their profile');
                }

                const user = await UserService.getUserById(currUserInfo.id);
                setCurrentUser(user);
                setFormData({
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    phone: user.phone
                });
                setPreviewImage(user.profilePicturePath || '');
            } catch (err: any) {
                showError(err);
                console.error('Error fetching user:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUser();
    }, [userId, getUserInfo, showError]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setFormErrors(prev => ({
            ...prev,
            [name]: ''
        }));
    };

    const handleImageUpdate = (files: File[]) => {
        if (files.length > 0) {
            const file = files[0];
            setNewProfileImage(file);
            setPreviewImage(URL.createObjectURL(file));
            setScale(1);
        } else {
            setNewProfileImage(null);
            setPreviewImage(currentUser?.profilePicturePath || '');
            setScale(1);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser || !editorRef.current) return;

        const errors: { [key: string]: string } = {};
        if (!formData.firstName) errors.firstName = 'First name is required';
        if (!formData.lastName) errors.lastName = 'Last name is required';
        if (!formData.email) errors.email = 'Email is required';
        if (!formData.phone) errors.phone = 'Phone number is required';

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            await UserService.editUser(currentUser.id, formData);

            if (newProfileImage) {
                // Get the cropped canvas from the editor
                const canvas = editorRef.current.getImageScaledToCanvas();

                // Convert canvas to blob
                const blob = await new Promise<Blob>((resolve, reject) => {
                    canvas.toBlob((blob) => {
                        if (blob) resolve(blob);
                        else reject(new Error('Failed to create blob'));
                    }, 'image/jpeg', 0.95);
                });

                // Create a new file from the blob
                const croppedImage = new File([blob], newProfileImage.name, {
                    type: 'image/jpeg',
                    lastModified: Date.now(),
                });

                await UserService.uploadImage(currentUser.id, croppedImage);
            }

            const updatedUser = await UserService.getUserById(currentUser.id);
            setCurrentUser(updatedUser);
            setPreviewImage(updatedUser.profilePicturePath || '');
            setNewProfileImage(null);
            setSaveSuccess(true);

            // Clear success message after animation
            setTimeout(() => {
                setSaveSuccess(false);
            }, 5000);

        } catch (err) {
            showError(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        return () => {
            if (previewImage && currentUser && previewImage !== currentUser.profilePicturePath) {
                URL.revokeObjectURL(previewImage);
            }
        };
    }, [previewImage, currentUser]);

    if (isLoading) {
        return (
            <Container className="py-5">
                <Row className="justify-content-center">
                    <Col sm={12} md={10} lg={8} xl={6} className="text-center">
                        Loading...
                    </Col>
                </Row>
            </Container>
        );
    }

    if (!currentUser) {
        return (
            <Container className="py-5">
                <Row className="justify-content-center">
                    <Col sm={12} md={10} lg={8} xl={6} className="text-center">
                        User not found
                    </Col>
                </Row>
            </Container>
        );
    }

    return (
        <Container className="py-5">
            <Row className="justify-content-center">
                <Col sm={12} md={10} lg={8} xl={6}>
                    <div className="d-flex justify-content-end mb-3">
                        <Button
                            variant="outline-primary"
                            onClick={() => navigate('/')}
                            type="button"
                            className={"mx-auto"}
                        >
                            <FontAwesomeIcon icon={faHome} />
                        </Button>
                    </div>
                    <Card>
                        <Card.Header className="bg-white">
                            <Card.Title className="mb-0">Edit Profile</Card.Title>
                        </Card.Header>
                        <Card.Body>
                            {error && (
                                <Alert variant="danger" dismissible onClose={() => setError(null)}>
                                    {error}
                                </Alert>
                            )}

                            {saveSuccess && (
                                <Alert
                                    variant="success"
                                    dismissible
                                    onClose={() => setSaveSuccess(false)}
                                    className="save-success"
                                >
                                    Profile updated successfully!
                                </Alert>
                            )}

                            <Form onSubmit={handleSubmit} noValidate>
                                <div className="text-center mb-4">
                                    <div className="user-edit-profile-image mb-3">
                                        <AvatarEditor
                                            ref={editorRef}
                                            image={previewImage}
                                            width={160}
                                            height={160}
                                            border={0}
                                            borderRadius={80}
                                            color={[255, 255, 255, 0.6]} // RGBA
                                            scale={scale}
                                            rotate={0}
                                        />
                                    </div>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Zoom</Form.Label>
                                        <Form.Range
                                            value={scale}
                                            onChange={(e) => setScale(parseFloat(e.target.value))}
                                            min={1}
                                            max={2}
                                            step={0.01}
                                        />
                                    </Form.Group>

                                    <div className="mx-auto">
                                        <ImageUploadStep
                                            ref={imageUploaderRef}
                                            onUpdate={handleImageUpdate}
                                            maxFiles={{ amount: 1, errorMessage: "Only one profile picture allowed" }}
                                        />
                                    </div>
                                </div>

                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-4">
                                            <Form.Label>First Name</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="firstName"
                                                value={formData.firstName}
                                                onChange={handleInputChange}
                                                isInvalid={!!formErrors.firstName}
                                                required
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {formErrors.firstName}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>

                                    <Col md={6}>
                                        <Form.Group className="mb-4">
                                            <Form.Label>Last Name</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="lastName"
                                                value={formData.lastName}
                                                onChange={handleInputChange}
                                                isInvalid={!!formErrors.lastName}
                                                required
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {formErrors.lastName}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-4">
                                            <Form.Label>Email</Form.Label>
                                            <Form.Control
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                isInvalid={!!formErrors.email}
                                                required
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {formErrors.email}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>

                                    <Col md={6}>
                                        <Form.Group className="mb-4">
                                            <Form.Label>Phone</Form.Label>
                                            <Form.Control
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                isInvalid={!!formErrors.phone}
                                                required
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {formErrors.phone}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <div className="d-flex justify-content-end gap-2 mt-4">
                                    <Button
                                        variant="outline-secondary"
                                        onClick={() => {
                                            if (imageUploaderRef.current) {
                                                imageUploaderRef.current.clearAll();
                                            }
                                            setPreviewImage(currentUser.profilePicturePath || '');
                                            setScale(1);
                                            setFormData({
                                                firstName: currentUser.firstName,
                                                lastName: currentUser.lastName,
                                                email: currentUser.email,
                                                phone: currentUser.phone
                                            });
                                            setFormErrors({});
                                        }}
                                        type="button"
                                    >
                                        Reset
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default UserEditComponent;