
import React from 'react';
import { Building2 } from 'lucide-react';

interface LogoProps {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
}

const Logo: React.FC<LogoProps> = ({ 
  className = "flex items-center gap-2", 
  iconClassName = "text-civic-blue h-6 w-6",
  textClassName = "font-bold text-lg"
}) => {
  return (
    <div className={className}>
      <Building2 className={iconClassName} />
      <span className={textClassName}>
        <span className="text-civic-blue">Municipal Corporation</span>
        <span className="text-civic-green"> of India</span>
      </span>
    </div>
  );
};

export default Logo;
