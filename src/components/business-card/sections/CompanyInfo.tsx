import React from 'react';
import type { CompanyInfo as CompanyInfoType } from '../../../types/business-card';

interface CompanyInfoProps {
  companyName: string;
  companyInfo: CompanyInfoType;
}

const CompanyInfo: React.FC<CompanyInfoProps> = ({ companyName, companyInfo }) => (
  <>
    <div className="px-4 py-5 sm:px-6 border-t border-gray-200">
      <h3 className="text-lg leading-6 font-medium text-gray-900">
        Company Information
      </h3>
      <p className="mt-1 max-w-2xl text-sm text-gray-500">
        {companyName}
      </p>
    </div>
    <div className="border-t border-gray-200">
      <dl>
        {companyInfo.description && (
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Description</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {companyInfo.description}
            </dd>
          </div>
        )}
        {companyInfo.industry && (
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Industry</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {companyInfo.industry}
            </dd>
          </div>
        )}
        {companyInfo.founded && (
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Founded</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {companyInfo.founded}
            </dd>
          </div>
        )}
        {companyInfo.employees && (
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Employees</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {companyInfo.employees}
            </dd>
          </div>
        )}
        {companyInfo.revenue && (
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Revenue</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {companyInfo.revenue}
            </dd>
          </div>
        )}
        {companyInfo.headquarters && (
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Headquarters</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {companyInfo.headquarters}
            </dd>
          </div>
        )}
        {companyInfo.competitors && companyInfo.competitors.length > 0 && (
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Competitors</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              <ul className="list-disc pl-5 space-y-1">
                {companyInfo.competitors.map((competitor, index) => (
                  <li key={index}>{competitor}</li>
                ))}
              </ul>
            </dd>
          </div>
        )}
      </dl>
    </div>
  </>
);

export default CompanyInfo;