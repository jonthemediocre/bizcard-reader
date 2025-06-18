/**
 * Advanced CRM Intelligence Meta-Prompt System
 * Transforms basic contact information into strategic relationship intelligence
 */

import { BusinessCardData } from '../types/ocr';

// Simplified, practical CRM intelligence focused on sales needs
export interface SalesIntelligence {
  // Lead Qualification (Top Priority for Sales)
  leadScore: number; // 1-100
  leadQuality: 'Hot' | 'Warm' | 'Cold';
  decisionMakingPower: 'High' | 'Medium' | 'Low';
  
  // Company Intelligence (Essential for Sales Context)
  companyProfile: {
    size: string;
    industry: string;
    estimatedRevenue: string;
    employeeCount: string;
    growthStage: string;
  };
  
  // Contact Intelligence (What Sales Pros Need to Know)
  contactProfile: {
    seniority: 'C-Level' | 'VP-Level' | 'Director' | 'Manager' | 'Individual Contributor';
    department: string;
    influence: 'High' | 'Medium' | 'Low';
    likelyBudgetAuthority: boolean;
  };
  
  // Sales Strategy (Actionable Insights)
  salesStrategy: {
    approachRecommendation: string;
    keyTalkingPoints: string[];
    potentialPainPoints: string[];
    suggestedFollowUp: string;
    bestContactTime: string;
  };
  
  // Social Intelligence (Modern Sales Research)
  socialIntelligence: {
    linkedinProfile?: string;
    recentActivity?: string[];
    mutualConnections?: string[];
    professionalInterests?: string[];
  };
  
  // Next Steps (Practical Actions)
  nextSteps: {
    priority: 'High' | 'Medium' | 'Low';
    suggestedActions: string[];
    followUpTimeline: string;
    notes: string;
  };
}

export class PracticalCRMEngine {
  
  async generateSalesIntelligence(data: BusinessCardData): Promise<SalesIntelligence> {
    console.log('🎯 Generating practical sales intelligence for:', data.name);
    
    const leadScore = this.calculateLeadScore(data);
    const companyProfile = this.analyzeCompany(data);
    const contactProfile = this.analyzeContact(data);
    const salesStrategy = this.generateSalesStrategy(data, contactProfile);
    const socialIntelligence = await this.gatherSocialIntelligence(data);
    const nextSteps = this.generateNextSteps(data, leadScore, contactProfile);
    
    return {
      leadScore,
      leadQuality: this.determineLeadQuality(leadScore),
      decisionMakingPower: contactProfile.influence,
      companyProfile,
      contactProfile,
      salesStrategy,
      socialIntelligence,
      nextSteps
    };
  }
  
  private calculateLeadScore(data: BusinessCardData): number {
    let score = 50; // Base score
    
    // Title-based scoring (Decision making authority)
    const title = data.title.toLowerCase();
    if (title.includes('ceo') || title.includes('founder') || title.includes('president')) {
      score += 30;
    } else if (title.includes('cto') || title.includes('cfo') || title.includes('coo')) {
      score += 25;
    } else if (title.includes('vp') || title.includes('vice president')) {
      score += 20;
    } else if (title.includes('director')) {
      score += 15;
    } else if (title.includes('manager')) {
      score += 10;
    }
    
    // Company size scoring
    const company = data.company.toLowerCase();
    if (company.includes('corp') || company.includes('global') || company.includes('international')) {
      score += 15;
    }
    
    // Contact completeness scoring
    if (data.email) score += 5;
    if (data.phone) score += 5;
    if (data.website) score += 5;
    
    return Math.min(100, Math.max(1, score));
  }
  
  private determineLeadQuality(score: number): 'Hot' | 'Warm' | 'Cold' {
    if (score >= 80) return 'Hot';
    if (score >= 60) return 'Warm';
    return 'Cold';
  }
  
