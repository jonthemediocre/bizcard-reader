import React, { useState } from 'react';
import { ContactIntelligence, generateDemoCRMIntelligence, CRMIntelligenceEngine } from '../services/crmIntelligence';
import { BusinessCardData } from '../services/businessCardExtractor';

interface CRMIntelligenceDisplayProps {
  businessCardData?: BusinessCardData;
}

export const CRMIntelligenceDisplay: React.FC<CRMIntelligenceDisplayProps> = ({ businessCardData }) => {
  const [intelligence, setIntelligence] = useState<ContactIntelligence | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'strategic' | 'tactical' | 'advanced'>('overview');

  const generateIntelligence = async () => {
    setLoading(true);
    try {
      console.log('🔍 CRM Intelligence Debug:', {
        hasBusinessCardData: !!businessCardData,
        businessCardData: businessCardData
      });
      
      if (businessCardData) {
        console.log('✅ Using REAL business card data:', businessCardData);
        const engine = new CRMIntelligenceEngine('Strategic');
        const result = await engine.generateIntelligence(businessCardData);
        console.log('📊 Generated intelligence from real data:', result);
        setIntelligence(result);
      } else {
        console.log('⚠️ No business card data - using demo data');
        // Use demo data
        const demoIntelligence = generateDemoCRMIntelligence();
        setIntelligence(demoIntelligence);
      }
    } catch (error) {
      console.error('Failed to generate CRM intelligence:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportIntelligence = () => {
    if (!intelligence) return;
    
    const dataStr = JSON.stringify(intelligence, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `crm-intelligence-${intelligence.contactProfile.name.replace(/\s+/g, '-').toLowerCase()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!intelligence) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">
          <div className="mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🧠</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Advanced CRM Intelligence
            </h3>
            <p className="text-gray-600 mb-6">
              Transform basic contact information into strategic relationship intelligence through multi-dimensional analysis.
            </p>
          </div>
          
          <button
            onClick={generateIntelligence}
            disabled={loading}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generating Intelligence...
              </div>
            ) : (
              `Generate ${businessCardData ? 'CRM Intelligence' : 'Demo Intelligence'}`
            )}
          </button>
          
          {!businessCardData && (
            <p className="text-sm text-gray-500 mt-3">
              No business card data available. Will generate demo intelligence.
            </p>
          )}
          {businessCardData && (
            <p className="text-sm text-green-600 mt-3">
              ✅ Using real business card data: {businessCardData.name} at {businessCardData.company}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold mb-2">CRM Intelligence Report</h2>
            <p className="text-blue-100">
              {intelligence.contactProfile.name} • {intelligence.contactProfile.title}
            </p>
            <p className="text-blue-200 text-sm">
              {intelligence.companySnapshot.name} • Confidence: {Math.round(intelligence.confidence * 100)}%
            </p>
          </div>
          <button
            onClick={exportIntelligence}
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Export Report
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {[
            { key: 'overview', label: 'Executive Overview', icon: '📊' },
            { key: 'strategic', label: 'Strategic Brief', icon: '🎯' },
            { key: 'tactical', label: 'Tactical Plan', icon: '⚡' },
            { key: 'advanced', label: 'Advanced Intel', icon: '🔍' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Contact Profile */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <span className="mr-2">👤</span>
                  Contact Profile
                </h3>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Role Influence:</span> {intelligence.contactProfile.roleInfluence}</div>
                  <div><span className="font-medium">Decision Authority:</span> {intelligence.contactProfile.decisionAuthority}</div>
                  <div><span className="font-medium">Communication Style:</span> {intelligence.advancedIntelligence.behavioralPatterns.communicationStyle}</div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <span className="mr-2">🏢</span>
                  Company Snapshot
                </h3>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Size:</span> {intelligence.companySnapshot.size}</div>
                  <div><span className="font-medium">Stage:</span> {intelligence.companySnapshot.stage}</div>
                  <div><span className="font-medium">Financial Health:</span> {intelligence.companySnapshot.financialHealth}</div>
                  <div><span className="font-medium">Growth:</span> {intelligence.marketPosition.growthTrajectory}</div>
                </div>
              </div>
            </div>

            {/* Engagement Opportunity */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">🎯</span>
                Primary Engagement Opportunity
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Approach Vector</h4>
                  <p className="text-sm text-gray-600">{intelligence.engagementOpportunity.primaryApproachVector}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Optimal Timing</h4>
                  <p className="text-sm text-gray-600">{intelligence.engagementOpportunity.optimalTiming}</p>
                </div>
              </div>
              <div className="mt-4">
                <h4 className="font-medium text-gray-700 mb-2">Value Propositions</h4>
                <div className="flex flex-wrap gap-2">
                  {intelligence.engagementOpportunity.valuePropositioning.map((value, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs">
                      {value}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Developments */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <span className="mr-2">📈</span>
                Recent Company Developments
              </h3>
              <ul className="space-y-2">
                {intelligence.companySnapshot.recentDevelopments.map((development, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    {development}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'strategic' && (
          <div className="space-y-6">
            {/* Business Priorities */}
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">🎯</span>
                Business Priorities
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                {intelligence.strategicBrief.businessPriorities.map((priority, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 text-center">
                    <div className="text-2xl mb-2">
                      {index === 0 ? '🚀' : index === 1 ? '⚡' : '💡'}
                    </div>
                    <p className="font-medium text-gray-900">{priority}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Decision Factors */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Decision Factors</h3>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-gray-700 text-sm">Budget Cycle</h4>
                    <p className="text-sm text-gray-600">{intelligence.strategicBrief.decisionFactors.budgetCycle}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700 text-sm">Approval Process</h4>
                    <p className="text-sm text-gray-600">{intelligence.strategicBrief.decisionFactors.approvalProcess}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700 text-sm">Timeline Expectations</h4>
                    <p className="text-sm text-gray-600">{intelligence.strategicBrief.decisionFactors.timelineExpectations}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Innovation Profile</h3>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-gray-700 text-sm">Technology Adoption</h4>
                    <p className="text-sm text-gray-600">{intelligence.strategicBrief.innovationAppetite.technologyAdoption}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700 text-sm">Risk Tolerance</h4>
                    <p className="text-sm text-gray-600">{intelligence.strategicBrief.innovationAppetite.riskTolerance}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700 text-sm">Change Drivers</h4>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {intelligence.strategicBrief.innovationAppetite.changeDrivers.map((driver, index) => (
                        <span key={index} className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                          {driver}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Market Challenges & Opportunities */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <span className="mr-2">⚠️</span>
                  Key Challenges
                </h3>
                <ul className="space-y-2">
                  {intelligence.marketPosition.keyChallenges.map((challenge, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start">
                      <span className="text-red-500 mr-2">•</span>
                      {challenge}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <span className="mr-2">🌟</span>
                  Market Opportunities
                </h3>
                <ul className="space-y-2">
                  {intelligence.marketPosition.marketOpportunities.map((opportunity, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start">
                      <span className="text-green-500 mr-2">•</span>
                      {opportunity}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tactical' && (
          <div className="space-y-6">
            {/* Optimal Timing */}
            <div className="bg-green-50 rounded-lg p-6 border border-green-200">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">⏰</span>
                Optimal Timing Strategy
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Best Timeframe</h4>
                  <p className="text-sm text-gray-600 mb-4">{intelligence.tacticalRecommendations.optimalTiming.bestTimeframe}</p>
                  
                  <h4 className="font-medium text-gray-700 mb-2">Industry Considerations</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {intelligence.tacticalRecommendations.optimalTiming.industryConsiderations.map((consideration, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        {consideration}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Company Milestones</h4>
                  <ul className="text-sm text-gray-600 space-y-1 mb-4">
                    {intelligence.tacticalRecommendations.optimalTiming.companyMilestones.map((milestone, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-purple-500 mr-2">•</span>
                        {milestone}
                      </li>
                    ))}
                  </ul>
                  
                  <h4 className="font-medium text-gray-700 mb-2">Personal Factors</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {intelligence.tacticalRecommendations.optimalTiming.personalFactors.map((factor, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-green-500 mr-2">•</span>
                        {factor}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Message Positioning */}
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">💬</span>
                Message Positioning
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">Pain Points to Address</h4>
                  <div className="space-y-2">
                    {intelligence.tacticalRecommendations.messagePositioning.painPointsToAddress.map((pain, index) => (
                      <div key={index} className="bg-red-100 text-red-800 px-3 py-2 rounded-lg text-sm">
                        {pain}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">Value Propositions</h4>
                  <div className="space-y-2">
                    {intelligence.tacticalRecommendations.messagePositioning.valuePropositions.map((value, index) => (
                      <div key={index} className="bg-green-100 text-green-800 px-3 py-2 rounded-lg text-sm">
                        {value}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Follow-up Architecture */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">📋</span>
                Follow-up Sequence
              </h3>
              <div className="space-y-4">
                {intelligence.tacticalRecommendations.followupArchitecture.sequencePlanning.map((step, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 border-l-4 border-blue-500">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900">Step {step.step}: {step.objective}</h4>
                      <span className="text-sm text-gray-500">{step.timing}</span>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">Channel:</span> {step.channel}
                    </div>
                    <p className="text-sm text-gray-600">{step.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'advanced' && (
          <div className="space-y-6">
            {/* Behavioral Patterns */}
            <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">🧠</span>
                Behavioral Pattern Analysis
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Communication Style</h4>
                    <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                      {intelligence.advancedIntelligence.behavioralPatterns.communicationStyle}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Decision Timeline</h4>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                      {intelligence.advancedIntelligence.behavioralPatterns.decisionTimeline}
                    </span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Risk Tolerance</h4>
                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                      {intelligence.advancedIntelligence.behavioralPatterns.riskTolerance}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Change Management</h4>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                      {intelligence.advancedIntelligence.behavioralPatterns.changeManagement}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Predictive Indicators */}
            <div className="bg-orange-50 rounded-lg p-6 border border-orange-200">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">🔮</span>
                Predictive Indicators
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Buying Cycle Position</h4>
                  <div className="bg-white rounded-lg p-3 mb-4">
                    <span className="text-lg font-semibold text-orange-600">
                      {intelligence.advancedIntelligence.predictiveIndicators.buyingCyclePosition}
                    </span>
                  </div>
                  
                  <h4 className="font-medium text-gray-700 mb-2">Budget Allocation</h4>
                  <p className="text-sm text-gray-600">
                    {intelligence.advancedIntelligence.predictiveIndicators.budgetAllocationTiming}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Strategic Inflection Points</h4>
                  <ul className="space-y-2">
                    {intelligence.advancedIntelligence.predictiveIndicators.strategicInflectionPoints.map((point, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start">
                        <span className="text-orange-500 mr-2">•</span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Intelligence Sources */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">📚</span>
                Intelligence Sources
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {intelligence.sources.map((source, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 border">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900">{source.source}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        source.type === 'Primary' ? 'bg-green-100 text-green-800' :
                        source.type === 'Social' ? 'bg-blue-100 text-blue-800' :
                        source.type === 'Industry' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {source.type}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Reliability: {Math.round(source.reliability * 100)}%</span>
                      <span>{source.freshness}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CRMIntelligenceDisplay;