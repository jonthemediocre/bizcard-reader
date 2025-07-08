export interface ExtractedContact {
  name?: string;
  title?: string;
  company?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  website?: string;
  address?: string;
  linkedin?: string;
  twitter?: string;
}

export interface BusinessCard {
  id: string;
  imageUri: string;
  extractedData: ExtractedContact;
  confidence: number;
  processedAt: Date;
  tenantId: string;
} 