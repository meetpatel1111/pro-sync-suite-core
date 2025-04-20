
import React, { useEffect, useState } from 'react';
import { 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Users
} from 'lucide-react';
import { getDashboardStats } from '@/services/dbService';
import { useAuth } from '@/hooks/useAuth';

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
  const { user, loading } = useAuth();
  const [stats, setStats] = useState({
    completedTasks: null,
    hoursTracked: null,
    openIssues: null,
    teamMembers: null
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user?.id) {
      setIsLoading(true);
      getDashboardStats(user.id)
        .then((data) => {
          setStats(data);
          setError(null);
        })
        .catch((e) => {
          setError('Failed to load dashboard stats');
        })
        .finally(() => setIsLoading(false));
    }
  }, [user, loading]);

  if (isLoading) {
    return <div className="col-span-4 text-center text-muted-foreground py-10">Loading dashboard statistics...</div>;
  }
  if (error) {
    return <div className="col-span-4 text-center text-red-500 py-10">{error}</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Completed Tasks"
        value={stats.completedTasks !== null && stats.completedTasks !== undefined ? String(stats.completedTasks) : '-'}
        trend="neutral"
        icon={<CheckCircle2 className="h-4 w-4 text-green-600" />}
      />
      <StatCard
        title="Hours Tracked"
        value={stats.hoursTracked !== null && stats.hoursTracked !== undefined ? String(stats.hoursTracked) : '-'}
        trend="neutral"
        icon={<Clock className="h-4 w-4 text-blue-600" />}
      />
      <StatCard
        title="Open Issues"
        value={stats.openIssues !== null && stats.openIssues !== undefined ? String(stats.openIssues) : '-'}
        trend="neutral"
        icon={<AlertCircle className="h-4 w-4 text-amber-600" />}
      />
      <StatCard
        title="Team Members"
        value={stats.teamMembers !== null && stats.teamMembers !== undefined ? String(stats.teamMembers) : '-'}
        trend="neutral"
        icon={<Users className="h-4 w-4 text-violet-600" />}
      />
    </div>
  );
};

export default DashboardStats;
