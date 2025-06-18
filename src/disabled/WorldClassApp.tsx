/**
 * 🌟 World-Class Business Card Intelligence Application
 * 
 * Features:
 * - Modern, responsive design with Framer Motion animations
 * - Comprehensive accessibility support
 * - Real-time processing with optimistic updates
 * - Advanced error handling and loading states
 * - Multi-format export capabilities
 * - AI-powered business intelligence
 * - Enterprise-ready architecture
 */

import React, { useState, useEffect, Suspense, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import { 
  CameraIcon, 
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
  DocumentTextIcon, 
  ChartBarIcon, 
  CogIcon,
  CloudArrowUpIcon,
  SparklesIcon,
  UserGroupIcon,
  DocumentArrowDownIcon,
  Camera,
  Upload,
  Download,
  FileText,
  Settings,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { Camera as CameraIconLucide } from 'lucide-react';

// Component imports
import BusinessCardScanner from './BusinessCardScanner';
import BusinessCardDisplay from './BusinessCardDisplay';
import PracticalCRMDisplay from './PracticalCRMDisplay';
import CRMIntelligenceDisplay from './CRMIntelligenceDisplay';
import { WorldClassInterfaceOrchestrator } from './WorldClassInterfaceOrchestrator';
import { BusinessCardData } from '../types/business-card';
import { CameraCapture } from './CameraCapture';
import { Settings as SettingsComponent } from './Settings';
import OCRScanner from './OCRScanner';

// Service imports  
import { businessCardExtractor } from '../services/businessCardExtractor';
import { practicalCRMAnalysis } from '../services/practicalCRM';
import { generateCRMIntelligence } from '../services/crmIntelligence';
import { exportToPDF, exportToCSV, exportToVCard } from '../utils/exportUtils';

// Removed disabled agent imports
// import { uiuxExpertAgent } from '../agents/UI-UX-Expert.agent';
// import { frontendExpertAgent } from '../agents/Frontend-Expert.agent';
// import { backendExpertAgent } from '../agents/Backend-Expert.agent';

interface WorldClassAppProps {
  title?: string;
}

type ViewMode = 'scanner' | 'display' | 'crm' | 'intelligence' | 'camera' | 'settings' | 'orchestrator';
type ExportFormat = 'json' | 'csv' | 'vcard' | 'pdf';

const WorldClassApp: React.FC<WorldClassAppProps> = ({ title = 'World-Class Business Card Reader' }) => {
  // State management
  const [currentView, setCurrentView] = useState<ViewMode>('scanner');
  const [businessCardData, setBusinessCardData] = useState<BusinessCardData | null>(null);
  const [crmData, setCrmData] = useState<any>(null);
  const [intelligenceData, setIntelligenceData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  
  // Refs for advanced features
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  // Initialize UI/UX recommendations
  useEffect(() => {
    const initializeApp = async () => {
      try {
        const recommendations = await uiuxExpertAgent.generateUIRecommendations({
          userType: 'business',
          deviceType: 'desktop',
          businessCard: businessCardData || undefined
        });

        const metrics = frontendExpertAgent.generateFrontendMetrics();

        setBusinessCardData(prev => ({
          ...prev,
          uiRecommendations: recommendations,
          performanceMetrics: metrics
        }));

        toast.success('🎨 World-class interface initialized!', {
          icon: '✨',
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
        });
      } catch (error) {
        console.error('Failed to initialize app:', error);
        toast.error('Failed to initialize advanced features');
      }
    };

    initializeApp();
  }, []);

  // Business card processing handler with proper typing
  const onBusinessCardExtracted = useCallback(async (data: BusinessCardData) => {
    setLoading(true);
    try {
      setBusinessCardData(data);
      
      // Generate CRM data
      const crm = await practicalCRMAnalysis(data);
      setCrmData(crm);
      
      // Generate intelligence
      const intelligence = await generateCRMIntelligence(data);
      setIntelligenceData(intelligence);
      
      setCurrentView('display');
    } catch (err) {
      setError('Failed to process business card data');
      console.error('Processing error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleFileUpload = useCallback((files: FileList) => {
    const file = files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const imageData = e.target?.result as string;
          const extracted = await businessCardExtractor(imageData);
          onBusinessCardExtracted(extracted);
        } catch (err) {
          setError('Failed to extract data from image');
          console.error('Extraction error:', err);
        }
      };
      reader.readAsDataURL(file);
    }
  }, [onBusinessCardExtracted]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    if (e.dataTransfer.files) {
      handleFileUpload(e.dataTransfer.files);
    }
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  const exportData = useCallback(async (format: ExportFormat) => {
    if (!businessCardData) return;
    
    try {
      switch (format) {
        case 'json':
          const jsonBlob = new Blob([JSON.stringify(businessCardData, null, 2)], {
            type: 'application/json'
          });
          const jsonUrl = URL.createObjectURL(jsonBlob);
          const jsonLink = document.createElement('a');
          jsonLink.href = jsonUrl;
          jsonLink.download = 'business-card.json';
          jsonLink.click();
          break;
        case 'csv':
          await exportToCSV(businessCardData);
          break;
        case 'vcard':
          await exportToVCard(businessCardData);
          break;
        case 'pdf':
          await exportToPDF(businessCardData);
          break;
      }
    } catch (err) {
      setError('Failed to export data');
      console.error('Export error:', err);
    }
  }, [businessCardData]);

  const resetApp = useCallback(() => {
    setBusinessCardData(null);
    setCrmData(null);
    setIntelligenceData(null);
    setError('');
    setCurrentView('scanner');
  }, []);

  const renderCurrentView = () => {
    switch (currentView) {
      case 'scanner':
        return (
          <div className="w-full max-w-4xl mx-auto">
            <div 
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <OCRScanner
                onImageCapture={(imageData) => {
                  // Process captured image
                  businessCardExtractor(imageData)
                    .then(onBusinessCardExtracted)
                    .catch(err => setError('Failed to process captured image'));
                }}
                isProcessing={loading}
              />
            </div>
          </div>
        );
        
      case 'display':
        return businessCardData ? (
          <BusinessCardDisplay 
            data={businessCardData} 
            onEdit={() => setCurrentView('scanner')}
            onExport={exportData}
            onSave={() => console.log('Save functionality would go here')}
          />
        ) : null;
        
      case 'crm':
        return crmData ? (
          <PracticalCRMDisplay data={crmData} />
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No CRM data available. Please scan a business card first.</p>
          </div>
        );
        
      case 'intelligence':
        return intelligenceData ? (
          <CRMIntelligenceDisplay data={intelligenceData} />
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No intelligence data available. Please scan a business card first.</p>
          </div>
        );
        
      case 'camera':
        return (
          <CameraCapture 
            onCapture={(imageData) => {
              // Process captured image
              businessCardExtractor(imageData)
                .then(onBusinessCardExtracted)
                .catch(err => setError('Failed to process captured image'));
            }}
            isProcessing={loading}
          />
        );
        
      case 'settings':
        return <SettingsComponent />;
        
      case 'orchestrator':
        return <WorldClassInterfaceOrchestrator />;
        
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
            borderRadius: '10px',
            border: '1px solid #4F46E5',
            boxShadow: '0 10px 40px rgba(79, 70, 229, 0.1)'
          }
        }}
      />

      {/* Enhanced Navigation Header */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-gray-200/50 sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo and Title */}
            <motion.div 
              className="flex items-center space-x-4"
              whileHover={{ scale: 1.02 }}
            >
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <SparklesIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
                  {title}
                </h1>
                <p className="text-sm text-gray-600">AI-Powered Professional Networking</p>
              </div>
            </motion.div>

            {/* Advanced Tab Navigation */}
            <nav className="flex space-x-1 bg-gray-100 rounded-xl p-1">
              {[
                { id: 'scanner', icon: CameraIcon, label: 'Scanner', description: 'Scan & Extract' },
                { id: 'display', icon: FileText, label: 'Display', description: 'View Business Card' },
                { id: 'crm', icon: UserGroupIcon, label: 'CRM', description: 'Relationship Intelligence' },
                { id: 'intelligence', icon: ChartBarIcon, label: 'Intelligence', description: 'AI Insights' },
                { id: 'camera', icon: CameraIconLucide, label: 'Camera', description: 'Scan with Camera' },
                { id: 'settings', icon: CogIcon, label: 'Settings', description: 'Preferences & Config' },
                { id: 'orchestrator', icon: SparklesIcon, label: 'Orchestrator', description: 'World-Class Interface System' }
              ].map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setCurrentView(tab.id as ViewMode)}
                  className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    currentView === tab.id
                      ? 'bg-white text-blue-600 shadow-md'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title={tab.description}
                >
                  <div className="flex items-center space-x-2">
                    <tab.icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </div>
                  {currentView === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-blue-600/10 rounded-lg -z-10"
                    />
                  )}
                </motion.button>
              ))}
            </nav>

            {/* Status Indicator */}
            {businessCardData && (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center space-x-2 text-sm text-gray-600 bg-green-50 px-3 py-2 rounded-full border border-green-200"
              >
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>Card: {businessCardData.name || 'Unknown'}</span>
              </motion.div>
            )}
          </div>
        </div>
      </motion.header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <ShieldCheckIcon className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => setError('')}
                    className="text-sm font-medium text-red-800 hover:text-red-600"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <div className="ml-3 text-sm text-blue-700">
                Processing your business card...
              </div>
            </div>
          </div>
        )}

        {renderCurrentView()}
      </main>

      {/* Global Processing Overlay */}
      <AnimatePresence>
        {loading && (
          <ProcessingOverlay />
        )}
      </AnimatePresence>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
        className="hidden"
      />
    </div>
  );
};

// Supporting Components
const LoadingSkeleton: React.FC = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    <div className="h-64 bg-gray-200 rounded"></div>
  </div>
);

const ProcessingOverlay: React.FC = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
  >
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl"
    >
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
          <CloudArrowUpIcon className="w-8 h-8 text-blue-600 animate-bounce" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Processing Business Card</h3>
        <p className="text-sm text-gray-600 mb-6">Please wait while we process your business card...</p>
      </div>
    </motion.div>
  </motion.div>
);

export default WorldClassApp; 