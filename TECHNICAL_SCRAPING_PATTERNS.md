# 🔧 Technical Web Scraping Patterns (Educational Reference)

## ⚠️ **Disclaimer**
These code examples are provided for educational purposes only. Users are responsible for ensuring compliance with all applicable laws, terms of service, and ethical guidelines.

## 🛠️ **Common Technical Patterns**

### **1. Basic Puppeteer Setup**
```typescript
import puppeteer from 'puppeteer';

class WebDataExtractor {
  private browser: any;
  
  async initialize() {
    this.browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });
  }

  async extractPageData(url: string) {
    const page = await this.browser.newPage();
    
    // Set viewport
    await page.setViewport({ width: 1366, height: 768 });
    
    try {
      await page.goto(url, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });
      
      // Extract data
      const data = await page.evaluate(() => {
        return {
          title: document.title,
          content: document.body.innerText,
          links: Array.from(document.querySelectorAll('a')).map(a => ({
            text: a.textContent,
            href: a.href
          }))
        };
      });
      
      return data;
      
    } finally {
      await page.close();
    }
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}
```

### **2. Request Management**
```typescript
class RequestManager {
  private requestQueue: string[] = [];
  private processing = false;
  private delay = 1000; // 1 second between requests
  
  async addRequest(url: string) {
    this.requestQueue.push(url);
    if (!this.processing) {
      this.processQueue();
    }
  }
  
  private async processQueue() {
    this.processing = true;
    
    while (this.requestQueue.length > 0) {
      const url = this.requestQueue.shift();
      if (url) {
        try {
          await this.processUrl(url);
          await this.wait(this.delay);
        } catch (error) {
          console.log(`Failed to process ${url}:`, error.message);
        }
      }
    }
    
    this.processing = false;
  }
  
  private async processUrl(url: string) {
    // Process individual URL
    console.log(`Processing: ${url}`);
  }
  
  private wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

### **3. Data Extraction Patterns**
```typescript
class DataExtractor {
  async extractContactInfo(page: any) {
    return await page.evaluate(() => {
      const extractors = {
        emails: () => {
          const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
          return document.body.innerText.match(emailRegex) || [];
        },
        
        phones: () => {
          const phoneRegex = /(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g;
          return document.body.innerText.match(phoneRegex) || [];
        },
        
        names: () => {
          // Look for common name patterns in headings
          const headings = Array.from(document.querySelectorAll('h1, h2, h3, .name, .person'));
          return headings.map(h => h.textContent?.trim()).filter(Boolean);
        },
        
        titles: () => {
          const titleSelectors = ['.title', '.position', '.role', '.job-title'];
          const titles: string[] = [];
          titleSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
              if (el.textContent) titles.push(el.textContent.trim());
            });
          });
          return titles;
        }
      };
      
      return {
        emails: extractors.emails(),
        phones: extractors.phones(),
        names: extractors.names(),
        titles: extractors.titles()
      };
    });
  }
}
```

### **4. Search Result Processing**
```typescript
class SearchProcessor {
  async processSearchResults(query: string) {
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    
    // This is a technical pattern - actual implementation would need proper handling
    const extractor = new WebDataExtractor();
    await extractor.initialize();
    
    try {
      const page = await extractor.browser.newPage();
      await page.goto(searchUrl);
      
      const results = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('.g')).map(result => ({
          title: result.querySelector('h3')?.textContent || '',
          link: result.querySelector('a')?.href || '',
          snippet: result.querySelector('.VwiC3b')?.textContent || ''
        }));
      });
      
      return results;
      
    } finally {
      await extractor.cleanup();
    }
  }
}
```

### **5. AI Processing Integration**
```typescript
class AIProcessor {
  async processWithLocalAI(data: any) {
    try {
      // Example using local Ollama
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama2',
          prompt: `Extract structured contact information from: ${JSON.stringify(data)}`,
          stream: false
        })
      });
      
      const result = await response.json();
      return JSON.parse(result.response);
      
    } catch (error) {
      console.log('AI processing failed:', error);
      return this.fallbackProcessing(data);
    }
  }
  
  private fallbackProcessing(data: any) {
    // Basic regex-based extraction as fallback
    return {
      emails: this.extractEmails(data),
      phones: this.extractPhones(data),
      names: this.extractNames(data)
    };
  }
  
  private extractEmails(text: string): string[] {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    return text.match(emailRegex) || [];
  }
  
  private extractPhones(text: string): string[] {
    const phoneRegex = /(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g;
    return text.match(phoneRegex) || [];
  }
  
  private extractNames(text: string): string[] {
    // Basic name extraction - would need more sophisticated logic
    const nameRegex = /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g;
    return text.match(nameRegex) || [];
  }
}
```

### **6. Error Handling & Retry Logic**
```typescript
class RobustExtractor {
  private maxRetries = 3;
  private retryDelay = 2000;
  
  async extractWithRetry(url: string, attempt = 1): Promise<any> {
    try {
      return await this.extract(url);
    } catch (error) {
      if (attempt < this.maxRetries) {
        console.log(`Attempt ${attempt} failed, retrying in ${this.retryDelay}ms...`);
        await this.wait(this.retryDelay);
        return this.extractWithRetry(url, attempt + 1);
      }
      throw error;
    }
  }
  
  private async extract(url: string) {
    // Actual extraction logic
    const extractor = new WebDataExtractor();
    await extractor.initialize();
    
    try {
      return await extractor.extractPageData(url);
    } finally {
      await extractor.cleanup();
    }
  }
  
  private wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

### **7. Data Validation & Cleaning**
```typescript
class DataValidator {
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  validatePhone(phone: string): boolean {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
  }
  
  cleanAndValidateData(rawData: any) {
    return {
      emails: rawData.emails?.filter((email: string) => this.validateEmail(email)) || [],
      phones: rawData.phones?.filter((phone: string) => this.validatePhone(phone)) || [],
      names: rawData.names?.filter((name: string) => name.length > 2 && name.length < 50) || [],
      titles: rawData.titles?.filter((title: string) => title.length > 2 && title.length < 100) || []
    };
  }
}
```

## 📝 **Usage Example**
```typescript
async function demonstratePatterns() {
  const extractor = new RobustExtractor();
  const processor = new AIProcessor();
  const validator = new DataValidator();
  
  try {
    // Extract data
    const rawData = await extractor.extractWithRetry('https://example.com');
    
    // Process with AI
    const processedData = await processor.processWithLocalAI(rawData);
    
    // Validate and clean
    const cleanData = validator.cleanAndValidateData(processedData);
    
    console.log('Final data:', cleanData);
    
  } catch (error) {
    console.error('Process failed:', error);
  }
}
```

## ⚠️ **Important Notes**

1. **These are technical patterns only** - implementation details are your responsibility
2. **Always check robots.txt** before accessing any website
3. **Implement proper rate limiting** to avoid overwhelming servers
4. **Handle errors gracefully** and implement retry logic
5. **Validate and clean all extracted data**
6. **Consider the legal implications** of your specific use case

## 🔧 **Dependencies**
```bash
npm install puppeteer cheerio axios
```

This provides the technical foundation - how you choose to implement and use these patterns is entirely up to you. 