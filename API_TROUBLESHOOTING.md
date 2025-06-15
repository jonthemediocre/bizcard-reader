# 🔧 API Troubleshooting Guide

## 404 Error Fixed! ✅

The 404 error you encountered has been resolved with the following updates:

### **What Was Fixed**

1. **Updated Model Name**: Changed from deprecated `gpt-4-vision-preview` to current `gpt-4o`
2. **Added Model Fallbacks**: App now tries multiple models if one fails
3. **Better Error Handling**: More specific error messages for different API issues
4. **Demo Mode**: Works without API key for testing

### **Model Fallback Order**
1. `gpt-4o` (latest and most capable)
2. `gpt-4-turbo` (backup option)
3. `gpt-4-vision-preview` (legacy fallback)

### **How to Use**

#### **Option 1: Demo Mode (No API Key Required)**
- Simply upload an image without configuring an API key
- App will show sample business card data
- Perfect for testing the interface

#### **Option 2: Real Extraction (API Key Required)**
1. Click "API Settings" in the app
2. Enter your OpenAI API key
3. Click "Save"
4. Upload business card image
5. Click "Extract Data"

### **Getting an OpenAI API Key**

1. Go to [platform.openai.com](https://platform.openai.com/api-keys)
2. Sign up or log in
3. Create a new API key
4. Copy and paste into the app settings

### **Common Issues & Solutions**

#### **401 Unauthorized**
- **Problem**: Invalid API key
- **Solution**: Double-check your API key in settings

#### **429 Rate Limited**
- **Problem**: Too many requests
- **Solution**: Wait a moment and try again

#### **400 Bad Request**
- **Problem**: Invalid request format
- **Solution**: Try a different image format (JPEG, PNG)

#### **Model Not Available**
- **Problem**: Your API key doesn't have access to the model
- **Solution**: App automatically tries fallback models

### **Supported Image Formats**
- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)
- Max size: 10MB

### **Expected Processing Time**
- **Demo Mode**: Instant
- **Real Extraction**: 2-5 seconds
- **Large Images**: Up to 10 seconds

### **Privacy & Security**
- ✅ API key stored locally only
- ✅ Images processed by OpenAI (not stored by us)
- ✅ Extracted data saved locally
- ✅ No data sent to our servers

### **Still Having Issues?**

1. **Check Browser Console**: Press F12 → Console tab for detailed errors
2. **Try Demo Mode**: Test without API key first
3. **Verify API Key**: Make sure it's valid and has vision model access
4. **Check Image**: Try a different business card image
5. **Clear Cache**: Refresh the page or clear browser cache

### **Success Indicators**
- ✅ Upload area shows image preview
- ✅ "Extract Data" button is enabled
- ✅ Loading spinner appears during processing
- ✅ Structured data appears on the right
- ✅ Export buttons work (vCard, CSV, JSON)

The app is now robust and handles API errors gracefully! 🚀 