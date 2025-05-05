
import React from 'react';
import { 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Users
} from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}

const StatCard = ({ title, value, change, icon, trend }: StatCardProps) => {
  const trendColor = trend === 'up' 
    ? 'text-green-600' 
    : trend === 'down' 
      ? 'text-red-600' 
      : 'text-gray-600';

  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className="rounded-md bg-secondary p-2">{icon}</div>
      </div>
      <div className="mt-2">
        <h3 className="text-2xl font-bold">{value}</h3>
        {change && (
          <p className={`flex items-center text-xs ${trendColor}`}>
            <ArrowUpRight className="mr-1 h-3 w-3" />
            {change} from last week
          </p>
        )}
      </div>
    </div>
  );
};

const DashboardStats = () => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Completed Tasks"
        value="147"
        change="12%"
        trend="up"
        icon={<CheckCircle2 className="h-4 w-4 text-green-600" />}
      />
      <StatCard
        title="Hours Tracked"
        value="215.5"
        change="8%"
        trend="up"
        icon={<Clock className="h-4 w-4 text-blue-600" />}
      />
      <StatCard
        title="Open Issues"
        value="23"
        change="5%"
        trend="down"
        icon={<AlertCircle className="h-4 w-4 text-amber-600" />}
      />
      <StatCard
        title="Team Members"
        value="18"
        change="2"
        trend="neutral"
        icon={<Users className="h-4 w-4 text-violet-600" />}
      />
    </div>
  );
};

export default DashboardStats;
