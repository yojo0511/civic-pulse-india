
import React from 'react';
import { Navigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LoginForm from '@/components/LoginForm';
import { useAuth } from '@/contexts/AuthContext';

const Login: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  
  // Redirect authenticated users
  if (isAuthenticated) {
    return <Navigate to={user?.role === 'citizen' ? "/citizen-dashboard" : "/municipal-dashboard"} replace />;
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-r from-blue-50 to-green-50">
      <Header />
      
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-md mx-auto p-8 bg-white rounded-xl shadow-xl border border-gray-200 relative overflow-hidden animate-fade-in">
          {/* Background decorative elements */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-civic-blue/20 rounded-full blur-xl"></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-civic-green/20 rounded-full blur-xl"></div>
          <div className="absolute top-20 left-10 w-20 h-20 bg-civic-orange/10 rounded-full blur-lg animate-pulse-slow"></div>
          
          <div className="text-center mb-8 relative">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-civic-blue to-civic-green bg-clip-text text-transparent">Welcome Back</h1>
            <div className="h-1 w-20 mx-auto bg-gradient-to-r from-civic-blue to-civic-green rounded-full mb-4"></div>
            <p className="text-muted-foreground">
              Sign in to report issues and track their resolution with the Municipal Corporation of India
            </p>
          </div>
          
          <LoginForm />
          
          {/* Decorative corner element */}
          <div className="absolute bottom-0 right-0 w-16 h-16 overflow-hidden">
            <div className="absolute -bottom-8 -right-8 w-16 h-16 bg-gradient-to-br from-civic-blue to-civic-green rotate-45"></div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Login;
