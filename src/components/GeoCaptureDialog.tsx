
import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Camera, MapPin, RefreshCw, X, Info, CameraOff } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { reverseGeocode } from '@/lib/utils';

interface GeoCaptureDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageUrl: string, location: {
    lat: number, 
    lng: number, 
    address: string,
    area?: string,
    street?: string,
    district?: string
  } | null) => void;
}

interface LocationDetails {
  lat: number;
  lng: number;
  fullAddress: string;
  area: string;
  street: string;
  district: string;
}

const GeoCaptureDialog: React.FC<GeoCaptureDialogProps> = ({ isOpen, onClose, onCapture }) => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<LocationDetails | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [useFallbackMode, setUseFallbackMode] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  
  // Clean up function to stop camera when unmounting
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);
  
  // Get location and initialize camera when dialog opens
  useEffect(() => {
    if (isOpen) {
      getLocation();
      if (!useFallbackMode) {
        initializeCamera();
      }
    }
  }, [isOpen, useFallbackMode]);
  
  // Initialize or re-initialize camera when facing mode changes
  useEffect(() => {
    if (isOpen && !useFallbackMode) {
      initializeCamera();
    }
  }, [facingMode, isOpen, useFallbackMode]);
  
  const getLocation = async () => {
    if (!navigator.geolocation) {
      toast({
        variant: "destructive",
        title: "Geolocation not supported",
        description: "Your browser doesn't support geolocation."
      });
      return;
    }
    
    setLocationLoading(true);
    
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      });
      
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      
      console.log("Location captured:", lat, lng);
      
      // Get detailed address information using the actual coordinates
      try {
        const addressDetails = await reverseGeocode(lat, lng);
        
        setCurrentLocation({
          lat,
          lng,
          ...addressDetails
        });
        
        toast({
          title: "Location captured",
          description: addressDetails.fullAddress || `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`
        });
      } catch (error) {
        console.error("Geocoding error:", error);
        // Still set location with coordinates even if geocoding fails
        setCurrentLocation({
          lat,
          lng,
          fullAddress: `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`,
          area: 'Unknown Area',
          street: 'Unknown Street',
          district: 'Unknown District'
        });
        
        toast({
          title: "Location captured",
          description: `Coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}`
        });
      }
    } catch (error) {
      console.error('Geolocation error:', error);
      toast({
        variant: "destructive",
        title: "Location error",
        description: "Could not capture your location. Please check your device permissions."
      });
      
      // Use fallback mock location for testing
      setCurrentLocation({
        lat: 28.6139,
        lng: 77.2090,
        fullAddress: "New Delhi, India (Demo)",
        area: "New Delhi",
        street: "Parliament Street",
        district: "Central District"
      });
    } finally {
      setLocationLoading(false);
    }
  };
  
  const initializeCamera = async () => {
    try {
      setCameraLoading(true);
      setCameraError(null);
      
      // First stop any existing stream
      stopCamera();
      
      console.log("Initializing camera with facing mode:", facingMode);
      
      // Try to get the requested camera
      const constraints = {
        video: { 
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play().catch(err => {
              console.error("Error playing video:", err);
              setCameraError("Error starting video stream");
              setUseFallbackMode(true);
            });
          }
        };
        setCameraStream(stream);
        console.log("Camera initialized successfully");
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setCameraError(`Could not access ${facingMode === 'user' ? 'front' : 'back'} camera. Make sure you've granted camera permissions.`);
      setUseFallbackMode(true);
      toast({
        variant: "destructive",
        title: "Camera error",
        description: "Could not access your camera. Using fallback mode."
      });
    } finally {
      setCameraLoading(false);
    }
  };
  
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
      console.log("Camera stopped");
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };
  
  const switchCamera = () => {
    if (useFallbackMode) return;
    setFacingMode(prevMode => prevMode === 'user' ? 'environment' : 'user');
    console.log("Switching camera to:", facingMode === 'user' ? 'environment' : 'user');
  };
  
  const captureImage = () => {
    if (useFallbackMode) {
      // In fallback mode, use a placeholder image
      const placeholderImages = [
        '/placeholder.svg',
        'https://images.unsplash.com/photo-1649972904349-6e44c42644a7',
        'https://images.unsplash.com/photo-1518770660439-4636190af475',
        'https://images.unsplash.com/photo-1500673922987-e212871fec22'
      ];
      
      const randomPlaceholder = placeholderImages[Math.floor(Math.random() * placeholderImages.length)];
      setCapturedImage(randomPlaceholder);
      
      toast({
        title: "Image captured (fallback)",
        description: "Using placeholder image with location data."
      });
      return;
    }
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (video && canvas) {
      try {
        // Make sure video is playing and ready
        if (!video.srcObject) {
          console.error("No video source");
          setUseFallbackMode(true);
          captureImage(); // Retry with fallback
          return;
        }
        
        const context = canvas.getContext('2d');
        if (!context) {
          console.error("Could not get canvas context");
          setUseFallbackMode(true);
          captureImage(); // Retry with fallback
          return;
        }
        
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        
        console.log("Canvas dimensions:", canvas.width, "x", canvas.height);
        console.log("Video dimensions:", video.videoWidth, "x", video.videoHeight);
        
        // Draw the current video frame to the canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Add location data as text overlay
        if (currentLocation) {
          context.fillStyle = 'rgba(0, 0, 0, 0.7)';
          context.fillRect(10, canvas.height - 90, 300, 80);
          context.fillStyle = 'white';
          context.font = '14px Arial';
          
          // Display detailed address information
          context.fillText(
            `Area: ${currentLocation.area || 'Unknown'}`,
            15,
            canvas.height - 65
          );
          context.fillText(
            `Street: ${currentLocation.street || 'Unknown'}`,
            15,
            canvas.height - 45
          );
          context.fillText(
            `District: ${currentLocation.district || 'Unknown'}`,
            15,
            canvas.height - 25
          );
        }
        
        // Get the image data URL
        try {
          const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
          setCapturedImage(imageDataUrl);
          console.log("Image captured successfully");
          
          toast({
            title: "Image captured",
            description: "Your image has been captured with location information."
          });
        } catch (err) {
          console.error("Error creating data URL:", err);
          // Fallback for security restrictions or other issues
          setUseFallbackMode(true);
          captureImage(); // Retry with fallback
        }
      } catch (err) {
        console.error("Error capturing image:", err);
        // Fallback for any other errors
        setUseFallbackMode(true);
        captureImage(); // Retry with fallback
      }
    } else {
      console.error("Missing video or canvas ref");
      // Fallback for missing refs
      setUseFallbackMode(true);
      captureImage(); // Retry with fallback
    }
  };
  
  const useGeoCapturedImage = () => {
    if (capturedImage && currentLocation) {
      onCapture(capturedImage, {
        lat: currentLocation.lat,
        lng: currentLocation.lng,
        address: currentLocation.fullAddress,
        area: currentLocation.area,
        street: currentLocation.street,
        district: currentLocation.district
      });
      onClose();
      stopCamera();
    }
  };
  
  const enableFallbackMode = () => {
    stopCamera();
    setUseFallbackMode(true);
    setCameraError(null);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        stopCamera();
        onClose();
      }
    }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Geo Capture Camera</DialogTitle>
          <DialogDescription>
            Capture an image with location data for your complaint
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center gap-4">
          {capturedImage ? (
            <div className="w-full h-64 bg-gray-100 rounded-lg relative overflow-hidden">
              <img 
                src={capturedImage} 
                alt="Captured" 
                className="w-full h-full object-cover" 
              />
              <button 
                className="absolute top-2 right-2 bg-white rounded-full p-1"
                onClick={() => setCapturedImage(null)}
              >
                <X className="h-4 w-4" />
              </button>
              {currentLocation && (
                <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md flex flex-col gap-1 max-w-[90%]">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span className="font-semibold truncate">
                      {currentLocation.area || 'Location Captured'}
                    </span>
                  </div>
                  <span className="text-xs opacity-90 pl-4 truncate">
                    {currentLocation.street || 'Unknown Street'}
                  </span>
                  <span className="text-xs opacity-90 pl-4 truncate">
                    {currentLocation.district || 'Unknown District'}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-64 bg-gray-900 rounded-lg relative overflow-hidden flex items-center justify-center">
              {cameraLoading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                </div>
              ) : useFallbackMode ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800 text-white p-4 text-center">
                  <CameraOff className="h-12 w-12 mb-2 text-red-400" />
                  <p className="font-medium mb-2">Using fallback mode</p>
                  <p className="text-sm text-gray-300 mb-4">
                    Camera access is unavailable. You can still capture location data with a placeholder image.
                  </p>
                  {!currentLocation && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={getLocation} 
                      className="mt-2"
                    >
                      Get Location
                    </Button>
                  )}
                </div>
              ) : cameraError ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800 text-white p-4 text-center">
                  <Info className="h-8 w-8 mb-2 text-red-400" />
                  <p>{cameraError}</p>
                  <div className="flex flex-col gap-2 mt-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={initializeCamera} 
                    >
                      Try Again
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={enableFallbackMode}
                    >
                      Use Fallback Mode
                    </Button>
                  </div>
                </div>
              ) : (
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              )}
              
              {!cameraError && !useFallbackMode && (
                <>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                    onClick={switchCamera}
                    disabled={cameraLoading}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  
                  <div className="absolute top-2 left-2 bg-white/80 text-black text-xs px-2 py-1 rounded-md">
                    {facingMode === 'user' ? 'Front' : 'Back'} Camera
                  </div>
                </>
              )}
              
              {currentLocation && (
                <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md flex flex-col gap-1 max-w-[90%]">
                  {locationLoading ? (
                    <div className="flex items-center gap-1">
                      <div className="animate-spin h-3 w-3 border border-white rounded-full border-t-transparent"></div>
                      <span>Loading address...</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="font-semibold truncate">
                          {currentLocation.area || 'Unknown Area'}
                        </span>
                      </div>
                      <span className="text-xs opacity-90 pl-4 truncate">
                        {currentLocation.street || 'Unknown Street'}
                      </span>
                      <span className="text-xs opacity-90 pl-4 truncate">
                        {currentLocation.district || 'Unknown District'}
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
          
          {/* Hidden canvas for processing the image */}
          <canvas ref={canvasRef} className="hidden" />
          
          {!capturedImage ? (
            <Button 
              onClick={captureImage} 
              className="w-full"
              disabled={cameraLoading || (!useFallbackMode && !!cameraError && !currentLocation)}
            >
              <Camera className="h-4 w-4 mr-2" />
              {useFallbackMode ? "Use Placeholder Image" : "Capture Image"}
            </Button>
          ) : (
            <div className="flex gap-2 w-full">
              <Button 
                variant="outline" 
                onClick={() => setCapturedImage(null)} 
                className="flex-1"
              >
                Retake
              </Button>
              <Button 
                onClick={useGeoCapturedImage} 
                className="flex-1 bg-civic-green hover:bg-civic-green/90"
              >
                Use Image
              </Button>
            </div>
          )}
        </div>
        
        <DialogFooter className="flex justify-between items-center">
          <Button 
            variant="outline" 
            className="bg-red-50 hover:bg-red-100 border-red-200 text-red-700" 
            onClick={() => {
              stopCamera();
              onClose();
            }}
          >
            Cancel
          </Button>
          
          {!capturedImage && !useFallbackMode && (
            <Button
              variant="outline"
              size="sm"
              onClick={enableFallbackMode}
              className="text-xs"
            >
              Having issues? Use fallback mode
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GeoCaptureDialog;
