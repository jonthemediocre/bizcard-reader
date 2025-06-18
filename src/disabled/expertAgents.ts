import type { BusinessCard, APIResponse } from '../types/business-card';
import { logger } from './logger';
import axios from 'axios';

let apiKey = '';

export const setExpertAPIKey = (key: string) => {
  apiKey = key;
};

const extractBusinessCard = async (text: string): Promise<BusinessCard> => {
  if (!apiKey) {
    throw new Error('API key not configured');
  }

  try {
    // Initial text cleanup and normalization with enhanced preprocessing
    const cleanedText = text
      .replace(/\s+/g, ' ')
      .replace(/[^\x20-\x7E\n]/g, '') // Remove non-printable characters
      .replace(/[|•·]/g, ' ') // Replace common business card separators
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)
      .join('\n')
      .trim();

    if (!cleanedText) {
      throw new Error('No readable text found in the image. Please ensure the image is clear and contains text.');
    }

    if (cleanedText.length < 10) {
      throw new Error('Insufficient text detected. Please ensure the business card is clearly visible and properly lit.');
    }

    logger.info('Processing text', { 
      originalLength: text.length, 
      cleanedLength: cleanedText.length,
      textSample: cleanedText.substring(0, 100), // Log first 100 chars for debugging
      lineCount: cleanedText.split('\n').length
    });

    // Enhanced name detection patterns with comprehensive coverage
    const namePatterns = [
      // Professional titles with names
      /(?:Mr\.|Mrs\.|Ms\.|Dr\.|Prof\.|Eng\.|Atty\.|Rev\.|Sir|Madam)\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+/g,
      
      // Standard name formats (2-4 parts)
      /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3}\b/g,
      
      // Names with credentials
      /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+(?:\s*,\s*(?:PhD|MD|MBA|CPA|PE|FACS|ESQ)\.?)?/g,
      
      // Names with middle initials
      /\b[A-Z][a-z]+\s+(?:[A-Z]\.?\s+)?[A-Z][a-z]+\b/g,
      
      // International name formats
      {
        // European names with particles
        pattern: /\b[A-Z][a-z]+\s+(?:van|von|de|di|el|al|bin|da|dos|das|del|della|den|der|le|la|du|des|zur|zum|af|av)\s+[A-Z][a-z]+\b/gi,
        weight: 1.2
      },
      
      // Asian name formats
      {
        pattern: /\b[A-Z][A-Z\s]{1,20}\b/g, // All caps format
        weight: 0.8
      },
      {
        pattern: /\b[A-Z][a-z]+\s+[A-Z]{2,}(?:\s+[A-Z][a-z]+)?\b/g, // Mixed format
        weight: 0.9
      },
      
      // Middle Eastern names
      {
        pattern: /\b[A-Z][a-z]+\s+(?:ibn|bin|ben|bar|bat)\s+[A-Z][a-z]+\b/gi,
        weight: 1.1
      },
      
      // Hyphenated names
      {
        pattern: /\b[A-Z][a-z]+(?:-[A-Z][a-z]+)+\b/g,
        weight: 1.1
      },
      
      // Names with apostrophes
      {
        pattern: /\b[A-Z][a-z]+(?:'[A-Z][a-z]+)?(?:\s+[A-Z][a-z]+)+\b/g,
        weight: 1.0
      }
    ];

    // Extract names using weighted scoring system
    const nameScores = new Map<string, number>();
    const nameContexts = new Map<string, string>();
    
    // First pass: Extract names and gather context
    cleanedText.split('\n').forEach((line, lineIndex, lines) => {
      namePatterns.forEach((patternObj) => {
        const { pattern, weight = 1.0 } = typeof patternObj === 'object' ? patternObj : { pattern: patternObj };
        const matches = [...line.matchAll(pattern)];
        
        matches.forEach(match => {
          const name = match[0].trim();
          
          // Calculate position score (names at top of card score higher)
          const positionScore = Math.max(0.5, 1 - (lineIndex / lines.length));
          
          // Calculate context score
          const contextScore = calculateContextScore(line, lines[lineIndex - 1], lines[lineIndex + 1]);
          
          // Calculate format score
          const formatScore = calculateFormatScore(name);
          
          // Final weighted score
          const score = (weight * (positionScore + contextScore + formatScore)) / 3;
          
          // Store name with its context
          const context = getNameContext(line, lines[lineIndex - 1], lines[lineIndex + 1]);
          nameContexts.set(name, context);
          
          // Update score if higher than existing
          nameScores.set(name, Math.max(nameScores.get(name) || 0, score));
        });
      });
    });

    // Filter and rank names
    const rankedNames = [...nameScores.entries()]
      .filter(([name]) => {
        const lowerName = name.toLowerCase();
        const context = nameContexts.get(name)?.toLowerCase() || '';
        
        return (
          name.length > 4 && // Minimum length
          !isCommonFalsePositive(lowerName) &&
          !containsBusinessTerms(lowerName) &&
          !containsLocationTerms(lowerName) &&
          isLikelyPersonName(name, context)
        );
      })
      .sort((a, b) => b[1] - a[1]) // Sort by score descending
      .map(([name]) => name);

    // Generic pattern matching for other business card elements
    const patterns = {
      phone: /(?:[\+]?\d{1,}[\s./\\-]*)?(?:[\(]?\d{3}[\)]?[\s./\\-]*)?\d{3}[\s./\\-]*\d{4}/g,
      email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
      website: /(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+(?:\.[a-zA-Z]{2,})+/g,
      address: /\b\d+\s+[A-Za-z\s,]+(Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Circle|Cir|Trail|Tr|Way|Place|Pl|Suite|Ste|Unit|#)\b[^]*?\b[A-Z]{2}\s+\d{5}\b/gi,
      title: /\b(?:Owner|Proprietor|Manager|CEO|President|Director|Store\s+Manager|Store\s+Owner|Founder|Partner|Executive|Vice\s+President|VP|Chief|Head|Lead|Principal|Supervisor|Coordinator|Specialist|Consultant|Analyst|Engineer|Designer|Developer|Architect|Administrator|Representative)\b/gi,
      company: /\b[A-Z][A-Za-z0-9']+(?:\s+[A-Z][A-Za-z0-9']+)*(?:\s+(?:Inc|LLC|Ltd|Corp|Corporation|Company|Co|Group|International|Enterprises|Solutions|Technologies|Tech|Services|Systems))?\b/g,
      industry: /\b(?:Retail|Store|Shop|Boutique|Market|Outlet|Trading|Sales|Commerce|Merchant|Manufacturing|Technology|Software|Consulting|Services|Healthcare|Financial|Education|Construction|Real Estate|Marketing|Design|Engineering)\b/gi,
      department: /\b(?:Sales|Marketing|Engineering|Development|Support|Customer Service|Operations|Finance|HR|Research|Design|Production|Quality|Legal)\b/gi
    };

    // Extract patterns from raw text
    const extractedData = {
      phones: [...new Set([...cleanedText.matchAll(patterns.phone)].map(m => m[0]))],
      emails: [...new Set([...cleanedText.matchAll(patterns.email)].map(m => m[0]))],
      websites: [...new Set([...cleanedText.matchAll(patterns.website)].map(m => m[0]))],
      addresses: [...new Set([...cleanedText.matchAll(patterns.address)].map(m => m[0]))],
      titles: [...new Set([...cleanedText.matchAll(patterns.title)].map(m => m[0]))],
      companies: [...new Set([...cleanedText.matchAll(patterns.company)].map(m => m[0]))],
      industries: [...new Set([...cleanedText.matchAll(patterns.industry)].map(m => m[0]))],
      departments: [...new Set([...cleanedText.matchAll(patterns.department)].map(m => m[0]))]
    };

    logger.info('Pattern matches found', {
      namesFound: rankedNames.length,
      phones: extractedData.phones.length,
      emails: extractedData.emails.length,
      websites: extractedData.websites.length,
      addresses: extractedData.addresses.length,
      titles: extractedData.titles.length,
      companies: extractedData.companies.length
    });

    // First pass: Extract with high recall
    const initialResponse = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are a business card information extractor. Analyze this text from a business card OCR:

${cleanedText}

Additional context - these patterns were found:
Names Found: ${rankedNames.join(', ')}
Titles: ${extractedData.titles.join(', ')}
Companies: ${extractedData.companies.join(', ')}
Phones: ${extractedData.phones.join(', ')}
Emails: ${extractedData.emails.join(', ')}
Websites: ${extractedData.websites.join(', ')}
Addresses: ${extractedData.addresses.join(', ')}
Industries: ${extractedData.industries.join(', ')}
Departments: ${extractedData.departments.join(', ')}

Extract ALL possible information, even if uncertain. Format as JSON with confidence scores (0-1).

Special Instructions:
1. Company Names:
   - Look for distinctive fonts/positioning
   - Check for business suffixes (Inc, LLC)
   - Consider text near logos/slogans
   - Default to most prominent business name
   - Use pattern matches if available

2. Person Names:
   - Use provided names if available
   - Look for text in larger fonts
   - Check for name patterns
   - Consider text near titles
   - Default to name with contact info
   - Consider compound names and international formats

3. Job Titles:
   - Look for text near names
   - Consider professional hierarchies
   - Include role descriptions
   - Default to business owner if unclear
   - Use pattern matches if available

4. Contact Info:
   - Use extracted pattern matches
   - Validate against raw text
   - Format consistently
   - Preserve international formats

Return complete JSON with all possible fields and confidence scores.`
          }
        ],
        temperature: 0.3,
        response_format: { type: "json_object" },
        max_tokens: 1500
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Second pass: Validate and enhance with context
    const validationResponse = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are a business card data validator. Review this extracted data and the original text:

Extracted Data:
${initialResponse.data.choices[0].message.content}

Original Text:
${cleanedText}

Pattern Matches Found:
Names Found: ${rankedNames.join(', ')}
Titles: ${extractedData.titles.join(', ')}
Companies: ${extractedData.companies.join(', ')}
Phones: ${extractedData.phones.join(', ')}
Emails: ${extractedData.emails.join(', ')}
Websites: ${extractedData.websites.join(', ')}
Addresses: ${extractedData.addresses.join(', ')}
Industries: ${extractedData.industries.join(', ')}
Departments: ${extractedData.departments.join(', ')}

Rules:
1. Required Fields:
   - Company Name: Must identify business entity
   - Person Name: Must be proper name (use pattern-matched name if available)
   - Job Title: Must indicate role
   - Phones: Must be valid numbers
   - Email: Must be valid format

2. Name Validation:
   - Use pattern-matched names if available
   - Check for full names
   - Consider context with company name
   - Validate against known patterns
   - Use most complete form available
   - Consider text positioning and formatting
   - Handle international name formats

3. Job Title Inference:
   - Consider business type and context
   - Default to most senior title if multiple found
   - Use "Business Owner" if no other title fits
   - Look for industry-specific roles
   - Consider company structure

4. Validation:
   - Clean and standardize formats
   - Remove duplicates
   - Verify field relationships
   - Apply business logic
   - Use pattern matches for validation

Return clean, validated JSON with high confidence fields.`
          }
        ],
        temperature: 0.1,
        response_format: { type: "json_object" },
        max_tokens: 1000
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const parsedResponse = JSON.parse(validationResponse.data.choices[0].message.content);

    // Enhanced validation with multiple attempts
    const requiredFields = ['companyName', 'personName', 'jobTitle'] as const;
    let attempts = 0;
    const MAX_ATTEMPTS = 3;

    while (attempts < MAX_ATTEMPTS) {
      const missingFields = requiredFields.filter(field => {
        const value = parsedResponse[field];
        return !value || String(value).trim().length === 0;
      });

      if (missingFields.length === 0) break;

      logger.info(`Attempt ${attempts + 1}: Recovering missing fields`, { 
        missingFields,
        availableNames: rankedNames.length,
        topNames: rankedNames.slice(0, 3),
        nameContexts: Object.fromEntries([...nameContexts.entries()].slice(0, 3))
      });

      // Recovery strategy based on attempt number
      for (const field of missingFields) {
        switch (field) {
          case 'personName':
            if (rankedNames.length > attempts) {
              const selectedName = rankedNames[attempts];
              const context = nameContexts.get(selectedName);
              parsedResponse.personName = selectedName;
              logger.info('Recovered person name', {
                name: selectedName,
                context,
                attempt: attempts + 1,
                score: nameScores.get(selectedName)
              });
            } else if (attempts === MAX_ATTEMPTS - 1) {
              // Last resort strategies
              const recoveredName = await recoverNameFromAlternativeSources(
                extractedData,
                cleanedText
              );
              if (recoveredName) {
                parsedResponse.personName = recoveredName;
              }
            }
            break;

          case 'companyName':
            if (extractedData.companies.length > attempts) {
              parsedResponse.companyName = extractedData.companies[attempts];
            } else if (attempts === MAX_ATTEMPTS - 1 && extractedData.emails.length > 0) {
              // Last resort: Try to extract company from email domain
              const domain = extractedData.emails[0].split('@')[1]?.split('.')[0];
              if (domain && domain.length > 2) {
                parsedResponse.companyName = domain.charAt(0).toUpperCase() + domain.slice(1);
              }
            }
            break;

          case 'jobTitle':
            if (extractedData.titles.length > attempts) {
              parsedResponse.jobTitle = extractedData.titles[attempts];
            } else if (attempts === MAX_ATTEMPTS - 1) {
              parsedResponse.jobTitle = 'Professional'; // Generic fallback
            }
            break;
        }
      }

      attempts++;
    }

    // Final validation after all attempts
    const finalMissingFields = requiredFields.filter(field => {
      const value = parsedResponse[field];
      return !value || String(value).trim().length === 0;
    });

    if (finalMissingFields.length > 0) {
      logger.error('Required fields still missing after recovery attempts', {
        missingFields: finalMissingFields,
        attempts,
        textLength: cleanedText.length
      });
      throw new Error(`Unable to extract required information: ${finalMissingFields.join(', ')}. Please ensure the business card image is clear and contains all necessary information.`);
    }

    // Build final card object with enhanced validation
    const card: BusinessCard = {
      companyName: String(parsedResponse.companyName).trim(),
      personName: String(parsedResponse.personName).trim(),
      jobTitle: String(parsedResponse.jobTitle).trim(),
      email: String(parsedResponse.email || extractedData.emails[0] || '').toLowerCase().trim(),
      phones: Array.from(new Set([
        ...(Array.isArray(parsedResponse.phones) ? parsedResponse.phones : []),
        ...extractedData.phones
      ]))
        .filter(Boolean)
        .map(p => String(p).trim())
        .filter(p => /[\d\+\-\(\)\s\.]+/.test(p)),
      website: parsedResponse.website || extractedData.websites[0] || undefined,
      address: parsedResponse.address || extractedData.addresses[0] || undefined,
      department: parsedResponse.department || undefined,
      directLine: parsedResponse.directLine || undefined,
      mobilePhone: parsedResponse.mobilePhone || undefined,
      faxNumber: parsedResponse.faxNumber || undefined,
      socialMedia: parsedResponse.socialMedia || undefined,
      officeLocation: parsedResponse.officeLocation || undefined,
      alternateEmail: String(parsedResponse.alternateEmail || extractedData.emails[1] || '').toLowerCase().trim() || undefined,
      languages: parsedResponse.languages || undefined,
      qualifications: parsedResponse.qualifications || undefined,
      specialties: parsedResponse.specialties || undefined
    };

    // Final quality check
    const qualityIssues = requiredFields.filter(field => {
      const value = card[field];
      return !value || String(value).trim().length < 3; // Ensure minimum meaningful length
    });

    if (qualityIssues.length > 0) {
      logger.error('Quality issues detected in extracted data', {
        qualityIssues,
        cardData: {
          companyName: card.companyName,
          personName: card.personName,
          jobTitle: card.jobTitle
        }
      });
      throw new Error('The extracted information appears to be incomplete or of low quality. Please try with a clearer image.');
    }

    logger.info('Successfully extracted business card data', {
      hasCompany: Boolean(card.companyName),
      hasPerson: Boolean(card.personName),
      hasEmail: Boolean(card.email),
      phoneCount: card.phones.length,
      additionalFieldsCount: Object.keys(card).length - requiredFields.length,
      confidence: 'high'
    });

    return card;
  } catch (error) {
    logger.error('Failed to extract business card data', {
      error,
      textLength: text?.length ?? 0,
      hasText: Boolean(text?.trim()),
      apiKeyConfigured: Boolean(apiKey)
    });

    if (error instanceof Error) {
      // Enhance error message for user-friendly feedback
      const userMessage = error.message.includes('Unable to extract') || 
                         error.message.includes('No readable text') ||
                         error.message.includes('Insufficient text') ?
        error.message :
        'Failed to process the business card. Please ensure the image is clear and try again.';
      
      throw new Error(userMessage);
    }
    throw error;
  }
};

