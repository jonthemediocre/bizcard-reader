# BizCard Reader Enterprise - Mobile App

## 📱 Overview

The BizCard Reader Enterprise mobile app is built with **React Native + Expo** and provides a complete business card scanning and CRM intelligence solution optimized for mobile devices.

## 🚀 Features

### Core Features
- **📷 Advanced Camera Scanning**: AI-powered business card recognition with real-time processing
- **🔍 OCR Processing**: Extract contact information with 95%+ accuracy
- **📊 Enterprise Dashboard**: Usage analytics, subscription management, and team insights
- **👥 Contact Management**: Organize and search scanned contacts with CRM intelligence
- **📈 Analytics**: Track scanning performance and team usage metrics
- **💰 Billing Integration**: Subscription management and usage tracking

### Enterprise Features
- **🏢 Multi-tenant Support**: Secure tenant isolation and data management
- **🔐 SSO Integration**: Enterprise authentication with Auth0, Azure AD, Okta
- **📋 Usage Limits**: Tier-based processing limits with upgrade prompts
- **🎨 White-label Ready**: Customizable branding for enterprise clients
- **🌍 Internationalization**: Support for 7+ languages
- **♿ Accessibility**: WCAG 2.1 AA compliant interface

## 🛠 Tech Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Framework** | React Native + Expo 49 | Cross-platform mobile development |
| **Navigation** | React Navigation 6 | Screen navigation and routing |
| **State Management** | Redux Toolkit | Global state management |
| **UI Components** | React Native Paper | Material Design components |
| **Camera** | Expo Camera | Business card capture |
| **Image Processing** | Expo Image Picker | Gallery integration |
| **Authentication** | Expo Auth Session | OAuth and SSO integration |
| **Storage** | Expo Secure Store | Secure local data storage |
| **Notifications** | Expo Notifications | Push notifications |
| **Contacts** | Expo Contacts | Device contact integration |

## 📁 Project Structure

```
mobile/
├── app.json                    # Expo configuration
├── package.json               # Dependencies and scripts
├── App.tsx                    # Main app component
├── src/
│   ├── screens/              # Screen components
│   │   ├── auth/            # Authentication screens
│   │   ├── dashboard/       # Dashboard and analytics
│   │   ├── scan/           # Camera and scanning
│   │   ├── contacts/       # Contact management
│   │   ├── settings/       # App settings
│   │   ├── billing/        # Subscription management
│   │   └── enterprise/     # Enterprise onboarding
│   ├── components/          # Reusable UI components
│   ├── services/           # Business logic and API
│   ├── store/             # Redux store configuration
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Helper functions
│   └── constants/         # App constants
└── assets/                # Images, fonts, icons
```

## 🔧 Setup Instructions

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Studio (Windows/Mac/Linux)

### Installation

1. **Navigate to mobile directory**
   ```bash
   cd mobile
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   ```

4. **Run on specific platform**
   ```bash
   # iOS Simulator
   npm run ios
   
   # Android Emulator
   npm run android
   
   # Web browser
   npm run web
   ```

### Environment Configuration

Create a `.env` file in the mobile directory:

```env
# API Configuration
API_BASE_URL=https://api.bizcardreader.com
API_VERSION=v1

# Authentication
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_CLIENT_ID=your-client-id

# Analytics
MIXPANEL_TOKEN=your-mixpanel-token
GOOGLE_ANALYTICS_ID=your-ga-id

# Feature Flags
ENABLE_ENTERPRISE_FEATURES=true
ENABLE_OFFLINE_MODE=false
```

## 📱 Screen Architecture

### Authentication Flow
- **LoginScreen**: Email/password and SSO login
- **RegisterScreen**: Account creation with email verification
- **EnterpriseOnboardingScreen**: Multi-step enterprise setup

### Main Application
- **DashboardScreen**: Usage overview, recent scans, quick actions
- **ScanScreen**: Camera interface with OCR processing
- **ContactsScreen**: Contact list with search and filtering
- **AnalyticsScreen**: Usage metrics and team insights
- **SettingsScreen**: App preferences and account management
- **BillingScreen**: Subscription management and usage tracking

