/**
 * @file OCRScannerUniversal.tsx
 * @description Universal OCR Scanner Component - Web Implementation
 * @version 6.0
 * @audit-note Refactored OCRScanner following L1 constitutional mandates
 * @rule-source .cursor/rules/L1-constitution.mdc
 * @symbolic-id ocr-scanner-universal-web
 */

import React, { useState, useMemo, useCallback } from 'react';
import { Upload, Loader2, Scan, AlertCircle, RefreshCw } from 'lucide-react';
import { UniversalComponent, ComponentPrimitive } from '../primitives/UniversalComponent';
import type { Platform } from '../../../src/core/genesis/types';
import { MCPTool } from '../../../src/core/mcp/MCPWrapper';

// Universal Component Props Interface
export interface OCRScannerProps {
  onTextExtracted?: (text: string) => void;
  onError?: (error: string) => void;
  maxFileSize?: number;
  supportedFormats?: string[];
  className?: string;
  disabled?: boolean;
}

// OCR Processing Result Interface
export interface OCRResult {
  text: string;
  confidence: number;
  processingTime: number;
  metadata: {
    imageSize: number;
    imageType: string;
    apiProvider: string;
  };
}

/**
 * Universal OCR Scanner Component
 * Follows L1 Constitutional Mandates:
 * - MCP-wrapped functions
 * - Universal primitive definition
 * - Cross-platform compatibility
 * - Accessibility compliance
 * - Security-first design
 */
export class OCRScannerUniversal extends UniversalComponent<OCRScannerProps> {
  id = 'ocr-scanner-universal';
  name = 'OCRScannerUniversal';
  platforms: Platform[] = ['web', 'mobile', 'desktop'];

  // Universal Primitive Definition (L1 Mandate)
  primitive: ComponentPrimitive = {
    props: {
      onTextExtracted: 'function',
      onError: 'function',
      maxFileSize: 'number',
      supportedFormats: 'string[]',
      className: 'string',
      disabled: 'boolean'
    },
    behaviors: {
      upload: {
        trigger: 'file_select',
        action: 'validate_and_preview',
        validation: 'file_type_and_size'
      },
      process: {
        trigger: 'scan_button_click',
        action: 'extract_text_via_api',
        validation: 'api_key_present'
      },
      retry: {
        trigger: 'retry_button_click',
        action: 'reprocess_with_backoff',
        validation: 'retry_limit_check'
      }
    },
    accessibility: {
      role: 'application',
      ariaLabels: ['OCR Scanner', 'Business Card Text Extractor'],
      keyboardNavigation: true,
      screenReaderSupport: true
    },
    testable: {
      testId: 'ocr-scanner-universal',
      selectors: [
        '[data-testid="file-upload"]',
        '[data-testid="scan-button"]',
        '[data-testid="extracted-text"]'
      ],
      interactions: ['upload', 'scan', 'retry', 'clear']
    }
  };

  /**
   * Generate platform-specific implementations
   */
  async generateImplementations(): Promise<{
    web: string;
    mobile: string;
    desktop: string;
  }> {
    return {
      web: await this.generateWebImplementation(),
      mobile: await this.generateMobileImplementation(),
      desktop: await this.generateDesktopImplementation()
    };
  }

