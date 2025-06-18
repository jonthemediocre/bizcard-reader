import React from 'react';
import { BusinessCard } from '../../../types/business-card';

interface ContactInfoProps {
  data: BusinessCard;
}

const ContactInfo: React.FC<ContactInfoProps> = ({ data }) => {
  const renderPhone = () => {
    if (!data.phones || data.phones.length === 0) return null;
    
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
        {data.phones.map((phone, index) => (
          <div key={index}>
            <a href={`tel:${phone}`} className="text-indigo-600 hover:text-indigo-900">
              {phone}
            </a>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
      
      {data.email && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <a href={`mailto:${data.email}`} className="text-indigo-600 hover:text-indigo-900">
            {data.email}
          </a>
        </div>
      )}
      
      {renderPhone()}
      
      {data.website && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
          <a href={data.website} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-900">
            {data.website}
          </a>
        </div>
      )}
      
      {data.address && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <p className="text-gray-900">{data.address}</p>
        </div>
      )}
      
      {data.socialMedia && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Social Media</label>
          <div className="space-y-1">
            <p className="text-indigo-600">{data.socialMedia}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactInfo;