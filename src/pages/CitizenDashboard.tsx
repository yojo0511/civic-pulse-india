
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
  DialogTrigger 
} from '@/components/ui/dialog';
import { PlusCircle, Search } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ComplaintForm from '@/components/ComplaintForm';
import ComplaintCard from '@/components/ComplaintCard';
import ComplaintDetails from '@/components/ComplaintDetails';
import { useAuth } from '@/contexts/AuthContext';
import { getUserComplaints } from '@/lib/complaint-service';
import { Complaint } from '@/lib/types';
import { toast } from '@/hooks/use-toast';

const CitizenDashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [filteredComplaints, setFilteredComplaints] = useState<Complaint[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
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
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Citizen Dashboard</h1>
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
            
            <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-civic-green hover:bg-civic-green/90">
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
        
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="all">All Complaints</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
          
          {['all', 'pending', 'in-progress', 'completed'].map((tab) => (
            <TabsContent key={tab} value={tab} className="mt-0">
              {isLoading ? (
                <div className="text-center py-12">
                  <p>Loading complaints...</p>
                </div>
              ) : getFilteredComplaintsByStatus(tab as any).length === 0 ? (
                <div className="text-center py-12 bg-muted/30 rounded-lg">
                  <h3 className="text-lg font-medium mb-2">No complaints found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery
                      ? 'No results match your search criteria'
                      : 'You have not submitted any complaints yet'}
                  </p>
                  <Button 
                    variant="outline"
                    onClick={() => setIsFormDialogOpen(true)}
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
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </main>
      
      <Footer />
      
      {/* Complaint Details Dialog */}
      <ComplaintDetails
        complaint={selectedComplaint}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
      />
    </div>
  );
};

export default CitizenDashboard;