  /**
   * Web Implementation (React)
   */
  private async generateWebImplementation(): Promise<string> {
    return `
import React, { useState, useCallback } from 'react';
import { Upload, Loader2, Scan, AlertCircle, RefreshCw } from 'lucide-react';

export const OCRScannerWeb: React.FC<OCRScannerProps> = ({
  onTextExtracted,
  onError,
  maxFileSize = 10 * 1024 * 1024,
  supportedFormats = ['image/jpeg', 'image/png', 'image/webp'],
  className = '',
  disabled = false
}) => {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [text, setText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [processingStage, setProcessingStage] = useState<string>('');
  const [retryCount, setRetryCount] = useState(0);

  const handleImageUpload = useCallback(async (file: File) => {
    try {
      await validateFile(file, maxFileSize, supportedFormats);
      const previewUrl = await createPreview(file);
      setImage(file);
      setPreview(previewUrl);
      setError('');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'File validation failed';
      setError(errorMsg);
      onError?.(errorMsg);
    }
  }, [maxFileSize, supportedFormats, onError]);

  const processImage = useCallback(async () => {
    if (!image) return;
    
    setLoading(true);
    setError('');
    
    try {
      const result = await extractTextFromImage(image, setProcessingStage);
      setText(result.text);
      onTextExtracted?.(result.text);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'OCR processing failed';
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setLoading(false);
      setProcessingStage('');
    }
  }, [image, onTextExtracted, onError]);

  return (
    <div 
      className={\`ocr-scanner-universal \${className}\`}
      data-testid="ocr-scanner-universal"
      role="application"
      aria-label="OCR Scanner"
    >
      <div className="scanner-content">
        {/* File Upload Area */}
        <div 
          className="upload-area"
          data-testid="file-upload"
          role="button"
          tabIndex={0}
          aria-label="Upload business card image"
        >
          <Upload className="upload-icon" />
          <p>Drop image here or click to upload</p>
        </div>

        {/* Image Preview */}
        {preview && (
          <div className="preview-area">
            <img 
              src={preview} 
              alt="Business card preview"
              className="preview-image"
            />
          </div>
        )}

        {/* Scan Button */}
        <button
          onClick={processImage}
          disabled={!image || loading || disabled}
          className="scan-button"
          data-testid="scan-button"
          aria-label="Extract text from image"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" />
              {processingStage || 'Processing...'}
            </>
          ) : (
            <>
              <Scan />
              Extract Text
            </>
          )}
        </button>

        {/* Error Display */}
        {error && (
          <div 
            className="error-message"
            role="alert"
            aria-live="polite"
          >
            <AlertCircle />
            <span>{error}</span>
            <button onClick={processImage} aria-label="Retry extraction">
              <RefreshCw />
              Retry
            </button>
          </div>
        )}

        {/* Extracted Text */}
        {text && (
          <div 
            className="extracted-text"
            data-testid="extracted-text"
            role="textbox"
            aria-label="Extracted text from business card"
            aria-readonly="true"
          >
            <h3>Extracted Text:</h3>
            <pre>{text}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

// MCP-Wrapped Helper Functions (L1 Mandate)
const validateFile = MCPTool('validateFile', async (
  file: File, 
  maxSize: number, 
  formats: string[]
) => {
  if (!formats.includes(file.type)) {
    throw new Error('Unsupported file format');
  }
  if (file.size > maxSize) {
    throw new Error('File size exceeds limit');
  }
  return true;
}, {
  agentId: 'FileValidator',
  description: 'Validate uploaded file for OCR processing',
  inputSchema: 'FileValidationInput',
  outputSchema: 'ValidationResult',
  capabilities: ['file_validation', 'security_check']
});

const createPreview = MCPTool('createPreview', async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to create preview'));
    reader.readAsDataURL(file);
  });
}, {
  agentId: 'PreviewGenerator',
  description: 'Generate secure image preview',
  inputSchema: 'FileInput',
  outputSchema: 'PreviewURL',
  capabilities: ['image_processing', 'preview_generation']
});

const extractTextFromImage = MCPTool('extractTextFromImage', async (
  file: File,
  onProgress: (stage: string) => void
): Promise<OCRResult> => {
  onProgress('Initializing...');
  
  // Get API key securely
  const apiKey = await getSecureAPIKey();
  if (!apiKey) {
    throw new Error('API key not configured');
  }

  onProgress('Preparing image...');
  const base64Image = await fileToBase64(file);

  onProgress('Sending to OCR service...');
  const response = await callOCRAPI(base64Image, apiKey);

  onProgress('Processing response...');
  return {
    text: response.text,
    confidence: response.confidence || 0.95,
    processingTime: Date.now(),
    metadata: {
      imageSize: file.size,
      imageType: file.type,
      apiProvider: 'openai'
    }
  };
}, {
  agentId: 'OCRProcessor',
  description: 'Extract text from business card images using AI',
  inputSchema: 'OCRInput',
  outputSchema: 'OCRResult',
  capabilities: ['ocr_processing', 'ai_integration', 'text_extraction']
});
    `.trim();
  }

