import { BusinessCard, APIResponse } from '../types/business-card';

export async function extractBusinessCardData(_imageFile: File): Promise<BusinessCard> {
  return {
    companyName: "Sample Company",
    personName: "John Doe",
    jobTitle: "Manager",
    email: "john@sample.com",
    phones: ["+1 (555) 123-4567"],
    website: "www.sample.com"
  };
}

export async function fetchAdditionalDetails(_businessCard: BusinessCard): Promise<APIResponse> {
  return {
    companyDetails: [],
    personDetails: [],
    socialProfiles: {
      linkedin: "",
      twitter: ""
    },
    companyInfo: {
      industry: "Technology",
      employees: "50-100"
    }
  };
} 