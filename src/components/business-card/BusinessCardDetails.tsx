import React from 'react';
import type { BusinessCard, APIResponse } from '../../types/business-card';
import { Download } from 'lucide-react';
import { generateCSV, generateVCard, downloadFile } from '../../utils/exportUtils';
import PersonalInfo from './sections/PersonalInfo';
import ContactInfo from './sections/ContactInfo';
import CompanyInfo from './sections/CompanyInfo';

interface BusinessCardDetailsProps {
  businessCard: BusinessCard;
  additionalDetails: APIResponse | null;
}

const BusinessCardDetails: React.FC<BusinessCardDetailsProps> = ({
  businessCard,
  additionalDetails
}) => {
  const handleExport = (format: 'csv' | 'vcard') => {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const personName = businessCard.personName.replace(/\s+/g, '-').toLowerCase();

      if (format === 'csv') {
        const csv = generateCSV(businessCard, additionalDetails);
        downloadFile(csv, `${personName}-${timestamp}.csv`, 'text/csv');
      } else {
        const vcard = generateVCard(businessCard, additionalDetails);
        downloadFile(vcard, `${personName}-${timestamp}.vcf`, 'text/vcard');
      }
    } catch (err) {
      console.error('Export error:', err);
    }
  };

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Card Details</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => handleExport('csv')}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </button>
          <button
            onClick={() => handleExport('vcard')}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Download className="w-4 h-4 mr-2" />
            Export vCard
          </button>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <PersonalInfo businessCard={businessCard} />
        <ContactInfo businessCard={businessCard} />
        {additionalDetails?.companyInfo && (
          <CompanyInfo
            companyName={businessCard.companyName}
            companyInfo={additionalDetails.companyInfo}
          />
        )}
      </div>
    </div>
  );
};

export default BusinessCardDetails;