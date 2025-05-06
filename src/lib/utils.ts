
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

// Enhanced reverse geocoding for better address formats
export const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Enhanced address generation with more realistic structure
    // This is just for demo - a real app would use actual geocoding API
    
    // Define some areas based on coordinates
    const areas = [
      'Connaught Place', 'Karol Bagh', 'Chandni Chowk', 'Lajpat Nagar', 
      'Greater Kailash', 'Saket', 'Dwarka', 'Rohini', 'Pitampura'
    ];
    
    const streets = [
      'Main Road', 'Gandhi Street', 'Nehru Avenue', 'Patel Lane', 
      'Singh Market', 'Bose Marg', 'Tagore Road', 'Ashoka Lane'
    ];
    
    const districts = [
      'Central Delhi', 'North Delhi', 'South Delhi', 'East Delhi',
      'West Delhi', 'New Delhi District', 'North West Delhi'
    ];
    
    // Generate deterministic but seemingly random selections based on coordinates
    const areaIndex = Math.abs(Math.floor((lat * 10) % areas.length));
    const streetIndex = Math.abs(Math.floor((lng * 10) % streets.length));
    const districtIndex = Math.abs(Math.floor(((lat + lng) * 5) % districts.length));
    
    const area = areas[areaIndex];
    const street = streets[streetIndex];
    const district = districts[districtIndex];
    
    // Format the address in a readable way
    return `${area}, ${street}, ${district}`;
  } catch (error) {
    console.error('Geocoding error:', error);
    return '';
  }
};

// Format coordinates to human-readable format
export const formatCoordinates = (location: GeoLocation | undefined): string => {
  if (!location) return '';
  return `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`;
};
