
import React, { createContext, useState, useEffect, useContext } from 'react';
import { User } from '@/lib/types';
import { getStoredUser, storeUser, clearStoredUser, citizenLogin, citizenRegister, municipalLogin } from '@/lib/auth-utils';
import { toast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (nameOrCode: string, password: string, role: 'citizen' | 'municipal') => Promise<void>;
  register: (name: string, password: string) => Promise<void>;
  logout: () => void;
  updateUserMobile: (mobileNumber: string) => Promise<void>;
  isMobileVerified: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileVerified, setIsMobileVerified] = useState(false);
  
  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = getStoredUser();
    if (storedUser) {
      setUser(storedUser);
      setIsMobileVerified(!!storedUser.mobileNumber);
    }
    setIsLoading(false);
  }, []);
  
  const login = async (nameOrCode: string, password: string, role: 'citizen' | 'municipal') => {
    setIsLoading(true);
    try {
      let loggedInUser: User;
      
      if (role === 'citizen') {
        loggedInUser = await citizenLogin(nameOrCode, password);
      } else {
        loggedInUser = await municipalLogin(nameOrCode, password);
      }
      
      setUser(loggedInUser);
      setIsMobileVerified(!!loggedInUser.mobileNumber);
      storeUser(loggedInUser);
      toast({
        title: "Login successful",
        description: `Welcome back, ${loggedInUser.name}!`,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to login';
      toast({
        variant: "destructive",
        title: "Login failed",
        description: errorMessage,
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const register = async (name: string, password: string) => {
    setIsLoading(true);
    try {
      const registeredUser = await citizenRegister(name, password);
      setUser(registeredUser);
      setIsMobileVerified(false);
      storeUser(registeredUser);
      toast({
        title: "Registration successful",
        description: `Welcome, ${registeredUser.name}!`,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to register';
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: errorMessage,
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const updateUserMobile = async (mobileNumber: string): Promise<void> => {
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Simulate API call to update mobile number
    return new Promise((resolve) => {
      setTimeout(() => {
        const updatedUser = {
          ...user,
          mobileNumber
        };
        
        setUser(updatedUser);
        setIsMobileVerified(true);
        storeUser(updatedUser);
        resolve();
      }, 1000);
    });
  };
  
  const logout = () => {
    setUser(null);
    setIsMobileVerified(false);
    clearStoredUser();
    toast({
      title: "Logged out successfully",
    });
  };
  
  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      isLoading,
      login,
      register,
      logout,
      updateUserMobile,
      isMobileVerified
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
