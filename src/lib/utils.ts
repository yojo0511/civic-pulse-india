
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

// Simulated reverse geocoding for demo purposes
// In a real app, this would call a geocoding API like Google Maps, Mapbox, or OpenStreetMap
export const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Generate different sample addresses based on coordinates
    // This is just for demo - a real app would use actual geocoding
    if (lat > 0 && lng > 0) {
      return 'Gandhi Nagar, North East Street, Delhi District';
    } else if (lat > 0 && lng < 0) {
      return 'Rajiv Chowk, North West Road, Central District';
    } else if (lat < 0 && lng > 0) {
      return 'Patel Road, South East Colony, South District';
    } else {
      return 'Nehru Market, South West Area, West District';
    }
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