  private analyzeCompany(data: BusinessCardData) {
    const company = data.company.toLowerCase();
    
    // Determine company size
    let size = 'SMB';
    let employeeCount = '10-50';
    let estimatedRevenue = '$1M-$10M';
    
    if (company.includes('global') || company.includes('international') || company.includes('corp')) {
      size = 'Enterprise';
      employeeCount = '1000+';
      estimatedRevenue = '$100M+';
    } else if (company.includes('inc') || company.includes('llc') || company.includes('ltd')) {
      size = 'Mid-Market';
      employeeCount = '50-500';
      estimatedRevenue = '$10M-$100M';
    }
    
    // Determine industry
    let industry = 'General Business';
    if (company.includes('tech') || company.includes('software') || company.includes('ai')) {
      industry = 'Technology';
    } else if (company.includes('financial') || company.includes('bank') || company.includes('capital')) {
      industry = 'Financial Services';
    } else if (company.includes('health') || company.includes('medical') || company.includes('pharma')) {
      industry = 'Healthcare';
    } else if (company.includes('consulting') || company.includes('advisory')) {
      industry = 'Professional Services';
    }
    
    return {
      size,
      industry,
      estimatedRevenue,
      employeeCount,
      growthStage: size === 'Enterprise' ? 'Mature' : 'Growth'
    };
  }
  
  private analyzeContact(data: BusinessCardData) {
    const title = data.title.toLowerCase();
    
    // Determine seniority
    let seniority: 'C-Level' | 'VP-Level' | 'Director' | 'Manager' | 'Individual Contributor';
    let influence: 'High' | 'Medium' | 'Low';
    let likelyBudgetAuthority = false;
    
    if (title.includes('ceo') || title.includes('cto') || title.includes('cfo') || 
        title.includes('founder') || title.includes('president')) {
      seniority = 'C-Level';
      influence = 'High';
      likelyBudgetAuthority = true;
    } else if (title.includes('vp') || title.includes('vice president')) {
      seniority = 'VP-Level';
      influence = 'High';
      likelyBudgetAuthority = true;
    } else if (title.includes('director')) {
      seniority = 'Director';
      influence = 'Medium';
      likelyBudgetAuthority = true;
    } else if (title.includes('manager')) {
      seniority = 'Manager';
      influence = 'Medium';
      likelyBudgetAuthority = false;
    } else {
      seniority = 'Individual Contributor';
      influence = 'Low';
      likelyBudgetAuthority = false;
    }
    
    // Determine department
    let department = 'General';
    if (title.includes('engineer') || title.includes('developer') || title.includes('tech')) {
      department = 'Engineering';
    } else if (title.includes('sales') || title.includes('business development')) {
      department = 'Sales';
    } else if (title.includes('marketing')) {
      department = 'Marketing';
    } else if (title.includes('finance') || title.includes('accounting')) {
      department = 'Finance';
    } else if (title.includes('hr') || title.includes('people')) {
      department = 'Human Resources';
    } else if (title.includes('operations') || title.includes('ops')) {
      department = 'Operations';
    }
    
    return {
      seniority,
      department,
      influence,
      likelyBudgetAuthority
    };
  }
  
  private generateSalesStrategy(data: BusinessCardData, contactProfile: any) {
    const strategies = {
      'C-Level': {
        approach: 'Executive-level strategic discussion focusing on business outcomes and ROI',
        talkingPoints: ['Strategic business impact', 'Competitive advantage', 'Long-term ROI', 'Industry trends'],
        painPoints: ['Market competition', 'Growth challenges', 'Operational efficiency', 'Digital transformation']
      },
      'VP-Level': {
        approach: 'Department-focused value proposition with clear metrics and outcomes',
        talkingPoints: ['Department efficiency', 'Team productivity', 'Budget optimization', 'Performance metrics'],
        painPoints: ['Resource constraints', 'Team scalability', 'Process optimization', 'Technology gaps']
      },
      'Director': {
        approach: 'Tactical implementation discussion with specific use cases and benefits',
        talkingPoints: ['Implementation ease', 'Team adoption', 'Quick wins', 'Process improvement'],
        painPoints: ['Daily operational challenges', 'Tool integration', 'Team efficiency', 'Reporting needs']
      },
      'Manager': {
        approach: 'Hands-on demonstration focusing on day-to-day benefits and ease of use',
        talkingPoints: ['User experience', 'Time savings', 'Simplified workflows', 'Team collaboration'],
        painPoints: ['Manual processes', 'Time management', 'Team coordination', 'Reporting overhead']
      },
      'Individual Contributor': {
        approach: 'Feature-focused discussion highlighting personal productivity gains',
        talkingPoints: ['Personal productivity', 'Ease of use', 'Time savings', 'Skill development'],
        painPoints: ['Repetitive tasks', 'Tool complexity', 'Information access', 'Workflow efficiency']
      }
    };
    
    const strategy = strategies[contactProfile.seniority] || strategies['Individual Contributor'];
    
    return {
      approachRecommendation: strategy.approach,
      keyTalkingPoints: strategy.talkingPoints,
      potentialPainPoints: strategy.painPoints,
      suggestedFollowUp: contactProfile.influence === 'High' ? 
        'Schedule executive briefing within 1 week' : 
        'Send relevant case study and schedule demo',
      bestContactTime: contactProfile.seniority === 'C-Level' ? 
        'Early morning or late afternoon' : 
        'Mid-morning or early afternoon'
    };
  }
  
