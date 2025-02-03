import React from 'react';
import type { BusinessCard } from '../../../types/business-card';

interface ContactInfoProps {
  businessCard: BusinessCard;
}

const ContactInfo: React.FC<ContactInfoProps> = ({ businessCard }) => (
  <>
    <div className="px-4 py-5 sm:px-6 border-t border-gray-200">
      <h3 className="text-lg leading-6 font-medium text-gray-900">
        Contact Information
      </h3>
    </div>
    <div className="border-t border-gray-200">
      <dl>
        {businessCard.email && (
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Email</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              <a href={`mailto:${businessCard.email}`} className="text-indigo-600 hover:text-indigo-900">
                {businessCard.email}
              </a>
            </dd>
          </div>
        )}
        {businessCard.alternateEmail && (
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Alternative Email</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              <a href={`mailto:${businessCard.alternateEmail}`} className="text-indigo-600 hover:text-indigo-900">
                {businessCard.alternateEmail}
              </a>
            </dd>
          </div>
        )}
        {businessCard.phones && businessCard.phones.length > 0 && (
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Phone Numbers</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              <ul className="space-y-2">
                {businessCard.phones.map((phone, index) => (
                  <li key={index}>
                    <a href={`tel:${typeof phone === 'string' ? phone : phone.value}`} className="text-indigo-600 hover:text-indigo-900">
                      {typeof phone === 'string' ? phone : phone.value}
                    </a>
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        )}
        {businessCard.website && (
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Website</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              <a href={businessCard.website} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-900">
                {businessCard.website}
              </a>
            </dd>
          </div>
        )}
        {businessCard.address && (
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Address</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {businessCard.address}
            </dd>
          </div>
        )}
      </dl>
    </div>
    <img src="..." alt="Description of image" />
  </>
);

export default ContactInfo;