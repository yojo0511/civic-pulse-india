
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import Logo from './Logo';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, User, LayoutDashboard } from 'lucide-react';

const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  return (
    <header className="bg-gradient-to-r from-white to-blue-50 shadow-md sticky top-0 z-10 border-b border-civic-blue/10">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center relative group">
          <span className="absolute -inset-2 bg-gradient-to-r from-civic-blue/10 to-civic-green/10 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity"></span>
          <Logo />
        </Link>
        
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 bg-white border-civic-blue/20 hover:bg-civic-blue/5 transition-colors">
                  <User className="h-4 w-4 text-civic-blue" />
                  <span className="font-medium text-civic-dark">{user?.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 border-civic-blue/20 shadow-lg animate-fade-in">
                <DropdownMenuLabel className="text-civic-blue">My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="flex items-center gap-2 cursor-pointer hover:bg-civic-blue/5"
                  onClick={() => navigate(user?.role === 'citizen' ? "/citizen-dashboard" : "/municipal-dashboard")}
                >
                  <LayoutDashboard className="h-4 w-4 text-civic-blue" />
                  <span>Dashboard</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="flex items-center gap-2 text-civic-orange hover:text-destructive cursor-pointer" 
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/login">
              <Button className="bg-gradient-to-r from-civic-blue to-civic-green hover:opacity-90 text-white transition-all shadow hover:shadow-md">
                Login
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