## 🔐 Security Features

### Data Protection
- **Secure Storage**: Sensitive data encrypted with Expo SecureStore
- **Network Security**: TLS 1.3 for all API communications
- **Biometric Authentication**: Face ID / Touch ID support
- **Session Management**: Automatic logout and token refresh

### Enterprise Security
- **Multi-tenant Isolation**: Tenant-scoped data access
- **Role-based Access**: User permissions and feature access
- **Audit Logging**: Track all user actions and data access
- **Compliance**: SOC 2, GDPR, HIPAA ready

## 📊 Analytics Integration

### User Analytics
- **Screen Tracking**: Navigation patterns and user flows
- **Feature Usage**: Scan frequency and success rates
- **Performance Metrics**: App load times and crash reporting
- **Conversion Tracking**: Free to paid subscription conversions

### Business Metrics
- **Usage Tracking**: Cards processed per user/tenant
- **Billing Events**: Subscription changes and usage overages
- **Support Metrics**: Help requests and satisfaction scores

## 🧪 Testing Strategy

### Unit Testing
```bash
npm test
```

### E2E Testing
```bash
# Install Detox (if not using Expo Go)
npm install -g detox-cli
npm run test:e2e
```

### Manual Testing Checklist
- [ ] Camera permissions and functionality
- [ ] OCR accuracy across different card types
- [ ] Offline mode data sync
- [ ] Push notification handling
- [ ] Deep linking navigation
- [ ] Accessibility features

## 🚀 Deployment

### Development Build
```bash
# Create development build
eas build --profile development --platform all
```

### Production Build
```bash
# Create production builds
eas build --profile production --platform all
```

### App Store Submission
```bash
# Submit to app stores
eas submit --platform ios
eas submit --platform android
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow
```yaml
name: Mobile CI/CD
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm test
      - run: npm run type-check
      - run: npm run lint

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: expo/expo-github-action@v7
      - run: eas build --non-interactive
```

## 📈 Performance Optimization

### Bundle Size Optimization
- Tree shaking for unused code elimination
- Image optimization with WebP format
- Lazy loading for non-critical screens
- Code splitting for large dependencies

### Runtime Performance
- Memoization for expensive calculations
- FlatList for large contact lists
- Image caching for scanned business cards
- Background processing for OCR operations

## 🌐 Internationalization

### Supported Languages
- English (default)
- Spanish (es)
- French (fr)
- German (de)
- Japanese (ja)
- Portuguese (pt)
- Chinese Simplified (zh-CN)

### Implementation
```typescript
import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';

const i18n = new I18n({
  en: require('./locales/en.json'),
  es: require('./locales/es.json'),
  // ... other languages
});

i18n.locale = Localization.locale;
```

## 🔧 Troubleshooting

### Common Issues

**Camera not working**
- Check permissions in app.json
- Verify camera access in device settings
- Test on physical device (camera doesn't work in simulator)

**Build failures**
- Clear Expo cache: `expo r -c`
- Update Expo CLI: `npm install -g expo-cli@latest`
- Check EAS Build status: `eas build:list`

**Performance issues**
- Enable Flipper debugging
- Use React DevTools for component analysis
- Monitor memory usage with Xcode Instruments

## 📞 Support

### Enterprise Support
- **Email**: enterprise@bizcardreader.com
- **Slack**: #enterprise-support
- **Phone**: 1-800-BIZCARD (24/7)

### Developer Resources
- **Documentation**: https://docs.bizcardreader.com
- **API Reference**: https://api.bizcardreader.com/docs
- **GitHub Issues**: https://github.com/bizcardreader/mobile/issues

## 📄 License

Enterprise License - See LICENSE.md for details.

---

**BizCard Reader Enterprise Mobile App v1.0.0**  
Built with ❤️ using React Native + Expo 