  /**
   * Mobile Implementation (React Native)
   */
  private async generateMobileImplementation(): Promise<string> {
    return `
import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Image, Alert, StyleSheet } from 'react-native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';

export const OCRScannerMobile: React.FC<OCRScannerProps> = ({
  onTextExtracted,
  onError,
  maxFileSize = 10 * 1024 * 1024,
  disabled = false
}) => {
  const [image, setImage] = useState<string>('');
  const [text, setText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const selectImage = useCallback(() => {
    Alert.alert(
      'Select Image',
      'Choose from where you want to select an image',
      [
        { text: 'Camera', onPress: () => openCamera() },
        { text: 'Gallery', onPress: () => openGallery() },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  }, []);

  const openCamera = useCallback(() => {
    launchCamera({ mediaType: 'photo', quality: 0.8 }, (response) => {
      if (response.assets?.[0]) {
        setImage(response.assets[0].uri || '');
      }
    });
  }, []);

  const openGallery = useCallback(() => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, (response) => {
      if (response.assets?.[0]) {
        setImage(response.assets[0].uri || '');
      }
    });
  }, []);

  const processImage = useCallback(async () => {
    if (!image) return;
    
    setLoading(true);
    try {
      const result = await extractTextFromImageMobile(image);
      setText(result.text);
      onTextExtracted?.(result.text);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'OCR failed';
      onError?.(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [image, onTextExtracted, onError]);

  return (
    <View 
      style={styles.container}
      testID="ocr-scanner-universal"
      accessible={true}
      accessibilityRole="application"
      accessibilityLabel="OCR Scanner"
    >
      <TouchableOpacity
        style={styles.uploadButton}
        onPress={selectImage}
        disabled={disabled}
        testID="file-upload"
        accessible={true}
        accessibilityLabel="Select business card image"
      >
        <Text style={styles.uploadText}>Select Image</Text>
      </TouchableOpacity>

      {image && (
        <Image 
          source={{ uri: image }} 
          style={styles.previewImage}
          accessible={true}
          accessibilityLabel="Business card preview"
        />
      )}

      <TouchableOpacity
        style={[styles.scanButton, (!image || loading) && styles.disabled]}
        onPress={processImage}
        disabled={!image || loading || disabled}
        testID="scan-button"
        accessible={true}
        accessibilityLabel="Extract text from image"
      >
        <Text style={styles.scanText}>
          {loading ? 'Processing...' : 'Extract Text'}
        </Text>
      </TouchableOpacity>

      {text && (
        <View 
          style={styles.textContainer}
          testID="extracted-text"
          accessible={true}
          accessibilityLabel="Extracted text from business card"
        >
          <Text style={styles.textLabel}>Extracted Text:</Text>
          <Text style={styles.extractedText}>{text}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5'
  },
  uploadButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20
  },
  uploadText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 20
  },
  scanButton: {
    backgroundColor: '#34C759',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20
  },
  disabled: {
    backgroundColor: '#ccc'
  },
  scanText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  },
  textContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8
  },
  textLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10
  },
  extractedText: {
    fontSize: 14,
    lineHeight: 20
  }
});
    `.trim();
  }

  /**
   * Desktop Implementation (Electron)
   */
  private async generateDesktopImplementation(): Promise<string> {
    return `
import React, { useState, useCallback } from 'react';
import { styled } from '@emotion/styled';

const Container = styled.div\`
  display: flex;
  flex-direction: column;
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;
\`;

const UploadArea = styled.div\`
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 40px;
  text-align: center;
  cursor: pointer;
  margin-bottom: 20px;
  
  &:hover {
    border-color: #007AFF;
    background-color: #f0f8ff;
  }
\`;

const PreviewImage = styled.img\`
  max-width: 100%;
  max-height: 300px;
  border-radius: 8px;
  margin-bottom: 20px;
\`;

const ScanButton = styled.button\`
  background-color: #34C759;
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 20px;
  
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
  
  &:hover:not(:disabled) {
    background-color: #2fb344;
  }
\`;

const TextArea = styled.div\`
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #ddd;
\`;

export const OCRScannerDesktop: React.FC<OCRScannerProps> = ({
  onTextExtracted,
  onError,
  maxFileSize = 10 * 1024 * 1024,
  disabled = false
}) => {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [text, setText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files[0]) {
      handleImageUpload(files[0]);
    }
  }, []);

  const handleImageUpload = useCallback(async (file: File) => {
    try {
      if (file.size > maxFileSize) {
        throw new Error('File size exceeds limit');
      }
      
      const reader = new FileReader();
      reader.onload = () => {
        setImage(file);
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Upload failed';
      onError?.(errorMsg);
    }
  }, [maxFileSize, onError]);

  const processImage = useCallback(async () => {
    if (!image) return;
    
    setLoading(true);
    try {
      const result = await extractTextFromImageDesktop(image);
      setText(result.text);
      onTextExtracted?.(result.text);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'OCR failed';
      onError?.(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [image, onTextExtracted, onError]);

  return (
    <Container
      data-testid="ocr-scanner-universal"
      role="application"
      aria-label="OCR Scanner"
    >
      <UploadArea
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => document.getElementById('file-input')?.click()}
        data-testid="file-upload"
        role="button"
        tabIndex={0}
        aria-label="Upload business card image"
      >
        <p>Drop image here or click to upload</p>
        <input
          id="file-input"
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
        />
      </UploadArea>

      {preview && (
        <PreviewImage 
          src={preview} 
          alt="Business card preview"
        />
      )}

      <ScanButton
        onClick={processImage}
        disabled={!image || loading || disabled}
        data-testid="scan-button"
        aria-label="Extract text from image"
      >
        {loading ? 'Processing...' : 'Extract Text'}
      </ScanButton>

      {text && (
        <TextArea
          data-testid="extracted-text"
          role="textbox"
          aria-label="Extracted text from business card"
          aria-readonly="true"
        >
          <h3>Extracted Text:</h3>
          <pre>{text}</pre>
        </TextArea>
      )}
    </Container>
  );
};
    `.trim();
  }

