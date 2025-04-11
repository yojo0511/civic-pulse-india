
import { User, UserRole } from './types';

// Sample municipal office users
const municipalUsers = [
  { code: 'MO01', password: 'pass001', name: 'Office North Zone' },
  { code: 'MO02', password: 'pass002', name: 'Office South Zone' },
  { code: 'MO03', password: 'pass003', name: 'Office East Zone' },
  { code: 'MO04', password: 'pass004', name: 'Office West Zone' },
  { code: 'MO05', password: 'pass005', name: 'Office Central Zone' },
  { code: 'MO06', password: 'pass006', name: 'Office Waste Management' },
  { code: 'MO07', password: 'pass007', name: 'Office Road Maintenance' },
  { code: 'MO08', password: 'pass008', name: 'Office Water Supply' },
  { code: 'MO09', password: 'pass009', name: 'Office Sanitation' },
  { code: 'MO10', password: 'pass010', name: 'Office Public Works' },
];

// Mock citizen login
export const citizenLogin = (email: string, password: string): Promise<User> => {
  return new Promise((resolve, reject) => {
    // Simulate API call
    setTimeout(() => {
      // Check if email and password meet minimum criteria
      if (!email || !password || password.length < 6) {
        reject(new Error('Invalid credentials'));
        return;
      }
      
      // For demo, any valid format email/password combo works
      resolve({
        id: Math.random().toString(36).substring(2, 10),
        name: email.split('@')[0],
        email,
        role: 'citizen'
      });
    }, 800);
  });
};

// Mock citizen registration
export const citizenRegister = (name: string, email: string, password: string): Promise<User> => {
  return new Promise((resolve, reject) => {
    // Simulate API call
    setTimeout(() => {
      // Validate inputs
      if (!name || !email || !password || password.length < 6) {
        reject(new Error('Invalid registration details'));
        return;
      }
      
      // For demo, registration always succeeds
      resolve({
        id: Math.random().toString(36).substring(2, 10),
        name,
        email,
        role: 'citizen'
      });
    }, 800);
  });
};

// Mock municipal office login
export const municipalLogin = (code: string, password: string): Promise<User> => {
  return new Promise((resolve, reject) => {
    // Simulate API call
    setTimeout(() => {
      const office = municipalUsers.find(user => user.code === code && user.password === password);
      
      if (!office) {
        reject(new Error('Invalid municipal office credentials'));
        return;
      }
      
      resolve({
        id: code,
        name: office.name,
        email: `${code.toLowerCase()}@municipality.gov.in`,
        role: 'municipal',
        code
      });
    }, 800);
  });
};

// Store user in local storage
export const storeUser = (user: User): void => {
  localStorage.setItem('civic_user', JSON.stringify(user));
};

// Retrieve user from local storage
export const getStoredUser = (): User | null => {
  const userJson = localStorage.getItem('civic_user');
  if (!userJson) return null;
  
  try {
    return JSON.parse(userJson) as User;
  } catch (error) {
    console.error('Failed to parse stored user', error);
    return null;
  }
};

// Clear stored user
export const clearStoredUser = (): void => {
  localStorage.removeItem('civic_user');
};
