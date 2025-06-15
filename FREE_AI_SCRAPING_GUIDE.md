# 🤖 Free AI Scraping Implementation Guide

## 🎯 **Overview**
This guide shows how to implement AI-powered data enrichment for your CRM system using completely free tools and services.

## ⚖️ **Legal Considerations First**

### **✅ What's Legal:**
- Scraping public information (company websites, public LinkedIn profiles)
- Using publicly available APIs
- Respecting robots.txt files
- Rate limiting your requests
- Using data for legitimate business purposes

### **❌ What to Avoid:**
- Scraping private/protected content
- Violating terms of service
- Overwhelming servers with requests
- Storing personal data without consent
- Commercial use of scraped data without permission

## 🛠️ **Free AI Scraping Stack**

### **1. Web Scraping Tools (Free)**
```bash
npm install puppeteer playwright cheerio axios
```

### **2. Free AI Models**
- **Ollama** (Local LLMs) - 100% free
- **Hugging Face** - Free tier
- **Google Gemini** - 15 requests/minute free
- **OpenAI GPT-3.5** - $5 credit for new users

### **3. Free Data Sources**
- Company websites
- Google search results
- Public LinkedIn profiles
- GitHub profiles
- Company press releases

## 🚀 **Implementation Examples**

### **Option 1: Local AI with Ollama (100% Free)**

```typescript
// Install Ollama: https://ollama.ai/
// Run: ollama pull llama2

interface ScrapedProfile {
  name: string;
  title: string;
  company: string;
  email?: string;
  phone?: string;
  linkedin?: string;
}

class FreeAIScraper {
  async scrapeLinkedInProfile(profileUrl: string): Promise<ScrapedProfile> {
    const puppeteer = require('puppeteer');
    const browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    
    try {
      await page.goto(profileUrl, { waitUntil: 'networkidle2', timeout: 30000 });
      
      const profileData = await page.evaluate(() => {
        return {
          name: document.querySelector('h1')?.textContent?.trim() || '',
          title: document.querySelector('.text-body-medium')?.textContent?.trim() || '',
          company: document.querySelector('.inline-show-more-text')?.textContent?.trim() || '',
          location: document.querySelector('.text-body-small')?.textContent?.trim() || '',
          about: document.querySelector('.pv-about-section')?.textContent?.trim() || ''
        };
      });
      
      await browser.close();
      
      // Use local AI to structure and enrich the data
      return await this.enrichWithLocalAI(profileData);
      
    } catch (error) {
      await browser.close();
      throw new Error(`Scraping failed: ${error.message}`);
    }
  }

  async enrichWithLocalAI(rawData: any): Promise<ScrapedProfile> {
    try {
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama2',
          prompt: `Extract and structure this LinkedIn profile data into JSON format:
                   Raw data: ${JSON.stringify(rawData)}
                   
                   Return ONLY valid JSON with these fields:
                   {
                     "name": "Full Name",
                     "title": "Job Title", 
                     "company": "Company Name",
                     "email": "guessed_email@company.com",
                     "seniority": "Senior/Mid/Junior",
                     "department": "Sales/Engineering/Marketing/etc"
                   }`,
          stream: false
        })
      });
      
      const result = await response.json();
      return JSON.parse(result.response);
      
    } catch (error) {
      // Fallback to basic parsing
      return {
        name: rawData.name || 'Unknown',
        title: rawData.title || 'Unknown',
        company: rawData.company || 'Unknown'
      };
    }
  }
}
```

### **Option 2: Google Search + Free AI (No API Keys)**

