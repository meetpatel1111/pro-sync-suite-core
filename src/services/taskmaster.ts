
// TaskMaster Service API
// Provides frontend CRUD functions for TaskMaster entities using backend endpoints
// Example entity:
import axios from 'axios';

export interface Task {
  task_id?: string;
  title: string;
  assigned_to?: string;
  status?: string;
}

export async function getAllTasks(userId: string) {
  return axios.get<{ data: Task[] }>(`/api/taskmaster/tasks?userId=${userId}`);
}

export async function createTask(task: Omit<Task, 'task_id'>) {
  return axios.post<{ data: Task }>(`/api/taskmaster/tasks`, task);
}

export async function getTaskById(task_id: string) {
  return axios.get<{ data: Task }>(`/api/taskmaster/tasks/${task_id}`);
}

export async function updateTask(task_id: string, updates: Partial<Task>) {
  return axios.put<{ data: Task }>(`/api/taskmaster/tasks/${task_id}`, updates);
}

export async function deleteTask(task_id: string) {
  return axios.delete<{ data: Task }>(`/api/taskmaster/tasks/${task_id}`);
}
// Repeat for subtasks, comments, etc.
