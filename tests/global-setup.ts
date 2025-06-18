/**
 * 🧪 Playwright Global Setup
 * 
 * Sets up the test environment before running tests
 */

import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Setting up global test environment...');

  // Create a browser instance for setup
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Wait for the dev server to be ready
    console.log('⏳ Waiting for development server...');
    await page.goto('http://localhost:5173');
    await page.waitForSelector('h1:has-text("Business Card Scanner")', { timeout: 30000 });
    console.log('✅ Development server is ready');

    // Setup test data or authentication if needed
    // await page.evaluate(() => {
    //   localStorage.setItem('testMode', 'true');
    // });

  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }

  console.log('✅ Global setup completed');
}

export default globalSetup; 