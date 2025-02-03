import React, { useState } from 'react';
import { Settings as SettingsIcon, Save, X, AlertCircle } from 'lucide-react';
import type { APIKeys } from '../types/business-card';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (keys: APIKeys) => void;
  apiKeys: APIKeys;
}

const Settings: React.FC<SettingsProps> = ({ isOpen, onClose, onSave, apiKeys }) => {
  const [keys, setKeys] = useState<APIKeys>(apiKeys);
  const [error, setError] = useState<string>('');

  const validateOpenAIKey = (key: string) => {
    if (!key) return 'OpenAI API key is required';
    if (!key.startsWith('sk-')) return 'OpenAI API key should start with "sk-"';
    if (key.length < 40) return 'OpenAI API key should be at least 40 characters long';
    return '';
  };

  const handleSave = () => {
    const openAIError = validateOpenAIKey(keys.openai);
    if (openAIError) {
      setError(openAIError);
      return;
    }

    setError('');
    onSave(keys);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold flex items-center">
            <SettingsIcon className="w-5 h-5 mr-2" />
            API Settings
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="openai" className="block text-sm font-medium text-gray-700 mb-1">
              OpenAI API Key
            </label>
            <input
              type="password"
              id="openai"
              value={keys.openai}
              onChange={(e) => {
                setKeys({ ...keys, openai: e.target.value });
                setError('');
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="sk-..."
            />
            <p className="mt-1 text-sm text-gray-500">
              Get your API key from{' '}
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-800"
              >
                OpenAI Dashboard
              </a>
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;