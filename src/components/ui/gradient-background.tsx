
import React from 'react';
import { cn } from '@/lib/utils';

interface GradientBackgroundProps {
  variant?: 'default' | 'purple' | 'blue' | 'green' | 'orange' | 'pink' | 'teal' | 'indigo';
  className?: string;
  children: React.ReactNode;
}

const gradientVariants = {
  default: 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900',
  purple: 'bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900',
  blue: 'bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900',
  green: 'bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900',
  orange: 'bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900',
  pink: 'bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900',
  teal: 'bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900',
  indigo: 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900'
};

export const GradientBackground: React.FC<GradientBackgroundProps> = ({ 
  variant = 'default', 
  className, 
  children 
}) => {
  return (
    <div className={cn(gradientVariants[variant], className)}>
      {children}
    </div>
  );
};
