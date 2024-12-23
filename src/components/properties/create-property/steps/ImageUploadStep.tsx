import React, {useCallback, useState} from 'react';
import {useDropzone} from 'react-dropzone';
import {Alert, Button, ProgressBar} from 'react-bootstrap';
import {Image as ImageIcon, Upload, X} from 'lucide-react';
import './ImageUploadStep.scss';

interface ImageUploadStepProps {
    onUpdate: (files: File[]) => void;
    onSubmit: () => void;
    onBack: () => void;
}

interface ProcessedImage {
    file: File;
    preview: string;
    status: 'processing' | 'ready' | 'error';
    error?: string;
}

const MAX_FILES = 10;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const TARGET_WIDTH = 1920;
const TARGET_HEIGHT = 1080;
const QUALITY = 0.8;

const ImageUploadStep: React.FC<ImageUploadStepProps> = ({
                                                             onUpdate,
                                                             onSubmit,
                                                             onBack
                                                         }) => {
    const [processedImages, setProcessedImages] = useState<ProcessedImage[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const processImage = async (file: File): Promise<ProcessedImage> => {
        return new Promise((resolve) => {
            const img = new Image();
            const objectUrl = URL.createObjectURL(file);

            img.onload = async () => {
                URL.revokeObjectURL(objectUrl);

                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Calculate new dimensions while maintaining aspect ratio
                if (width > TARGET_WIDTH || height > TARGET_HEIGHT) {
                    const ratio = Math.min(TARGET_WIDTH / width, TARGET_HEIGHT / height);
                    width *= ratio;
                    height *= ratio;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');

                if (!ctx) {
                    resolve({
                        file,
                        preview: objectUrl,
                        status: 'error',
                        error: 'Failed to process image'
                    });
                    return;
                }

                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            resolve({
                                file,
                                preview: objectUrl,
                                status: 'error',
                                error: 'Failed to process image'
                            });
                            return;
                        }

                        const processedFile = new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now(),
                        });

                        resolve({
                            file: processedFile,
                            preview: URL.createObjectURL(blob),
                            status: 'ready'
                        });
                    },
                    'image/jpeg',
                    QUALITY
                );
            };

            img.onerror = () => {
                URL.revokeObjectURL(objectUrl);
                resolve({
                    file,
                    preview: objectUrl,
                    status: 'error',
                    error: 'Failed to load image'
                });
            };

            img.src = objectUrl;
        });
    };

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        setError(null);
        setIsProcessing(true);

        try {
            // Validate number of files
            if (processedImages.length + acceptedFiles.length > MAX_FILES) {
                setError(`Maximum ${MAX_FILES} images allowed`);
                return;
            }

            // Process all images
            const newProcessedImages = await Promise.all(
                acceptedFiles.map(async (file) => {
                    // Validate file size
                    if (file.size > MAX_FILE_SIZE) {
                        return {
                            file,
                            preview: URL.createObjectURL(file),
                            status: 'error' as const,
                            error: 'File size exceeds 5MB'
                        };
                    }

                    // Validate file type
                    if (!ACCEPTED_TYPES.includes(file.type)) {
                        return {
                            file,
                            preview: URL.createObjectURL(file),
                            status: 'error' as const,
                            error: 'Invalid file type'
                        };
                    }

                    return await processImage(file);
                })
            );

            setProcessedImages(prev => [...prev, ...newProcessedImages]);

            // Update parent with only the successfully processed images
            const validFiles = newProcessedImages
                .filter(img => img.status === 'ready')
                .map(img => img.file);
            onUpdate(validFiles);

        } catch (err) {
            setError('Failed to process images');
            console.error('Error processing images:', err);
        } finally {
            setIsProcessing(false);
        }
    }, [onUpdate, processedImages.length]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/jpeg': ['.jpg', '.jpeg'],
            'image/png': ['.png'],
            'image/webp': ['.webp']
        },
        multiple: true,
        maxFiles: MAX_FILES,
        maxSize: MAX_FILE_SIZE,
    });

    const removeImage = (index: number) => {
        setProcessedImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = () => {
        const validFiles = processedImages
            .filter(img => img.status === 'ready')
            .map(img => img.file);

        if (validFiles.length === 0) {
            setError('Please upload at least one valid image');
            return;
        }

        onSubmit();
    };

    return (
        <div className="image-upload-step">
            {error && (
                <Alert variant="danger" onClose={() => setError(null)} dismissible>
                    {error}
                </Alert>
            )}

            <div
                {...getRootProps()}
                className={`dropzone ${isDragActive ? 'active' : ''}`}
            >
                <input {...getInputProps()} />
                <Upload size={48} className="upload-icon" />
                <p className="upload-text">
                    {isDragActive
                        ? 'Drop your images here...'
                        : 'Drag & drop images here, or click to select'}
                </p>
                <p className="upload-hint">
                    Supported formats: JPG, PNG, WebP (max {MAX_FILES} images, {MAX_FILE_SIZE / (1024 * 1024)}MB each)
                </p>
            </div>

            {isProcessing && (
                <div className="processing-indicator">
                    <ProgressBar animated now={100} />
                    <p>Processing images...</p>
                </div>
            )}

            {processedImages.length > 0 && (
                <div className="image-preview-grid">
                    {processedImages.map((image, index) => (
                        <div
                            key={index}
                            className={`image-preview ${image.status === 'error' ? 'error' : ''}`}
                        >
                            <div className="image-container">
                                {image.status === 'error' ? (
                                    <div className="error-overlay">
                                        <ImageIcon size={24} />
                                        <span>{image.error}</span>
                                    </div>
                                ) : (
                                    <img src={image.preview} alt={`Preview ${index + 1}`} />
                                )}
                                <button
                                    className="remove-button"
                                    onClick={() => removeImage(index)}
                                    title="Remove image"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="step-navigation">
                <Button
                    variant="outline-secondary"
                    onClick={onBack}
                    className="px-4"
                >
                    Back
                </Button>
                <Button
                    variant="primary"
                    className="px-4"
                    onClick={handleSubmit}
                    disabled={isProcessing || processedImages.length === 0}
                >
                    Finish
                </Button>
            </div>
        </div>
    );
};

export default ImageUploadStep;