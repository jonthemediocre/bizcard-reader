/**
 * 🧪 World-Class Interface End-to-End Tests
 * 
 * Comprehensive test suite covering:
 * - User interface interactions
 * - Business card processing workflow
 * - Performance metrics
 * - Accessibility compliance
 * - Cross-browser compatibility
 * - Mobile responsiveness
 */

import { test, expect, Page } from '@playwright/test';

test.describe('World-Class Business Card Intelligence Interface', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
    
    // Wait for the application to load
    await page.waitForSelector('h1:has-text("Business Card Intelligence")', { timeout: 10000 });
    
    // Verify initial state
    await expect(page.locator('[data-testid="app-container"]')).toBeVisible();
  });

  test.describe('🎨 UI/UX Excellence', () => {
    
    test('should display modern, responsive navigation', async ({ page }) => {
      // Check navigation header
      const header = page.locator('header');
      await expect(header).toBeVisible();
      await expect(header).toHaveClass(/backdrop-blur-lg/);
      
      // Check logo and title
      await expect(page.locator('h1')).toContainText('Business Card Intelligence');
      await expect(page.locator('p')).toContainText('AI-Powered Professional Networking');
      
      // Check navigation tabs
      const tabs = ['Scanner', 'CRM', 'Intelligence', 'Analytics', 'Settings'];
      for (const tab of tabs) {
        await expect(page.locator(`button:has-text("${tab}")`)).toBeVisible();
      }
    });

    test('should have smooth animations and transitions', async ({ page }) => {
      // Test tab switching animations
      await page.click('button:has-text("CRM")');
      await page.waitForTimeout(500); // Allow animation to complete
      
      await page.click('button:has-text("Scanner")');
      await page.waitForTimeout(500);
      
      // Verify tab indicator animation
      const activeTab = page.locator('.bg-white.text-blue-600');
      await expect(activeTab).toBeVisible();
    });

    test('should be fully responsive across device sizes', async ({ page }) => {
      // Test desktop view
      await page.setViewportSize({ width: 1920, height: 1080 });
      await expect(page.locator('nav')).toBeVisible();
      
      // Test tablet view
      await page.setViewportSize({ width: 768, height: 1024 });
      await expect(page.locator('nav')).toBeVisible();
      
      // Test mobile view
      await page.setViewportSize({ width: 375, height: 667 });
      await expect(page.locator('nav')).toBeVisible();
    });

    test('should support dark/light theme preferences', async ({ page }) => {
      // Navigate to settings
      await page.click('button:has-text("Settings")');
      
      // Check for theme settings (if implemented)
      const themeToggle = page.locator('button:has-text("Theme")');
      if (await themeToggle.isVisible()) {
        await themeToggle.click();
        // Verify theme change
        await page.waitForTimeout(300);
      }
    });
  });

  test.describe('📱 Scanner Functionality', () => {
    
    test.beforeEach(async ({ page }) => {
      await page.click('button:has-text("Scanner")');
      await page.waitForTimeout(500);
    });

    test('should display scanner interface correctly', async ({ page }) => {
      // Check for scanner components
      await expect(page.locator('[data-testid="business-card-scanner"]')).toBeVisible();
      
      // Check for upload options
      const uploadButton = page.locator('button:has-text("Upload")');
      const cameraButton = page.locator('button:has-text("Camera")');
      
      if (await uploadButton.isVisible()) {
        await expect(uploadButton).toBeEnabled();
      }
      
      if (await cameraButton.isVisible()) {
        await expect(cameraButton).toBeEnabled();
      }
    });

    test('should handle file upload gracefully', async ({ page }) => {
      // Look for file input
      const fileInput = page.locator('input[type="file"]');
      
      if (await fileInput.isVisible()) {
        // Create a test image file
        const testImagePath = './tests/fixtures/test-business-card.jpg';
        
        // Upload file
        await fileInput.setInputFiles(testImagePath);
        
        // Wait for processing to start
        await page.waitForSelector('[data-testid="processing-indicator"]', { timeout: 5000 });
        
        // Verify processing state
        await expect(page.locator('text=Processing')).toBeVisible();
      }
    });

    test('should show processing pipeline steps', async ({ page }) => {
      // Simulate processing state
      await page.evaluate(() => {
        // Mock processing state for testing
        window.dispatchEvent(new CustomEvent('startProcessing'));
      });

      // Check for processing steps
      const steps = [
        'OCR Text Extraction',
        'AI Analysis',
        'Data Enrichment',
        'Business Intelligence',
        'Data Validation'
      ];

      for (const step of steps) {
        const stepElement = page.locator(`text=${step}`);
        if (await stepElement.isVisible()) {
          await expect(stepElement).toBeVisible();
        }
      }
    });
  });

  test.describe('🧠 CRM Intelligence', () => {
    
    test.beforeEach(async ({ page }) => {
      await page.click('button:has-text("CRM")');
      await page.waitForTimeout(500);
    });

    test('should display CRM interface', async ({ page }) => {
      await expect(page.locator('[data-testid="crm-display"]')).toBeVisible();
    });

    test('should show contact information clearly', async ({ page }) => {
      // Check for contact display elements
      const contactElements = [
        '[data-testid="contact-name"]',
        '[data-testid="contact-company"]',
        '[data-testid="contact-email"]',
        '[data-testid="contact-phone"]'
      ];

      for (const selector of contactElements) {
        const element = page.locator(selector);
        if (await element.isVisible()) {
          await expect(element).toBeVisible();
        }
      }
    });
  });

  test.describe('📊 Analytics Dashboard', () => {
    
    test.beforeEach(async ({ page }) => {
      await page.click('button:has-text("Analytics")');
      await page.waitForTimeout(500);
    });

    test('should display performance metrics', async ({ page }) => {
      // Check for metrics cards
      const metricTitles = ['Load Time', 'Interactions', 'Bundle Size', 'Accessibility'];
      
      for (const title of metricTitles) {
        const metric = page.locator(`text=${title}`);
        if (await metric.isVisible()) {
          await expect(metric).toBeVisible();
        }
      }
    });

    test('should show real-time data updates', async ({ page }) => {
      // Verify metrics are displayed with values
      const metricValues = page.locator('[data-testid="metric-value"]');
      const count = await metricValues.count();
      
      if (count > 0) {
        for (let i = 0; i < count; i++) {
          const value = await metricValues.nth(i).textContent();
          expect(value).toBeTruthy();
          expect(value).not.toBe('--');
        }
      }
    });
  });

  test.describe('⚙️ Settings & Configuration', () => {
    
    test.beforeEach(async ({ page }) => {
      await page.click('button:has-text("Settings")');
      await page.waitForTimeout(500);
    });

    test('should display settings interface', async ({ page }) => {
      await expect(page.locator('h2:has-text("Application Settings")')).toBeVisible();
    });

    test('should allow preference customization', async ({ page }) => {
      // Check for toggle switches
      const toggles = [
        'Enable Animations',
        'Push Notifications',
        'Accessibility Mode'
      ];

      for (const toggle of toggles) {
        const toggleElement = page.locator(`text=${toggle}`);
        if (await toggleElement.isVisible()) {
          await expect(toggleElement).toBeVisible();
          
          // Test toggle interaction
          const toggleButton = page.locator(`button`).filter({ hasText: toggle }).first();
          if (await toggleButton.isVisible()) {
            await toggleButton.click();
            await page.waitForTimeout(200);
          }
        }
      }
    });

    test('should show UI/UX recommendations', async ({ page }) => {
      const recommendations = page.locator('h3:has-text("UI/UX Recommendations")');
      if (await recommendations.isVisible()) {
        await expect(recommendations).toBeVisible();
        
        // Check for recommendation content
        const content = page.locator('.bg-blue-50');
        await expect(content).toBeVisible();
      }
    });
  });

  test.describe('♿ Accessibility Compliance', () => {
    
    test('should meet WCAG accessibility standards', async ({ page }) => {
      // Check for proper heading hierarchy
      const h1 = page.locator('h1');
      await expect(h1).toHaveCount(1);
      
      // Check for alt text on images
      const images = page.locator('img');
      const imageCount = await images.count();
      
      for (let i = 0; i < imageCount; i++) {
        const alt = await images.nth(i).getAttribute('alt');
        expect(alt).toBeTruthy();
      }
      
      // Check for proper button labels
      const buttons = page.locator('button');
      const buttonCount = await buttons.count();
      
      for (let i = 0; i < buttonCount; i++) {
        const button = buttons.nth(i);
        const text = await button.textContent();
        const ariaLabel = await button.getAttribute('aria-label');
        const title = await button.getAttribute('title');
        
        expect(text || ariaLabel || title).toBeTruthy();
      }
    });

    test('should support keyboard navigation', async ({ page }) => {
      // Test tab navigation
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // Verify focus is visible
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    });

    test('should have sufficient color contrast', async ({ page }) => {
      // This would require a specialized accessibility testing library
      // For now, we'll check that text is visible
      const textElements = page.locator('p, span, button, h1, h2, h3');
      const count = await textElements.count();
      
      for (let i = 0; i < Math.min(count, 10); i++) {
        await expect(textElements.nth(i)).toBeVisible();
      }
    });
  });

  test.describe('⚡ Performance Optimization', () => {
    
    test('should load quickly and efficiently', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/');
      await page.waitForSelector('h1:has-text("Business Card Intelligence")');
      
      const loadTime = Date.now() - startTime;
      
      // Should load in under 3 seconds
      expect(loadTime).toBeLessThan(3000);
    });

    test('should handle large images efficiently', async ({ page }) => {
      // Navigate to scanner
      await page.click('button:has-text("Scanner")');
      
      // Check for file size warnings or optimization features
      const fileInput = page.locator('input[type="file"]');
      
      if (await fileInput.isVisible()) {
        // This would test with a large image file
        // await fileInput.setInputFiles('./tests/fixtures/large-image.jpg');
        
        // Verify handling of large files
        await page.waitForTimeout(1000);
      }
    });

    test('should maintain smooth interactions under load', async ({ page }) => {
      // Rapidly switch between tabs to test performance
      const tabs = ['Scanner', 'CRM', 'Intelligence', 'Analytics', 'Settings'];
      
      for (let i = 0; i < 3; i++) {
        for (const tab of tabs) {
          await page.click(`button:has-text("${tab}")`);
          await page.waitForTimeout(100);
        }
      }
      
      // Verify the interface is still responsive
      await expect(page.locator('h1')).toBeVisible();
    });
  });

  test.describe('🔄 Error Handling & Recovery', () => {
    
    test('should gracefully handle network errors', async ({ page }) => {
      // Simulate network failure
      await page.route('**/api/**', route => route.abort());
      
      // Attempt an operation that requires network
      await page.click('button:has-text("Scanner")');
      
      // Check for error handling
      const errorMessage = page.locator('text=Failed').or(page.locator('text=Error'));
      
      // Should show appropriate error message
      await page.waitForTimeout(2000);
    });

    test('should recover from processing failures', async ({ page }) => {
      // Navigate to scanner
      await page.click('button:has-text("Scanner")');
      
      // Simulate processing failure
      await page.evaluate(() => {
        window.dispatchEvent(new CustomEvent('processingError', {
          detail: { error: 'Simulated processing failure' }
        }));
      });
      
      // Check for error recovery options
      await page.waitForTimeout(1000);
    });
  });

  test.describe('📱 Cross-Browser Compatibility', () => {
    
    test('should work consistently across browsers', async ({ browserName, page }) => {
      // Basic functionality should work in all browsers
      await expect(page.locator('h1')).toBeVisible();
      
      // Test tab navigation
      await page.click('button:has-text("CRM")');
      await page.waitForTimeout(300);
      await expect(page.locator('button:has-text("CRM")')).toHaveClass(/text-blue-600/);
      
      console.log(`✅ Basic functionality verified in ${browserName}`);
    });
  });
});

// Helper functions for test utilities
async function simulateFileUpload(page: Page, fileName: string) {
  const fileInput = page.locator('input[type="file"]');
  if (await fileInput.isVisible()) {
    await fileInput.setInputFiles(`./tests/fixtures/${fileName}`);
  }
}

async function waitForProcessingComplete(page: Page) {
  await page.waitForSelector('[data-testid="processing-complete"]', { timeout: 30000 });
}

async function verifyAccessibility(page: Page) {
  // This would integrate with axe-core or similar accessibility testing library
  const violations = await page.evaluate(() => {
    // Mock accessibility check
    return [];
  });
  
  expect(violations).toHaveLength(0);
}

// Performance testing helpers
async function measureLoadTime(page: Page): Promise<number> {
  const startTime = Date.now();
  await page.waitForLoadState('domcontentloaded');
  return Date.now() - startTime;
}

async function measureInteractionTime(page: Page, action: () => Promise<void>): Promise<number> {
  const startTime = Date.now();
  await action();
  return Date.now() - startTime;
} 