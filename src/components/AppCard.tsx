
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import AppIcon from './AppIcon';

interface AppCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  bgColor: string;
  route: string;
  featureCount: number;
}

const AppCard = ({
  title,
  description,
  icon,
  bgColor,
  route,
  featureCount
}: AppCardProps) => {
  return (
    <Link to={route} className="block h-full">
      <div className="group h-full overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-1">
        <div className="p-5">
          <div className="flex flex-col space-y-4">
            <AppIcon icon={icon} bgColor={bgColor} size="md" />
            <div className="space-y-1">
              <h3 className="font-semibold tracking-tight text-lg">{title}</h3>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </div>
          <div className="mt-4 text-xs text-muted-foreground">
            {featureCount} Features
          </div>
        </div>
      </div>
    </Link>
  );
};

export default AppCard;
