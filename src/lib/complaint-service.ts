
import { Complaint } from './types';
import { reverseGeocode } from './utils';

// Sample complaints data - We'll add a lookup by userId to ensure persistence
const complaintsByUser = new Map<string, Complaint[]>();

// Initialize with some sample complaints
const initializeComplaints = () => {
  // Sample complaints for demo users
  const sampleComplaints = [
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

  // Add sample complaints to the map
  sampleComplaints.forEach(complaint => {
    if (!complaintsByUser.has(complaint.userId)) {
      complaintsByUser.set(complaint.userId, []);
    }
    complaintsByUser.get(complaint.userId)?.push(complaint);
  });
};

// Initialize complaints on load
initializeComplaints();

// Check local storage for saved complaints
const loadSavedComplaints = () => {
  try {
    const savedComplaints = localStorage.getItem('civic_complaints');
    if (savedComplaints) {
      const parsed = JSON.parse(savedComplaints);
      complaintsByUser.clear();
      
      // Convert from object to Map
      Object.entries(parsed).forEach(([userId, complaints]) => {
        complaintsByUser.set(userId, complaints as Complaint[]);
      });
      
      console.log("Loaded saved complaints from local storage");
    }
  } catch (error) {
    console.error("Failed to load complaints from local storage:", error);
  }
};

// Save complaints to local storage
const saveComplaintsToStorage = () => {
  try {
    // Convert Map to object for storage
    const complaintsObj: Record<string, Complaint[]> = {};
    complaintsByUser.forEach((complaints, userId) => {
      complaintsObj[userId] = complaints;
    });
    
    localStorage.setItem('civic_complaints', JSON.stringify(complaintsObj));
    console.log("Saved complaints to local storage");
  } catch (error) {
    console.error("Failed to save complaints to local storage:", error);
  }
};

// Load complaints from storage on module initialization
loadSavedComplaints();

// Get all complaints
export const getAllComplaints = (): Promise<Complaint[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Flatten all complaints from the map
      const allComplaints: Complaint[] = [];
      complaintsByUser.forEach(complaints => {
        allComplaints.push(...complaints);
      });
      
      resolve([...allComplaints]);
    }, 500);
  });
};

// Get complaints by user ID
export const getUserComplaints = (userId: string): Promise<Complaint[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Get complaints for this specific user
      const userComplaints = complaintsByUser.get(userId) || [];
      resolve([...userComplaints]);
    }, 500);
  });
};

// Get complaints by municipal code
export const getMunicipalComplaints = (municipalCode: string): Promise<Complaint[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // For simplicity, return all complaints for municipal users
      const allComplaints: Complaint[] = [];
      complaintsByUser.forEach(complaints => {
        allComplaints.push(...complaints);
      });
      
      resolve([...allComplaints]);
    }, 500);
  });
};

// Get complaints by date
export const getComplaintsByDate = (date: string): Promise<Complaint[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Filter all complaints by date
      const allComplaints: Complaint[] = [];
      complaintsByUser.forEach(complaints => {
        allComplaints.push(...complaints);
      });
      
      const dateComplaints = allComplaints.filter(complaint => complaint.date === date);
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
      
      // Get all complaints for ID generation
      const allComplaints: Complaint[] = [];
      complaintsByUser.forEach(complaints => {
        allComplaints.push(...complaints);
      });
      
      // Generate a new ID
      const newId = `c${allComplaints.length + 1}`;
      
      const newComplaint: Complaint = {
        ...complaint,
        id: newId,
        date: new Date().toISOString().split('T')[0],
        status: 'pending',
        geoLocation
      };
      
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
      
      // Add to the user's complaints
      if (!complaintsByUser.has(newComplaint.userId)) {
        complaintsByUser.set(newComplaint.userId, []);
      }
      complaintsByUser.get(newComplaint.userId)?.unshift(newComplaint);
      
      // Save to local storage
      saveComplaintsToStorage();
      
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
      // Find the complaint in all users' lists
      let updatedComplaint: Complaint | null = null;
      let foundUserId: string | null = null;
      let foundIndex: number = -1;
      
      complaintsByUser.forEach((complaints, userId) => {
        const index = complaints.findIndex(c => c.id === complaintId);
        if (index !== -1) {
          foundUserId = userId;
          foundIndex = index;
        }
      });
      
      if (foundUserId === null || foundIndex === -1) {
        reject(new Error('Complaint not found'));
        return;
      }
      
      const userComplaints = complaintsByUser.get(foundUserId) || [];
      updatedComplaint = { ...userComplaints[foundIndex], status };
      
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
      
      // Update in the map
      userComplaints[foundIndex] = updatedComplaint;
      complaintsByUser.set(foundUserId, userComplaints);
      
      // Save to local storage
      saveComplaintsToStorage();
      
      // If status is updated to completed, notify the citizen
      if (status === 'completed' && updatedComplaint.status !== 'completed') {
        // In a real app, this would trigger a notification to the citizen
        console.log(`Notification sent to citizen: Your complaint #${complaintId} has been resolved`);
      }
      
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
      // Find the complaint in all users' lists
      let updatedComplaint: Complaint | null = null;
      let foundUserId: string | null = null;
      let foundIndex: number = -1;
      
      complaintsByUser.forEach((complaints, userId) => {
        const index = complaints.findIndex(c => c.id === complaintId);
        if (index !== -1) {
          foundUserId = userId;
          foundIndex = index;
        }
      });
      
      if (foundUserId === null || foundIndex === -1) {
        reject(new Error('Complaint not found'));
        return;
      }
      
      const userComplaints = complaintsByUser.get(foundUserId) || [];
      updatedComplaint = { ...userComplaints[foundIndex] };
      
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

      // Update in the map
      userComplaints[foundIndex] = updatedComplaint;
      complaintsByUser.set(foundUserId, userComplaints);
      
      // Save to local storage
      saveComplaintsToStorage();

      // In a real app, this would trigger a notification to the citizen
      console.log(`Notification sent to citizen: Repair images added to your complaint #${complaintId}`);
      
      resolve(updatedComplaint);
    }, 500);
  });
};

// Delete complaint
export const deleteComplaint = (complaintId: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      let deleted = false;
      
      complaintsByUser.forEach((complaints, userId) => {
        const initialLength = complaints.length;
        const filteredComplaints = complaints.filter(c => c.id !== complaintId);
        
        if (filteredComplaints.length < initialLength) {
          complaintsByUser.set(userId, filteredComplaints);
          deleted = true;
        }
      });
      
      if (!deleted) {
        reject(new Error('Complaint not found'));
        return;
      }
      
      // Save to local storage
      saveComplaintsToStorage();
      
      resolve(true);
    }, 500);
  });
};
