
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { ColorfulButton } from '@/components/ui/colorful-button';
import { LucideIcon, ArrowRight, Zap, Star } from 'lucide-react';

interface AppCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  bgColor: string;
  route: string;
  featureCount?: number;
}

const AppCard = ({ title, description, icon: Icon, bgColor, route, featureCount }: AppCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(route);
  };

  return (
    <div className="group relative overflow-hidden">
      {/* Compact Card */}
      <div 
        className="relative p-4 rounded-2xl shadow-lg transition-all duration-300 cursor-pointer hover:shadow-xl hover:-translate-y-1 hover:scale-105 border border-white/20 backdrop-blur-sm animate-fade-in-up min-h-[120px] flex flex-col justify-between"
        onClick={handleClick}
      >
        {/* Gradient Background */}
        <div className={`absolute inset-0 ${bgColor} opacity-90 rounded-2xl`} />
        
        {/* Animated Background Elements */}
        <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-8 translate-x-8 group-hover:scale-125 transition-transform duration-500" />
        <div className="absolute bottom-0 left-0 w-12 h-12 bg-white/10 rounded-full translate-y-6 -translate-x-6 group-hover:scale-110 transition-transform duration-500" />
        
        {/* Content */}
        <div className="relative z-10 space-y-2">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm group-hover:bg-white/30 transition-colors duration-300 group-hover:scale-110 transform">
              <Icon className="h-5 w-5 text-white drop-shadow-lg" />
            </div>
            {featureCount !== undefined && featureCount > 0 && (
              <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm text-xs">
                {featureCount}
              </Badge>
            )}
          </div>

          {/* Title */}
          <div>
            <h3 className="text-sm font-bold text-white drop-shadow-lg group-hover:scale-105 transition-transform duration-300 leading-tight">
              {title}
            </h3>
          </div>

          {/* Footer - Simple indicator */}
          <div className="flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <ArrowRight className="h-3 w-3 text-white group-hover:translate-x-1 transition-transform duration-300" />
          </div>
        </div>

        {/* Shine Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
      </div>

      {/* Hover Glow Effect */}
      <div className={`absolute inset-0 ${bgColor} opacity-0 group-hover:opacity-20 rounded-2xl blur-lg transition-opacity duration-300 -z-10`} />
    </div>
  );
};

export default AppCard;
