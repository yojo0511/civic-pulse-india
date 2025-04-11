
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Camera, MapPin, Upload } from 'lucide-react';
import { createComplaint } from '@/lib/complaint-service';
import { useAuth } from '@/contexts/AuthContext';

const ComplaintForm: React.FC<{ onSuccess?: () => void }> = ({ onSuccess }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  
  const handleLocationDetect = () => {
    // In a real app, this would use the Geolocation API
    // For demo purposes, we'll just set a mock location
    toast({
      title: "Location detected",
      description: "Location has been automatically detected."
    });
    setLocation('Gandhi Nagar, 5th Cross Road');
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
        <Label>Upload Images</Label>
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
            </div>
          ))}
        </div>
      )}
      
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Submitting...' : 'Submit Complaint'}
      </Button>
    </form>
  );
};

export default ComplaintForm;
