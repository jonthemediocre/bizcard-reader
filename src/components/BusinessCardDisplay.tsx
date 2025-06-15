/**
 * @file BusinessCardDisplay.tsx
 * @description Display structured business card data with export options
 * @user-value Show extracted data in useful format with export capabilities
 */

import React from 'react';
import { Download, Save, User, Building, Mail, Phone, Globe, MapPin } from 'lucide-react';
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

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Business Card Data</h3>
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

      <div className="space-y-3">
        {data.name && (
          <div className="flex items-center space-x-3">
            <User className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-medium">{data.name}</p>
            </div>
          </div>
        )}

        {data.title && (
          <div className="flex items-center space-x-3">
            <Building className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Title</p>
              <p className="font-medium">{data.title}</p>
            </div>
          </div>
        )}

        {data.company && (
          <div className="flex items-center space-x-3">
            <Building className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Company</p>
              <p className="font-medium">{data.company}</p>
            </div>
          </div>
        )}

        {data.email && (
          <div className="flex items-center space-x-3">
            <Mail className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <a 
                href={`mailto:${data.email}`}
                className="font-medium text-blue-600 hover:text-blue-800"
              >
                {data.email}
              </a>
            </div>
          </div>
        )}

        {data.phone && (
          <div className="flex items-center space-x-3">
            <Phone className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <a 
                href={`tel:${data.phone}`}
                className="font-medium text-blue-600 hover:text-blue-800"
              >
                {data.phone}
              </a>
            </div>
          </div>
        )}

        {data.website && (
          <div className="flex items-center space-x-3">
            <Globe className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Website</p>
              <a 
                href={data.website.startsWith('http') ? data.website : `https://${data.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-blue-600 hover:text-blue-800"
              >
                {data.website}
              </a>
            </div>
          </div>
        )}

        {data.address && (
          <div className="flex items-center space-x-3">
            <MapPin className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Address</p>
              <p className="font-medium">{data.address}</p>
            </div>
          </div>
        )}
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

      {/* Confidence Score */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Extraction Confidence</span>
          <span className="text-sm font-medium text-green-600">
            {Math.round(data.confidence * 100)}%
          </span>
        </div>
        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-green-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${data.confidence * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default BusinessCardDisplay; 