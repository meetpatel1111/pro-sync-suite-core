
import { supabase } from '@/integrations/supabase/client';

export interface AppHealthMetric {
  id: string;
  user_id: string;
  app_name: string;
  status: 'healthy' | 'warning' | 'critical';
  response_time_ms: number;
  uptime_percentage: number;
  error_rate: number;
  last_check_at: string;
  created_at: string;
  updated_at: string;
}

export interface AppPerformanceMetric {
  id: string;
  user_id: string;
  app_name: string;
  requests_per_minute: number;
  success_rate: number;
  avg_response_time_ms: number;
  error_count: number;
  recorded_at: string;
  created_at: string;
}

export interface AppAvailabilityCheck {
  id: string;
  user_id: string;
  app_name: string;
  endpoint_url: string;
  check_type: string;
  is_available: boolean;
  response_time_ms?: number;
  status_code?: number;
  error_message?: string;
  checked_at: string;
  created_at: string;
}

// ProSync Suite app configurations
const APP_ENDPOINTS = {
  'TaskMaster': '/api/taskmaster/health',
  'TimeTrackPro': '/api/timetrack/health',
  'CollabSpace': '/api/collab/health',
  'PlanBoard': '/api/planboard/health',
  'FileVault': '/api/filevault/health',
  'BudgetBuddy': '/api/budget/health',
  'InsightIQ': '/api/insights/health',
  'ResourceHub': '/api/resources/health',
  'ClientConnect': '/api/clients/health',
  'RiskRadar': '/api/risks/health'
};

