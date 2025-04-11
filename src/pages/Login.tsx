
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
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow flex items-center justify-center bg-gradient-to-br from-civic-blue/10 to-civic-green/10">
        <div className="w-full max-w-md mx-auto p-8 bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="text-center mb-8">
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
