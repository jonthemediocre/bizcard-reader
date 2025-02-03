import { logger } from './logger';

interface ImageProcessingResult {
  processedImageData: ImageData;
  textRegions: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
}

export class ImageProcessor {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement('canvas');
    const ctx = this.canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }
    this.ctx = ctx;
  }

  async preprocessImage(imageFile: File): Promise<ImageProcessingResult> {
    try {
      // Load image
      const image = await this.loadImage(imageFile);
      
      // Set canvas size
      this.canvas.width = image.width;
      this.canvas.height = image.height;
      
      // Draw original image
      this.ctx.drawImage(image, 0, 0);
      
      // Get image data
      const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
      
      // Apply preprocessing steps
      const enhancedData = this.enhanceImage(imageData);
      
      // Detect text regions
      const textRegions = this.detectTextRegions(enhancedData);
      
      // Apply region-specific enhancements
      const finalData = this.enhanceTextRegions(enhancedData, textRegions);
      
      logger.info('Image preprocessing completed', {
        width: image.width,
        height: image.height,
        regionsFound: textRegions.length
      });

      return {
        processedImageData: finalData,
        textRegions
      };
    } catch (error) {
      logger.error('Image preprocessing failed', {}, error);
      throw error;
    }
  }

  private loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  private enhanceImage(imageData: ImageData): ImageData {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    
    // Convert to grayscale and calculate histogram
    const histogram = new Uint32Array(256).fill(0);
    const grayscale = new Uint8Array(width * height);
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      // Convert to grayscale using luminance formula
      const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
      grayscale[i / 4] = gray;
      histogram[gray]++;
    }

    // Calculate Otsu's threshold
    const total = width * height;
    let sum = 0;
    for (let i = 0; i < 256; i++) {
      sum += i * histogram[i];
    }

    let sumB = 0;
    let wB = 0;
    let wF = 0;
    let maxVariance = 0;
    let threshold = 0;

    for (let t = 0; t < 256; t++) {
      wB += histogram[t];
      if (wB === 0) continue;
      wF = total - wB;
      if (wF === 0) break;

      sumB += t * histogram[t];
      const mB = sumB / wB;
      const mF = (sum - sumB) / wF;
      const variance = wB * wF * Math.pow(mB - mF, 2);

      if (variance > maxVariance) {
        maxVariance = variance;
        threshold = t;
      }
    }

    // Apply adaptive thresholding and contrast enhancement
    const enhanced = new Uint8ClampedArray(data.length);
    const windowSize = 15;
    const C = 5;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const grayIdx = y * width + x;
        
        // Calculate local mean
        let sum = 0;
        let count = 0;
        
        for (let wy = -windowSize; wy <= windowSize; wy++) {
          for (let wx = -windowSize; wx <= windowSize; wx++) {
            const ny = y + wy;
            const nx = x + wx;
            
            if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
              sum += grayscale[ny * width + nx];
              count++;
            }
          }
        }

        const mean = sum / count;
        const pixel = grayscale[grayIdx];
        
        // Apply local threshold
        const value = pixel > mean - C ? 255 : 0;
        
        enhanced[idx] = value;
        enhanced[idx + 1] = value;
        enhanced[idx + 2] = value;
        enhanced[idx + 3] = 255;
      }
    }

    return new ImageData(enhanced, width, height);
  }

  private detectTextRegions(imageData: ImageData): Array<{ x: number; y: number; width: number; height: number }> {
    const { data, width, height } = imageData;
    const regions: Array<{ x: number; y: number; width: number; height: number }> = [];
    const visited = new Set<number>();
    
    // Connected component analysis
    const findComponent = (startX: number, startY: number) => {
      const queue: Array<[number, number]> = [[startX, startY]];
      let minX = startX, maxX = startX;
      let minY = startY, maxY = startY;
      
      while (queue.length > 0) {
        const [x, y] = queue.pop()!;
        const idx = (y * width + x) * 4;
        
        if (visited.has(idx)) continue;
        visited.add(idx);
        
        // Update bounds
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
        
        // Check neighbors
        const neighbors = [
          [x - 1, y], [x + 1, y],
          [x, y - 1], [x, y + 1]
        ];
        
        for (const [nx, ny] of neighbors) {
          if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
          
          const nIdx = (ny * width + nx) * 4;
          if (!visited.has(nIdx) && data[nIdx] === 0) {
            queue.push([nx, ny]);
          }
        }
      }
      
      return {
        x: minX,
        y: minY,
        width: maxX - minX + 1,
        height: maxY - minY + 1
      };
    };
    
    // Find text components
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        if (!visited.has(idx) && data[idx] === 0) {
          const region = findComponent(x, y);
          
          // Filter out noise and non-text regions
          const aspectRatio = region.width / region.height;
          const area = region.width * region.height;
          const density = area / (width * height);
          
          if (
            aspectRatio > 0.1 && 
            aspectRatio < 20 && 
            density > 0.0001 && 
            density < 0.1 &&
            region.height > 8
          ) {
            regions.push(region);
          }
        }
      }
    }
    
    // Merge overlapping regions
    return this.mergeRegions(regions);
  }

  private mergeRegions(regions: Array<{ x: number; y: number; width: number; height: number }>) {
    const merged: Array<{ x: number; y: number; width: number; height: number }> = [];
    
    const overlap = (r1: typeof regions[0], r2: typeof regions[0]) => {
      return !(
        r2.x > r1.x + r1.width ||
        r2.x + r2.width < r1.x ||
        r2.y > r1.y + r1.height ||
        r2.y + r2.height < r1.y
      );
    };
    
    const merge = (r1: typeof regions[0], r2: typeof regions[0]) => {
      const x = Math.min(r1.x, r2.x);
      const y = Math.min(r1.y, r2.y);
      const width = Math.max(r1.x + r1.width, r2.x + r2.width) - x;
      const height = Math.max(r1.y + r1.height, r2.y + r2.height) - y;
      return { x, y, width, height };
    };
    
    for (const region of regions) {
      let merged_region = region;
      let didMerge = false;
      
      for (let i = 0; i < merged.length; i++) {
        if (overlap(merged[i], region)) {
          merged[i] = merge(merged[i], region);
          didMerge = true;
          break;
        }
      }
      
      if (!didMerge) {
        merged.push(merged_region);
      }
    }
    
    return merged;
  }

  private enhanceTextRegions(imageData: ImageData, regions: Array<{ x: number; y: number; width: number; height: number }>): ImageData {
    const { data, width, height } = imageData;
    const enhanced = new Uint8ClampedArray(data);
    
    for (const region of regions) {
      // Apply region-specific enhancements
      for (let y = region.y; y < region.y + region.height; y++) {
        for (let x = region.x; x < region.x + region.width; x++) {
          if (y < 0 || y >= height || x < 0 || x >= width) continue;
          
          const idx = (y * width + x) * 4;
          
          // Increase contrast in text regions
          const value = data[idx];
          enhanced[idx] = value < 128 ? 0 : 255;
          enhanced[idx + 1] = enhanced[idx];
          enhanced[idx + 2] = enhanced[idx];
        }
      }
    }
    
    return new ImageData(enhanced, width, height);
  }
}

export const imageProcessor = new ImageProcessor();