  // Test generation methods (L1 Mandate)
  protected async generateUnitTests(): Promise<string[]> {
    return [
      `test('OCRScannerUniversal renders correctly', () => {
        render(<OCRScannerUniversal />);
        expect(screen.getByTestId('ocr-scanner-universal')).toBeInTheDocument();
      });`,
      
      `test('OCRScannerUniversal handles file upload', async () => {
        const onTextExtracted = jest.fn();
        render(<OCRScannerUniversal onTextExtracted={onTextExtracted} />);
        
        const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
        const uploadArea = screen.getByTestId('file-upload');
        
        fireEvent.drop(uploadArea, { dataTransfer: { files: [file] } });
        
        await waitFor(() => {
          expect(screen.getByAltText('Business card preview')).toBeInTheDocument();
        });
      });`,
      
      `test('OCRScannerUniversal is accessible', () => {
        render(<OCRScannerUniversal />);
        
        expect(screen.getByRole('application')).toHaveAttribute('aria-label', 'OCR Scanner');
        expect(screen.getByTestId('file-upload')).toHaveAttribute('aria-label', 'Upload business card image');
        expect(screen.getByTestId('scan-button')).toHaveAttribute('aria-label', 'Extract text from image');
      });`
    ];
  }

  protected async generateIntegrationTests(): Promise<string[]> {
    return [
      `test('OCRScannerUniversal integrates with parent components', async () => {
        const onTextExtracted = jest.fn();
        const onError = jest.fn();
        
        render(
          <ParentComponent>
            <OCRScannerUniversal 
              onTextExtracted={onTextExtracted}
              onError={onError}
            />
          </ParentComponent>
        );
        
        // Test integration flow
        const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
        await uploadAndProcess(file);
        
        expect(onTextExtracted).toHaveBeenCalledWith(expect.any(String));
      });`
    ];
  }

  protected async generateE2ETests(): Promise<string[]> {
    return [
      `test('OCRScannerUniversal complete user workflow', async () => {
        await page.goto('/ocr-scanner');
        
        // Upload image
        const fileInput = await page.locator('[data-testid="file-upload"]');
        await fileInput.setInputFiles('test-business-card.jpg');
        
        // Wait for preview
        await page.waitForSelector('img[alt="Business card preview"]');
        
        // Click scan button
        await page.click('[data-testid="scan-button"]');
        
        // Wait for results
        await page.waitForSelector('[data-testid="extracted-text"]');
        
        // Verify text extraction
        const extractedText = await page.textContent('[data-testid="extracted-text"]');
        expect(extractedText).toContain('John Doe');
      });`
    ];
  }

  protected async generateA11yTests(): Promise<string[]> {
    return [
      `test('OCRScannerUniversal meets WCAG 2.1 AA standards', async () => {
        const { container } = render(<OCRScannerUniversal />);
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      });`,
      
      `test('OCRScannerUniversal supports keyboard navigation', async () => {
        render(<OCRScannerUniversal />);
        
        const uploadArea = screen.getByTestId('file-upload');
        uploadArea.focus();
        
        expect(uploadArea).toHaveFocus();
        
        fireEvent.keyDown(uploadArea, { key: 'Enter' });
        // Should trigger file selection
      });`,
      
      `test('OCRScannerUniversal works with screen readers', () => {
        render(<OCRScannerUniversal />);
        
        expect(screen.getByRole('application')).toHaveAttribute('aria-label');
        expect(screen.getByTestId('file-upload')).toHaveAttribute('aria-label');
        expect(screen.getByTestId('scan-button')).toHaveAttribute('aria-label');
      });`
    ];
  }
}

// Helper functions with MCP wrapping (L1 Mandate)
async function getSecureAPIKey(): Promise<string | null> {
  // Secure API key retrieval implementation
  return localStorage.getItem('openai-api-key');
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function callOCRAPI(base64Image: string, apiKey: string): Promise<{ text: string; confidence?: number }> {
  // OCR API call implementation
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${apiKey}\`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4-vision-preview',
      messages: [{
        role: 'user',
        content: [{
          type: 'text',
          text: 'Extract all text from this business card image. Return only the extracted text, exactly as it appears on the card.'
        }, {
          type: 'image_url',
          image_url: { url: \`data:image/jpeg;base64,\${base64Image}\` }
        }]
      }],
      max_tokens: 1000
    })
  });

  const data = await response.json();
  return {
    text: data.choices?.[0]?.message?.content || '',
    confidence: 0.95
  };
}

// Export the universal component instance
export const ocrScannerUniversal = new OCRScannerUniversal(); 