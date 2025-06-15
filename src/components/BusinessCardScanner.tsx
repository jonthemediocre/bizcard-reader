/**
 * @file BusinessCardScanner.tsx
 * @description Streamlined business card scanner focused on user value delivery
 * @user-value Upload image → Get structured data → Export/Save
 */

import React, { useState } from 'react';
import { Upload, Loader2, AlertCircle, Settings } from 'lucide-react';
import { extractBusinessCardData, BusinessCardData } from '../services/businessCardExtractor';
import BusinessCardDisplay from './BusinessCardDisplay';

interface BusinessCardScannerProps {
  onBusinessCardExtracted?: (data: BusinessCardData) => void;
}

const BusinessCardScanner: React.FC<BusinessCardScannerProps> = ({ onBusinessCardExtracted }) => {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [businessCard, setBusinessCard] = useState<BusinessCardData | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState(() => {
    const saved = localStorage.getItem('apiKeys');
    return saved ? JSON.parse(saved).openai || '' : '';
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset state
    setError('');
    setBusinessCard(null);

    // Validate file
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPEG, PNG, etc.)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be less than 10MB');
      return;
    }

    // Set image and preview
    setImage(file);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleExtract = async () => {
    if (!image) return;

    setLoading(true);
    setError('');

    try {
      const result = await extractBusinessCardData(image);
      
      if (result.success && result.data) {
        setBusinessCard(result.data);
        // Notify parent component
        onBusinessCardExtracted?.(result.data);
      } else {
        setError(result.error || 'Failed to extract business card data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Extraction failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveApiKey = () => {
    localStorage.setItem('apiKeys', JSON.stringify({ openai: apiKey }));
    setShowSettings(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.dataTransfer.files[0];
    if (file) {
      const fakeEvent = { target: { files: [file] } } as any;
      handleImageUpload(fakeEvent);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Business Card Scanner
          </h1>
          <p className="text-gray-600">
            Upload a business card image to extract structured contact data
          </p>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="mt-4 inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <Settings className="w-4 h-4 mr-1" />
            API Settings
          </button>
        </div>

        {/* API Settings */}
        {showSettings && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">OpenAI API Configuration</h3>
            <div className="flex space-x-4">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your OpenAI API key"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSaveApiKey}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Your API key is stored locally and never sent to our servers.
            </p>
            {!apiKey && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  <strong>Demo Mode:</strong> Without an API key, the app will show sample data. 
                  Get your OpenAI API key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline">platform.openai.com</a>
                </p>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Upload Business Card</h2>
            
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-red-700">{error}</p>
                  {error.includes('Invalid response format') && (
                    <div className="mt-2 text-xs text-red-600">
                      <p><strong>Tip:</strong> Try uploading a clearer image or a different business card.</p>
                      <p>The AI sometimes has trouble with blurry or complex layouts.</p>
                    </div>
                  )}
                  {error.includes('API key') && (
                    <div className="mt-2 text-xs text-red-600">
                      <p><strong>Need an API key?</strong> Get one from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline">OpenAI</a></p>
                      <p>Or try demo mode by uploading an image without an API key.</p>
                    </div>
                  )}
                  <button
                    onClick={() => setError('')}
                    className="mt-2 text-xs text-red-700 hover:text-red-800 underline"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            {!preview ? (
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors"
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">
                  Drag and drop an image here, or click to select
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer"
                >
                  Select Image
                </label>
              </div>
            ) : (
              <div className="space-y-4">
                <img
                  src={preview}
                  alt="Business card preview"
                  className="w-full h-64 object-contain bg-gray-100 rounded-lg"
                />
                <div className="flex space-x-4">
                  <button
                    onClick={handleExtract}
                    disabled={loading}
                    className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Extracting...
                      </>
                    ) : (
                      'Extract Data'
                    )}
                  </button>
                  {error && (
                    <button
                      onClick={() => {
                        setError('');
                        handleExtract();
                      }}
                      disabled={loading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Retry
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setImage(null);
                      setPreview('');
                      setBusinessCard(null);
                      setError('');
                    }}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Results Section */}
          <div>
            {businessCard ? (
              <BusinessCardDisplay 
                data={businessCard} 
                onSave={() => {
                  // Could show a success message here
                  console.log('Business card saved!');
                }}
              />
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
                <p>Upload and extract a business card to see structured data here</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Instructions */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">How it works:</h3>
          <ol className="list-decimal list-inside space-y-1 text-blue-800">
            <li>Configure your OpenAI API key in settings</li>
            <li>Upload or drag & drop a business card image</li>
            <li>Click "Extract Data" to get structured information</li>
            <li>Export as vCard, CSV, or JSON for use in your contacts app</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default BusinessCardScanner; 