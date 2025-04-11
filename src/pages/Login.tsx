
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
        <div className="w-full max-w-md mx-auto p-8 bg-white rounded-xl shadow-lg border border-gray-200 relative overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-civic-blue/10 rounded-full blur-xl"></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-civic-green/10 rounded-full blur-xl"></div>
          
          <div className="text-center mb-8 relative">
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-civic-blue to-civic-green bg-clip-text text-transparent">Welcome</h1>
            <p className="text-muted-foreground">
              Sign in to report issues and track their resolution with the Municipal Corporation of India
            </p>
          </div>
          
          <LoginForm />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Login;
