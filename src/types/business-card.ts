export interface BusinessCard {
  companyName: string;
  personName: string;
  jobTitle: string;
  email: string;
  phones: string[];
  website?: string;
  address?: string;
  department?: string;
  directLine?: string;
  mobilePhone?: string;
  faxNumber?: string;
  socialMedia?: string;
  officeLocation?: string;
  alternateEmail?: string;
  languages?: string;
  qualifications?: string;
  specialties?: string;
}

export interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  analysis?: string;
  source?: string;
  date?: string;
  confidence?: number;
}

export interface CompanyInfo {
  founded?: string;
  employees?: string;
  revenue?: string;
  industry?: string;
  description?: string;
  headquarters?: string;
  ceo?: string;
  stockSymbol?: string;
  marketCap?: string;
  competitors?: string[];
  products?: string[];
  subsidiaries?: string[];
  partnerships?: string[];
  recentNews?: string[];
  awards?: string[];
  certifications?: string[];
  sources?: string[];
  lastUpdated?: string;
}

export interface SocialProfiles {
  linkedin?: string;
  twitter?: string;
  facebook?: string;
  instagram?: string;
  youtube?: string;
  sources?: string[];
  lastVerified?: string;
}

export interface APIResponse {
  companyDetails: SearchResult[];
  personDetails: SearchResult[];
  socialProfiles?: SocialProfiles;
  companyInfo?: CompanyInfo;
  summary?: {
    professional: string;
    company: string;
    sources: string[];
    lastUpdated: string;
    dataQuality?: string;
    unreliableFields?: string[];
  };
}

export interface APIKeys {
  openai: string;
}

export interface BusinessCardData {
  id?: string;
  name?: string;
  title?: string;
  company?: string;
  email?: string;
  phone?: string | { type?: string; value: string }[];
  website?: string;
  address?: string;
  social?: {
    linkedin?: string;
    twitter?: string;
  };
  extractedText?: string;
  rawText?: string;
  confidence?: number;
  timestamp?: string;
  department?: string;
  industry?: string;
  companySize?: string;
  socialMedia?: any;
  certifications?: string[];
  languages?: string[];
  specialties?: string[];
  companyDescription?: string;
  visualCues?: any;
}