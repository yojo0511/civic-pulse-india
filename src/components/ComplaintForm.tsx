
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Camera, MapPin, Upload, X } from 'lucide-react';
import { createComplaint } from '@/lib/complaint-service';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

const ComplaintForm: React.FC<{ onSuccess?: () => void }> = ({ onSuccess }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  
  // Geo capture states
  const [isGeoCaptureOpen, setIsGeoCaptureOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  
  const handleLocationDetect = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          
          // Convert coordinates to a readable address (in a real app, this would use reverse geocoding)
          const readableLocation = `Location (${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)})`;
          setLocation(readableLocation);
          
          toast({
            title: "Location detected",
            description: `${readableLocation}`
          });
        },
        (error) => {
          console.error("Geolocation error:", error);
          toast({
            variant: "destructive",
            title: "Location error",
            description: "Could not detect your location. Please check your device permissions."
          });
        }
      );
    } else {
      toast({
        variant: "destructive",
        title: "Geolocation not supported",
        description: "Your browser doesn't support geolocation."
      });
    }
  };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // For demo purposes, we're not actually uploading files
    // We'll just use the placeholder image
    if (e.target.files && e.target.files.length > 0) {
      // In a real app, we would upload the file and get the URL
      setImages([...images, '/placeholder.svg']);
      toast({
        title: "Image uploaded",
        description: `${e.target.files.length} image(s) uploaded successfully.`
      });
    }
  };
  
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // For demo purposes, we're not actually uploading files
    if (e.target.files && e.target.files.length > 0) {
      // In a real app, we would upload the file and get the URL
      setVideos([...videos, '/placeholder.svg']);
      toast({
        title: "Video uploaded",
        description: `${e.target.files.length} video(s) uploaded successfully.`
      });
    }
  };
  
  const openGeoCapture = async () => {
    setIsGeoCaptureOpen(true);
    
    // Try to get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          toast({
            title: "Location captured",
            description: `Location: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
          toast({
            variant: "destructive",
            title: "Location error",
            description: "Could not capture your location. Please check your device permissions."
          });
        }
      );
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true,
        audio: false
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraStream(stream);
      }
    } catch (err) {
      console.error("Camera access error:", err);
      toast({
        variant: "destructive",
        title: "Camera error",
        description: "Could not access your camera. Please check your device permissions."
      });
    }
  };
  
  const closeGeoCapture = () => {
    // Stop the camera stream
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setCapturedImage(null);
    setIsGeoCaptureOpen(false);
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
          context.fillRect(10, canvas.height - 40, 300, 30);
          context.fillStyle = 'white';
          context.font = '14px Arial';
          context.fillText(
            `Lat: ${currentLocation.lat.toFixed(4)}, Lng: ${currentLocation.lng.toFixed(4)}`,
            15,
            canvas.height - 20
          );
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
      setImages([...images, capturedImage]);
      
      // If we have location data, update the location field
      if (currentLocation) {
        const readableLocation = `Location (${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)})`;
        setLocation(readableLocation);
      }
      
      closeGeoCapture();
      
      toast({
        title: "Image added",
        description: "Geo-tagged image has been added to your complaint."
      });
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "You must be logged in to submit a complaint."
      });
      return;
    }
    
    if (!title || !description || !location) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please fill in all required fields."
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      await createComplaint({
        title,
        description,
        location,
        userId: user.id,
        userName: user.name,
        images: images.length > 0 ? images : undefined,
        videos: videos.length > 0 ? videos : undefined,
      });
      
      toast({
        title: "Complaint submitted successfully",
        description: "Thank you for reporting this issue.",
      });
      
      // Reset form
      setTitle('');
      setDescription('');
      setLocation('');
      setImages([]);
      setVideos([]);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to submit complaint",
        description: "There was an error submitting your complaint. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Issue Title *</Label>
          <Input
            id="title"
            placeholder="e.g., Garbage not collected"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            placeholder="Please provide details about the issue..."
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="location">Location *</Label>
          <div className="flex gap-2">
            <Input
              id="location"
              placeholder="e.g., Gandhi Nagar, 5th Cross Road"
              className="flex-1"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleLocationDetect}
              title="Detect my location"
            >
              <MapPin className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label>Media Evidence</Label>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={openGeoCapture}
              className="text-xs flex items-center gap-1 bg-civic-blue/10 hover:bg-civic-blue/20 text-civic-blue border-civic-blue/30"
            >
              <Camera className="h-3 w-3" />
              Geo Capture
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border rounded-md p-4 text-center">
              <div className="flex flex-col items-center gap-2">
                <Camera className="h-8 w-8 text-muted-foreground" />
                <div className="text-sm text-muted-foreground">
                  {images.length > 0 ? `${images.length} image(s) uploaded` : 'No images uploaded'}
                </div>
                <Label
                  htmlFor="image-upload"
                  className="cursor-pointer inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Upload Images
                </Label>
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  className="sr-only"
                  onChange={handleImageUpload}
                />
              </div>
            </div>
            
            <div className="border rounded-md p-4 text-center">
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <div className="text-sm text-muted-foreground">
                  {videos.length > 0 ? `${videos.length} video(s) uploaded` : 'No videos uploaded'}
                </div>
                <Label
                  htmlFor="video-upload"
                  className="cursor-pointer inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Upload Videos
                </Label>
                <Input
                  id="video-upload"
                  type="file"
                  accept="video/*"
                  multiple
                  className="sr-only"
                  onChange={handleVideoUpload}
                />
              </div>
            </div>
          </div>
        </div>
        
        {images.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {images.map((image, index) => (
              <div key={`img-${index}`} className="relative w-16 h-16 rounded overflow-hidden">
                <img src={image} alt="Preview" className="object-cover w-full h-full" />
                <button
                  type="button"
                  className="absolute top-0 right-0 bg-black/50 text-white p-0.5 rounded-bl"
                  onClick={() => setImages(images.filter((_, i) => i !== index))}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Submitting...' : 'Submit Complaint'}
        </Button>
      </form>

      {/* Geo Capture Dialog */}
      <Dialog open={isGeoCaptureOpen} onOpenChange={(open) => !open && closeGeoCapture()}>
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
                  className="w-full h-full object-contain" 
                />
                <button 
                  className="absolute top-2 right-2 bg-white rounded-full p-1"
                  onClick={() => setCapturedImage(null)}
                >
                  <X className="h-4 w-4" />
                </button>
                {currentLocation && (
                  <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    <span>
                      {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-64 bg-gray-900 rounded-lg relative overflow-hidden">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline
                  className="w-full h-full object-cover"
                />
                {currentLocation && (
                  <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    <span>
                      {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
                    </span>
                  </div>
                )}
              </div>
            )}
            
            {/* Hidden canvas for processing the image */}
            <canvas ref={canvasRef} className="hidden" />
            
            {!capturedImage ? (
              <Button 
                onClick={captureImage} 
                className="w-full bg-civic-green hover:bg-civic-green/90"
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
            <Button variant="outline" onClick={closeGeoCapture}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ComplaintForm;
