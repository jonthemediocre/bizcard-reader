import React from 'react';
import { Upload, Camera, Scan, Loader2 } from 'lucide-react';

interface ImageUploaderProps {
  preview: string;
  loading: boolean;
  onImageUpload: (file: File) => void;
  onCameraOpen: () => void;
  onProcess: () => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  preview,
  loading,
  onImageUpload,
  onCameraOpen,
  onProcess
}) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    onImageUpload(file);
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {preview ? (
        <img
          src={preview}
          alt="Preview"
          className="max-w-sm rounded-lg shadow-sm"
        />
      ) : (
        <div className="w-full max-w-sm h-64 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
          <Upload className="w-12 h-12 text-gray-400" />
        </div>
      )}
      
      <div className="flex space-x-4">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          id="image-upload"
        />
        <label
          htmlFor="image-upload"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer"
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload Image
        </label>
        
        <button
          onClick={onCameraOpen}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Camera className="w-4 h-4 mr-2" />
          Use Camera
        </button>
      </div>
      
      <button
        onClick={onProcess}
        disabled={!preview || loading}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Scan className="w-4 h-4 mr-2" />
        )}
        {loading ? 'Processing...' : 'Scan Card'}
      </button>
    </div>
  );
};

export default ImageUploader;