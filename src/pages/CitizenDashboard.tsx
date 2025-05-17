
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter 
} from '@/components/ui/dialog';
import { PlusCircle, Search, MapPin, Camera, X, Check, Info } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ComplaintForm from '@/components/ComplaintForm';
import ComplaintCard from '@/components/ComplaintCard';
import ComplaintDetails from '@/components/ComplaintDetails';
import { useAuth } from '@/contexts/AuthContext';
import { getUserComplaints } from '@/lib/complaint-service';
import { Complaint } from '@/lib/types';
import { toast } from '@/hooks/use-toast';
import { getComplaintStatusTimeline, getStatusLabel, getStatusColor } from '@/lib/utils';

const CitizenDashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [filteredComplaints, setFilteredComplaints] = useState<Complaint[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  // New states for geo capture
  const [isGeoCaptureOpen, setIsGeoCaptureOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  
  // Redirect if not authenticated or not a citizen
  if (!isAuthenticated || user?.role !== 'citizen') {
    return <Navigate to="/login" replace />;
  }
  
  useEffect(() => {
    const fetchComplaints = async () => {
      setIsLoading(true);
      try {
        if (user) {
          const userComplaints = await getUserComplaints(user.id);
          setComplaints(userComplaints);
          setFilteredComplaints(userComplaints);
        }
      } catch (error) {
        console.error('Failed to fetch complaints:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load complaints. Please try again."
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchComplaints();
  }, [user]);
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    
    if (query.trim() === '') {
      setFilteredComplaints(complaints);
    } else {
      const filtered = complaints.filter(
        complaint =>
          complaint.title.toLowerCase().includes(query) ||
          complaint.description.toLowerCase().includes(query) ||
          complaint.location.toLowerCase().includes(query)
      );
      setFilteredComplaints(filtered);
    }
  };
  
  const handleFormSuccess = async () => {
    setIsFormDialogOpen(false);
    
    // Refresh complaints
    try {
      if (user) {
        const userComplaints = await getUserComplaints(user.id);
        setComplaints(userComplaints);
        setFilteredComplaints(userComplaints);
        
        toast({
          title: "Success",
          description: "Your complaint has been submitted successfully."
        });
      }
    } catch (error) {
      console.error('Failed to refresh complaints:', error);
    }
  };
  
  const handleViewComplaint = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setIsDetailsOpen(true);
  };
  
  const getFilteredComplaintsByStatus = (status: Complaint['status'] | 'all') => {
    if (status === 'all') {
      return filteredComplaints;
    }
    return filteredComplaints.filter(complaint => complaint.status === status);
  };
  
  // Geo Capture functions
  const openGeoCapture = () => {
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
            description: `Lat: ${position.coords.latitude.toFixed(4)}, Lng: ${position.coords.longitude.toFixed(4)}`
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
  };
  
  const captureImage = () => {
    // In a real app, we would use the device camera
    // For demo, we'll just use a placeholder image
    setCapturedImage('/placeholder.svg');
    toast({
      title: "Image captured",
      description: "Your image has been captured with geographic information embedded."
    });
  };
  
  const handleCreateWithGeoCapture = () => {
    setIsGeoCaptureOpen(false);
    setIsFormDialogOpen(true);
    // This would pass the geo data to the form in a real implementation
  };

  // Count complaints by status
  const countsByStatus = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === 'pending').length,
    inProgress: complaints.filter(c => ['assigned', 'in-progress'].includes(c.status)).length,
    completed: complaints.filter(c => c.status === 'completed').length,
    rejected: complaints.filter(c => c.status === 'rejected').length,
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8 bg-gray-50">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 p-6 bg-white rounded-lg shadow-sm">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-civic-blue to-civic-green bg-clip-text text-transparent">Citizen Dashboard</h1>
            <p className="text-muted-foreground">Track and manage your reported issues</p>
          </div>
          
          <div className="flex gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search complaints..."
                className="pl-10"
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
            
            <Button className="bg-civic-green hover:bg-civic-green/90" onClick={openGeoCapture}>
              <MapPin className="h-4 w-4 mr-2" />
              Geo Capture
            </Button>
            
            <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-civic-blue hover:bg-civic-blue/90">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  New Complaint
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-xl">
                <DialogHeader>
                  <DialogTitle>Report a New Issue</DialogTitle>
                  <DialogDescription>
                    Fill in the details below to report a civic issue in your area.
                  </DialogDescription>
                </DialogHeader>
                <ComplaintForm onSuccess={handleFormSuccess} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Status summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-gray-500">
            <div className="text-sm text-gray-500">Total</div>
            <div className="text-2xl font-bold">{countsByStatus.total}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-yellow-500">
            <div className="text-sm text-gray-500">Pending</div>
            <div className="text-2xl font-bold">{countsByStatus.pending}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-purple-500">
            <div className="text-sm text-gray-500">In Progress</div>
            <div className="text-2xl font-bold">{countsByStatus.inProgress}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
            <div className="text-sm text-gray-500">Completed</div>
            <div className="text-2xl font-bold">{countsByStatus.completed}</div>
          </div>
        </div>
        
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-6 p-1 bg-white rounded-lg">
            <TabsTrigger value="all">All Complaints</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>
          
          {['all', 'pending', 'in-progress', 'completed', 'rejected'].map((tab) => (
            <TabsContent key={tab} value={tab} className="mt-0">
              {isLoading ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900 mx-auto mb-4"></div>
                  <p>Loading complaints...</p>
                </div>
              ) : getFilteredComplaintsByStatus(tab as any).length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                  <h3 className="text-lg font-medium mb-2">No complaints found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery
                      ? 'No results match your search criteria'
                      : `You don't have any ${getStatusLabel(tab as any).toLowerCase()} complaints`}
                  </p>
                  <Button 
                    variant="outline"
                    onClick={() => setIsFormDialogOpen(true)}
                    className="bg-gradient-to-r from-civic-blue to-civic-green text-white hover:from-civic-blue/90 hover:to-civic-green/90"
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Report an Issue
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getFilteredComplaintsByStatus(tab as any).map((complaint) => (
                    <ComplaintCard
                      key={complaint.id}
                      complaint={complaint}
                      onView={handleViewComplaint}
                      showStatusBadge={true} 
                      showStatusTimeline={true}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </main>
      
      <Footer />
      
      {/* Geo Capture Dialog */}
      <Dialog open={isGeoCaptureOpen} onOpenChange={setIsGeoCaptureOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Geo Capture Camera</DialogTitle>
            <DialogDescription>
              Capture an image with location data for your complaint
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="w-full h-64 bg-gray-100 rounded-lg relative overflow-hidden flex items-center justify-center">
              {capturedImage ? (
                <>
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
                        <MapPin className="h-3 w-3" />
                        <span>
                          {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
                        </span>
                      </div>
                      <div className="pl-5 text-xs">
                        Area, Street, District information will be shown here
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center">
                  <Camera className="h-16 w-16 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground text-sm">Camera preview</p>
                </div>
              )}
            </div>
            
            {!capturedImage ? (
              <Button onClick={captureImage} className="w-full" disabled={!currentLocation}>
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
                  onClick={handleCreateWithGeoCapture} 
                  className="flex-1 bg-civic-green hover:bg-civic-green/90"
                >
                  Use Image
                </Button>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGeoCaptureOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Complaint Details Dialog */}
      <ComplaintDetails
        complaint={selectedComplaint}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        showStatusTimeline={true}
      />
    </div>
  );
};

export default CitizenDashboard;
