
// InsightIQ Service API
// Provides frontend CRUD functions for InsightIQ entities using backend endpoints
// Example entity:
import axios from 'axios';

export interface Report {
  report_id?: string;
  user_id: string;
  report_type: string;
  generated_at?: string;
}

export async function getAllReports(userId: string) {
  return axios.get<{ data: Report[] }>(`/api/insightiq/reports?userId=${userId}`);
}

export async function createReport(report: Omit<Report, 'report_id' | 'generated_at'>) {
  return axios.post<{ data: Report }>(`/api/insightiq/reports`, report);
}

export async function getReportById(report_id: string) {
  return axios.get<{ data: Report }>(`/api/insightiq/reports/${report_id}`);
}

export async function updateReport(report_id: string, updates: Partial<Report>) {
  return axios.put<{ data: Report }>(`/api/insightiq/reports/${report_id}`, updates);
}

export async function deleteReport(report_id: string) {
  return axios.delete<{ data: Report }>(`/api/insightiq/reports/${report_id}`);
}
// Repeat for charts, dashboards, etc.
