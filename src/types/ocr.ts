/**
 * @file ocr.ts
 * @description OCR-related type definitions for business card processing
 * @version 2.3
 * @audit-note Enhanced type system for DominoAuditEngine.v2
 * @rule-source .cursor/rules/GLOBAL.md
 * @symbolic-id ocr-types-core
 */

// Core OCR Input/Output Types
export interface ImageInput {
  file: File;
  base64?: string;
  metadata: ImageMetadata;
}

export interface ImageMetadata {
  fileName: string;
  fileSize: number;
  fileType: string;
  dimensions?: {
    width: number;
    height: number;
  };
  quality?: number;
  timestamp: string;
}

export interface ProcessedImage {
  originalImage: ImageInput;
  processedBase64: string;
  transformations: ImageTransformation[];
  quality: number;
  processingTime: number;
}

export interface ImageTransformation {
  type: 'resize' | 'rotate' | 'crop' | 'enhance' | 'denoise' | 'sharpen';
  parameters: Record<string, any>;
  timestamp: string;
}

// OCR Processing Types
export interface OCRConfig {
  engine: 'tesseract' | 'openai-vision' | 'google-vision';
  language: string;
  confidence: number;
  preprocessing: PreprocessingOptions;
  postprocessing: PostprocessingOptions;
}

export interface PreprocessingOptions {
  autoRotate: boolean;
  enhanceContrast: boolean;
  removeNoise: boolean;
  sharpen: boolean;
  resize?: {
    width: number;
    height: number;
    maintainAspectRatio: boolean;
  };
}

export interface PostprocessingOptions {
  spellCheck: boolean;
  removeExtraSpaces: boolean;
  fixLineBreaks: boolean;
  validateCharacters: boolean;
}

// OCR Results
export interface ExtractedText {
  rawText: string;
  cleanedText: string;
  confidence: number;
  processingTime: number;
  engine: string;
  metadata: OCRMetadata;
  regions?: TextRegion[];
}

export interface OCRMetadata {
  imageQuality: number;
  textDensity: number;
  languageDetected: string;
  processingSteps: string[];
  warnings: string[];
  timestamp: string;
}

export interface TextRegion {
  text: string;
  confidence: number;
  boundingBox: BoundingBox;
  type: 'header' | 'body' | 'footer' | 'logo' | 'contact' | 'unknown';
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

// OCR Processing Pipeline
export interface OCRPipelineStep {
  name: string;
  description: string;
  processor: (input: any) => Promise<any>;
  config: Record<string, any>;
  enabled: boolean;
}

export interface OCRPipeline {
  steps: OCRPipelineStep[];
  config: OCRConfig;
  metadata: {
    version: string;
    created: string;
    lastModified: string;
  };
}

// OCR Error Types
export interface OCRError {
  code: OCRErrorCode;
  message: string;
  details?: Record<string, any>;
  recoverable: boolean;
  suggestions: string[];
}

export enum OCRErrorCode {
  IMAGE_TOO_SMALL = 'IMAGE_TOO_SMALL',
  IMAGE_TOO_LARGE = 'IMAGE_TOO_LARGE',
  UNSUPPORTED_FORMAT = 'UNSUPPORTED_FORMAT',
  POOR_IMAGE_QUALITY = 'POOR_IMAGE_QUALITY',
  NO_TEXT_DETECTED = 'NO_TEXT_DETECTED',
  API_ERROR = 'API_ERROR',
  PROCESSING_TIMEOUT = 'PROCESSING_TIMEOUT',
  INVALID_CONFIGURATION = 'INVALID_CONFIGURATION'
}

// OCR Performance Metrics
export interface OCRPerformanceMetrics {
  processingTime: number;
  accuracy: number;
  confidence: number;
  textLength: number;
  imageSize: number;
  engineUsed: string;
  timestamp: string;
}

// OCR Quality Assessment
export interface OCRQualityAssessment {
  overallScore: number;
  textClarity: number;
  imageQuality: number;
  completeness: number;
  accuracy: number;
  recommendations: string[];
}

// OCR Validation
export interface OCRValidationResult {
  isValid: boolean;
  confidence: number;
  issues: ValidationIssue[];
  suggestions: string[];
  correctedText?: string;
}

export interface ValidationIssue {
  type: 'spelling' | 'format' | 'structure' | 'encoding';
  severity: 'low' | 'medium' | 'high';
  message: string;
  position?: {
    start: number;
    end: number;
  };
  suggestion?: string;
}

// OCR Engine Specific Types
export interface TesseractOptions {
  lang: string;
  oem: number;
  psm: number;
  tessedit_char_whitelist?: string;
  tessedit_char_blacklist?: string;
}

export interface OpenAIVisionOptions {
  model: string;
  maxTokens: number;
  temperature: number;
  prompt?: string;
}

export interface GoogleVisionOptions {
  features: string[];
  imageContext?: {
    languageHints: string[];
  };
}

// OCR Result Comparison
export interface OCRComparison {
  engines: string[];
  results: ExtractedText[];
  consensus: string;
  differences: TextDifference[];
  recommendedResult: ExtractedText;
}

export interface TextDifference {
  position: number;
  original: string;
  alternative: string;
  confidence: number;
  source: string;
}

// All types are already exported above with their interface declarations

export interface BusinessCardData {
  // Core Contact Information (Essential CRM Fields)
  name: string;
  title: string;
  company: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  rawText: string;
  confidence: number;
  
  // Enhanced fields for CRM intelligence (from extraction)
  department?: string;
  industry?: string;
  companySize?: 'Startup' | 'SMB' | 'Mid-Market' | 'Enterprise' | 'Fortune 500';
  socialMedia?: {
    linkedin?: string;
    twitter?: string;
    other?: string[];
  };
  certifications?: string[];
  languages?: string[];
  specialties?: string[];
  companyDescription?: string;
  visualCues?: {
    logoStyle?: string;
    cardQuality?: string;
    designComplexity?: string;
    brandMaturity?: string;
  };
  
  // Sales Intelligence Fields (What Sales Pros Actually Need)
  leadSource?: 'Business Card' | 'Referral' | 'LinkedIn' | 'Event' | 'Cold Outreach';
  leadScore?: number; // 1-100 based on title/company analysis
  decisionMakingAuthority?: 'High' | 'Medium' | 'Low';
  
  // Social & Digital Presence (For Modern Sales Research)
  linkedinProfile?: string;
  socialMediaHandles?: {
    twitter?: string;
    linkedin?: string;
  };
  
  // Sales Context & Notes
  meetingContext?: string; // Where/how you met them
  personalNotes?: string; // Conversation highlights, interests
  followUpReminder?: Date;
  lastContactDate?: Date;
  
  // Opportunity Tracking
  potentialValue?: number;
  buyingTimeframe?: 'Immediate' | '1-3 months' | '3-6 months' | '6+ months' | 'Unknown';
  painPoints?: string[];
  interests?: string[];
}

export interface OCRResult {
  success: boolean;
  data?: BusinessCardData;
  error?: string;
  processingTime: number;
}
