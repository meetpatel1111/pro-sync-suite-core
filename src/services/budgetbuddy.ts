import axios from 'axios';

const API_BASE = '/api/budgetbuddy';

type Budget = {
  id?: string;
  user_id: string;
  month: number;
  year: number;
  total_budget: number;
};

export async function createBudget(budget: Omit<Budget, 'id'>) {
  return axios.post(`${API_BASE}/budgets`, budget);
}

export async function getBudgetById(id: string) {
  return axios.get(`${API_BASE}/budgets/${id}`);
}

export async function getAllBudgets(userId: string) {
  return axios.get(`${API_BASE}/budgets?userId=${userId}`);
}

export async function updateBudget(id: string, updates: Partial<Budget>) {
  return axios.put(`${API_BASE}/budgets/${id}`, updates);
}

export async function deleteBudget(id: string) {
  return axios.delete(`${API_BASE}/budgets/${id}`);
}

// Transactions
export type Transaction = {
  id?: string;
  user_id: string;
  amount: number;
  category_id: string;
  date: string;
  description?: string;
};

export async function createTransaction(transaction: Omit<Transaction, 'id'>) {
  return axios.post(`${API_BASE}/transactions`, transaction);
}
export async function getTransactionById(id: string) {
  return axios.get(`${API_BASE}/transactions/${id}`);
}
export async function getAllTransactions(userId: string) {
  return axios.get(`${API_BASE}/transactions?userId=${userId}`);
}
export async function updateTransaction(id: string, updates: Partial<Transaction>) {
  return axios.put(`${API_BASE}/transactions/${id}`, updates);
}
export async function deleteTransaction(id: string) {
  return axios.delete(`${API_BASE}/transactions/${id}`);
}

// Categories
export type Category = {
  id?: string;
  user_id: string;
  name: string;
};

export async function createCategory(category: Omit<Category, 'id'>) {
  return axios.post(`${API_BASE}/categories`, category);
}
export async function getCategoryById(id: string) {
  return axios.get(`${API_BASE}/categories/${id}`);
}
export async function getAllCategories(userId: string) {
  return axios.get(`${API_BASE}/categories?userId=${userId}`);
}
export async function updateCategory(id: string, updates: Partial<Category>) {
  return axios.put(`${API_BASE}/categories/${id}`, updates);
}
export async function deleteCategory(id: string) {
  return axios.delete(`${API_BASE}/categories/${id}`);
}
