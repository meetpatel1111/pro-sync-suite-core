
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
      {/* Main Card */}
      <div 
        className="relative p-8 rounded-3xl shadow-xl transition-all duration-500 cursor-pointer hover:shadow-2xl hover:-translate-y-2 hover:scale-105 border-2 border-white/20 backdrop-blur-sm animate-fade-in-up"
        onClick={handleClick}
      >
        {/* Gradient Background */}
        <div className={`absolute inset-0 ${bgColor} opacity-90 rounded-3xl`} />
        
        {/* Animated Background Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12 group-hover:scale-125 transition-transform duration-700" />
        
        {/* Content */}
        <div className="relative z-10 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm group-hover:bg-white/30 transition-colors duration-300 group-hover:scale-110 transform">
              <Icon className="h-8 w-8 text-white drop-shadow-lg" />
            </div>
            <div className="flex flex-col gap-2">
              <Star className="h-5 w-5 text-yellow-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse" />
              {featureCount !== undefined && featureCount > 0 && (
                <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                  {featureCount} new
                </Badge>
              )}
            </div>
          </div>

          {/* Title & Description */}
          <div className="space-y-3">
            <h3 className="text-2xl font-bold text-white drop-shadow-lg group-hover:scale-105 transition-transform duration-300">
              {title}
            </h3>
            <p className="text-white/90 text-sm leading-relaxed group-hover:text-white transition-colors duration-300">
              {description}
            </p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center gap-2 text-white/80 text-sm">
              <Zap className="h-4 w-4" />
              <span>Enhanced</span>
            </div>
            
            <div className="flex items-center gap-2 text-white group-hover:translate-x-1 transition-transform duration-300">
              <span className="text-sm font-medium">Launch</span>
              <ArrowRight className="h-4 w-4 group-hover:scale-125 transition-transform duration-300" />
            </div>
          </div>
        </div>

        {/* Shine Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
      </div>

      {/* Hover Glow Effect */}
      <div className={`absolute inset-0 ${bgColor} opacity-0 group-hover:opacity-20 rounded-3xl blur-xl transition-opacity duration-500 -z-10`} />
    </div>
  );
};

export default AppCard;
