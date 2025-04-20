// RiskRadar Service API
// Provides frontend CRUD functions for RiskRadar entities using backend endpoints
// Example entity:

import axios from 'axios';

export interface Risk {
  risk_id?: string;
  project_id: string;
  title: string;
}

export async function getAllRisks(userId: string) {
  return axios.get<{ data: Risk[] }>(`/api/riskradar/risks?userId=${userId}`);
}

export async function createRisk(risk: Omit<Risk, 'risk_id'>) {
  return axios.post<{ data: Risk }>(`/api/riskradar/risks`, risk);
}
export async function getRiskById(risk_id: string) {
  return axios.get<{ data: Risk }>(`/api/riskradar/risks/${risk_id}`);
}
export async function updateRisk(risk_id: string, updates: Partial<Risk>) {
  return axios.put<{ data: Risk }>(`/api/riskradar/risks/${risk_id}`, updates);
}
export async function deleteRisk(risk_id: string) {
  return axios.delete<{ data: Risk }>(`/api/riskradar/risks/${risk_id}`);
}
// Repeat for categories, owners, etc.
