import { createWorker, createScheduler, PSM, OEM } from 'tesseract.js';
import { logger } from '../logger';
import type { OCRResult } from '../../types/ocr';

class OCRService {
  private static instance: OCRService;

  private constructor() {}

  static getInstance(): OCRService {
    if (!OCRService.instance) {
      OCRService.instance = new OCRService();
    }
    return OCRService.instance;
  }

  async processImage(imageData: string): Promise<OCRResult> {
    try {
      // Create scheduler for parallel processing
      const scheduler = createScheduler();
      const worker1 = await createWorker();
      const worker2 = await createWorker();
      const worker3 = await createWorker();
      
      // Initialize workers with different configurations
      await Promise.all([
        worker1.loadLanguage('eng'),
        worker2.loadLanguage('eng'),
        worker3.loadLanguage('eng')
      ]);

      await Promise.all([
        worker1.initialize('eng'),
        worker2.initialize('eng'),
        worker3.initialize('eng')
      ]);
      
      // Configure workers with different parameters
      await worker1.setParameters({
        tessedit_ocr_engine_mode: OEM.LSTM_ONLY,
        tessedit_pageseg_mode: PSM.AUTO,
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@.-_+()[]{}',
      });
      
      await worker2.setParameters({
        tessedit_ocr_engine_mode: OEM.LSTM_ONLY,
        tessedit_pageseg_mode: PSM.SINGLE_BLOCK,
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@.-_+()[]{}',
      });

      await worker3.setParameters({
        tessedit_ocr_engine_mode: OEM.LSTM_ONLY,
        tessedit_pageseg_mode: PSM.SINGLE_LINE,
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@.-_+()[]{}',
      });

      scheduler.addWorker(worker1);
      scheduler.addWorker(worker2);
      scheduler.addWorker(worker3);

      // Process image with multiple configurations
      const results = await Promise.all([
        scheduler.addJob('recognize', imageData),
        scheduler.addJob('recognize', imageData),
        scheduler.addJob('recognize', imageData)
      ]);

      // Combine and clean results
      const combinedText = results
        .map(r => r.data.text)
        .join('\n')
        .replace(/\s+/g, ' ')
        .trim();
      
      await scheduler.terminate();

      if (!combinedText) {
        throw new Error('No text could be extracted from the image');
      }

      logger.info('OCR text extracted', { textLength: combinedText.length });
      
      return {
        text: combinedText,
        confidence: Math.max(...results.map(r => r.data.confidence)),
        words: results.flatMap(r => r.data.words || [])
      };
    } catch (error) {
      logger.error('OCR processing failed', {}, error);
      throw error;
    }
  }
}

export const ocrService = OCRService.getInstance();