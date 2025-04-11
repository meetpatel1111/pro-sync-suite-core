
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

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
  icon: Icon,
  bgColor,
  route,
  featureCount
}: AppCardProps) => {
  return (
    <Link to={route}>
      <div className="group app-card h-full overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-1">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={cn("app-card-icon rounded-md p-2", bgColor)}>
              <Icon className="h-6 w-6 text-white" />
            </div>
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