  private async gatherSocialIntelligence(data: BusinessCardData) {
    // In a real implementation, this would integrate with LinkedIn API, social media APIs
    const linkedinProfile = this.generateLinkedInURL(data.name, data.company);
    
    return {
      linkedinProfile,
      recentActivity: [
        'Check LinkedIn for recent posts and activity',
        'Look for mutual connections',
        'Review company updates and news'
      ],
      mutualConnections: ['Use LinkedIn to find mutual connections'],
      professionalInterests: ['Research based on LinkedIn activity and posts']
    };
  }
  
  private generateLinkedInURL(name: string, company: string): string {
    const searchName = name.replace(/\s+/g, '%20');
    const searchCompany = company.replace(/\s+/g, '%20');
    return `https://www.linkedin.com/search/results/people/?keywords=${searchName}%20${searchCompany}`;
  }
  
  private generateNextSteps(data: BusinessCardData, leadScore: number, contactProfile: any) {
    const priority: 'High' | 'Medium' | 'Low' = leadScore >= 80 ? 'High' : leadScore >= 60 ? 'Medium' : 'Low';
    
    const actions = [];
    if (contactProfile.influence === 'High') {
      actions.push('Research company recent news and challenges');
      actions.push('Find mutual connections on LinkedIn');
      actions.push('Prepare executive-level value proposition');
    } else {
      actions.push('Send connection request on LinkedIn');
      actions.push('Share relevant case study or resource');
      actions.push('Schedule informal discovery call');
    }
    
    return {
      priority,
      suggestedActions: actions,
      followUpTimeline: priority === 'High' ? 'Within 24 hours' : 
                       priority === 'Medium' ? 'Within 3 days' : 'Within 1 week',
      notes: `${data.name} from ${data.company} - ${contactProfile.seniority} level contact with ${contactProfile.influence.toLowerCase()} influence`
    };
  }
}

// Demo function for testing
export function generateDemoSalesIntelligence(): SalesIntelligence {
  return {
    leadScore: 85,
    leadQuality: 'Hot',
    decisionMakingPower: 'High',
    companyProfile: {
      size: 'Enterprise',
      industry: 'Financial Services',
      estimatedRevenue: '$500M+',
      employeeCount: '2000+',
      growthStage: 'Mature'
    },
    contactProfile: {
      seniority: 'C-Level',
      department: 'Finance',
      influence: 'High',
      likelyBudgetAuthority: true
    },
    salesStrategy: {
      approachRecommendation: 'Executive-level strategic discussion focusing on business outcomes and ROI',
      keyTalkingPoints: ['Strategic business impact', 'Competitive advantage', 'Long-term ROI', 'Industry trends'],
      potentialPainPoints: ['Market competition', 'Growth challenges', 'Operational efficiency', 'Digital transformation'],
      suggestedFollowUp: 'Schedule executive briefing within 1 week',
      bestContactTime: 'Early morning or late afternoon'
    },
    socialIntelligence: {
      linkedinProfile: 'https://www.linkedin.com/search/results/people/?keywords=Alex%20Rodriguez%20Global%20Financial%20Corp',
      recentActivity: ['Check LinkedIn for recent posts and activity', 'Look for mutual connections'],
      mutualConnections: ['Use LinkedIn to find mutual connections'],
      professionalInterests: ['Research based on LinkedIn activity and posts']
    },
    nextSteps: {
      priority: 'High',
      suggestedActions: [
        'Research company recent news and challenges',
        'Find mutual connections on LinkedIn',
        'Prepare executive-level value proposition'
      ],
      followUpTimeline: 'Within 24 hours',
      notes: 'Alex Rodriguez from Global Financial Corp - C-Level contact with high influence'
    }
  };
}

export const generateCRMIntelligence = async (data: any) => {
  const engine = new PracticalCRMEngine();
  return await engine.generateSalesIntelligence(data);
};