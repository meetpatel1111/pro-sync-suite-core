
export interface AppHealthMetric {
  id: string;
  app: string;
  app_name: string;
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  uptime_percentage: number;
  responseTime: number;
  response_time_ms: number;
  lastChecked: Date;
  last_check_at: string;
  errorCount: number;
  error_rate: number;
}

export interface AppPerformanceMetric {
  id: string;
  app_name: string;
  recorded_at: string;
  success_rate: number;
  avg_response_time_ms: number;
  error_count: number;
}

export class AppMonitoringService {
  async getHealthMetrics(userId: string): Promise<AppHealthMetric[]> {
    // Mock implementation
    return [
      {
        id: '1',
        app: 'TaskMaster',
        app_name: 'TaskMaster',
        status: 'healthy',
        uptime: 99.8,
        uptime_percentage: 99.8,
        responseTime: 245,
        response_time_ms: 245,
        lastChecked: new Date(),
        last_check_at: new Date().toISOString(),
        errorCount: 2,
        error_rate: 0.2
      },
      {
        id: '2',
        app: 'TimeTrackPro',
        app_name: 'TimeTrackPro',
        status: 'warning',
        uptime: 98.2,
        uptime_percentage: 98.2,
        responseTime: 890,
        response_time_ms: 890,
        lastChecked: new Date(),
        last_check_at: new Date().toISOString(),
        errorCount: 15,
        error_rate: 1.5
      },
      {
        id: '3',
        app: 'BudgetBuddy',
        app_name: 'BudgetBuddy',
        status: 'healthy',
        uptime: 99.9,
        uptime_percentage: 99.9,
        responseTime: 180,
        response_time_ms: 180,
        lastChecked: new Date(),
        last_check_at: new Date().toISOString(),
        errorCount: 0,
        error_rate: 0
      }
    ];
  }

  async getPerformanceMetrics(userId: string, startDate: string, endDate: string): Promise<AppPerformanceMetric[]> {
    // Mock implementation
    return [
      {
        id: '1',
        app_name: 'TaskMaster',
        recorded_at: new Date().toISOString(),
        success_rate: 99.5,
        avg_response_time_ms: 245,
        error_count: 2
      }
    ];
  }

  async runHealthChecks(userId: string): Promise<void> {
    // Mock implementation
    console.log('Running health checks for user:', userId);
  }

  async initializeMonitoring(userId: string): Promise<void> {
    // Mock implementation
    console.log('Initializing monitoring for user:', userId);
  }

  async checkAppHealth(appName: string): Promise<AppHealthMetric> {
    // Mock implementation
    return {
      id: '1',
      app: appName,
      app_name: appName,
      status: 'healthy',
      uptime: 99.5,
      uptime_percentage: 99.5,
      responseTime: 320,
      response_time_ms: 320,
      lastChecked: new Date(),
      last_check_at: new Date().toISOString(),
      errorCount: 1,
      error_rate: 0.1
    };
  }
}

export const appMonitoringService = new AppMonitoringService();

// Legacy export for backward compatibility
export class AppHealthService extends AppMonitoringService {}
export const appHealthService = new AppHealthService();