```typescript
class FreeGoogleScraper {
  async findContactInfo(name: string, company: string): Promise<any> {
    const searchQueries = [
      `"${name}" "${company}" email`,
      `"${name}" "${company}" site:linkedin.com`,
      `"${name}" "${company}" contact`,
      `"${company}" leadership team "${name}"`
    ];
    
    const results = [];
    
    for (const query of searchQueries) {
      try {
        const searchResults = await this.googleSearch(query);
        results.push(...searchResults);
      } catch (error) {
        console.log(`Search failed for: ${query}`);
      }
    }
    
    return await this.extractContactsWithAI(results);
  }

  async googleSearch(query: string): Promise<any[]> {
    const puppeteer = require('puppeteer');
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    
    try {
      await page.goto(searchUrl, { waitUntil: 'networkidle2' });
      
      const results = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('.g')).slice(0, 5).map(result => ({
          title: result.querySelector('h3')?.textContent || '',
          link: result.querySelector('a')?.href || '',
          snippet: result.querySelector('.VwiC3b')?.textContent || ''
        }));
      });
      
      await browser.close();
      return results;
      
    } catch (error) {
      await browser.close();
      return [];
    }
  }

  async extractContactsWithAI(searchResults: any[]): Promise<any> {
    // Use free Hugging Face API
    const response = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Free tier - no API key needed for some models
      },
      body: JSON.stringify({
        inputs: `Extract contact information from these search results: ${JSON.stringify(searchResults)}`
      })
    });
    
    return response.json();
  }
}
```

### **Option 3: Company Website Scraping**

```typescript
class CompanyWebsiteScraper {
  async scrapeCompanyExecutives(companyDomain: string): Promise<any[]> {
    const pagesToCheck = [
      `https://${companyDomain}/about`,
      `https://${companyDomain}/team`,
      `https://${companyDomain}/leadership`,
      `https://${companyDomain}/management`,
      `https://${companyDomain}/contact`,
      `https://${companyDomain}/about-us`
    ];
    
    const allData = [];
    const puppeteer = require('puppeteer');
    const browser = await puppeteer.launch({ headless: true });
    
    for (const url of pagesToCheck) {
      try {
        const page = await browser.newPage();
        await page.goto(url, { timeout: 15000 });
        
        const pageData = await page.evaluate(() => {
          // Extract team/leadership information
          const teamMembers = Array.from(document.querySelectorAll('.team-member, .leadership, .executive')).map(member => ({
            name: member.querySelector('h1, h2, h3, .name')?.textContent?.trim(),
            title: member.querySelector('.title, .position, .role')?.textContent?.trim(),
            bio: member.querySelector('.bio, .description, p')?.textContent?.trim(),
            image: member.querySelector('img')?.src
          }));
          
          // Extract contact information
          const contacts = Array.from(document.querySelectorAll('a[href*="mailto:"]')).map(link => 
            link.getAttribute('href')?.replace('mailto:', '')
          );
          
          return { teamMembers, contacts, url };
        });
        
        allData.push(pageData);
        await page.close();
        
      } catch (error) {
        console.log(`Failed to scrape ${url}: ${error.message}`);
      }
    }
    
    await browser.close();
    return this.processWithAI(allData);
  }

  async processWithAI(scrapedData: any[]): Promise<any[]> {
    // Use free local AI to structure the data
    const prompt = `
      Extract executive contact information from this scraped website data.
      Return as JSON array with: name, title, email, seniority_level, department
      
      Data: ${JSON.stringify(scrapedData)}
    `;
    
    // Use Ollama or other free AI service
    return this.callFreeAI(prompt);
  }
}
```

### **Option 4: Email Pattern Generation & Verification**

```typescript
class EmailEnrichment {
  generateEmailPatterns(firstName: string, lastName: string, domain: string): string[] {
    const f = firstName.toLowerCase();
    const l = lastName.toLowerCase();
    
    return [
      `${f}.${l}@${domain}`,
      `${f}${l}@${domain}`,
      `${f.charAt(0)}${l}@${domain}`,
      `${f}@${domain}`,
      `${f.charAt(0)}.${l}@${domain}`,
      `${f}_${l}@${domain}`,
      `${l}.${f}@${domain}`,
      `${f}${l.charAt(0)}@${domain}`
    ];
  }

  async verifyEmailFree(email: string): Promise<boolean> {
    const freeServices = [
      `https://api.eva.pingutil.com/email?email=${email}`,
      `https://emailvalidation.abstractapi.com/v1/?api_key=YOUR_FREE_KEY&email=${email}`,
      // Add more free email verification services
    ];
    
    for (const service of freeServices) {
      try {
        const response = await fetch(service);
        const result = await response.json();
        
        if (result.status === 'valid' || result.deliverability === 'DELIVERABLE') {
          return true;
        }
      } catch (error) {
        continue;
      }
    }
    
    return false;
  }

