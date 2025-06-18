import type { BusinessCard, APIResponse } from '../types/business-card';
import { BusinessCardData } from '../types/business-card';

export const generateCSV = (card: BusinessCard, additionalDetails?: APIResponse | null): string => {
  const headers = [
    'Company Name',
    'Person Name',
    'Job Title',
    'Email',
    'Phone Numbers',
    'Website',
    'Address',
    'LinkedIn',
    'Twitter',
    'Facebook',
    'Company Industry',
    'Company Size',
    'Company Revenue',
    'Founded',
    'Company Description',
    'Notes'
  ];

  // Build notes with additional information
  const notes = [];
  if (additionalDetails?.companyInfo?.description) {
    notes.push(`Company Info: ${additionalDetails.companyInfo.description}`);
  }
  if (additionalDetails?.companyDetails?.[0]?.snippet) {
    notes.push(`Additional Details: ${additionalDetails.companyDetails[0].snippet}`);
  }

  const values = [
    card.companyName,
    card.personName,
    card.jobTitle,
    card.email,
    card.phones.join('; '),
    card.website || '',
    card.address || '',
    additionalDetails?.socialProfiles?.linkedin || '',
    additionalDetails?.socialProfiles?.twitter || '',
    additionalDetails?.socialProfiles?.facebook || '',
    additionalDetails?.companyInfo?.industry || '',
    additionalDetails?.companyInfo?.employees || '',
    additionalDetails?.companyInfo?.revenue || '',
    additionalDetails?.companyInfo?.founded || '',
    additionalDetails?.companyInfo?.description || '',
    notes.join('\n')
  ].map(value => `"${value.replace(/"/g, '""')}"`);

  return `${headers.join(',')}\n${values.join(',')}`;
};

export const generateVCard = (card: BusinessCard, additionalDetails?: APIResponse | null): string => {
  const nameParts = card.personName.split(' ');
  const lastName = nameParts.pop() || '';
  const firstName = nameParts.join(' ');

  const formattedPhones = card.phones.map(phone => {
    const cleaned = phone.replace(/[^\d+]/g, '');
    return `TEL;TYPE=WORK,VOICE:${cleaned}`;
  });

  // Build notes with rich information
  const notes = [];
  if (additionalDetails?.companyInfo?.industry) {
    notes.push(`Industry: ${additionalDetails.companyInfo.industry}`);
  }
  if (additionalDetails?.companyInfo?.employees) {
    notes.push(`Company Size: ${additionalDetails.companyInfo.employees}`);
  }
  if (additionalDetails?.companyInfo?.revenue) {
    notes.push(`Revenue: ${additionalDetails.companyInfo.revenue}`);
  }
  if (additionalDetails?.companyInfo?.founded) {
    notes.push(`Founded: ${additionalDetails.companyInfo.founded}`);
  }
  if (additionalDetails?.companyInfo?.description) {
    notes.push(`Company Description: ${additionalDetails.companyInfo.description}`);
  }

  // Social media profiles
  const socialUrls = [];
  if (additionalDetails?.socialProfiles?.linkedin) {
    socialUrls.push(`URL;TYPE=WORK,PROFILE:${additionalDetails.socialProfiles.linkedin}`);
  }
  if (additionalDetails?.socialProfiles?.twitter) {
    socialUrls.push(`URL;TYPE=SOCIAL:${additionalDetails.socialProfiles.twitter}`);
  }
  if (additionalDetails?.socialProfiles?.facebook) {
    socialUrls.push(`URL;TYPE=SOCIAL:${additionalDetails.socialProfiles.facebook}`);
  }

  const vcard = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${lastName};${firstName};;;`,
    `FN:${card.personName}`,
    `ORG:${card.companyName}`,
    `TITLE:${card.jobTitle}`,
    `EMAIL;TYPE=WORK,INTERNET:${card.email}`,
    ...formattedPhones,
    card.website ? `URL;TYPE=WORK:${card.website}` : '',
    card.address ? `ADR;TYPE=WORK:;;${card.address};;;;` : '',
    ...socialUrls,
    notes.length > 0 ? `NOTE:${notes.join('\\n')}` : '',
    'END:VCARD'
  ].filter(Boolean).join('\r\n');

  return vcard;
};

export const downloadFile = (content: string, filename: string, type: string) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportToPDF = async (data: BusinessCardData): Promise<void> => {
  // Mock PDF export implementation
  const pdfContent = `
Business Card Data:
Name: ${data.name}
Title: ${data.title}
Company: ${data.company}
Email: ${data.email}
Phone: ${data.phone}
  `;
  
  const blob = new Blob([pdfContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${(data.name || 'business_card').replace(/\s+/g, '_')}_business_card.txt`;
  link.click();
  URL.revokeObjectURL(url);
};

export const exportToCSV = async (data: BusinessCardData): Promise<void> => {
  const csvContent = `Name,Title,Company,Email,Phone
"${data.name || ''}","${data.title || ''}","${data.company || ''}","${data.email || ''}","${data.phone || ''}"`;
  
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${(data.name || 'business_card').replace(/\s+/g, '_')}_business_card.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

export const exportToVCard = async (data: BusinessCardData): Promise<void> => {
  const vCardContent = `BEGIN:VCARD
VERSION:3.0
FN:${data.name || ''}
TITLE:${data.title || ''}
ORG:${data.company || ''}
EMAIL:${data.email || ''}
TEL:${data.phone || ''}
END:VCARD`;
  
  const blob = new Blob([vCardContent], { type: 'text/vcard' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${(data.name || 'business_card').replace(/\s+/g, '_')}_business_card.vcf`;
  link.click();
  URL.revokeObjectURL(url);
};