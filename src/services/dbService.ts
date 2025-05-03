
// This file re-exports all service modules for backward compatibility
// This allows existing code to continue functioning without changes

import userService from './userService';
import settingsService, { UserSettings } from './settingsService';
import timeTrackingService from './timeTrackingService';
import dashboardService from './dashboardService';
import clientService from './clientService';
import notificationsService from './notificationsService';
import taskService from './taskService';
import projectService from './projectService';
import resourceService from './resourceService';
import riskService from './riskService';
import fileService from './fileService';
import insightService from './insightService';

// Export UserSettings interface for backward compatibility
export { UserSettings } from './settingsService';

// Combine all services into one
const dbService = {
  // User profile functions
  getUserProfile: userService.getUserProfile,
  createUserProfile: userService.createUserProfile,
  updateUserProfile: userService.updateUserProfile,
  deleteUserProfile: userService.deleteUserProfile,
  
  // App user functions
  upsertAppUser: userService.upsertAppUser,
  
  // User settings functions
  getUserSettings: settingsService.getUserSettings,
  createUserSettings: settingsService.createUserSettings,
  updateUserSettings: settingsService.updateUserSettings,
  deleteUserSettings: settingsService.deleteUserSettings,
  
  // Time entry functions
  getTimeEntry: timeTrackingService.getTimeEntry,
  listTimeEntries: timeTrackingService.listTimeEntries,
  createTimeEntry: timeTrackingService.createTimeEntry,
  updateTimeEntry: timeTrackingService.updateTimeEntry,
  deleteTimeEntry: timeTrackingService.deleteTimeEntry,
  getTimeEntries: timeTrackingService.getTimeEntries,
  
  // Dashboard stats function
  getDashboardStats: dashboardService.getDashboardStats,
  
  // Client functions
  getClients: clientService.getClients,
  getClientById: clientService.getClientById,
  createClient: clientService.createClient,
  updateClient: clientService.updateClient,
  deleteClient: clientService.deleteClient,
  getClientNotes: clientService.getClientNotes,
  createClientNote: clientService.createClientNote,
  updateClientNote: clientService.updateClientNote,
  deleteClientNote: clientService.deleteClientNote,
  
  // Notification functions
  getNotifications: notificationsService.getNotifications,
  markNotificationAsRead: notificationsService.markNotificationAsRead,
  
  // Resource functions
  getResources: resourceService.getResources,
  getResourceAllocations: resourceService.getResourceAllocations,
  getResourceSkills: resourceService.getResourceSkills,
  getTeamMembers: resourceService.getTeamMembers,
  createResourceAllocation: resourceService.createResourceAllocation,
  
  // Project functions
  getProjects: projectService.getProjects,
  createProject: projectService.createProject,
  updateProject: projectService.updateProject,
  deleteProject: projectService.deleteProject,
  
  // Task functions
  getTasks: taskService.getTasks,
  createTask: taskService.createTask,
  updateTask: taskService.updateTask,
  deleteTask: taskService.deleteTask,
  
  // Risk functions
  getRisks: riskService.getRisks,
  createRisk: riskService.createRisk,
  updateRisk: riskService.updateRisk,
  
  // FileVault functions
  getFiles: fileService.getFiles,
  uploadFile: fileService.uploadFile,
  
  // InsightIQ functions
  getDashboards: insightService.getDashboards,
  getWidgets: insightService.getWidgets,
  createDashboard: insightService.createDashboard,
  updateDashboard: insightService.updateDashboard,
  deleteDashboard: insightService.deleteDashboard,
  createWidget: insightService.createWidget,
  deleteWidget: insightService.deleteWidget
};

export default dbService;
