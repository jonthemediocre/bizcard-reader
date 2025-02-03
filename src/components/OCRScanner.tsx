import React, { useState } from 'react';
import { Upload, Loader2, Scan, AlertCircle, RefreshCw } from 'lucide-react';
import axios from 'axios';

const OCRScanner: React.FC = () => {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [text, setText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [processingStage, setProcessingStage] = useState<string>('');
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  const handleImageUpload = (file: File) => {
    try {
      // Reset states
      setError('');
      setText('');
      setProcessingStage('');
      setRetryCount(0);

      // Validate file
      if (!file.type.startsWith('image/')) {
        throw new Error('Please upload a valid image file (JPEG, PNG, etc.)');
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
        }
      };
      reader.onerror = () => {
        throw new Error('Failed to read the image file. Please try again.');
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process file');
      setImage(null);
      setPreview('');
    }
  };

  const processImage = async (isRetry = false) => {
    if (!image) {
      setError('Please select an image first');
      return;
    }

    if (!isRetry) {
      setRetryCount(0);
    }

    setLoading(true);
    setError('');
    setProcessingStage('Initializing...');

    try {
      // Get API key from localStorage
      const apiKeys = localStorage.getItem('apiKeys');
      const openaiKey = apiKeys ? JSON.parse(apiKeys).openai : '';

      if (!openaiKey) {
        throw new Error('OpenAI API key not configured. Please check your settings.');
      }

      setProcessingStage('Preparing image...');
      const base64Image = preview.split(',')[1];

      setProcessingStage('Sending to OpenAI...');
      const requestData = {
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Extract all text from this business card image. Return only the extracted text, exactly as it appears on the card.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${image.type};base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 1000
      };

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        requestData,
        {
          headers: {
            'Authorization': `Bearer ${openaiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000 // 30 second timeout
        }
      );

      setProcessingStage('Processing response...');
      const extractedText = response.data?.choices?.[0]?.message?.content;
      
      if (!extractedText) {
        throw new Error('No text was extracted from the image. Please try again with a clearer image.');
      }

      setText(extractedText);
      setProcessingStage('');
    } catch (err) {
      let errorMessage = 'Failed to process image. Please try again.';
      let canRetry = true;
      
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          errorMessage = 'Invalid API key. Please check your settings.';
          canRetry = false;
        } else if (err.response?.status === 429) {
          errorMessage = 'Rate limit exceeded. Please wait a moment and try again.';
        } else if (err.code === 'ECONNABORTED') {
          errorMessage = 'Request timed out. Please try again.';
        } else if (err.response?.data?.error?.message) {
          errorMessage = err.response.data.error.message;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      // Log error safely
      console.error('Vision API Error:', {
        message: errorMessage,
        status: axios.isAxiosError(err) ? err.response?.status : 'unknown',
        retryCount
      });

      // Handle retries
      if (canRetry && retryCount < MAX_RETRIES) {
        setRetryCount(prev => prev + 1);
        setError(`${errorMessage} Retrying... (Attempt ${retryCount + 1}/${MAX_RETRIES})`);
        setTimeout(() => processImage(true), 2000); // Retry after 2 seconds
        return;
      }

      setError(errorMessage);
    } finally {
      if (retryCount >= MAX_RETRIES) {
        setProcessingStage('');
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Business Card Scanner
          </h1>
          <p className="text-gray-600">
            Upload a business card image to extract text using AI
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-red-700">{error}</p>
                {retryCount >= MAX_RETRIES && (
                  <button
                    onClick={() => processImage()}
                    className="mt-2 inline-flex items-center text-sm text-red-700 hover:text-red-800"
                  >
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Try Again
                  </button>
                )}
              </div>
            </div>
          )}

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
                onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
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
            </div>
            
            <button
              onClick={() => processImage()}
              disabled={!preview || loading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Scan className="w-4 h-4 mr-2" />
              )}
              {loading ? processingStage || 'Processing...' : 'Scan Card'}
            </button>
          </div>

          {text && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-2">Extracted Text:</h2>
              <div className="bg-gray-50 rounded-lg p-4 whitespace-pre-wrap font-mono text-sm">
                {text}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OCRScanner;