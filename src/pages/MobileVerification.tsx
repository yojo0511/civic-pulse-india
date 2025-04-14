
import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { Phone } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const MobileVerification: React.FC = () => {
  const { user, isAuthenticated, updateUserMobile } = useAuth();
  const navigate = useNavigate();
  const [mobileNumber, setMobileNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Redirect if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!mobileNumber || mobileNumber.length < 10) {
      toast({
        variant: "destructive",
        title: "Invalid mobile number",
        description: "Please enter a valid mobile number with at least 10 digits"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Update user with mobile number
      await updateUserMobile(mobileNumber);
      
      toast({
        title: "Mobile number verified",
        description: "Your mobile number has been successfully added to your account."
      });
      
      // Navigate to appropriate dashboard based on user role
      navigate(user?.role === 'citizen' ? '/citizen-dashboard' : '/municipal-dashboard');
    } catch (error) {
      console.error('Mobile verification failed:', error);
      toast({
        variant: "destructive",
        title: "Verification failed",
        description: "Failed to verify your mobile number. Please try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
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
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-civic-blue to-civic-green bg-clip-text text-transparent">Mobile Verification</h1>
            <div className="h-1 w-20 mx-auto bg-gradient-to-r from-civic-blue to-civic-green rounded-full mb-4"></div>
            <p className="text-muted-foreground">
              Please verify your mobile number to continue
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="mobile-number">Mobile Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="mobile-number"
                  type="tel"
                  placeholder="Enter your 10-digit mobile number"
                  className="pl-10"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Your mobile number will be used for verification and account recovery
              </p>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-civic-blue to-civic-green hover:opacity-90 transition-all"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Verifying...' : 'Verify & Continue'}
            </Button>
          </form>
          
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

export default MobileVerification;
