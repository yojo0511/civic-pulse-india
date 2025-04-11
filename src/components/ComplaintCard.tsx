
import React from 'react';
import { Complaint } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Image, MapPin, Video } from 'lucide-react';

interface ComplaintCardProps {
  complaint: Complaint;
  onView?: (complaint: Complaint) => void;
}

const getStatusColor = (status: Complaint['status']) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
    case 'assigned':
      return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
    case 'in-progress':
      return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
    case 'completed':
      return 'bg-green-100 text-green-800 hover:bg-green-200';
    case 'rejected':
      return 'bg-red-100 text-red-800 hover:bg-red-200';
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
  }
};

const getStatusLabel = (status: Complaint['status']) => {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'assigned':
      return 'Assigned';
    case 'in-progress':
      return 'In Progress';
    case 'completed':
      return 'Completed';
    case 'rejected':
      return 'Rejected';
    default:
      return status;
  }
};

const ComplaintCard: React.FC<ComplaintCardProps> = ({ complaint, onView }) => {
  return (
    <div className="city-card bg-white p-4 flex flex-col h-full">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-lg truncate pr-2">{complaint.title}</h3>
        <Badge className={getStatusColor(complaint.status)}>
          {getStatusLabel(complaint.status)}
        </Badge>
      </div>
      
      <p className="text-muted-foreground line-clamp-2 mb-3">
        {complaint.description}
      </p>
      
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-3 w-3" />
          <span className="truncate">{complaint.location}</span>
        </div>
        
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>{complaint.date}</span>
        </div>
      </div>
      
      {complaint.images && complaint.images.length > 0 && (
        <div className="flex items-center gap-2 mb-2">
          <Image className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{complaint.images.length} image(s)</span>
        </div>
      )}
      
      {complaint.videos && complaint.videos.length > 0 && (
        <div className="flex items-center gap-2 mb-2">
          <Video className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{complaint.videos.length} video(s)</span>
        </div>
      )}
      
      <div className="mt-auto pt-4">
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => onView && onView(complaint)}
        >
          View Details
        </Button>
      </div>
    </div>
  );
};

export default ComplaintCard;
