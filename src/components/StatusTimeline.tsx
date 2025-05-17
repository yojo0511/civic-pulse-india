
import React from 'react';
import { Complaint } from '@/lib/types';
import { Check, X, Info } from 'lucide-react';
import { getComplaintStatusTimeline } from '@/lib/utils';

interface StatusTimelineProps {
  complaint: Complaint;
  compact?: boolean;
}

const StatusTimeline: React.FC<StatusTimelineProps> = ({ complaint, compact = false }) => {
  if (!complaint) return null;
  
  const getStepIcon = (status: string, isCompleted: boolean) => {
    if (status.toLowerCase() === 'rejected') {
      return <Info className="h-3 w-3" />;
    }
    
    return isCompleted ? <Check className="h-3 w-3" /> : null;
  };
  
  const getStepClasses = (status: string, isCompleted: boolean) => {
    if (status.toLowerCase() === 'rejected') {
      return 'text-red-600 bg-red-100';
    }
    
    return isCompleted ? 'text-green-600 bg-green-100' : 'text-gray-400 bg-gray-100';
  };

  // For very compact display
  if (compact) {
    return (
      <div className="flex items-center space-x-1 px-2 py-1">
        {['pending', 'assigned', 'in-progress', 'completed'].map((step, index) => {
          const isCompleted = 
            step === 'pending' || 
            (step === 'assigned' && ['assigned', 'in-progress', 'completed'].includes(complaint.status)) || 
            (step === 'in-progress' && ['in-progress', 'completed'].includes(complaint.status)) || 
            (step === 'completed' && complaint.status === 'completed');
          
          const isRejected = complaint.status === 'rejected';
          
          return (
            <React.Fragment key={step}>
              <div 
                className={`rounded-full w-2 h-2 ${isRejected && index === 0 ? 'bg-red-500' : isCompleted ? 'bg-green-500' : 'bg-gray-300'}`}
              />
              {index < 3 && (
                <div className={`h-px w-2 ${isRejected ? 'bg-red-300' : isCompleted && ['assigned', 'in-progress', 'completed'].includes(complaint.status) && index < 2 ? 'bg-green-300' : 'bg-gray-300'}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  }
  
  // Full timeline display
  return (
    <div className="p-4 bg-slate-50 rounded-lg">
      <h4 className="font-medium mb-3 text-sm">Status Timeline</h4>
      <div className="space-y-2">
        <div className={`flex items-center gap-2 text-sm ${complaint.status !== 'rejected' ? 'text-green-600' : 'text-gray-400'}`}>
          <div className={`rounded-full p-1 ${complaint.status !== 'rejected' ? 'bg-green-100' : 'bg-gray-100'}`}>
            <Check className="h-3 w-3" />
          </div>
          <span className="text-sm">Complaint Received</span>
          <span className="text-xs text-muted-foreground ml-auto">{complaint.date}</span>
        </div>
        
        <div className={`flex items-center gap-2 text-sm ${complaint.status === 'assigned' || complaint.status === 'in-progress' || complaint.status === 'completed' ? 'text-green-600' : 'text-gray-400'}`}>
          <div className={`rounded-full p-1 ${complaint.status === 'assigned' || complaint.status === 'in-progress' || complaint.status === 'completed' ? 'bg-green-100' : 'bg-gray-100'}`}>
            {complaint.status === 'assigned' || complaint.status === 'in-progress' || complaint.status === 'completed' ? (
              <Check className="h-3 w-3" />
            ) : (
              <div className="h-3 w-3" />
            )}
          </div>
          <span className="text-sm">Assigned to Municipality</span>
          <span className="text-xs text-muted-foreground ml-auto">
            {complaint.comments?.find(c => c.text.includes('assigned'))?.date || ''}
          </span>
        </div>
        
        <div className={`flex items-center gap-2 text-sm ${complaint.status === 'in-progress' || complaint.status === 'completed' ? 'text-green-600' : 'text-gray-400'}`}>
          <div className={`rounded-full p-1 ${complaint.status === 'in-progress' || complaint.status === 'completed' ? 'bg-green-100' : 'bg-gray-100'}`}>
            {complaint.status === 'in-progress' || complaint.status === 'completed' ? (
              <Check className="h-3 w-3" />
            ) : (
              <div className="h-3 w-3" />
            )}
          </div>
          <span className="text-sm">Work In Progress</span>
          <span className="text-xs text-muted-foreground ml-auto">
            {complaint.comments?.find(c => c.text.toLowerCase().includes('progress'))?.date || ''}
          </span>
        </div>
        
        <div className={`flex items-center gap-2 text-sm ${complaint.status === 'completed' ? 'text-green-600' : 'text-gray-400'}`}>
          <div className={`rounded-full p-1 ${complaint.status === 'completed' ? 'bg-green-100' : 'bg-gray-100'}`}>
            {complaint.status === 'completed' ? (
              <Check className="h-3 w-3" />
            ) : (
              <div className="h-3 w-3" />
            )}
          </div>
          <span className="text-sm">Resolved</span>
          <span className="text-xs text-muted-foreground ml-auto">
            {complaint.comments?.find(c => c.text.toLowerCase().includes('resolved') || c.text.toLowerCase().includes('completed'))?.date || ''}
          </span>
        </div>
        
        {complaint.status === 'rejected' && (
          <div className="flex items-center gap-2 text-sm text-red-600">
            <div className="rounded-full p-1 bg-red-100">
              <Info className="h-3 w-3" />
            </div>
            <span className="text-sm">Complaint Rejected</span>
            <span className="text-xs text-red-400 ml-auto">
              {complaint.comments?.find(c => c.text.toLowerCase().includes('rejected'))?.date || ''}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatusTimeline;