  async findWorkingEmail(name: string, company: string): Promise<string | null> {
    const domain = await this.getCompanyDomain(company);
    if (!domain) return null;
    
    const [firstName, ...lastNameParts] = name.split(' ');
    const lastName = lastNameParts.join(' ');
    
    const patterns = this.generateEmailPatterns(firstName, lastName, domain);
    
    for (const email of patterns) {
      const isValid = await this.verifyEmailFree(email);
      if (isValid) {
        return email;
      }
    }
    
    return null;
  }

  async getCompanyDomain(company: string): Promise<string | null> {
    // Use free domain lookup
    try {
      const response = await fetch(`https://autocomplete.clearbit.com/v1/companies/suggest?query=${encodeURIComponent(company)}`);
      const results = await response.json();
      return results[0]?.domain || null;
    } catch {
      return null;
    }
  }
}
```

## 🔧 **Setup Instructions**

### **1. Install Ollama (Local AI)**
```bash
# Download from https://ollama.ai/
# Then install a model:
ollama pull llama2
ollama pull codellama
```

### **2. Install Dependencies**
```bash
npm install puppeteer cheerio axios
```

### **3. Basic Implementation**
```typescript
import { FreeAIScraper, EmailEnrichment } from './free-ai-scraper';

const scraper = new FreeAIScraper();
const emailFinder = new EmailEnrichment();

// Example usage
async function enrichContact(name: string, company: string) {
  try {
    // Find LinkedIn profile
    const linkedinUrl = await scraper.findLinkedInProfile(name, company);
    
    // Scrape profile data
    const profileData = await scraper.scrapeLinkedInProfile(linkedinUrl);
    
    // Find email
    const email = await emailFinder.findWorkingEmail(name, company);
    
    return {
      ...profileData,
      email,
      enriched: true
    };
    
  } catch (error) {
    console.error('Enrichment failed:', error);
    return { name, company, enriched: false };
  }
}
```

## 📊 **Performance & Limits**

### **Free Tier Limits:**
- **Ollama**: Unlimited (local processing)
- **Hugging Face**: 1000 requests/month
- **Google Gemini**: 15 requests/minute
- **Puppeteer**: No limits (but respect rate limiting)

### **Best Practices:**
- Add delays between requests (1-2 seconds)
- Use rotating user agents
- Implement retry logic
- Cache results to avoid re-scraping
- Respect robots.txt files

## 🎯 **Integration with Your CRM**

Add this to your existing `practicalCRM.ts`:

```typescript
// Add to PracticalCRMEngine class
async enrichContactData(contact: BusinessCardData): Promise<SalesIntelligence> {
  const scraper = new FreeAIScraper();
  
  try {
    // Try to enrich with free AI scraping
    const enrichedData = await scraper.enrichContact(contact.name, contact.company);
    
    // Merge with existing intelligence
    const baseIntelligence = this.generateSalesIntelligence(contact);
    
    return {
      ...baseIntelligence,
      contactProfile: {
        ...baseIntelligence.contactProfile,
        email: enrichedData.email || baseIntelligence.contactProfile.email,
        linkedinProfile: enrichedData.linkedin || baseIntelligence.contactProfile.linkedinProfile
      },
      socialIntelligence: {
        ...baseIntelligence.socialIntelligence,
        linkedinResearchUrl: enrichedData.linkedin || baseIntelligence.socialIntelligence.linkedinResearchUrl
      }
    };
    
  } catch (error) {
    console.log('Free enrichment failed, using demo data');
    return this.generateSalesIntelligence(contact);
  }
}
```

## ⚠️ **Important Notes**

1. **Rate Limiting**: Always add delays between requests
2. **Legal Compliance**: Only scrape public information
3. **Error Handling**: Implement robust fallbacks
4. **Data Privacy**: Don't store personal data unnecessarily
5. **Terms of Service**: Respect website ToS

This approach gives you powerful AI-driven data enrichment completely free, while staying within legal and ethical boundaries! 🚀 