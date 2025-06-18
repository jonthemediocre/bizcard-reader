import React, { useState, useEffect } from 'react';
import { BusinessCardData } from '../types/ocr';
import { PracticalCRMEngine, SalesIntelligence, generateDemoSalesIntelligence } from '../services/practicalCRM';

interface PracticalCRMDisplayProps {
  businessCardData?: BusinessCardData;
}

export const PracticalCRMDisplay: React.FC<PracticalCRMDisplayProps> = ({ businessCardData }) => {
  const [intelligence, setIntelligence] = useState<SalesIntelligence | null>(null);
  const [loading, setLoading] = useState(false);

  const generateIntelligence = async () => {
    setLoading(true);
    try {
      console.log('🎯 Practical CRM Debug:', {
        hasBusinessCardData: !!businessCardData,
        businessCardData: businessCardData
      });
      
      if (businessCardData) {
        console.log('✅ Using REAL business card data for CRM intelligence');
        const engine = new PracticalCRMEngine();
        const result = await engine.generateSalesIntelligence(businessCardData);
        setIntelligence(result);
      } else {
        console.log('⚠️ No business card data - using demo intelligence');
        const demoIntelligence = generateDemoSalesIntelligence();
        setIntelligence(demoIntelligence);
      }
    } catch (error) {
      console.error('Failed to generate sales intelligence:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateIntelligence();
  }, [businessCardData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Generating sales intelligence...</span>
      </div>
    );
  }

  if (!intelligence) {
    return (
      <div className="text-center p-8">
        <button
          onClick={generateIntelligence}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Generate Sales Intelligence
        </button>
        {!businessCardData && (
          <p className="text-sm text-gray-500 mt-3">
            No business card data available. Will generate demo intelligence.
          </p>
        )}
        {businessCardData && (
          <p className="text-sm text-green-600 mt-3">
            ✅ Ready to analyze: {businessCardData.name} at {businessCardData.company}
          </p>
        )}
      </div>
    );
  }

  const getLeadQualityColor = (quality: string) => {
    switch (quality) {
      case 'Hot': return 'bg-red-100 text-red-800 border-red-200';
      case 'Warm': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Cold': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header with Lead Score */}
      <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Sales Intelligence</h2>
            {businessCardData && (
              <p className="text-gray-600">{businessCardData.name} • {businessCardData.company}</p>
            )}
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600">{intelligence.leadScore}</div>
            <div className="text-sm text-gray-500">Lead Score</div>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getLeadQualityColor(intelligence.leadQuality)}`}>
              {intelligence.leadQuality} Lead
            </span>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-sm text-gray-500">Decision Power</div>
          <div className="text-lg font-semibold text-gray-900">{intelligence.decisionMakingPower}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-sm text-gray-500">Company Size</div>
          <div className="text-lg font-semibold text-gray-900">{intelligence.companyProfile.size}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-sm text-gray-500">Industry</div>
          <div className="text-lg font-semibold text-gray-900">{intelligence.companyProfile.industry}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-sm text-gray-500">Budget Authority</div>
          <div className="text-lg font-semibold text-gray-900">
            {intelligence.contactProfile.likelyBudgetAuthority ? '✅ Yes' : '❌ No'}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📞 Contact Information</h3>
          {businessCardData ? (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium">{businessCardData.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Title:</span>
                <span className="font-medium">{businessCardData.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Company:</span>
                <span className="font-medium">{businessCardData.company}</span>
              </div>
              {businessCardData.email && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <a href={`mailto:${businessCardData.email}`} className="font-medium text-blue-600 hover:text-blue-800">
                    {businessCardData.email}
                  </a>
                </div>
              )}
              {businessCardData.phone && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone:</span>
                  <a href={`tel:${businessCardData.phone}`} className="font-medium text-blue-600 hover:text-blue-800">
                    {businessCardData.phone}
                  </a>
                </div>
              )}
              {businessCardData.website && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Website:</span>
                  <a href={businessCardData.website} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:text-blue-800">
                    {businessCardData.website}
                  </a>
                </div>
              )}
              {businessCardData.address && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Address:</span>
                  <span className="font-medium text-right max-w-xs">{businessCardData.address}</span>
                </div>
              )}
              {businessCardData.linkedinProfile && (
                <div className="flex justify-between">
                  <span className="text-gray-600">LinkedIn:</span>
                  <a href={businessCardData.linkedinProfile} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:text-blue-800">
                    View Profile
                  </a>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No contact information available</p>
          )}
        </div>

        {/* Contact Profile */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">👤 Contact Profile</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Seniority:</span>
              <span className="font-medium">{intelligence.contactProfile.seniority}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Department:</span>
              <span className="font-medium">{intelligence.contactProfile.department}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Influence:</span>
              <span className="font-medium">{intelligence.contactProfile.influence}</span>
            </div>
          </div>
        </div>

        {/* Company Profile */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🏢 Company Profile</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Revenue:</span>
              <span className="font-medium">{intelligence.companyProfile.estimatedRevenue}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Employees:</span>
              <span className="font-medium">{intelligence.companyProfile.employeeCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Growth Stage:</span>
              <span className="font-medium">{intelligence.companyProfile.growthStage}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Founded:</span>
              <span className="font-medium">{intelligence.companyProfile.foundedYear}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Headquarters:</span>
              <span className="font-medium">{intelligence.companyProfile.headquarters}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Business Model:</span>
              <span className="font-medium">{intelligence.companyProfile.businessModel}</span>
            </div>
          </div>
        </div>

        {/* Strategic Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 Strategic Information</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Mission Statement:</h4>
              <p className="text-sm text-gray-600 italic">{intelligence.companyProfile.missionStatement}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Vision Statement:</h4>
              <p className="text-sm text-gray-600 italic">{intelligence.companyProfile.visionStatement}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Core Values:</h4>
              <div className="flex flex-wrap gap-2">
                {intelligence.companyProfile.coreValues.map((value, index) => (
                  <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {value}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Strategic Priorities:</h4>
              <div className="flex flex-wrap gap-2">
                {intelligence.companyProfile.strategicPriorities.map((priority, index) => (
                  <span key={index} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    {priority}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Market Position:</h4>
              <p className="text-sm text-gray-600">{intelligence.companyProfile.marketPosition}</p>
            </div>
          </div>
        </div>

        {/* Competitive Intelligence */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🏆 Competitive Intelligence</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Target Markets:</h4>
              <div className="flex flex-wrap gap-2">
                {intelligence.companyProfile.targetMarkets.map((market, index) => (
                  <span key={index} className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                    {market}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Key Partners:</h4>
              <div className="flex flex-wrap gap-2">
                {intelligence.companyProfile.keyPartners.map((partner, index) => (
                  <span key={index} className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                    {partner}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Competitive Advantages:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {intelligence.companyProfile.competitiveAdvantages.map((advantage, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    {advantage}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Key Technologies:</h4>
              <div className="flex flex-wrap gap-2">
                {intelligence.companyProfile.keyTechnologies.map((tech, index) => (
                  <span key={index} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sales Strategy */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 Sales Strategy</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Approach:</h4>
              <p className="text-sm text-gray-600">{intelligence.salesStrategy.approachRecommendation}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Key Talking Points:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {intelligence.salesStrategy.keyTalkingPoints.map((point, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Potential Pain Points:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {intelligence.salesStrategy.potentialPainPoints.map((point, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Social Intelligence */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🔗 Social Intelligence</h3>
          <div className="space-y-4">
            {intelligence.socialIntelligence.linkedinProfile && (
              <div>
                <h4 className="font-medium text-gray-700 mb-2">LinkedIn Research:</h4>
                <a 
                  href={intelligence.socialIntelligence.linkedinProfile}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm underline"
                >
                  Search LinkedIn Profile →
                </a>
              </div>
            )}
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Research Checklist:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {intelligence.socialIntelligence.recentActivity?.map((activity, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-green-500 mr-2">□</span>
                    {activity}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Next Steps - Full Width */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">🚀 Next Steps</h3>
          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(intelligence.nextSteps.priority)}`}>
            {intelligence.nextSteps.priority} Priority
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-3">Action Items:</h4>
            <ul className="space-y-2">
              {intelligence.nextSteps.suggestedActions.map((action, index) => (
                <li key={index} className="flex items-start">
                  <input type="checkbox" className="mt-1 mr-3" />
                  <span className="text-sm text-gray-700">{action}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <div className="space-y-3">
              <div>
                <span className="font-medium text-gray-700">Follow-up Timeline:</span>
                <p className="text-sm text-gray-600">{intelligence.nextSteps.followUpTimeline}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Best Contact Time:</span>
                <p className="text-sm text-gray-600">{intelligence.salesStrategy.bestContactTime}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Suggested Follow-up:</span>
                <p className="text-sm text-gray-600">{intelligence.salesStrategy.suggestedFollowUp}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-700 mb-1">Notes:</h4>
          <p className="text-sm text-gray-600">{intelligence.nextSteps.notes}</p>
        </div>
      </div>

      {/* Organizational Intelligence Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">🏢 Company Intelligence & Decision Makers</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Decision Makers */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-md font-semibold text-gray-900 mb-4">👑 Key Decision Makers</h4>
            <div className="space-y-3">
              {intelligence.organizationalIntelligence.decisionMakers.map((exec, index) => (
                <div key={index} className="bg-white p-3 rounded-lg border-l-4 border-blue-500">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h5 className="font-semibold text-gray-900 text-sm">{exec.name}</h5>
                      <p className="text-xs text-gray-600">{exec.title}</p>
                    </div>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      Priority: {exec.contactPriority}/10
                    </span>
                  </div>
                  <p className="text-xs text-gray-700 mb-2">{exec.backgroundSummary}</p>
                  <a 
                    href={exec.linkedinProfile} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                  >
                    🔗 LinkedIn Research
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Key Influencers */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-md font-semibold text-gray-900 mb-4">🌟 Key Influencers</h4>
            <div className="space-y-3">
              {intelligence.organizationalIntelligence.keyInfluencers.map((exec, index) => (
                <div key={index} className="bg-white p-3 rounded-lg border-l-4 border-green-500">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h5 className="font-semibold text-gray-900 text-sm">{exec.name}</h5>
                      <p className="text-xs text-gray-600">{exec.title}</p>
                    </div>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      {exec.influenceLevel} Influence
                    </span>
                  </div>
                  <p className="text-xs text-gray-700 mb-2">{exec.backgroundSummary}</p>
                  <a 
                    href={exec.linkedinProfile} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                  >
                    🔗 LinkedIn Research
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Department Heads */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-md font-semibold text-gray-900 mb-4">🏛️ Department Heads</h4>
            <div className="space-y-2">
              {intelligence.organizationalIntelligence.departmentHeads.slice(0, 4).map((exec, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-white rounded-lg">
                  <div>
                    <h5 className="font-medium text-gray-900 text-sm">{exec.name}</h5>
                    <p className="text-xs text-gray-600">{exec.title}</p>
                  </div>
                  <a 
                    href={exec.linkedinProfile} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-xs"
                  >
                    LinkedIn →
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Buying Committee */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-md font-semibold text-gray-900 mb-4">💼 Buying Committee</h4>
            <div className="space-y-2">
              {intelligence.organizationalIntelligence.buyingCommittee.map((member, index) => (
                <div key={index} className="p-2 bg-white border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-start mb-1">
                    <h5 className="font-medium text-gray-900 text-sm">{member.role}</h5>
                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                      {member.influence}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600">
                    <span className="font-medium">Key Concerns:</span>
                    <span className="ml-1">{member.concerns.slice(0, 2).join(', ')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Organizational Structure */}
        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <h4 className="text-md font-semibold text-gray-900 mb-4">🏗️ Organizational Structure</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {intelligence.organizationalIntelligence.organizationalStructure.map((dept, index) => (
              <div key={index} className="p-3 bg-white border border-gray-200 rounded-lg">
                <h5 className="font-semibold text-gray-900 mb-2 text-sm">{dept.department}</h5>
                <div className="space-y-1 text-xs">
                  <div>
                    <span className="text-gray-600">Team Size:</span>
                    <span className="ml-2 font-medium">{dept.headCount} people</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Budget Authority:</span>
                    <span className="ml-2 font-medium">{dept.budgetAuthority.split(' - ')[0]}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 block mb-1">Key Roles:</span>
                    <div className="flex flex-wrap gap-1">
                      {dept.keyRoles.slice(0, 2).map((role, idx) => (
                        <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-1 py-0.5 rounded">
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Export Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📤 Export & Actions</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => {
              const exportData = {
                contactInfo: businessCardData || {},
                salesIntelligence: intelligence,
                exportDate: new Date().toISOString(),
                exportType: 'Sales Intelligence Report'
              };
              const dataStr = JSON.stringify(exportData, null, 2);
              const dataBlob = new Blob([dataStr], { type: 'application/json' });
              const url = URL.createObjectURL(dataBlob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `sales-intelligence-${businessCardData?.name?.replace(/\s+/g, '-') || 'demo'}.json`;
              link.click();
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            Export JSON
          </button>
          
          <button
            onClick={() => {
              const csvContent = [
                'Field,Value',
                '=== CONTACT INFORMATION ===,',
                `Name,${businessCardData?.name || 'N/A'}`,
                `Title,${businessCardData?.title || 'N/A'}`,
                `Company,${businessCardData?.company || 'N/A'}`,
                `Email,${businessCardData?.email || 'N/A'}`,
                `Phone,${businessCardData?.phone || 'N/A'}`,
                `Website,${businessCardData?.website || 'N/A'}`,
                `Address,${businessCardData?.address || 'N/A'}`,
                `LinkedIn,${businessCardData?.linkedinProfile || 'N/A'}`,
                '',
                '=== SALES INTELLIGENCE ===,',
                `Lead Score,${intelligence.leadScore}`,
                `Lead Quality,${intelligence.leadQuality}`,
                `Decision Power,${intelligence.decisionMakingPower}`,
                `Seniority,${intelligence.contactProfile.seniority}`,
                `Department,${intelligence.contactProfile.department}`,
                `Influence,${intelligence.contactProfile.influence}`,
                `Budget Authority,${intelligence.contactProfile.likelyBudgetAuthority ? 'Yes' : 'No'}`,
                '',
                '=== COMPANY PROFILE ===,',
                `Company Size,${intelligence.companyProfile.size}`,
                `Industry,${intelligence.companyProfile.industry}`,
                `Estimated Revenue,${intelligence.companyProfile.estimatedRevenue}`,
                `Employee Count,${intelligence.companyProfile.employeeCount}`,
                `Growth Stage,${intelligence.companyProfile.growthStage}`,
                `Founded,${intelligence.companyProfile.foundedYear}`,
                `Headquarters,${intelligence.companyProfile.headquarters}`,
                `Business Model,${intelligence.companyProfile.businessModel}`,
                `Market Position,${intelligence.companyProfile.marketPosition}`,
                '',
                '=== STRATEGIC INFORMATION ===,',
                `Mission Statement,"${intelligence.companyProfile.missionStatement}"`,
                `Vision Statement,"${intelligence.companyProfile.visionStatement}"`,
                `Core Values,"${intelligence.companyProfile.coreValues.join('; ')}"`,
                `Strategic Priorities,"${intelligence.companyProfile.strategicPriorities.join('; ')}"`,
                `Target Markets,"${intelligence.companyProfile.targetMarkets.join('; ')}"`,
                `Key Partners,"${intelligence.companyProfile.keyPartners.join('; ')}"`,
                `Competitive Advantages,"${intelligence.companyProfile.competitiveAdvantages.join('; ')}"`,
                `Key Technologies,"${intelligence.companyProfile.keyTechnologies.join('; ')}"`,
                '',
                '=== NEXT STEPS ===,',
                `Priority,${intelligence.nextSteps.priority}`,
                `Follow-up Timeline,${intelligence.nextSteps.followUpTimeline}`,
                `Best Contact Time,${intelligence.salesStrategy.bestContactTime}`,
                `Suggested Follow-up,${intelligence.salesStrategy.suggestedFollowUp}`,
                '',
                '=== SALES STRATEGY ===,',
                `Approach,"${intelligence.salesStrategy.approachRecommendation}"`,
                `Key Talking Points,"${intelligence.salesStrategy.keyTalkingPoints.join('; ')}"`,
                `Potential Pain Points,"${intelligence.salesStrategy.potentialPainPoints.join('; ')}"`,
                '',
                '=== DECISION MAKERS ===,',
                ...intelligence.organizationalIntelligence.decisionMakers.map(exec => 
                  `${exec.name} (${exec.title}),Priority: ${exec.contactPriority}/10 - ${exec.linkedinProfile}`
                ),
                '',
                '=== KEY INFLUENCERS ===,',
                ...intelligence.organizationalIntelligence.keyInfluencers.map(exec => 
                  `${exec.name} (${exec.title}),${exec.influenceLevel} Influence - ${exec.linkedinProfile}`
                ),
                '',
                '=== ORGANIZATIONAL STRUCTURE ===,',
                ...intelligence.organizationalIntelligence.organizationalStructure.map(dept => 
                  `${dept.department},${dept.headCount} people - ${dept.budgetAuthority}`
                ),
                '',
                `Export Date,${new Date().toISOString()}`
              ].join('\n');
              
              const dataBlob = new Blob([csvContent], { type: 'text/csv' });
              const url = URL.createObjectURL(dataBlob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `sales-intelligence-${businessCardData?.name?.replace(/\s+/g, '-') || 'demo'}.csv`;
              link.click();
            }}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
          >
            Export CSV
          </button>
          
          <button
            onClick={generateIntelligence}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm"
          >
            Refresh Analysis
          </button>
        </div>
      </div>
    </div>
  );
}; 