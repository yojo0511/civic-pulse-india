
import React from 'react';
import { Complaint } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Calendar,
  Clock,
  Image,
  MapPin,
  MessageSquare,
  User,
  Video,
} from 'lucide-react';
import { getStatusLabel, getStatusColor } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface ComplaintDetailsProps {
  complaint: Complaint | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus?: (
    complaintId: string,
    status: Complaint['status'],
    comment?: string
  ) => void;
}

const ComplaintDetails: React.FC<ComplaintDetailsProps> = ({
  complaint,
  isOpen,
  onClose,
  onUpdateStatus,
}) => {
  const { user } = useAuth();
  const [comment, setComment] = React.useState('');
  
  if (!complaint) return null;
  
  const handleUpdateStatus = (status: Complaint['status']) => {
    if (onUpdateStatus && complaint) {
      onUpdateStatus(complaint.id, status, comment);
      setComment('');
    }
  };
  
  const canUpdateStatus = user?.role === 'municipal';
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{complaint.title}</DialogTitle>
          <DialogDescription>
            Complaint ID: {complaint.id}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Badge className={getStatusColor(complaint.status)}>
              {getStatusLabel(complaint.status)}
            </Badge>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{complaint.date}</span>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Description</h4>
            <p className="text-muted-foreground">{complaint.description}</p>
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{complaint.location}</span>
          </div>

          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span>Reported by: {complaint.userName}</span>
          </div>

          {complaint.assignedTo && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>Assigned to: {complaint.assignedTo}</span>
            </div>
          )}

          {/* Media Display */}
          {complaint.images && complaint.images.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Image className="h-4 w-4" />
                <span>Images</span>
              </h4>
              <div className="grid grid-cols-3 gap-2">
                {complaint.images.map((img, idx) => (
                  <div key={`img-${idx}`} className="relative aspect-square rounded overflow-hidden">
                    <img src={img} alt={`Complaint image ${idx + 1}`} className="object-cover w-full h-full" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {complaint.videos && complaint.videos.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Video className="h-4 w-4" />
                <span>Videos</span>
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {complaint.videos.map((video, idx) => (
                  <div key={`video-${idx}`} className="relative aspect-video rounded overflow-hidden bg-muted flex items-center justify-center">
                    <Video className="h-8 w-8 text-muted-foreground" />
                    <span className="sr-only">Video {idx + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Comments */}
          {complaint.comments && complaint.comments.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <span>Updates</span>
              </h4>
              <div className="space-y-3 max-h-40 overflow-y-auto p-1">
                {complaint.comments.map((comment) => (
                  <div key={comment.id} className="bg-muted p-3 rounded">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-sm">{comment.userName}</span>
                      <span className="text-xs text-muted-foreground">{comment.date}</span>
                    </div>
                    <p className="text-sm">{comment.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Status Update Section for Municipal Officers */}
          {canUpdateStatus && (
            <>
              <Separator />
              <div className="space-y-3">
                <h4 className="font-medium">Update Status</h4>
                <textarea
                  className="w-full p-2 border rounded-md"
                  rows={2}
                  placeholder="Add a comment about this status change..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                ></textarea>
                <div className="flex flex-wrap gap-2">
                  {complaint.status !== 'assigned' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpdateStatus('assigned')}
                    >
                      Mark as Assigned
                    </Button>
                  )}
                  {complaint.status !== 'in-progress' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpdateStatus('in-progress')}
                    >
                      Mark as In Progress
                    </Button>
                  )}
                  {complaint.status !== 'completed' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-green-100 text-green-800 hover:bg-green-200"
                      onClick={() => handleUpdateStatus('completed')}
                    >
                      Mark as Completed
                    </Button>
                  )}
                  {complaint.status !== 'rejected' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-red-100 text-red-800 hover:bg-red-200"
                      onClick={() => handleUpdateStatus('rejected')}
                    >
                      Reject Complaint
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ComplaintDetails;
