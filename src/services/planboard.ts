
// PlanBoard Service API
import axios from 'axios';

export interface Plan {
  plan_id?: string;
  project_id: string;
  plan_type: string;
  start_date: string;
  end_date: string;
}

export interface Milestone {
  milestone_id?: string;
  plan_id: string;
  title: string;
  description?: string;
  due_date: string;
  status: string;
}

export interface Task {
  task_id?: string;
  milestone_id?: string;
  plan_id: string;
  title: string;
  description?: string;
  assigned_to?: string;
  status: string;
  due_date?: string;
  estimate_hours?: number;
}

// Plan Functions
export async function getAllPlans(projectId: string) {
  return axios.get<{ data: Plan[] }>(`/api/planboard/plans?projectId=${projectId}`);
}

export async function createPlan(plan: Omit<Plan, 'plan_id'>) {
  return axios.post<{ data: Plan }>(`/api/planboard/plans`, plan);
}

export async function getPlanById(plan_id: string) {
  return axios.get<{ data: Plan }>(`/api/planboard/plans/${plan_id}`);
}

export async function updatePlan(plan_id: string, updates: Partial<Plan>) {
  return axios.put<{ data: Plan }>(`/api/planboard/plans/${plan_id}`, updates);
}

export async function deletePlan(plan_id: string) {
  return axios.delete<{ data: Plan }>(`/api/planboard/plans/${plan_id}`);
}

// Milestone Functions
export async function getMilestones(plan_id: string) {
  return axios.get<{ data: Milestone[] }>(`/api/planboard/plans/${plan_id}/milestones`);
}

export async function createMilestone(milestone: Omit<Milestone, 'milestone_id'>) {
  return axios.post<{ data: Milestone }>(`/api/planboard/milestones`, milestone);
}

export async function updateMilestone(milestone_id: string, updates: Partial<Milestone>) {
  return axios.put<{ data: Milestone }>(`/api/planboard/milestones/${milestone_id}`, updates);
}

export async function deleteMilestone(milestone_id: string) {
  return axios.delete<{ data: Milestone }>(`/api/planboard/milestones/${milestone_id}`);
}

// Task Functions
export async function getTasks(plan_id: string) {
  return axios.get<{ data: Task[] }>(`/api/planboard/plans/${plan_id}/tasks`);
}

export async function createTask(task: Omit<Task, 'task_id'>) {
  return axios.post<{ data: Task }>(`/api/planboard/tasks`, task);
}

export async function updateTask(task_id: string, updates: Partial<Task>) {
  return axios.put<{ data: Task }>(`/api/planboard/tasks/${task_id}`, updates);
}

export async function deleteTask(task_id: string) {
  return axios.delete<{ data: Task }>(`/api/planboard/tasks/${task_id}`);
}
