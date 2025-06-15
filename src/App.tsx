import React, { useState } from 'react';
import BusinessCardScanner from './components/BusinessCardScanner';
import { PracticalCRMDisplay } from './components/PracticalCRMDisplay';
import { BusinessCardData } from './types/ocr';

function App() {
  const [activeTab, setActiveTab] = useState<'scanner' | 'crm'>('scanner');
  const [businessCardData, setBusinessCardData] = useState<BusinessCardData | null>(null);

  const handleBusinessCardExtracted = (data: BusinessCardData) => {
    console.log('📱 App received business card data:', data);
    setBusinessCardData(data);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Business Card Intelligence</h1>
              <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('scanner')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'scanner'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  📱 Scanner
                </button>
                <button
                  onClick={() => setActiveTab('crm')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'crm'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  🧠 CRM Intelligence
                </button>
              </div>
            </div>
            {businessCardData && (
              <div className="text-sm text-gray-600">
                Last scan: {businessCardData.name || 'Unknown contact'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'scanner' && (
          <BusinessCardScanner onBusinessCardExtracted={handleBusinessCardExtracted} />
        )}
        {activeTab === 'crm' && (
          <PracticalCRMDisplay businessCardData={businessCardData || undefined} />
        )}
      </div>
    </div>
  );
}

export default App;