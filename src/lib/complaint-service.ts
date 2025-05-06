import { Complaint } from './types';

// Sample complaints data
let complaints: Complaint[] = [
  {
    id: 'c1',
    title: 'Garbage not collected',
    description: 'Garbage has not been collected from our street for 3 days',
    location: 'Gandhi Nagar, Street 5',
    status: 'pending',
    date: '2025-04-10',
    userId: 'u1',
    userName: 'Amit Kumar',
    images: ['/placeholder.svg'],
    videos: [],
  },
  {
    id: 'c2',
    title: 'Broken street light',
    description: 'Street light at the corner is not working for a week',
    location: 'Nehru Road, Junction 12',
    status: 'in-progress',
    date: '2025-04-09',
    userId: 'u2',
    userName: 'Priya Sharma',
    images: ['/placeholder.svg'],
    videos: [],
    assignedTo: 'MO07',
  },
  {
    id: 'c3',
    title: 'Water leakage',
    description: 'There is water leakage from the main pipe on our road',
    location: 'Subhash Marg, Near Central Park',
    status: 'completed',
    date: '2025-04-08',
    userId: 'u3',
    userName: 'Ravi Patel',
    images: ['/placeholder.svg'],
    videos: [],
    assignedTo: 'MO08',
    comments: [
      {
        id: 'cm1',
        text: 'Team has been dispatched',
        userId: 'MO08',
        userName: 'Office Water Supply',
        date: '2025-04-08',
      },
      {
        id: 'cm2',
        text: 'Leakage fixed successfully',
        userId: 'MO08',
        userName: 'Office Water Supply',
        date: '2025-04-08',
      },
    ],
  },
];

// Get all complaints
export const getAllComplaints = (): Promise<Complaint[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...complaints]);
    }, 500);
  });
};

// Get complaints by user ID
export const getUserComplaints = (userId: string): Promise<Complaint[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const userComplaints = complaints.filter(complaint => complaint.userId === userId);
      resolve([...userComplaints]);
    }, 500);
  });
};

// Get complaints by municipal code
export const getMunicipalComplaints = (municipalCode: string): Promise<Complaint[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // For simplicity, return all complaints for municipal users
      // In a real app, you'd filter based on area or assignment
      resolve([...complaints]);
    }, 500);
  });
};

// Get complaints by date
export const getComplaintsByDate = (date: string): Promise<Complaint[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const dateComplaints = complaints.filter(complaint => complaint.date === date);
      resolve([...dateComplaints]);
    }, 500);
  });
};

// Create a new complaint
export const createComplaint = (complaint: Omit<Complaint, 'id' | 'date' | 'status'>): Promise<Complaint> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newComplaint: Complaint = {
        ...complaint,
        id: `c${complaints.length + 1}`,
        date: new Date().toISOString().split('T')[0],
        status: 'pending',
      };
      
      complaints = [newComplaint, ...complaints];
      resolve(newComplaint);
    }, 500);
  });
};

// Update complaint status
export const updateComplaintStatus = (
  complaintId: string, 
  status: Complaint['status'], 
  assignedTo?: string,
  comment?: string,
  commenterName?: string
): Promise<Complaint> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const complaintIndex = complaints.findIndex(c => c.id === complaintId);
      
      if (complaintIndex === -1) {
        reject(new Error('Complaint not found'));
        return;
      }
      
      const updatedComplaint = { ...complaints[complaintIndex], status };
      
      if (assignedTo) {
        updatedComplaint.assignedTo = assignedTo;
      }
      
      if (comment && commenterName) {
        const newComment = {
          id: `cm${Date.now()}`,
          text: comment,
          userId: assignedTo || 'system',
          userName: commenterName,
          date: new Date().toISOString().split('T')[0],
        };
        
        updatedComplaint.comments = updatedComplaint.comments || [];
        updatedComplaint.comments.push(newComment);
      }
      
      complaints[complaintIndex] = updatedComplaint;
      resolve(updatedComplaint);
    }, 500);
  });
};

// Add repair images to a complaint
export const addRepairImages = (
  complaintId: string,
  images: string[],
  comment?: string,
  commenterName?: string
): Promise<Complaint> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const complaintIndex = complaints.findIndex(c => c.id === complaintId);
      
      if (complaintIndex === -1) {
        reject(new Error('Complaint not found'));
        return;
      }
      
      const updatedComplaint = { ...complaints[complaintIndex] };
      
      // Add repair images
      updatedComplaint.repairImages = updatedComplaint.repairImages || [];
      updatedComplaint.repairImages = [...updatedComplaint.repairImages, ...images];
      
      // Add a comment about the repair images if provided
      if (comment && commenterName) {
        const newComment = {
          id: `cm${Date.now()}`,
          text: comment,
          userId: updatedComplaint.assignedTo || 'system',
          userName: commenterName,
          date: new Date().toISOString().split('T')[0],
        };
        
        updatedComplaint.comments = updatedComplaint.comments || [];
        updatedComplaint.comments.push(newComment);
      }
      
      complaints[complaintIndex] = updatedComplaint;
      resolve(updatedComplaint);
    }, 500);
  });
};

// Delete complaint
export const deleteComplaint = (complaintId: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const initialLength = complaints.length;
      complaints = complaints.filter(c => c.id !== complaintId);
      
      if (complaints.length === initialLength) {
        reject(new Error('Complaint not found'));
        return;
      }
      
      resolve(true);
    }, 500);
  });
};
