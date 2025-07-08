import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Camera, CameraType, FlashMode } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, Title, Paragraph } from 'react-native-paper';
import Toast from 'react-native-toast-message';

// Services
import { OCRService } from '../../services/OCRService';
import { ContactService } from '../../services/ContactService';
import { EnterpriseService } from '../../services/EnterpriseService';

// Types
import { BusinessCard, ExtractedContact } from '../../types/contact';

const { width, height } = Dimensions.get('window');

interface ScanScreenProps {
  navigation: any;
}

export default function ScanScreen({ navigation }: ScanScreenProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [type, setType] = useState(CameraType.back);
  const [flashMode, setFlashMode] = useState(FlashMode.off);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastScannedCard, setLastScannedCard] = useState<BusinessCard | null>(null);
  const cameraRef = useRef<Camera>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        setIsProcessing(true);
        
        const photo = await cameraRef.current.takePictureAsync({
          quality: 1,
          base64: true,
          exif: false,
        });

        await processBusinessCard(photo.uri, photo.base64);
      } catch (error) {
        console.error('Error taking picture:', error);
        Toast.show({
          type: 'error',
          text1: 'Camera Error',
          text2: 'Failed to capture image. Please try again.',
        });
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 10],
        quality: 1,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        setIsProcessing(true);
        await processBusinessCard(result.assets[0].uri, result.assets[0].base64);
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Toast.show({
        type: 'error',
        text1: 'Gallery Error',
        text2: 'Failed to select image. Please try again.',
      });
      setIsProcessing(false);
    }
  };

  const processBusinessCard = async (imageUri: string, base64?: string) => {
    try {
      // Check enterprise usage limits
      const usageCheck = await EnterpriseService.checkUsageLimits();
      if (!usageCheck.canProcess) {
        Alert.alert(
          'Usage Limit Reached',
          'You have reached your monthly business card processing limit. Please upgrade your plan or wait until next month.',
          [
            { text: 'Upgrade Plan', onPress: () => navigation.navigate('Billing') },
            { text: 'OK', style: 'cancel' },
          ]
        );
        return;
      }

      // Process with OCR service
      const ocrResult = await OCRService.processBusinessCard(imageUri, base64);
      
      if (ocrResult.success && ocrResult.extractedData) {
        const businessCard: BusinessCard = {
          id: Date.now().toString(),
          imageUri,
          extractedData: ocrResult.extractedData,
          confidence: ocrResult.confidence || 0.8,
          processedAt: new Date(),
          tenantId: await EnterpriseService.getCurrentTenantId(),
        };

        setLastScannedCard(businessCard);

        // Record usage for billing
        await EnterpriseService.recordUsage('cards_processed', 1);

        Toast.show({
          type: 'success',
          text1: 'Card Scanned Successfully',
          text2: `Extracted ${ocrResult.extractedData.name || 'contact information'}`,
        });

        // Navigate to contact details for review
        navigation.navigate('ContactReview', { businessCard });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Processing Failed',
          text2: ocrResult.error || 'Could not extract information from the business card.',
        });
      }
    } catch (error) {
      console.error('Error processing business card:', error);
      Toast.show({
        type: 'error',
        text1: 'Processing Error',
        text2: 'An error occurred while processing the business card.',
      });
    }
  };

  const toggleFlash = () => {
    setFlashMode(flashMode === FlashMode.off ? FlashMode.on : FlashMode.off);
  };

  const flipCamera = () => {
    setType(type === CameraType.back ? CameraType.front : CameraType.back);
  };

  if (hasPermission === null) {
    return (
      <View style={styles.permissionContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.permissionText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.permissionContainer}>
        <Ionicons name="camera-off" size={64} color="#666" />
        <Text style={styles.permissionText}>No access to camera</Text>
        <Button
          mode="contained"
          onPress={() => Camera.requestCameraPermissionsAsync()}
          style={styles.permissionButton}
        >
          Grant Permission
        </Button>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Scan Business Card</Text>
        <TouchableOpacity onPress={toggleFlash} style={styles.headerButton}>
          <Ionicons
            name={flashMode === FlashMode.on ? 'flash' : 'flash-off'}
            size={24}
            color="#007AFF"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.cameraContainer}>
        <Camera
          ref={cameraRef}
          style={styles.camera}
          type={type}
          flashMode={flashMode}
        >
          <View style={styles.overlay}>
            <View style={styles.scanFrame} />
            <Text style={styles.instructionText}>
              Position the business card within the frame
            </Text>
          </View>
        </Camera>
      </View>

      {isProcessing && (
        <View style={styles.processingOverlay}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.processingText}>Processing business card...</Text>
        </View>
      )}

      <View style={styles.controls}>
        <TouchableOpacity onPress={pickImage} style={styles.controlButton}>
          <Ionicons name="images" size={32} color="#007AFF" />
          <Text style={styles.controlButtonText}>Gallery</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={takePicture}
          style={[styles.captureButton, isProcessing && styles.captureButtonDisabled]}
          disabled={isProcessing}
        >
          <View style={styles.captureButtonInner} />
        </TouchableOpacity>

        <TouchableOpacity onPress={flipCamera} style={styles.controlButton}>
          <Ionicons name="camera-reverse" size={32} color="#007AFF" />
          <Text style={styles.controlButtonText}>Flip</Text>
        </TouchableOpacity>
      </View>

      {lastScannedCard && (
        <Card style={styles.lastScannedCard}>
          <Card.Content>
            <Title>Last Scanned</Title>
            <Paragraph>
              {lastScannedCard.extractedData.name || 'Unknown Contact'}
            </Paragraph>
            <Paragraph>
              {lastScannedCard.extractedData.company || 'No Company'}
            </Paragraph>
          </Card.Content>
        </Card>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  headerButton: {
    padding: 5,
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: width * 0.8,
    height: (width * 0.8) * 0.63, // Standard business card ratio
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 10,
    backgroundColor: 'transparent',
  },
  instructionText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  controlButton: {
    alignItems: 'center',
    padding: 10,
  },
  controlButtonText: {
    color: '#007AFF',
    fontSize: 12,
    marginTop: 5,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  processingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 10,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionText: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 20,
    color: '#666',
  },
  permissionButton: {
    marginTop: 20,
  },
  lastScannedCard: {
    margin: 10,
    marginBottom: 20,
  },
}); 