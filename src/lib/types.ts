
export type UserRole = 'citizen' | 'municipal';

export interface User {
  id: string;
  name: string;
  email?: string;
  role: UserRole;
  code?: string;
  mobileNumber?: string;
}

export interface GeoLocation {
  lat: number;
  lng: number;
  address?: string;
  area?: string;
  street?: string;
  district?: string;
}

export interface Complaint {
  id: string;
  title: string;
  description: string;
  location: string;
  geoLocation?: GeoLocation;
  status: 'pending' | 'assigned' | 'in-progress' | 'completed' | 'rejected';
  date: string;
  userId: string;
  userName: string;
  images?: string[];
  videos?: string[];
  assignedTo?: string;
  repairImages?: string[]; // Images added by municipal officers after repair
  comments?: {
    id: string;
    text: string;
    userId: string;
    userName: string;
    date: string;
  }[];
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
