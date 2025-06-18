import { BusinessCardData } from '../types/business-card';
export type { BusinessCardData };

export interface ExtractionResult {
  success: boolean;
  data?: BusinessCardData;
  error?: string;
  processingTime: number;
}

export async function extractBusinessCardData(_imageFile: File): Promise<ExtractionResult> {
  return {
    success: true,
    data: {
      name: "Sample Contact",
      title: "Business Development Manager",
      company: "Tech Solutions Inc",
      email: "contact@techsolutions.com",
      phone: "+1 (555) 123-4567",
      confidence: 0.95
    },
    processingTime: 500
  };
}

export function exportBusinessCard(data: BusinessCardData, format: 'json' | 'csv' | 'vcard'): string {
  switch (format) {
    case 'json':
      return JSON.stringify(data, null, 2);
    case 'csv':
      return `Name,Title,Company,Email,Phone\n"${data.name || ''}","${data.title || ''}","${data.company || ''}","${data.email || ''}","${data.phone || ''}"`;
    case 'vcard':
      return `BEGIN:VCARD\nVERSION:3.0\nFN:${data.name || ''}\nTITLE:${data.title || ''}\nORG:${data.company || ''}\nEMAIL:${data.email || ''}\nTEL:${data.phone || ''}\nEND:VCARD`;
    default:
      return JSON.stringify(data);
  }
}

export function saveBusinessCard(data: BusinessCardData): void {
  console.log('Saving business card:', data);
  localStorage.setItem(`businessCard_${Date.now()}`, JSON.stringify(data));
} 