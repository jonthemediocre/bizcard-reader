import React, { useState } from 'react';
import { BusinessCardData } from '../types/ocr';

interface CRMIntelligenceDisplayProps {
  businessCardData?: BusinessCardData;
}

export const CRMIntelligenceDisplay: React.FC<CRMIntelligenceDisplayProps> = ({ 
  businessCardData 
}) => {
  const [intelligence, setIntelligence] = useState<any | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateIntelligence = async () => {
    if (!businessCardData) {
      alert('Please scan a business card first!');
      return;
    }

    setIsGenerating(true);
    try {
      // Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock intelligence data
      const mockIntelligence = {
        salesIntelligence: {
          leadScore: 85,
          buyingSignals: ['New company', 'Growing team', 'Technology focus'],
          recommendedApproach: 'Technical consultation',
          estimatedDealSize: '$50K-$100K',
          timeToClose: '3-6 months'
        },
        relationshipMapping: {
          connectionStrength: 'Second-degree',
          mutualConnections: 12,
          sharedInterests: ['Technology', 'Innovation', 'Growth']
        },
        marketInsights: {
          companyStage: 'Growth',
          recentNews: ['Series B funding', 'New product launch'],
          competitors: ['CompetitorA', 'CompetitorB']
        }
      };
      
      setIntelligence(mockIntelligence);
    } catch (error) {
      console.error('Failed to generate intelligence:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!businessCardData) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
            🧠
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Business Card Scanned
          </h3>
          <p className="text-gray-500">
            Please scan a business card first to generate CRM intelligence insights.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              🧠 CRM Intelligence Analysis
            </h2>
            <p className="text-gray-600">
              AI-powered insights for {businessCardData.name || 'contact'}
            </p>
          </div>
          <button
            onClick={generateIntelligence}
            disabled={isGenerating}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              isGenerating
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isGenerating ? '🔄 Analyzing...' : '🚀 Generate Intelligence'}
          </button>
        </div>

        {/* Contact Summary */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-2">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Name:</span> {businessCardData.name || 'N/A'}
            </div>
            <div>
              <span className="font-medium">Company:</span> {businessCardData.company || 'N/A'}
            </div>
            <div>
              <span className="font-medium">Title:</span> {businessCardData.title || 'N/A'}
            </div>
            <div>
              <span className="font-medium">Email:</span> {businessCardData.email || 'N/A'}
            </div>
          </div>
        </div>
      </div>

      {/* Intelligence Results */}
      {intelligence && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales Intelligence */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              📈 Sales Intelligence
            </h3>
            <div className="space-y-4">
              <div>
                <label className="font-medium text-gray-700">Lead Score:</label>
                <div className="mt-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${intelligence.salesIntelligence.leadScore}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600">
                  {intelligence.salesIntelligence.leadScore}/100
                </span>
              </div>
              
              <div>
                <label className="font-medium text-gray-700">Buying Signals:</label>
                <ul className="mt-1 list-disc list-inside space-y-1">
                  {intelligence.salesIntelligence.buyingSignals.map((signal: string, index: number) => (
                    <li key={index} className="text-sm text-gray-600">{signal}</li>
                  ))}
                </ul>
              </div>

              <div>
                <label className="font-medium text-gray-700">Recommended Approach:</label>
                <p className="mt-1 text-sm text-gray-600">
                  {intelligence.salesIntelligence.recommendedApproach}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-medium text-gray-700">Deal Size:</label>
                  <p className="text-sm text-gray-600">
                    {intelligence.salesIntelligence.estimatedDealSize}
                  </p>
                </div>
                <div>
                  <label className="font-medium text-gray-700">Time to Close:</label>
                  <p className="text-sm text-gray-600">
                    {intelligence.salesIntelligence.timeToClose}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Relationship Mapping */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              🌐 Relationship Mapping
            </h3>
            <div className="space-y-4">
              <div>
                <label className="font-medium text-gray-700">Connection Strength:</label>
                <p className="text-sm text-gray-600">
                  {intelligence.relationshipMapping.connectionStrength}
                </p>
              </div>
              
              <div>
                <label className="font-medium text-gray-700">Mutual Connections:</label>
                <p className="text-sm text-gray-600">
                  {intelligence.relationshipMapping.mutualConnections} contacts
                </p>
              </div>

              <div>
                <label className="font-medium text-gray-700">Shared Interests:</label>
                <div className="mt-1 flex flex-wrap gap-2">
                  {intelligence.relationshipMapping.sharedInterests.map((interest: string, index: number) => (
                    <span 
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Market Insights */}
          <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-2">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              📊 Market Insights
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="font-medium text-gray-700">Company Stage:</label>
                <p className="text-sm text-gray-600 mt-1">
                  {intelligence.marketInsights.companyStage}
                </p>
              </div>
              
              <div>
                <label className="font-medium text-gray-700">Recent News:</label>
                <ul className="mt-1 space-y-1">
                  {intelligence.marketInsights.recentNews.map((news: string, index: number) => (
                    <li key={index} className="text-sm text-gray-600">• {news}</li>
                  ))}
                </ul>
              </div>

              <div>
                <label className="font-medium text-gray-700">Key Competitors:</label>
                <ul className="mt-1 space-y-1">
                  {intelligence.marketInsights.competitors.map((competitor: string, index: number) => (
                    <li key={index} className="text-sm text-gray-600">• {competitor}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isGenerating && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Generating Intelligence...
            </h3>
            <p className="text-gray-500">
              Our AI is analyzing the contact and market data to provide actionable insights.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CRMIntelligenceDisplay;