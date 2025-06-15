
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AppCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  bgColor: string;
  route: string;
  featureCount: number;
}

const AppCard: React.FC<AppCardProps> = ({ 
  title, 
  description, 
  icon: Icon, 
  bgColor, 
  route, 
  featureCount 
}) => {
  return (
    <Link to={route} className="block group">
      <Card className="h-full transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-3 border-0 modern-card group-hover:border-primary/20 overflow-hidden">
        <CardContent className="p-6 h-full">
          <div className="flex flex-col h-full">
            {/* Icon Container with Enhanced Animations */}
            <div className="relative mb-6">
              <div className={`${bgColor} w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg group-hover:shadow-2xl relative z-10`}>
                <Icon className="h-8 w-8 text-white group-hover:scale-110 transition-transform duration-300" />
              </div>
              {/* Glow effect */}
              <div className={`${bgColor} w-16 h-16 rounded-2xl absolute top-0 left-0 opacity-0 group-hover:opacity-30 blur-xl transition-all duration-500 scale-150`}></div>
            </div>
            
            {/* Content */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-primary transition-colors duration-300 leading-tight">
                  {title}
                </h3>
                <Badge 
                  variant="secondary" 
                  className="text-xs bg-gradient-to-r from-primary/10 to-primary/5 text-primary border border-primary/20 group-hover:from-primary group-hover:to-primary/80 group-hover:text-white transition-all duration-300"
                >
                  New
                </Badge>
              </div>
              
              <p className="text-sm text-muted-foreground mb-6 line-clamp-2 leading-relaxed group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-300">
                {description}
              </p>
            </div>
            
            {/* Footer with Enhanced Styling */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800 group-hover:border-primary/20 transition-colors duration-300">
              {featureCount > 0 ? (
                <span className="text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors duration-300">
                  {featureCount}+ features
                </span>
              ) : (
                <span className="text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors duration-300">
                  Ready to use
                </span>
              )}
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 group-hover:bg-emerald-500 group-hover:scale-125 transition-all duration-300 shadow-lg shadow-emerald-400/50"></div>
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Active
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default AppCard;
