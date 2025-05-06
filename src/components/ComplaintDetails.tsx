
import React, { useState } from 'react';
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
  ImagePlus,
  MapPin,
  MessageSquare,
  User,
  Video,
  Check,
  Info,
} from 'lucide-react';
import { getStatusLabel, getStatusColor } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { addRepairImages } from '@/lib/complaint-service';
import { toast } from '@/hooks/use-toast';

interface ComplaintDetailsProps {
  complaint: Complaint | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus?: (
    complaintId: string,
    status: Complaint['status'],
    comment?: string
  ) => void;
  onComplaintUpdate?: (complaint: Complaint) => void;
}

const ComplaintDetails: React.FC<ComplaintDetailsProps> = ({
  complaint,
  isOpen,
  onClose,
  onUpdateStatus,
  onComplaintUpdate,
}) => {
  const { user } = useAuth();
  const [comment, setComment] = useState('');
  const [repairImages, setRepairImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  if (!complaint) return null;
  
  const handleUpdateStatus = (status: Complaint['status']) => {
    if (onUpdateStatus && complaint) {
      onUpdateStatus(complaint.id, status, comment);
      setComment('');
    }
  };

  // Handle file selection for repair images
  const handleRepairImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    
    // For demonstration purposes, we're using a placeholder image
    // In a real app, you would upload these files to a server
    const newImages = Array.from({ length: files.length }, () => '/placeholder.svg');
    setRepairImages(newImages);
    setIsUploading(false);
  };

  // Submit repair images
  const handleSubmitRepairImages = async () => {
    if (!repairImages.length || !complaint) return;
    
    try {
      const updatedComplaint = await addRepairImages(
        complaint.id,
        repairImages,
        comment,
        user?.name
      );
      
      toast({
        title: "Repair images added",
        description: "Repair images have been added to the complaint and citizen has been notified.",
      });
      
      setRepairImages([]);
      setComment('');
      
      if (onComplaintUpdate) {
        onComplaintUpdate(updatedComplaint);
      }
    } catch (error) {
      console.error('Failed to add repair images:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add repair images. Please try again.",
      });
    }
  };
  
  const canUpdateStatus = user?.role === 'municipal';
  const canAddRepairImages = user?.role === 'municipal' && (
    complaint.status === 'in-progress' || complaint.status === 'completed'
  );

  // Determine if this user is the complaint creator
  const isComplaintCreator = user?.id === complaint.userId;
  
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

          {/* Status Timeline - Shows to citizens */}
          {isComplaintCreator && (
            <div className="p-4 bg-slate-50 rounded-lg">
              <h4 className="font-medium mb-3">Status Timeline</h4>
              <div className="space-y-2">
                <div className={`flex items-center gap-2 ${complaint.status !== 'rejected' ? 'text-green-600' : 'text-gray-400'}`}>
                  <div className={`rounded-full p-1 ${complaint.status !== 'rejected' ? 'bg-green-100' : 'bg-gray-100'}`}>
                    <Check className="h-3 w-3" />
                  </div>
                  <span className="text-sm">Complaint Received</span>
                </div>
                
                <div className={`flex items-center gap-2 ${complaint.status === 'assigned' || complaint.status === 'in-progress' || complaint.status === 'completed' ? 'text-green-600' : 'text-gray-400'}`}>
                  <div className={`rounded-full p-1 ${complaint.status === 'assigned' || complaint.status === 'in-progress' || complaint.status === 'completed' ? 'bg-green-100' : 'bg-gray-100'}`}>
                    {complaint.status === 'assigned' || complaint.status === 'in-progress' || complaint.status === 'completed' ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <div className="h-3 w-3" />
                    )}
                  </div>
                  <span className="text-sm">Assigned to Municipality</span>
                </div>
                
                <div className={`flex items-center gap-2 ${complaint.status === 'in-progress' || complaint.status === 'completed' ? 'text-green-600' : 'text-gray-400'}`}>
                  <div className={`rounded-full p-1 ${complaint.status === 'in-progress' || complaint.status === 'completed' ? 'bg-green-100' : 'bg-gray-100'}`}>
                    {complaint.status === 'in-progress' || complaint.status === 'completed' ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <div className="h-3 w-3" />
                    )}
                  </div>
                  <span className="text-sm">Work In Progress</span>
                </div>
                
                <div className={`flex items-center gap-2 ${complaint.status === 'completed' ? 'text-green-600' : 'text-gray-400'}`}>
                  <div className={`rounded-full p-1 ${complaint.status === 'completed' ? 'bg-green-100' : 'bg-gray-100'}`}>
                    {complaint.status === 'completed' ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <div className="h-3 w-3" />
                    )}
                  </div>
                  <span className="text-sm">Resolved</span>
                </div>
                
                {complaint.status === 'rejected' && (
                  <div className="flex items-center gap-2 text-red-600">
                    <div className="rounded-full p-1 bg-red-100">
                      <Info className="h-3 w-3" />
                    </div>
                    <span className="text-sm">Complaint Rejected</span>
                  </div>
                )}
              </div>
            </div>
          )}

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
                <span>Complaint Images</span>
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

          {/* Repair Images Display with improved UI for citizens */}
          {complaint.repairImages && complaint.repairImages.length > 0 && (
            <div className="space-y-2 bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-medium flex items-center gap-2 text-green-800">
                <Image className="h-4 w-4" />
                <span>Repair Images</span>
                {isComplaintCreator && (
                  <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">
                    Added by Municipality
                  </span>
                )}
              </h4>
              <div className="grid grid-cols-3 gap-2">
                {complaint.repairImages.map((img, idx) => (
                  <div key={`repair-img-${idx}`} className="relative aspect-square rounded overflow-hidden border border-green-200">
                    <img src={img} alt={`Repair image ${idx + 1}`} className="object-cover w-full h-full" />
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

          {/* Comments with improved UI */}
          {complaint.comments && complaint.comments.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <span>Updates</span>
              </h4>
              <div className="space-y-3 max-h-60 overflow-y-auto p-1">
                {complaint.comments.map((comment) => (
                  <div 
                    key={comment.id} 
                    className={`p-3 rounded ${
                      comment.userId === user?.id 
                        ? 'bg-blue-50 border-l-4 border-blue-400' 
                        : 'bg-gray-50 border-l-4 border-gray-300'
                    }`}
                  >
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

          {/* Add Repair Images Section for Municipal Officers */}
          {canAddRepairImages && (
            <>
              <Separator />
              <div className="space-y-3 bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-800">Add Repair Images</h4>
                <p className="text-sm text-blue-700">
                  Upload images showing the repairs that have been completed for this complaint.
                  <strong> These will be shared with the citizen who filed the complaint.</strong>
                </p>
                
                {repairImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {repairImages.map((img, idx) => (
                      <div key={`new-img-${idx}`} className="relative aspect-square rounded overflow-hidden border border-blue-300">
                        <img src={img} alt={`New repair image ${idx + 1}`} className="object-cover w-full h-full" />
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-2 rounded-md flex items-center gap-2 transition-colors">
                    <ImagePlus className="h-4 w-4" />
                    <span>Select Images</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleRepairImageChange}
                      disabled={isUploading}
                    />
                  </label>
                  <span className="text-sm text-blue-700">
                    {repairImages.length} images selected
                  </span>
                </div>
                
                <textarea
                  className="w-full p-2 border border-blue-300 rounded-md"
                  rows={2}
                  placeholder="Add a comment about these repair images for the citizen..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                ></textarea>
                
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={handleSubmitRepairImages}
                  disabled={repairImages.length === 0 || isUploading}
                >
                  Submit Repair Images
                </Button>
              </div>
            </>
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
