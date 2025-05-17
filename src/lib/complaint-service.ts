
import { Complaint } from './types';
import { reverseGeocode } from './utils';

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
    geoLocation: {
      lat: 28.65,
      lng: 77.22,
      area: 'Gandhi Nagar',
      street: 'Street 5',
      district: 'Central Delhi'
    }
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
    geoLocation: {
      lat: 28.55,
      lng: 77.25,
      area: 'Nehru Road',
      street: 'Junction 12',
      district: 'South Delhi'
    },
    comments: [
      {
        id: 'cm1',
        text: 'Complaint has been assigned to the electrical maintenance team',
        userId: 'MO07',
        userName: 'Office Electrical',
        date: '2025-04-09',
      }
    ]
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
    repairImages: ['/placeholder.svg'],
    geoLocation: {
      lat: 28.60,
      lng: 77.20,
      area: 'Subhash Marg',
      street: 'Central Park Road',
      district: 'Central Delhi'
    },
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
      {
        id: 'cm3',
        text: 'Repair images added showing the fixed pipe',
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
export const createComplaint = async (complaint: Omit<Complaint, 'id' | 'date' | 'status'>): Promise<Complaint> => {
  return new Promise(async (resolve) => {
    setTimeout(async () => {
      // Process geo location if not already provided
      let geoLocation = complaint.geoLocation;
      if (!geoLocation && complaint.location) {
        // Simulate geocoding by generating random coordinates for the provided location
        const lat = 28.5 + Math.random() * 0.3; // Generate random Delhi area latitude
        const lng = 77.1 + Math.random() * 0.3; // Generate random Delhi area longitude
        
        // Generate address components
        try {
          const addressDetails = await reverseGeocode(lat, lng);
          geoLocation = {
            lat,
            lng,
            address: addressDetails.fullAddress,
            area: addressDetails.area,
            street: addressDetails.street,
            district: addressDetails.district
          };
        } catch (error) {
          console.error('Geocoding error:', error);
        }
      }
      
      const newComplaint: Complaint = {
        ...complaint,
        id: `c${complaints.length + 1}`,
        date: new Date().toISOString().split('T')[0],
        status: 'pending',
        geoLocation
      };
      
      complaints = [newComplaint, ...complaints];
      
      // Add timestamp for when the complaint was received
      const comments = newComplaint.comments || [];
      comments.push({
        id: `cm${Date.now()}`,
        text: 'Complaint received and registered in the system.',
        userId: 'system',
        userName: 'System',
        date: newComplaint.date,
      });
      newComplaint.comments = comments;
      
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
      
      // Generate status-specific comment if none provided
      let statusComment = comment;
      if (!statusComment) {
        switch (status) {
          case 'assigned':
            statusComment = `Complaint assigned to ${commenterName || 'municipal office'}.`;
            break;
          case 'in-progress':
            statusComment = 'Work has started on resolving this complaint.';
            break;
          case 'completed':
            statusComment = 'This complaint has been successfully resolved.';
            break;
          case 'rejected':
            statusComment = 'This complaint has been reviewed and rejected.';
            break;
          default:
            statusComment = `Status updated to ${status}.`;
        }
      }
      
      if (statusComment && commenterName) {
        const newComment = {
          id: `cm${Date.now()}`,
          text: statusComment,
          userId: assignedTo || 'system',
          userName: commenterName,
          date: new Date().toISOString().split('T')[0],
        };
        
        updatedComplaint.comments = updatedComplaint.comments || [];
        updatedComplaint.comments.push(newComment);
      }
      
      // If status is updated to completed, notify the citizen
      if (status === 'completed' && updatedComplaint.status !== 'completed') {
        // In a real app, this would trigger a notification to the citizen
        console.log(`Notification sent to citizen: Your complaint #${complaintId} has been resolved`);
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
      if (!comment) {
        comment = 'Repair images added to show progress on this complaint.';
      }
      
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

      // In a real app, this would trigger a notification to the citizen
      console.log(`Notification sent to citizen: Repair images added to your complaint #${complaintId}`);
      
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
