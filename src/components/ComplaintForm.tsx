import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Camera, MapPin, Upload, X } from 'lucide-react';
import { createComplaint } from '@/lib/complaint-service';
import { useAuth } from '@/contexts/AuthContext';
import GeoCaptureDialog from './GeoCaptureDialog';

const ComplaintForm: React.FC<{ onSuccess?: () => void }> = ({ onSuccess }) => {
  const { user, isMobileVerified } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  
  // Geo capture states
  const [isGeoCaptureOpen, setIsGeoCaptureOpen] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ 
    lat: number; 
    lng: number;
    address?: string;
    area?: string;
    street?: string;
    district?: string;
  } | null>(null);
  
  const handleLocationDetect = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          
          setCurrentLocation(coords);
          
          try {
            // Simulate reverse geocoding (in a real app, call a geocoding API)
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Generate a simulated address based on coordinates
            let address = '';
            
            // Generate different sample addresses based on quadrants
            if (coords.lat > 0 && coords.lng > 0) {
              address = 'Gandhi Nagar, North East Street, Delhi District';
            } else if (coords.lat > 0 && coords.lng < 0) {
              address = 'Rajiv Chowk, North West Road, Central District';
            } else if (coords.lat < 0 && coords.lng > 0) {
              address = 'Patel Road, South East Colony, South District';
            } else {
              address = 'Nehru Market, South West Area, West District';
            }
            
            setLocation(address);
            
            toast({
              title: "Location detected",
              description: address
            });
          } catch (error) {
            console.error("Geocoding error:", error);
            // Fallback to coordinates if geocoding fails
            const readableLocation = `Location (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`;
            setLocation(readableLocation);
            
            toast({
              title: "Location detected",
              description: `${readableLocation}`
            });
          }
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
  
  const openGeoCapture = () => {
    if (!isMobileVerified) {
      toast({
        variant: "destructive",
        title: "Mobile verification required",
        description: "Please verify your mobile number before using the camera."
      });
      return;
    }
    
    setIsGeoCaptureOpen(true);
  };
  
  const handleGeoCaptured = (imageUrl: string, location: {
    lat: number, 
    lng: number, 
    address: string,
    area?: string,
    street?: string,
    district?: string
  } | null) => {
    setImages([...images, imageUrl]);
    
    // If we have location data, update the location field
    if (location) {
      if (location.address) {
        setLocation(location.address);
      } else {
        const readableLocation = `Location (${location.lat.toFixed(4)}, ${location.lng.toFixed(4)})`;
        setLocation(readableLocation);
      }
      setCurrentLocation(location);
    }
    
    toast({
      title: "Image added",
      description: "Geo-tagged image has been added to your complaint."
    });
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
        geoLocation: currentLocation ? {
          lat: currentLocation.lat,
          lng: currentLocation.lng,
          address: currentLocation.address,
          area: currentLocation.area,
          street: currentLocation.street,
          district: currentLocation.district
        } : undefined
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
              className={`text-xs flex items-center gap-1 ${isMobileVerified 
                ? "bg-civic-blue/10 hover:bg-civic-blue/20 text-civic-blue border-civic-blue/30" 
                : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
              disabled={!isMobileVerified}
            >
              <Camera className="h-3 w-3" />
              Geo Capture
            </Button>
          </div>
          
          {!isMobileVerified && (
            <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded-md border border-amber-200">
              ⚠️ Mobile verification required to use camera features
            </p>
          )}
          
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
      <GeoCaptureDialog 
        isOpen={isGeoCaptureOpen} 
        onClose={() => setIsGeoCaptureOpen(false)} 
        onCapture={handleGeoCaptured}
      />
    </>
  );
};

export default ComplaintForm;
