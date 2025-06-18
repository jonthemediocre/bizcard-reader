# Page snapshot

```yaml
- heading "Business Card Scanner" [level=1]
- paragraph: Upload a business card image to extract structured contact data
- button "API Settings":
  - img
  - text: API Settings
- heading "OpenAI API Configuration" [level=3]
- textbox "Enter your OpenAI API key"
- button "Save"
- paragraph: Your API key is stored locally and never sent to our servers.
- paragraph:
  - strong: "Demo Mode:"
  - text: Without an API key, the app will show sample data. Get your OpenAI API key from
  - link "platform.openai.com":
    - /url: https://platform.openai.com/api-keys
- heading "Upload Business Card" [level=2]
- img
- paragraph: Drag and drop an image here, or click to select
- text: Select Image
- paragraph: Upload and extract a business card to see structured data here
- paragraph: "You'll get access to:"
- img
- text: Contact Data
- img
- text: CRM Intelligence
- img
- text: Sales Intelligence
- heading "How it works:" [level=3]
- list:
  - listitem: Configure your OpenAI API key in settings
  - listitem: Upload or drag & drop a business card image
  - listitem: Click "Extract Data" to get structured information
  - listitem: Export as vCard, CSV, or JSON for use in your contacts app
```