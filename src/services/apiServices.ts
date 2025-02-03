import axios from 'axios';
import type { BusinessCard, APIResponse, APIKeys } from '../types/business-card';
import { logger } from './logger';

let apiKeys: APIKeys = {
  openai: ''
};

const TIMEOUT = 60000;

export const setAPIKeys = (keys: APIKeys) => {
  // Don't validate if keys are being initialized as empty
  if (!keys.openai) {
    apiKeys = keys;
    return;
  }

  // Only validate when actually setting a non-empty key
  if (!keys.openai.startsWith('sk-') || keys.openai.length < 40) {
    const error = new Error('Invalid OpenAI API key format');
    logger.error('Invalid API key format', { keyFormat: keys.openai?.slice(0, 5) }, error);
    throw error;
  }

  apiKeys = keys;
};

export const validateAPIKeys = (): boolean => {
  // Consider keys valid if they're not set yet (initial state)
  if (!apiKeys.openai) {
    return true;
  }
  
  // Only validate non-empty keys
  const isValid = apiKeys.openai.startsWith('sk-') && apiKeys.openai.length >= 40;
  if (!isValid) {
    logger.warn('API key validation failed', { 
      hasKey: Boolean(apiKeys.openai),
      keyStartsWith: apiKeys.openai ? apiKeys.openai.slice(0, 3) : 'none'
    });
  }
  return isValid;
};

export const extractBusinessCardData = async (imageBase64: string): Promise<BusinessCard> => {
  try {
    // First call: Extract text from image
    const textResponse = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Extract all text from this business card image. Return only the extracted text, exactly as it appears on the card.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        max_tokens: 1000
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKeys.openai}`,
          'Content-Type': 'application/json'
        },
        timeout: TIMEOUT
      }
    );

    const extractedText = textResponse.data.choices[0].message.content;

    // Second call: Parse and structure the extracted text
    const parseResponse = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `Extract and structure business card information from the following text. Return a JSON object with these fields:
            {
              "personName": "Full name of the person",
              "jobTitle": "Job title/position",
              "companyName": "Company name",
              "email": "Primary email address",
              "alternateEmail": "Secondary email (if any)",
              "phones": ["Array of phone numbers"],
              "website": "Website URL",
              "address": "Physical address",
              "department": "Department name (if any)",
              "qualifications": "Professional qualifications (if any)",
              "specialties": "Areas of expertise (if any)",
              "languages": "Languages spoken (if any)"
            }
            
            Only include fields that are present in the text. Format phone numbers consistently.`
          },
          {
            role: 'user',
            content: extractedText
          }
        ],
        temperature: 0.3,
        response_format: { type: "json_object" },
        max_tokens: 1000
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKeys.openai}`,
          'Content-Type': 'application/json'
        },
        timeout: TIMEOUT
      }
    );

    const parsedCard: BusinessCard = JSON.parse(parseResponse.data.choices[0].message.content);

    // Ensure required fields are present
    if (!parsedCard.personName || !parsedCard.companyName || !parsedCard.jobTitle) {
      throw new Error('Missing required fields: personName, companyName, or jobTitle');
    }

    // Ensure phones is always an array
    if (!parsedCard.phones) {
      parsedCard.phones = [];
    }

    logger.info('Successfully extracted business card data', {
      hasName: Boolean(parsedCard.personName),
      hasCompany: Boolean(parsedCard.companyName),
      hasEmail: Boolean(parsedCard.email),
      phoneCount: parsedCard.phones.length
    });

    return parsedCard;
  } catch (error) {
    logger.error('Failed to extract business card data', {
      errorMessage: error.message,
      stack: error.stack,
      imageBase64Length: imageBase64.length
    }, error);
    throw error;
  }
};

export const fetchAdditionalDetails = async (
  companyName: string,
  personName: string
): Promise<APIResponse> => {
  try {
    // Company research
    const companyResponse = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `Research this company and provide detailed information in JSON format:

Company: ${companyName}

Include:
1. Company description
2. Industry
3. Year founded
4. Employee count
5. Annual revenue
6. Headquarters location
7. Key competitors
8. Main products/services
9. Recent developments

Format as JSON:
{
  "description": "string",
  "industry": "string",
  "founded": "string",
  "employees": "string",
  "revenue": "string",
  "headquarters": "string",
  "competitors": ["string"],
  "products": ["string"],
  "recentNews": ["string"]
}`
          }
        ],
        temperature: 0.3,
        response_format: { type: "json_object" },
        max_tokens: 1000
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKeys.openai}`,
          'Content-Type': 'application/json'
        },
        timeout: TIMEOUT
      }
    );

    const companyData = JSON.parse(companyResponse.data.choices[0].message.content);

    // Person research
    const personResponse = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `Research this person and provide information in JSON format:

Person: ${personName}
Company: ${companyName}

Include:
1. Professional background
2. Current role details
3. Notable achievements
4. Industry expertise
5. Social media presence

Format as JSON:
{
  "background": "string",
  "currentRole": "string",
  "achievements": ["string"],
  "expertise": ["string"],
  "socialProfiles": {
    "linkedin": "string or null",
    "twitter": "string or null"
  }
}`
          }
        ],
        temperature: 0.3,
        response_format: { type: "json_object" },
        max_tokens: 1000
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKeys.openai}`,
          'Content-Type': 'application/json'
        },
        timeout: TIMEOUT
      }
    );

    const personData = JSON.parse(personResponse.data.choices[0].message.content);

    return {
      companyDetails: [],
      personDetails: [],
      socialProfiles: personData.socialProfiles,
      companyInfo: {
        description: companyData.description,
        industry: companyData.industry,
        founded: companyData.founded,
        employees: companyData.employees,
        revenue: companyData.revenue,
        headquarters: companyData.headquarters,
        competitors: companyData.competitors,
        products: companyData.products,
        recentNews: companyData.recentNews
      },
      summary: {
        professional: personData.background,
        company: companyData.description,
        sources: [],
        lastUpdated: new Date().toISOString(),
        dataQuality: 'generated'
      }
    };
  } catch (error) {
    logger.error('Failed to fetch additional details', {
      companyName,
      personName
    }, error);
    throw error;
  }
};