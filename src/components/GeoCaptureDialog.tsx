
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
import { Camera, MapPin, RefreshCw, X, Info } from 'lucide-react';
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  
  // Get location and initialize camera when dialog opens
  useEffect(() => {
    if (isOpen) {
      getLocation();
      initializeCamera();
      
      // Clean up when component unmounts
      return () => {
        stopCamera();
      };
    }
  }, [isOpen]);
  
  // Initialize or re-initialize camera when facing mode changes
  useEffect(() => {
    if (isOpen) {
      initializeCamera();
    }
  }, [facingMode, isOpen]);
  
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
      
      console.log("Actual GPS coordinates:", lat, lng);
      
      // Get detailed address information using the actual coordinates
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
      console.error('Geolocation error:', error);
      toast({
        variant: "destructive",
        title: "Location error",
        description: "Could not capture your location. Please check your device permissions."
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
      
      // Try to get the requested camera
      const constraints = {
        video: { facingMode },
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
            });
          }
        };
        setCameraStream(stream);
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setCameraError(`Could not access ${facingMode === 'user' ? 'front' : 'back'} camera. Make sure you've granted camera permissions.`);
      toast({
        variant: "destructive",
        title: "Camera error",
        description: "Could not access your camera. Please check your device permissions."
      });
    } finally {
      setCameraLoading(false);
    }
  };
  
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };
  
  const switchCamera = () => {
    setFacingMode(prevMode => prevMode === 'user' ? 'environment' : 'user');
  };
  
  const captureImage = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (video && canvas && video.srcObject) {
      const context = canvas.getContext('2d');
      if (context) {
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth || 320;
        canvas.height = video.videoHeight || 240;
        
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
            `Area: ${currentLocation.area}`,
            15,
            canvas.height - 65
          );
          context.fillText(
            `Street: ${currentLocation.street}`,
            15,
            canvas.height - 45
          );
          context.fillText(
            `District: ${currentLocation.district}`,
            15,
            canvas.height - 25
          );
        }
        
        // Get the image data URL
        try {
          const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
          setCapturedImage(imageDataUrl);
          
          toast({
            title: "Image captured",
            description: "Your image has been captured with location information."
          });
        } catch (err) {
          console.error("Error creating data URL:", err);
          // Fallback for demo
          setCapturedImage('/placeholder.svg');
          toast({
            title: "Image captured (demo)",
            description: "Using placeholder image due to canvas security restrictions."
          });
        }
      }
    } else {
      // Fallback for demo
      setCapturedImage('/placeholder.svg');
      toast({
        title: "Image captured (demo)",
        description: "This is a demo image with simulated geographic information."
      });
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
                    {currentLocation.street}
                  </span>
                  <span className="text-xs opacity-90 pl-4 truncate">
                    {currentLocation.district}
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
              ) : cameraError ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800 text-white p-4 text-center">
                  <Info className="h-8 w-8 mb-2 text-red-400" />
                  <p>{cameraError}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={initializeCamera} 
                    className="mt-4"
                  >
                    Try Again
                  </Button>
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
              
              {!cameraError && (
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
              
              {currentLocation && !cameraError && (
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
                          {currentLocation.area || 'Area'}
                        </span>
                      </div>
                      <span className="text-xs opacity-90 pl-4 truncate">
                        {currentLocation.street || 'Street'}
                      </span>
                      <span className="text-xs opacity-90 pl-4 truncate">
                        {currentLocation.district || 'District'}
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
              disabled={cameraLoading || !!cameraError || !currentLocation}
            >
              <Camera className="h-4 w-4 mr-2" />
              Capture Image
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
        
        <DialogFooter>
          <Button variant="outline" onClick={() => {
            stopCamera();
            onClose();
          }}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GeoCaptureDialog;
