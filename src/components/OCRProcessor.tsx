import React, { useState } from 'react';
import { Scan, Loader2, Settings as SettingsIcon, Camera, RefreshCw, Info } from 'lucide-react';
import type { BusinessCard, APIResponse } from '../types/business-card';
import { extractBusinessCardData, fetchAdditionalDetails } from '../services/apiServices';
import { logger } from '../services/logger';
import Settings from './Settings';
import CameraCapture from './CameraCapture';
import ImageUploader from './business-card/ImageUploader';
import BusinessCardDetails from './business-card/BusinessCardDetails';
import ErrorMessage from './common/ErrorMessage';
import ManualInput from './business-card/ManualInput';

const OCRProcessor: React.FC = () => {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [businessCard, setBusinessCard] = useState<BusinessCard | null>(null);
  const [additionalDetails, setAdditionalDetails] = useState<APIResponse | null>(null);
  const [error, setError] = useState<string>('');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const [showManualInput, setShowManualInput] = useState<boolean>(false);
  const [isResearching, setIsResearching] = useState<boolean>(false);

  const handleImageUpload = async (file: File) => {
    try {
      // Validate file
      if (!file.type.startsWith('image/')) {
        throw new Error('Please upload a valid image file');
      }

      if (file.size > 10 * 1024 * 1024) {
        throw new Error('Image size should be less than 10MB');
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setImage(file);
          setPreview(reader.result);
          setBusinessCard(null);
          setAdditionalDetails(null);
          setError('');
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process file');
    }
  };

  const handleCameraCapture = (file: File) => {
    handleImageUpload(file);
  };

  const handleManualSave = async (data: BusinessCard) => {
    try {
      setBusinessCard(data);
      setShowManualInput(false);
    } catch (err) {
      logger.error('Failed to process manual data', {}, err);
      setError('Failed to process the entered information. Please try again.');
    }
  };

  const processImage = async () => {
    if (!image) {
      setError('Please select an image first');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Convert image to base64
      const base64Image = preview.split(',')[1];
      
      // Extract business card data
      const cardData = await extractBusinessCardData(base64Image);
      setBusinessCard(cardData);
      
      logger.info('Successfully processed business card', {
        hasName: Boolean(cardData.personName),
        hasCompany: Boolean(cardData.companyName),
        hasEmail: Boolean(cardData.email)
      });
    } catch (err) {
      logger.error('Failed to process image', {}, err);
      setError(err instanceof Error ? err.message : 'Failed to process image');
      if (err instanceof Error && err.message.includes('API key')) {
        setIsSettingsOpen(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const researchAdditionalInfo = async () => {
    if (!businessCard) {
      setError('No business card data available');
      return;
    }

    setIsResearching(true);
    setError('');

    try {
      const details = await fetchAdditionalDetails(
        businessCard.companyName,
        businessCard.personName
      );
      setAdditionalDetails(details);
      
      logger.info('Successfully fetched additional details', {
        hasCompanyInfo: Boolean(details.companyInfo),
        hasSocialProfiles: Boolean(details.socialProfiles)
      });
    } catch (err) {
      logger.error('Failed to fetch additional details', {}, err);
      setError(err instanceof Error ? err.message : 'Failed to fetch additional information');
    } finally {
      setIsResearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Business Card Scanner
            </h1>
            <p className="text-gray-600 max-w-xl">
              Upload a business card image to extract contact information and research additional details about the person and company.
            </p>
          </div>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            <SettingsIcon className="w-4 h-4 mr-2" />
            Settings
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 transition-all duration-200 hover:shadow-xl">
          {error && <ErrorMessage message={error} />}
          
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-start">
              <Info className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
              <div className="text-sm text-blue-700">
                <p className="font-medium mb-1">Two-Step Process:</p>
                <ol className="list-decimal ml-4 space-y-1">
                  <li>Upload or capture a business card image to extract basic information</li>
                  <li>Use the "Research Additional Info" button to gather more details about the person and company</li>
                </ol>
              </div>
            </div>
          </div>
          
          <ImageUploader
            preview={preview}
            loading={loading}
            onImageUpload={handleImageUpload}
            onCameraOpen={() => setIsCameraOpen(true)}
            onProcess={processImage}
          />

          {businessCard && (
            <div className="mt-8 border-t border-gray-200 pt-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">Card Details</h2>
                <button
                  onClick={researchAdditionalInfo}
                  disabled={isResearching}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isResearching ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Researching...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Research Additional Info
                    </>
                  )}
                </button>
              </div>
              
              <BusinessCardDetails
                businessCard={businessCard}
                additionalDetails={additionalDetails}
              />
            </div>
          )}
        </div>
      </div>

      {isSettingsOpen && (
        <Settings
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          onSave={(keys) => {
            localStorage.setItem('apiKeys', JSON.stringify(keys));
            setIsSettingsOpen(false);
          }}
          apiKeys={JSON.parse(localStorage.getItem('apiKeys') || '{}')}
        />
      )}

      {isCameraOpen && (
        <CameraCapture
          onCapture={handleCameraCapture}
          onClose={() => setIsCameraOpen(false)}
        />
      )}

      {showManualInput && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="max-w-2xl w-full">
            <ManualInput
              initialData={businessCard || {}}
              onSave={handleManualSave}
              onCancel={() => setShowManualInput(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default OCRProcessor;