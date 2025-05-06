import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calendar,
  CalendarIcon,
  Check,
  ListFilter,
  Search,
} from 'lucide-react';
import { format } from 'date-fns';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ComplaintCard from '@/components/ComplaintCard';
import ComplaintDetails from '@/components/ComplaintDetails';
import { useAuth } from '@/contexts/AuthContext';
import {
  getMunicipalComplaints,
  getComplaintsByDate,
  updateComplaintStatus,
} from '@/lib/complaint-service';
import { Complaint } from '@/lib/types';
import { toast } from '@/hooks/use-toast';

const MunicipalDashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [filteredComplaints, setFilteredComplaints] = useState<Complaint[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  // Redirect if not authenticated or not a municipal office
  if (!isAuthenticated || user?.role !== 'municipal') {
    return <Navigate to="/login" replace />;
  }
  
  useEffect(() => {
    const fetchComplaints = async () => {
      setIsLoading(true);
      try {
        if (user && user.code) {
          const municipalComplaints = await getMunicipalComplaints(user.code);
          setComplaints(municipalComplaints);
          setFilteredComplaints(municipalComplaints);
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
  
  useEffect(() => {
    const fetchComplaintsByDate = async () => {
      if (!selectedDate) return;
      
      setIsLoading(true);
      try {
        const formattedDate = format(selectedDate, 'yyyy-MM-dd');
        const dateComplaints = selectedDate
          ? await getComplaintsByDate(formattedDate)
          : complaints;
        
        setFilteredComplaints(dateComplaints);
      } catch (error) {
        console.error('Failed to fetch complaints by date:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to filter complaints by date."
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    if (selectedDate) {
      fetchComplaintsByDate();
    } else {
      setFilteredComplaints(complaints);
    }
  }, [selectedDate, complaints]);
  
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
          complaint.location.toLowerCase().includes(query) ||
          complaint.userName.toLowerCase().includes(query)
      );
      setFilteredComplaints(filtered);
    }
  };
  
  const handleViewComplaint = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setIsDetailsOpen(true);
  };
  
  const handleUpdateComplaintStatus = async (
    complaintId: string,
    status: Complaint['status'],
    comment?: string
  ) => {
    try {
      if (!user) return;
      
      const updatedComplaint = await updateComplaintStatus(
        complaintId,
        status,
        user.code,
        comment,
        user.name
      );
      
      // Update complaints in state
      setComplaints(prev =>
        prev.map(c => (c.id === complaintId ? updatedComplaint : c))
      );
      setFilteredComplaints(prev =>
        prev.map(c => (c.id === complaintId ? updatedComplaint : c))
      );
      
      // Update the selected complaint if it's open
      if (selectedComplaint && selectedComplaint.id === complaintId) {
        setSelectedComplaint(updatedComplaint);
      }
      
      toast({
        title: "Status updated",
        description: `Complaint status updated to ${status}`,
      });
      
      // If status is completed, also show a thank you message
      if (status === 'completed') {
        setTimeout(() => {
          toast({
            title: "Thanks for Great Work!",
            description: "The citizen has been notified of the resolution.",
            className: "bg-civic-green/10 text-civic-green border-civic-green",
          });
        }, 1000);
      }
    } catch (error) {
      console.error('Failed to update complaint status:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update complaint status.",
      });
    }
  };
  
  const handleComplaintUpdate = (updatedComplaint: Complaint) => {
    // Update complaints in state
    setComplaints(prev => 
      prev.map(c => (c.id === updatedComplaint.id ? updatedComplaint : c))
    );
    setFilteredComplaints(prev =>
      prev.map(c => (c.id === updatedComplaint.id ? updatedComplaint : c))
    );
    
    // Update the selected complaint if it's open
    if (selectedComplaint && selectedComplaint.id === updatedComplaint.id) {
      setSelectedComplaint(updatedComplaint);
    }

    toast({
      title: "Complaint updated",
      description: "The complaint has been updated with repair images",
    });
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
            <h1 className="text-3xl font-bold">Municipal Office Dashboard</h1>
            <p className="text-muted-foreground">Manage and resolve citizen complaints</p>
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
            
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="flex gap-2"
                >
                  <CalendarIcon className="h-4 w-4" />
                  {selectedDate ? format(selectedDate, 'PP') : 'Filter by date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                />
                {selectedDate && (
                  <div className="p-3 border-t">
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-muted-foreground"
                      onClick={() => setSelectedDate(undefined)}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Clear date filter
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
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
                  <p className="text-muted-foreground">
                    {searchQuery
                      ? 'No results match your search criteria'
                      : selectedDate
                      ? `No complaints found for ${format(selectedDate, 'PP')}`
                      : 'There are no complaints in this category'}
                  </p>
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
        onUpdateStatus={handleUpdateComplaintStatus}
        onComplaintUpdate={handleComplaintUpdate}
      />
    </div>
  );
};

export default MunicipalDashboard;
