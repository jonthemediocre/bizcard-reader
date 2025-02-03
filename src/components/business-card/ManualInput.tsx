import React, { useState } from 'react';
import { Save } from 'lucide-react';
import type { BusinessCard } from '../../types/business-card';

interface ManualInputProps {
  initialData: Partial<BusinessCard>;
  onSave: (data: BusinessCard) => void;
  onCancel: () => void;
}

const ManualInput: React.FC<ManualInputProps> = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<BusinessCard>>({
    personName: '',
    companyName: '',
    jobTitle: '',
    email: '',
    phones: [''],
    ...initialData
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as BusinessCard);
  };

  const handlePhoneChange = (index: number, value: string) => {
    const newPhones = [...formData.phones!];
    newPhones[index] = value;
    setFormData({ ...formData, phones: newPhones });
  };

  const addPhone = () => {
    setFormData({ ...formData, phones: [...formData.phones!, ''] });
  };

  const removePhone = (index: number) => {
    const newPhones = formData.phones!.filter((_, i) => i !== index);
    setFormData({ ...formData, phones: newPhones });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4">Manual Information Entry</h2>
      <p className="text-gray-600 mb-4">
        Please enter any missing or incorrect information below.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Person Name *
          </label>
          <input
            type="text"
            value={formData.personName}
            onChange={(e) => setFormData({ ...formData, personName: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Company Name *
          </label>
          <input
            type="text"
            value={formData.companyName}
            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Job Title *
          </label>
          <input
            type="text"
            value={formData.jobTitle}
            onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Numbers *
          </label>
          {formData.phones!.map((phone, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="tel"
                value={phone}
                onChange={(e) => handlePhoneChange(index, e.target.value)}
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
              {formData.phones!.length > 1 && (
                <button
                  type="button"
                  onClick={() => removePhone(index)}
                  className="px-2 py-1 text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addPhone}
            className="text-sm text-indigo-600 hover:text-indigo-800"
          >
            + Add another phone number
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Website
          </label>
          <input
            type="url"
            value={formData.website || ''}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Address
          </label>
          <textarea
            value={formData.address || ''}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            rows={3}
          />
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Information
          </button>
        </div>
      </form>
    </div>
  );
};

export default ManualInput;