export const appMonitoringService = {
  // Get all health metrics for a user
  async getHealthMetrics(userId: string): Promise<AppHealthMetric[]> {
    const { data, error } = await supabase
      .from('app_health_metrics')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching health metrics:', error);
      return [];
    }

    // Type assertion to ensure status field matches our interface
    return (data || []).map(item => ({
      ...item,
      status: item.status as 'healthy' | 'warning' | 'critical'
    })) as AppHealthMetric[];
  },

  // Get performance metrics for a user within a time range
  async getPerformanceMetrics(
    userId: string, 
    startDate?: string, 
    endDate?: string
  ): Promise<AppPerformanceMetric[]> {
    let query = supabase
      .from('app_performance_metrics')
      .select('*')
      .eq('user_id', userId);

    if (startDate) {
      query = query.gte('recorded_at', startDate);
    }
    if (endDate) {
      query = query.lte('recorded_at', endDate);
    }

    const { data, error } = await query.order('recorded_at', { ascending: false });

    if (error) {
      console.error('Error fetching performance metrics:', error);
      return [];
    }

    return data || [];
  },

  // Check availability of a single app
  async checkAppAvailability(userId: string, appName: string): Promise<AppAvailabilityCheck | null> {
    const endpoint = APP_ENDPOINTS[appName as keyof typeof APP_ENDPOINTS];
    if (!endpoint) {
      console.warn(`No endpoint configured for app: ${appName}`);
      return null;
    }

    const startTime = Date.now();
    let isAvailable = false;
    let responseTime = 0;
    let statusCode = 0;
    let errorMessage = '';

    try {
      // For now, simulate API calls since we don't have real endpoints yet
      // In a real implementation, this would make actual HTTP requests
      const mockLatency = Math.random() * 500 + 50; // 50-550ms
      await new Promise(resolve => setTimeout(resolve, mockLatency));
      
      responseTime = Date.now() - startTime;
      isAvailable = Math.random() > 0.1; // 90% success rate
      statusCode = isAvailable ? 200 : 500;
      
      if (!isAvailable) {
        errorMessage = 'Service temporarily unavailable';
      }
    } catch (error) {
      responseTime = Date.now() - startTime;
      isAvailable = false;
      errorMessage = error instanceof Error ? error.message : 'Unknown error';
    }

    // Save the availability check
    const { data, error: insertError } = await supabase
      .from('app_availability_checks')
      .insert({
        user_id: userId,
        app_name: appName,
        endpoint_url: endpoint,
        check_type: 'http',
        is_available: isAvailable,
        response_time_ms: responseTime,
        status_code: statusCode,
        error_message: errorMessage || null,
        checked_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error saving availability check:', insertError);
      return null;
    }

    return data;
  },

  // Update health metrics for an app
  async updateHealthMetric(
    userId: string,
    appName: string,
    status: 'healthy' | 'warning' | 'critical',
    responseTime: number,
    uptimePercentage: number,
    errorRate: number
  ): Promise<void> {
    const { error } = await supabase.rpc('update_app_health_metric', {
      p_user_id: userId,
      p_app_name: appName,
      p_status: status,
      p_response_time_ms: responseTime,
      p_uptime_percentage: uptimePercentage,
      p_error_rate: errorRate
    });

    if (error) {
      console.error('Error updating health metric:', error);
      throw error;
    }
  },

  // Record performance metrics
  async recordPerformanceMetrics(
    userId: string,
    appName: string,
    requestsPerMinute: number,
    successRate: number,
    avgResponseTime: number,
    errorCount: number
  ): Promise<void> {
    const { error } = await supabase
      .from('app_performance_metrics')
      .insert({
        user_id: userId,
        app_name: appName,
        requests_per_minute: requestsPerMinute,
        success_rate: successRate,
        avg_response_time_ms: avgResponseTime,
        error_count: errorCount,
        recorded_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error recording performance metrics:', error);
      throw error;
    }
  },

  // Run health checks for all apps
  async runHealthChecks(userId: string): Promise<void> {
    const appNames = Object.keys(APP_ENDPOINTS);
    const results = await Promise.allSettled(
      appNames.map(appName => this.checkAppAvailability(userId, appName))
    );

    // Update health metrics based on availability checks
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      const appName = appNames[i];

      if (result.status === 'fulfilled' && result.value) {
        const check = result.value;
        let status: 'healthy' | 'warning' | 'critical' = 'healthy';
        
        if (!check.is_available) {
          status = 'critical';
        } else if (check.response_time_ms && check.response_time_ms > 1000) {
          status = 'warning';
        }

        // Calculate simulated uptime and error rate based on recent checks
        const uptime = check.is_available ? 99.5 + Math.random() * 0.5 : 95 + Math.random() * 5;
        const errorRate = check.is_available ? Math.random() * 1 : Math.random() * 5 + 2;

        await this.updateHealthMetric(
          userId,
          appName,
          status,
          check.response_time_ms || 0,
          uptime,
          errorRate
        );

        // Also record performance metrics
        await this.recordPerformanceMetrics(
          userId,
          appName,
          Math.floor(Math.random() * 1000) + 500, // requests per minute
          check.is_available ? 95 + Math.random() * 5 : 85 + Math.random() * 10, // success rate
          check.response_time_ms || 0,
          check.is_available ? Math.floor(Math.random() * 5) : Math.floor(Math.random() * 20) + 10
        );
      }
    }
  },

  // Initialize monitoring for a user (create initial records)
  async initializeMonitoring(userId: string): Promise<void> {
    console.log('Initializing monitoring for user:', userId);
    
    // Check if user already has health metrics
    const existing = await this.getHealthMetrics(userId);
    
    if (existing.length === 0) {
      // Create initial health metrics for all apps
      const appNames = Object.keys(APP_ENDPOINTS);
      
      for (const appName of appNames) {
        await this.updateHealthMetric(
          userId,
          appName,
          'healthy',
          Math.floor(Math.random() * 200) + 100, // 100-300ms
          99 + Math.random(), // 99-100% uptime
          Math.random() * 0.5 // 0-0.5% error rate
        );
      }
      
      console.log('Initial health metrics created for all apps');
    }
  }
};
