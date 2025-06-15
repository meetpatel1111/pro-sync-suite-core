
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

// ProSync Suite app health check endpoints
const APP_ENDPOINTS = {
  'TaskMaster': `${window.location.origin}/api/health/taskmaster`,
  'TimeTrackPro': `${window.location.origin}/api/health/timetrack`,
  'CollabSpace': `${window.location.origin}/api/health/collab`,
  'PlanBoard': `${window.location.origin}/api/health/planboard`,
  'FileVault': `${window.location.origin}/api/health/filevault`,
  'BudgetBuddy': `${window.location.origin}/api/health/budget`,
  'InsightIQ': `${window.location.origin}/api/health/insights`,
  'ResourceHub': `${window.location.origin}/api/health/resources`,
  'ClientConnect': `${window.location.origin}/api/health/clients`,
  'RiskRadar': `${window.location.origin}/api/health/risks`
};

// Health check timeout in milliseconds
const HEALTH_CHECK_TIMEOUT = 5000;

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

  // Make real HTTP health check request
  async makeHealthCheckRequest(url: string, timeout: number = HEALTH_CHECK_TIMEOUT): Promise<{
    isAvailable: boolean;
    responseTime: number;
    statusCode: number;
    errorMessage?: string;
  }> {
    const startTime = Date.now();
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;

      return {
        isAvailable: response.ok,
        responseTime,
        statusCode: response.status,
        errorMessage: response.ok ? undefined : `HTTP ${response.status}: ${response.statusText}`,
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            isAvailable: false,
            responseTime,
            statusCode: 0,
            errorMessage: `Request timeout after ${timeout}ms`,
          };
        }
        
        return {
          isAvailable: false,
          responseTime,
          statusCode: 0,
          errorMessage: error.message,
        };
      }

      return {
        isAvailable: false,
        responseTime,
        statusCode: 0,
        errorMessage: 'Unknown network error',
      };
    }
  },

  // Check availability of a single app with real HTTP request
  async checkAppAvailability(userId: string, appName: string): Promise<AppAvailabilityCheck | null> {
    const endpoint = APP_ENDPOINTS[appName as keyof typeof APP_ENDPOINTS];
    if (!endpoint) {
      console.warn(`No endpoint configured for app: ${appName}`);
      return null;
    }

    console.log(`Checking health for ${appName} at ${endpoint}`);

    const healthCheckResult = await this.makeHealthCheckRequest(endpoint);

    // Save the availability check
    const { data, error: insertError } = await supabase
      .from('app_availability_checks')
      .insert({
        user_id: userId,
        app_name: appName,
        endpoint_url: endpoint,
        check_type: 'http',
        is_available: healthCheckResult.isAvailable,
        response_time_ms: healthCheckResult.responseTime,
        status_code: healthCheckResult.statusCode,
        error_message: healthCheckResult.errorMessage || null,
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

  // Calculate health status based on availability check
  calculateHealthStatus(check: AppAvailabilityCheck): 'healthy' | 'warning' | 'critical' {
    if (!check.is_available) {
      return 'critical';
    }
    
    if (check.response_time_ms && check.response_time_ms > 2000) {
      return 'warning';
    }
    
    if (check.status_code && (check.status_code >= 400 && check.status_code < 500)) {
      return 'warning';
    }
    
    return 'healthy';
  },

  // Calculate uptime percentage from recent checks
  async calculateUptimePercentage(userId: string, appName: string): Promise<number> {
    const { data, error } = await supabase
      .from('app_availability_checks')
      .select('is_available')
      .eq('user_id', userId)
      .eq('app_name', appName)
      .gte('checked_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours
      .order('checked_at', { ascending: false })
      .limit(100);

    if (error || !data || data.length === 0) {
      return 100; // Default to 100% if no data
    }

    const availableChecks = data.filter(check => check.is_available).length;
    return (availableChecks / data.length) * 100;
  },

  // Calculate error rate from recent checks
  async calculateErrorRate(userId: string, appName: string): Promise<number> {
    const { data, error } = await supabase
      .from('app_availability_checks')
      .select('is_available, status_code')
      .eq('user_id', userId)
      .eq('app_name', appName)
      .gte('checked_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours
      .order('checked_at', { ascending: false })
      .limit(100);

    if (error || !data || data.length === 0) {
      return 0; // Default to 0% error rate if no data
    }

    const errorChecks = data.filter(check => 
      !check.is_available || (check.status_code && check.status_code >= 400)
    ).length;
    
    return (errorChecks / data.length) * 100;
  },

  // Run health checks for all apps
  async runHealthChecks(userId: string): Promise<void> {
    const appNames = Object.keys(APP_ENDPOINTS);
    console.log('Running health checks for apps:', appNames);
    
    const results = await Promise.allSettled(
      appNames.map(appName => this.checkAppAvailability(userId, appName))
    );

    // Update health metrics based on availability checks
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      const appName = appNames[i];

      if (result.status === 'fulfilled' && result.value) {
        const check = result.value;
        const status = this.calculateHealthStatus(check);
        
        // Calculate real uptime and error rate from historical data
        const [uptime, errorRate] = await Promise.all([
          this.calculateUptimePercentage(userId, appName),
          this.calculateErrorRate(userId, appName)
        ]);

        await this.updateHealthMetric(
          userId,
          appName,
          status,
          check.response_time_ms || 0,
          uptime,
          errorRate
        );

        // Record performance metrics based on real data
        const successRate = check.is_available ? 100 - errorRate : Math.max(0, 100 - errorRate - 20);
        await this.recordPerformanceMetrics(
          userId,
          appName,
          Math.floor(Math.random() * 500) + 200, // Still simulated - would need real metrics from apps
          successRate,
          check.response_time_ms || 0,
          check.is_available ? 0 : 1
        );
      } else {
        console.error(`Health check failed for ${appName}:`, result.status === 'rejected' ? result.reason : 'Unknown error');
      }
    }
  },

  // Initialize monitoring for a user (create initial records)
  async initializeMonitoring(userId: string): Promise<void> {
    console.log('Initializing monitoring for user:', userId);
    
    // Check if user already has health metrics
    const existing = await this.getHealthMetrics(userId);
    
    if (existing.length === 0) {
      console.log('No existing health metrics found, running initial health checks...');
      // Run real health checks to initialize data
      await this.runHealthChecks(userId);
      console.log('Initial health checks completed');
    }
  }
};
