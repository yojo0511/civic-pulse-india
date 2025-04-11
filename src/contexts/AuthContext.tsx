
import React, { createContext, useState, useEffect, useContext } from 'react';
import { User } from '@/lib/types';
import { getStoredUser, storeUser, clearStoredUser, citizenLogin, citizenRegister, municipalLogin } from '@/lib/auth-utils';
import { toast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, role: 'citizen' | 'municipal') => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = getStoredUser();
    if (storedUser) {
      setUser(storedUser);
    }
    setIsLoading(false);
  }, []);
  
  const login = async (emailOrCode: string, password: string, role: 'citizen' | 'municipal') => {
    setIsLoading(true);
    try {
      let loggedInUser: User;
      
      if (role === 'citizen') {
        loggedInUser = await citizenLogin(emailOrCode, password);
      } else {
        loggedInUser = await municipalLogin(emailOrCode, password);
      }
      
      setUser(loggedInUser);
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
  
  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const registeredUser = await citizenRegister(name, email, password);
      setUser(registeredUser);
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
  
  const logout = () => {
    setUser(null);
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
      logout
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
