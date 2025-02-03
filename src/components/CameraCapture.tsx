import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Camera, X } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onClose: () => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string>('');
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  const stopCamera = useCallback(() => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
          try {
            track.stop();
          } catch (e) {
            console.error('Error stopping track:', e);
          }
        });
        streamRef.current = null;
      }
    } catch (e) {
      console.error('Error in stopCamera:', e);
    } finally {
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setIsCameraReady(false);
    }
  }, []);

  const startCamera = useCallback(async () => {
    try {
      setIsInitializing(true);
      setError('');
      stopCamera();

      // Check if getUserMedia is supported
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera access is not supported in your browser');
      }

      // First try to enumerate devices to check camera availability
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasCamera = devices.some(device => device.kind === 'videoinput');
      
      if (!hasCamera) {
        throw new Error('No camera device found on your system');
      }

      // Request camera permissions with a timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Camera initialization timed out')), 10000);
      });

      const constraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      };

      const mediaStream = await Promise.race([
        navigator.mediaDevices.getUserMedia(constraints),
        timeoutPromise
      ]) as MediaStream;

      if (!videoRef.current) {
        throw new Error('Video element not found');
      }

      // Store stream in ref to prevent state update issues
      streamRef.current = mediaStream;
      videoRef.current.srcObject = mediaStream;

      // Wait for video to be ready with timeout
      await Promise.race([
        new Promise<void>((resolve) => {
          if (!videoRef.current) return;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current!.play()
              .then(() => resolve())
              .catch(e => {
                console.error('Error playing video:', e);
                throw new Error('Failed to start video stream');
              });
          };
        }),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Video stream initialization timed out')), 5000)
        )
      ]);

      setIsCameraReady(true);
      setError('');
    } catch (err) {
      let errorMessage = 'Unable to access camera. ';
      
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          errorMessage = 'Camera access denied. Please grant camera permissions in your browser settings and try again.';
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          errorMessage = 'No camera device found. Please ensure your camera is properly connected.';
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          errorMessage = 'Camera is in use by another application. Please close other apps using the camera and try again.';
        } else if (err.message.includes('timed out')) {
          errorMessage = 'Camera initialization timed out. Please check your camera connection and try again.';
        } else {
          errorMessage += err.message;
        }
      }

      setError(errorMessage);
      console.error('Camera access error:', err);
      stopCamera();
    } finally {
      setIsInitializing(false);
    }
  }, [stopCamera]);

  const handleClose = useCallback(() => {
    stopCamera();
    onClose();
  }, [stopCamera, onClose]);

  const captureImage = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !isCameraReady) {
      setError('Camera is not ready. Please wait or try again.');
      return;
    }

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas size to match video dimensions
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      // Draw the video frame to the canvas
      ctx.drawImage(video, 0, 0);
      
      // Convert to blob with high quality
      canvas.toBlob((blob) => {
        if (!blob) {
          setError('Failed to capture image. Please try again.');
          return;
        }

        const file = new File([blob], 'business-card.jpg', { type: 'image/jpeg' });
        stopCamera();
        onCapture(file);
        handleClose();
      }, 'image/jpeg', 0.95);
    } catch (err) {
      setError('Failed to capture image. Please try again.');
      console.error('Capture error:', err);
    }
  }, [isCameraReady, onCapture, handleClose, stopCamera]);

  useEffect(() => {
    let mounted = true;

    const initCamera = async () => {
      if (mounted) {
        try {
          await startCamera();
        } catch (err) {
          console.error('Camera initialization error:', err);
        }
      }
    };

    initCamera();

    return () => {
      mounted = false;
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  const handleVideoLoad = useCallback(() => {
    setIsCameraReady(true);
    setIsInitializing(false);
  }, []);

  const handleRetry = useCallback(() => {
    setError('');
    setIsInitializing(true);
    startCamera();
  }, [startCamera]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium">Capture Business Card</h3>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close camera"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-4">
          {error ? (
            <div className="bg-red-50 text-red-700 p-4 rounded-md flex flex-col items-center">
              <p className="mb-4 text-center">{error}</p>
              <button
                onClick={handleRetry}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Retry Camera Access
              </button>
            </div>
          ) : (
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              {isInitializing && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-90">
                  <div className="text-white text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                    <div>Initializing camera...</div>
                    <div className="text-sm text-gray-300 mt-2">Please allow camera access when prompted</div>
                  </div>
                </div>
              )}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-contain"
                onLoadedMetadata={handleVideoLoad}
              />
              <canvas ref={canvasRef} className="hidden" />
            </div>
          )}
          
          <div className="mt-4 flex justify-center">
            <button
              onClick={captureImage}
              disabled={!isCameraReady || isInitializing}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <Camera className="w-5 h-5 mr-2" />
              {isInitializing ? 'Initializing...' : 'Capture Image'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CameraCapture;