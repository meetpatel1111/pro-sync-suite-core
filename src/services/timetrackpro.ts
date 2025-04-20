// TimeTrackPro Service API
// Provides frontend CRUD functions for TimeTrackPro entities using backend endpoints
import axios from 'axios';

// Example entity:
export interface Timesheet {
  timesheet_id?: string;
  user_id: string;
  date: string;
  hours: number;
}

export async function getAllTimesheets(userId: string) {
  return axios.get<{ data: Timesheet[] }>(`/api/timetrackpro/timesheets?userId=${userId}`);
}

export async function createTimesheet(timesheet: Omit<Timesheet, 'timesheet_id'>) {
  return axios.post<{ data: Timesheet }>(`/api/timetrackpro/timesheets`, timesheet);
}
export async function getTimesheetById(timesheet_id: string) {
  return axios.get<{ data: Timesheet }>(`/api/timetrackpro/timesheets/${timesheet_id}`);
}
export async function updateTimesheet(timesheet_id: string, updates: Partial<Timesheet>) {
  return axios.put<{ data: Timesheet }>(`/api/timetrackpro/timesheets/${timesheet_id}`, updates);
}
export async function deleteTimesheet(timesheet_id: string) {
  return axios.delete<{ data: Timesheet }>(`/api/timetrackpro/timesheets/${timesheet_id}`);
}
// Repeat for entries, approvals, etc.
