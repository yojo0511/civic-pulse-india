
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Complaint, GeoLocation } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getStatusColor = (status: Complaint['status']) => {
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

export const getStatusLabel = (status: Complaint['status']) => {
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

// Enhanced reverse geocoding that attempts to use actual location data
export const reverseGeocode = async (lat: number, lng: number): Promise<{ 
  fullAddress: string;
  area: string;
  street: string;
  district: string;
}> => {
  try {
    // In a real app, we would use a real geocoding API like Google Maps, Mapbox, etc.
    // For our demo, we're going to use a more deterministic approach based on the actual coordinates
    
    // Create a meaningful location name based on the actual coordinates
    // This makes the location feel more connected to the actual coordinates
    const latStr = lat.toFixed(4);
    const lngStr = lng.toFixed(4);

    // Generate location components based on the actual coordinates
    // These could be customized based on known areas in your target location
    // This is still a simulation but at least tied to the actual coordinates
    
    // For demo: Define a more specific approach based on coordinate ranges
    // This makes the locations predictably tied to latitude/longitude
    
    // Define districts based on lat (north/south)
    let district = '';
    if (lat > 28.7) district = 'North Delhi';
    else if (lat > 28.6) district = 'Central Delhi';
    else if (lat > 28.5) district = 'South Delhi';
    else district = 'Extended South Delhi';
    
    // Define areas based on lng (east/west)
    let area = '';
    if (lng > 77.3) area = 'East Delhi Area';
    else if (lng > 77.2) area = 'Central Delhi Area';
    else if (lng > 77.1) area = 'West Delhi Area';
    else area = 'Extended West Delhi';
    
    // Define street based on the combination
    const streetNumber = Math.abs(Math.floor((lat * lng * 1000) % 100));
    const street = `${streetNumber} Main Street`;
    
    // Format the address in a readable way using the actual location data
    const fullAddress = `${area}, ${street}, ${district}`;
    
    return {
      fullAddress,
      area,
      street,
      district
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    // Fallback for when geocoding fails
    return {
      fullAddress: `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
      area: `Area near ${lat.toFixed(2)}, ${lng.toFixed(2)}`,
      street: 'Unknown Street',
      district: 'Unknown District'
    };
  }
};

// Format coordinates to human-readable format
export const formatCoordinates = (location: GeoLocation | undefined): string => {
  if (!location) return '';
  return `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`;
};

// Get status timeline steps for a complaint
export const getComplaintStatusTimeline = (complaint: Complaint) => {
  const steps = [
    { 
      label: 'Received',
      completed: true,
      date: complaint.date
    },
    { 
      label: 'Assigned',
      completed: ['assigned', 'in-progress', 'completed'].includes(complaint.status),
      date: complaint.comments?.find(c => c.text.includes('assigned'))?.date
    },
    { 
      label: 'In Progress',
      completed: ['in-progress', 'completed'].includes(complaint.status),
      date: complaint.comments?.find(c => c.text.includes('progress'))?.date
    },
    { 
      label: 'Completed',
      completed: complaint.status === 'completed',
      date: complaint.comments?.find(c => c.text.includes('completed'))?.date
    }
  ];

  if (complaint.status === 'rejected') {
    steps.push({
      label: 'Rejected',
      completed: true,
      date: complaint.comments?.find(c => c.text.includes('rejected'))?.date
    });
  }

  return steps;
};
