
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
      <Card className="h-full transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 border-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50">
        <CardContent className="p-6">
          <div className="flex flex-col h-full">
            {/* Icon Container */}
            <div className={`${bgColor} w-16 h-16 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
              <Icon className="h-8 w-8 text-white" />
            </div>
            
            {/* Content */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                  {title}
                </h3>
                <Badge variant="secondary" className="text-xs">
                  New
                </Badge>
              </div>
              
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {description}
              </p>
            </div>
            
            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
              {featureCount > 0 ? (
                <span className="text-xs text-muted-foreground">
                  {featureCount}+ features
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">
                  Ready to use
                </span>
              )}
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default AppCard;
