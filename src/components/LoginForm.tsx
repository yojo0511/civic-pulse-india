
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, Mail, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const LoginForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();
  
  // Citizen login form state
  const [citizenEmail, setCitizenEmail] = useState('');
  const [citizenPassword, setCitizenPassword] = useState('');
  
  // Citizen register form state
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  
  // Municipal login form state
  const [officeCode, setOfficeCode] = useState('');
  const [officePassword, setOfficePassword] = useState('');
  
  const handleCitizenLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await login(citizenEmail, citizenPassword, 'citizen');
      navigate('/citizen-dashboard');
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCitizenRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await register(registerName, registerEmail, registerPassword);
      navigate('/citizen-dashboard');
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleMunicipalLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await login(officeCode, officePassword, 'municipal');
      navigate('/municipal-dashboard');
    } catch (error) {
      console.error('Municipal login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="w-full max-w-md mx-auto space-y-6 animate-fade-in">
      <Tabs defaultValue="citizen" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="citizen" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>Citizen</span>
          </TabsTrigger>
          <TabsTrigger value="municipal" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span>Municipal Office</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="citizen" className="space-y-4 pt-4">
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="pt-4">
              <form onSubmit={handleCitizenLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="citizen-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="citizen-email"
                      type="email"
                      placeholder="your.email@example.com"
                      className="pl-10"
                      value={citizenEmail}
                      onChange={(e) => setCitizenEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="citizen-password">Password</Label>
                  <Input
                    id="citizen-password"
                    type="password"
                    placeholder="********"
                    value={citizenPassword}
                    onChange={(e) => setCitizenPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Logging in...' : 'Login'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="register" className="pt-4">
              <form onSubmit={handleCitizenRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="register-name"
                      type="text"
                      placeholder="John Doe"
                      className="pl-10"
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="your.email@example.com"
                      className="pl-10"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password">Password</Label>
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="********"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    minLength={6}
                    required
                  />
                  <p className="text-xs text-muted-foreground">Password must be at least 6 characters</p>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </TabsContent>
        
        <TabsContent value="municipal" className="space-y-4 pt-4">
          <form onSubmit={handleMunicipalLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="office-code">Office Code</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="office-code"
                  type="text"
                  placeholder="MO01"
                  className="pl-10"
                  value={officeCode}
                  onChange={(e) => setOfficeCode(e.target.value)}
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Enter your assigned office code (e.g., MO01 to MO10)
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="office-password">Password</Label>
              <Input
                id="office-password"
                type="password"
                placeholder="********"
                value={officePassword}
                onChange={(e) => setOfficePassword(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Enter your office password (e.g., pass001 to pass010)
              </p>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LoginForm;
