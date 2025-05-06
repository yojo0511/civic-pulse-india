
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

interface GeoCaptureDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageUrl: string, location: {lat: number, lng: number, address: string} | null) => void;
}

const GeoCaptureDialog: React.FC<GeoCaptureDialogProps> = ({ isOpen, onClose, onCapture }) => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number, address: string} | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [addressResult, setAddressResult] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  // Get location and initialize camera when dialog opens
  useEffect(() => {
    if (isOpen) {
      getLocation();
      initializeCamera();
    } else {
      // Clean up when dialog closes
      stopCamera();
    }
  }, [isOpen, facingMode]);
  
  const reverseGeocode = async (lat: number, lng: number) => {
    setLocationLoading(true);
    try {
      // This would be a real API call in production
      // For demo purposes we're simulating the response with a timeout
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Simulate reverse geocoding response based on coordinates
      // In a real app, this would call a service like Google Maps, Mapbox, or OpenStreetMap
      let address = '';
      
      // Generate different sample addresses based on quadrants
      if (lat > 0 && lng > 0) {
        address = 'Gandhi Nagar, North East Street, Delhi District';
      } else if (lat > 0 && lng < 0) {
        address = 'Rajiv Chowk, North West Road, Central District';
      } else if (lat < 0 && lng > 0) {
        address = 'Patel Road, South East Colony, South District';
      } else {
        address = 'Nehru Market, South West Area, West District';
      }
      
      setAddressResult(address);
      return address;
    } catch (error) {
      console.error('Geocoding error:', error);
      toast({
        variant: "destructive",
        title: "Address lookup failed",
        description: "Could not retrieve address information"
      });
      return '';
    } finally {
      setLocationLoading(false);
    }
  };
  
  const getLocation = () => {
    if (navigator.geolocation) {
      setLocationLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            address: ''
          };
          
          // Get human-readable address
          const address = await reverseGeocode(coords.lat, coords.lng);
          coords.address = address;
          
          setCurrentLocation(coords);
          toast({
            title: "Location captured",
            description: address || `Lat: ${coords.lat.toFixed(4)}, Lng: ${coords.lng.toFixed(4)}`
          });
          setLocationLoading(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          toast({
            variant: "destructive",
            title: "Location error",
            description: "Could not capture your location. Please check your device permissions."
          });
          setLocationLoading(false);
        }
      );
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
        video: { facingMode: facingMode },
        audio: false
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraStream(stream);
      }
      setCameraLoading(false);
    } catch (err) {
      console.error("Camera access error:", err);
      setCameraError(`Could not access ${facingMode === 'user' ? 'front' : 'back'} camera`);
      toast({
        variant: "destructive",
        title: "Camera error",
        description: "Could not access your camera. Please check your device permissions."
      });
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
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw the current video frame to the canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Add location data as text overlay
        if (currentLocation) {
          context.fillStyle = 'rgba(0, 0, 0, 0.5)';
          context.fillRect(10, canvas.height - 60, 300, 50);
          context.fillStyle = 'white';
          context.font = '14px Arial';
          
          // Display address if available, otherwise coordinates
          if (currentLocation.address) {
            context.fillText(
              currentLocation.address,
              15,
              canvas.height - 40
            );
            context.fillText(
              `Lat: ${currentLocation.lat.toFixed(4)}, Lng: ${currentLocation.lng.toFixed(4)}`,
              15,
              canvas.height - 20
            );
          } else {
            context.fillText(
              `Lat: ${currentLocation.lat.toFixed(4)}, Lng: ${currentLocation.lng.toFixed(4)}`,
              15,
              canvas.height - 30
            );
          }
        }
        
        // Get the image data URL
        const imageDataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(imageDataUrl);
        
        toast({
          title: "Image captured",
          description: "Your image has been captured with geographic information."
        });
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
    if (capturedImage) {
      onCapture(capturedImage, currentLocation);
      onClose();
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-md bg-gradient-to-b from-white to-blue-50">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-civic-blue to-civic-green bg-clip-text text-transparent">
            Geo Capture Camera
          </DialogTitle>
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
                className="w-full h-full object-contain" 
              />
              <button 
                className="absolute top-2 right-2 bg-white rounded-full p-1"
                onClick={() => setCapturedImage(null)}
              >
                <X className="h-4 w-4" />
              </button>
              {currentLocation && (
                <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md flex flex-col">
                  <div className="flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    <span className="font-semibold">
                      {currentLocation.address || 'Location Captured'}
                    </span>
                  </div>
                  <span className="text-xs opacity-75 pl-4">
                    {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-64 bg-gray-900 rounded-lg relative overflow-hidden">
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
                  className="w-full h-full object-cover"
                />
              )}
              
              {currentLocation && !cameraError && (
                <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md flex flex-col">
                  <div className="flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    <span className="font-semibold">
                      {locationLoading ? 'Loading address...' : (currentLocation.address || 'Location Captured')}
                    </span>
                  </div>
                  <span className="text-xs opacity-75 pl-4">
                    {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
                  </span>
                </div>
              )}
              
              <Button 
                variant="outline" 
                size="icon" 
                className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                onClick={switchCamera}
                disabled={cameraLoading || !!cameraError}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              
              <div className="absolute top-2 left-2 bg-white/80 text-black text-xs px-2 py-1 rounded-md">
                {facingMode === 'user' ? 'Front' : 'Back'} Camera
              </div>
            </div>
          )}
          
          {/* Hidden canvas for processing the image */}
          <canvas ref={canvasRef} className="hidden" />
          
          {!capturedImage ? (
            <Button 
              onClick={captureImage} 
              className="w-full bg-gradient-to-r from-civic-blue to-civic-green hover:opacity-90"
              disabled={cameraLoading || !!cameraError}
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
                className="flex-1 bg-gradient-to-r from-civic-blue to-civic-green hover:opacity-90"
              >
                Use Image
              </Button>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GeoCaptureDialog;