// Helper functions for name extraction
function calculateContextScore(currentLine: string, prevLine?: string, nextLine?: string): number {
  let score = 0;
  
  // Check for job titles nearby
  const titlePattern = /(?:CEO|CTO|CFO|Director|Manager|President|Owner|Founder|Partner|Associate|Consultant|Engineer|Analyst|Specialist)/i;
  if (titlePattern.test(prevLine || '') || titlePattern.test(nextLine || '')) {
    score += 0.3;
  }
  
  // Check for professional credentials
  const credentialsPattern = /(?:PhD|MD|MBA|CPA|PE|FACS|ESQ)/i;
  if (credentialsPattern.test(currentLine)) {
    score += 0.2;
  }
  
  // Check for contact information nearby
  const contactPattern = /(?:Tel|Phone|Email|Mobile|Fax):/i;
  if (contactPattern.test(prevLine || '') || contactPattern.test(nextLine || '')) {
    score += 0.2;
  }
  
  return Math.min(score, 1);
}

function calculateFormatScore(name: string): number {
  let score = 0;
  
  // Proper capitalization
  if (/^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+$/.test(name)) {
    score += 0.4;
  }
  
  // Appropriate length (2-4 words)
  const wordCount = name.split(/\s+/).length;
  if (wordCount >= 2 && wordCount <= 4) {
    score += 0.3;
  }
  
  // No numbers or special characters
  if (!/[\d@#$%^&*()+=\[\]{};:'",.<>/?\\|]/.test(name)) {
    score += 0.3;
  }
  
  return score;
}

function getNameContext(currentLine: string, prevLine?: string, nextLine?: string): string {
  return [prevLine, currentLine, nextLine]
    .filter(Boolean)
    .join(' | ');
}

function isCommonFalsePositive(name: string): boolean {
  const falsePositives = [
    'company', 'corporation', 'inc', 'llc', 'ltd', 'website', 'email',
    'phone', 'fax', 'address', 'street', 'avenue', 'road', 'suite',
    'floor', 'building', 'plaza', 'center', 'centre', 'mall', 'office'
  ];
  return falsePositives.some(term => name.includes(term));
}

function containsBusinessTerms(name: string): boolean {
  const businessTerms = [
    'solutions', 'services', 'systems', 'technologies', 'consulting',
    'associates', 'partners', 'group', 'agency', 'enterprises'
  ];
  return businessTerms.some(term => name.includes(term));
}

function containsLocationTerms(name: string): boolean {
  const locationTerms = [
    'north', 'south', 'east', 'west', 'central', 'international',
    'global', 'worldwide', 'national', 'regional', 'local'
  ];
  return locationTerms.some(term => name.includes(term));
}

function isLikelyPersonName(name: string, context: string): boolean {
  // Check for common name indicators in context
  const nameIndicators = [
    /(?:Mr\.|Mrs\.|Ms\.|Dr\.|Prof\.)/i,
    /(?:CEO|CTO|CFO|Director|Manager|President)/i,
    /(?:Tel|Email):/i,
    /(?:PhD|MD|MBA|CPA)/i
  ];
  
  return nameIndicators.some(pattern => pattern.test(context));
}

async function recoverNameFromAlternativeSources(
  extractedData: any,
  cleanedText: string
): Promise<string | null> {
  // Try email first
  if (extractedData.emails.length > 0) {
    const emailName = extractedData.emails[0].split('@')[0]
      .replace(/[._]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
    if (emailName.length > 3 && !isCommonFalsePositive(emailName.toLowerCase())) {
      return emailName;
    }
  }
  
  // Try finding name near job title
  if (extractedData.titles.length > 0) {
    const titleIndex = cleanedText.indexOf(extractedData.titles[0]);
    if (titleIndex !== -1) {
      const surroundingText = cleanedText.slice(
        Math.max(0, titleIndex - 50),
        titleIndex + 50
      );
      
      // Look for name patterns near the title
      for (const pattern of namePatterns) {
        const { pattern: namePattern } = typeof pattern === 'object' ? pattern : { pattern };
        const match = surroundingText.match(namePattern);
        if (match && !isCommonFalsePositive(match[0].toLowerCase())) {
          return match[0];
        }
      }
    }
  }
  
  return null;
}

export const expertCoordinator = {
  analyzeBusinessCard: extractBusinessCard
};