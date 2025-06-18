/**
 * @file BusinessCardDisplay.tsx
 * @description Display structured business card data with export options
 * @user-value Show extracted data in useful format with export capabilities
 */

import React from 'react';
import { Download, Save } from 'lucide-react';
import { BusinessCardData, exportBusinessCard, saveBusinessCard } from '../services/businessCardExtractor';

interface BusinessCardDisplayProps {
  data: BusinessCardData;
  onSave?: () => void;
}

const BusinessCardDisplay: React.FC<BusinessCardDisplayProps> = ({ data, onSave }) => {
  const handleExport = (format: 'json' | 'csv' | 'vcard') => {
    const exported = exportBusinessCard(data, format);
    const blob = new Blob([exported], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.name || 'business-card'}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSave = () => {
    saveBusinessCard(data);
    onSave?.();
  };

  const renderPhone = () => {
    if (!data.phone) return 'Not provided';
    
    if (typeof data.phone === 'string') {
      return data.phone;
    }
    
    if (Array.isArray(data.phone)) {
      return data.phone.map((phoneItem: any, index: number) => (
        <div key={index}>
          {phoneItem.value}
          {phoneItem.type && <span className="text-gray-500 ml-2">({phoneItem.type})</span>}
        </div>
      ));
    }
    
    return 'Not provided';
  };

  const confidence = data.confidence || 0;
  const confidencePercentage = Math.round(confidence * 100);

  return (
    <div className="max-w-md mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4">
        <div className="text-white">
          <h2 className="text-xl font-bold">{data.name || 'Name not detected'}</h2>
          {data.title && <p className="text-blue-100">{data.title}</p>}
          {data.company && <p className="text-blue-100 font-medium">{data.company}</p>}
        </div>
      </div>
      
      <div className="px-6 py-4">
        <div className="space-y-3">
          {data.email && (
            <div className="flex items-center">
              <span className="text-gray-600 font-medium w-20">Email:</span>
              <a href={`mailto:${data.email}`} className="text-blue-600 hover:text-blue-800">
                {data.email}
              </a>
            </div>
          )}
          
          <div className="flex items-center">
            <span className="text-gray-600 font-medium w-20">Phone:</span>
            <div className="text-gray-800">
              {renderPhone()}
            </div>
          </div>
          
          {data.website && (
            <div className="flex items-center">
              <span className="text-gray-600 font-medium w-20">Website:</span>
              <a 
                href={data.website} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-600 hover:text-blue-800"
              >
                {data.website}
              </a>
            </div>
          )}
          
          {data.address && (
            <div className="flex items-start">
              <span className="text-gray-600 font-medium w-20">Address:</span>
              <span className="text-gray-800">{data.address}</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="px-6 py-3 bg-gray-50 border-t">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Extraction Confidence</span>
          <div className="flex items-center">
            <span className="text-sm font-medium text-gray-900 mr-2">
              {confidencePercentage}%
            </span>
            <div className="w-16 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${confidencePercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-start mt-4">
        <div className="flex space-x-2">
          <button
            onClick={handleSave}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            title="Save card"
          >
            <Save className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Export Options */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-500 mb-3">Export as:</p>
        <div className="flex space-x-2">
          <button
            onClick={() => handleExport('vcard')}
            className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>vCard</span>
          </button>
          <button
            onClick={() => handleExport('csv')}
            className="flex items-center space-x-1 px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>CSV</span>
          </button>
          <button
            onClick={() => handleExport('json')}
            className="flex items-center space-x-1 px-3 py-2 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>JSON</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BusinessCardDisplay; 