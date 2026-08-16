'use client';

import { useCallback, useState } from 'react';
import { useDropzone, type FileRejection } from 'react-dropzone';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { formatFileSize } from '@/lib/utils';

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  onImageRemove: () => void;
  selectedImage?: File | null;
  accept?: string;
  maxSize?: number;
  className?: string;
  disabled?: boolean;
  label?: string;
  description?: string;
}

export default function ImageUpload({
  onImageSelect,
  onImageRemove,
  selectedImage,
  accept = 'image/*',
  maxSize = 10 * 1024 * 1024, // 10MB
  className = '',
  disabled = false,
  label = 'Upload Image',
  description = 'PNG, JPG, GIF up to 10MB',
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      setError(null);

      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        if (rejection.errors[0]?.code === 'file-too-large') {
          setError(`File is too large. Maximum size is ${formatFileSize(maxSize)}`);
        } else if (rejection.errors[0]?.code === 'file-invalid-type') {
          setError('Invalid file type. Please upload an image file.');
        } else {
          setError('Invalid file. Please try again.');
        }
        return;
      }

      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        onImageSelect(file);

        // Create preview
        const reader = new FileReader();
        reader.onload = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    },
    [onImageSelect, maxSize]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
    },
    maxSize,
    multiple: false,
    disabled,
  });

  const handleRemove = () => {
    setPreview(null);
    setError(null);
    onImageRemove();
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>

      {selectedImage || preview ? (
        <div className="relative">
          <div className="relative rounded-lg border-2 border-gray-300 overflow-hidden">
            <img
              src={preview || (selectedImage ? URL.createObjectURL(selectedImage) : '')}
              alt="Preview"
              className="w-full h-64 object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={handleRemove}
                className="bg-red-600 text-white rounded-full p-2 hover:bg-red-700 transition-colors"
                disabled={disabled}
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
          {selectedImage && (
            <div className="mt-2 text-sm text-gray-600">
              <p className="font-medium">{selectedImage.name}</p>
              <p>{formatFileSize(selectedImage.size)}</p>
            </div>
          )}
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`
            relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
            ${isDragActive
              ? 'border-green-400 bg-green-50'
              : error
              ? 'border-red-300 bg-red-50'
              : 'border-gray-300 hover:border-green-400 hover:bg-green-50'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input {...getInputProps()} />
          <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-900">
              {isDragActive ? 'Drop the image here' : 'Click to upload or drag and drop'}
            </p>
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
