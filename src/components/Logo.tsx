
import React from 'react';
import { Building2 } from 'lucide-react';

interface LogoProps {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
}

const Logo: React.FC<LogoProps> = ({ 
  className = "flex items-center gap-2", 
  iconClassName = "text-civic-blue h-6 w-6 animate-float",
  textClassName = "font-bold text-lg"
}) => {
  return (
    <div className={className}>
      <div className="relative">
        <div className="absolute inset-0 bg-civic-blue/20 blur-sm rounded-full"></div>
        <Building2 className={iconClassName} />
      </div>
      <span className={textClassName}>
        <span className="text-civic-blue bg-gradient-to-r from-civic-blue to-civic-blue bg-clip-text">Municipal Corporation</span>
        <span className="text-civic-green bg-gradient-to-r from-civic-green to-civic-green/80 bg-clip-text"> of India</span>
      </span>
    </div>
  );
};

export default Logo;
