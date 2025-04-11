
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AppIconProps {
  icon: LucideIcon;
  bgColor: string;
  size?: 'sm' | 'md' | 'lg';
}

const AppIcon = ({ icon: Icon, bgColor, size = 'md' }: AppIconProps) => {
  const sizeClasses = {
    sm: 'p-1.5 h-8 w-8',
    md: 'p-2 h-10 w-10',
    lg: 'p-3 h-14 w-14'
  };

  const iconSizes = {
    sm: 'h-5 w-5',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <div className={cn("rounded-md flex items-center justify-center", bgColor, sizeClasses[size])}>
      <Icon className={cn("text-white", iconSizes[size])} />
    </div>
  );
};

export default AppIcon;
