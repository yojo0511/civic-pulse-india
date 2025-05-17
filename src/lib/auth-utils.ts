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

// Ensure consistent user IDs for citizens
const citizenUserMap = new Map();

// Mock citizen login
export const citizenLogin = (name: string, password: string): Promise<User> => {
  return new Promise((resolve, reject) => {
    // Simulate API call
    setTimeout(() => {
      // Check if name and password meet minimum criteria
      if (!name || !password || password.length < 6) {
        reject(new Error('Invalid credentials'));
        return;
      }
      
      // Use existing user ID if this user has logged in before
      let userId = generateConsistentUserId(name, password);
      
      // For demo, any valid format name/password combo works
      resolve({
        id: userId,
        name,
        role: 'citizen'
      });
    }, 800);
  });
};

// Mock citizen registration
export const citizenRegister = (name: string, password: string): Promise<User> => {
  return new Promise((resolve, reject) => {
    // Simulate API call
    setTimeout(() => {
      // Validate inputs
      if (!name || !password || password.length < 6) {
        reject(new Error('Invalid registration details'));
        return;
      }
      
      // Generate a consistent user ID for this user
      const userId = generateConsistentUserId(name, password);
      
      // For demo, registration always succeeds
      resolve({
        id: userId,
        name,
        role: 'citizen'
      });
    }, 800);
  });
};

// Generate consistent user IDs
function generateConsistentUserId(name: string, password: string): string {
  const userKey = `${name}:${password}`;
  
  // If we already have an ID for this user, return it
  if (citizenUserMap.has(userKey)) {
    return citizenUserMap.get(userKey);
  }
  
  // Otherwise, generate a new ID that will be consistent for this user
  const userId = generateDeterministicId(name, password);
  citizenUserMap.set(userKey, userId);
  return userId;
}

// Generate a deterministic ID based on name and password
function generateDeterministicId(name: string, password: string): string {
  // Create a simple hash from the name and password
  // This is just for demo purposes - not for actual security
  let hash = 0;
  const combinedString = name + password;
  for (let i = 0; i < combinedString.length; i++) {
    const char = combinedString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Convert to a string with prefix
  return 'u' + Math.abs(hash).toString(16).substring(0, 8);
}

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
        role: 'municipal',
        code
      });
    }, 800);
  });
};

// Store user in local storage
export const storeUser = (user: User): void => {
  localStorage.setItem('civic_user', JSON.stringify(user));
  console.log("User data stored in local storage:", user.id);
};

// Retrieve user from local storage
export const getStoredUser = (): User | null => {
  const userJson = localStorage.getItem('civic_user');
  if (!userJson) return null;
  
  try {
    const user = JSON.parse(userJson) as User;
    console.log("Retrieved user from local storage:", user.id);
    return user;
  } catch (error) {
    console.error('Failed to parse stored user', error);
    return null;
  }
};

// Clear stored user
export const clearStoredUser = (): void => {
  localStorage.removeItem('civic_user');
  console.log("User data cleared from local storage");
};
