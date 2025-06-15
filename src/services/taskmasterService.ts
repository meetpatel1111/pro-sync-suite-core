
import { supabase } from '@/integrations/supabase/client';
import { safeQueryTable } from '@/utils/db-helpers';
import type { 
  Organization, 
  Project, 
  Board, 
  Sprint, 
  TaskMasterTask, 
  TaskLabel, 
  TaskComment, 
  TaskHistory, 
  ProjectMember 
} from '@/types/taskmaster';

export const taskmasterService = {
  // Organizations
  async getOrganizations(userId: string) {
    return await safeQueryTable<Organization>('organizations', (query) =>
      query.select('*').eq('created_by', userId).order('created_at', { ascending: false })
    );
  },

  async createOrganization(orgData: Omit<Organization, 'id' | 'created_at' | 'updated_at'>) {
    return await safeQueryTable<Organization>('organizations', (query) =>
      query.insert(orgData).select().single()
    );
  },

  // Projects
  async getProjects(userId: string) {
    return await safeQueryTable<Project>('projects', (query) =>
      query
        .select(`
          *,
          project_members!inner(user_id, role)
        `)
        .or(`created_by.eq.${userId},project_members.user_id.eq.${userId}`)
        .order('created_at', { ascending: false })
    );
  },

  async createProject(projectData: Omit<Project, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await safeQueryTable<Project>('projects', (query) =>
      query.insert(projectData).select().single()
    );
    
    // Add creator as admin member
    if (data && !error) {
      await this.addProjectMember(data.id, projectData.created_by, 'admin');
    }
    
    return { data, error };
  },

  async updateProject(projectId: string, updates: Partial<Project>) {
    return await safeQueryTable<Project>('projects', (query) =>
      query.update(updates).eq('id', projectId).select().single()
    );
  },

  // Project Members
  async getProjectMembers(projectId: string) {
    return await safeQueryTable<ProjectMember>('project_members', (query) =>
      query.select('*').eq('project_id', projectId)
    );
  },

  async addProjectMember(projectId: string, userId: string, role: ProjectMember['role']) {
    return await safeQueryTable<ProjectMember>('project_members', (query) =>
      query.insert({ project_id: projectId, user_id: userId, role }).select().single()
    );
  },

  async updateProjectMemberRole(projectId: string, userId: string, role: ProjectMember['role']) {
    return await safeQueryTable<ProjectMember>('project_members', (query) =>
      query
        .update({ role })
        .eq('project_id', projectId)
        .eq('user_id', userId)
        .select().single()
    );
  },

  async removeProjectMember(projectId: string, userId: string) {
    return await safeQueryTable('project_members', (query) =>
      query.delete().eq('project_id', projectId).eq('user_id', userId)
    );
  },

  // Boards
  async getBoards(projectId: string) {
    return await safeQueryTable<Board>('boards', (query) =>
      query.select('*').eq('project_id', projectId).order('created_at', { ascending: false })
    );
  },

  async createBoard(boardData: Omit<Board, 'id' | 'created_at' | 'updated_at'>) {
    return await safeQueryTable<Board>('boards', (query) =>
      query.insert(boardData).select().single()
    );
  },

  async updateBoard(boardId: string, updates: Partial<Board>) {
    return await safeQueryTable<Board>('boards', (query) =>
      query.update(updates).eq('id', boardId).select().single()
    );
  },

  async deleteBoard(boardId: string) {
    return await safeQueryTable('boards', (query) =>
      query.delete().eq('id', boardId)
    );
  },

  // Sprints
  async getSprints(projectId: string) {
    return await safeQueryTable<Sprint>('sprints', (query) =>
      query.select('*').eq('project_id', projectId).order('created_at', { ascending: false })
    );
  },

  async createSprint(sprintData: Omit<Sprint, 'id' | 'created_at' | 'updated_at'>) {
    return await safeQueryTable<Sprint>('sprints', (query) =>
      query.insert(sprintData).select().single()
    );
  },

  async updateSprint(sprintId: string, updates: Partial<Sprint>) {
    return await safeQueryTable<Sprint>('sprints', (query) =>
      query.update(updates).eq('id', sprintId).select().single()
    );
  },

  // Tasks
  async getTasks(boardId: string) {
    return await safeQueryTable<TaskMasterTask>('tasks', (query) =>
      query
        .select(`
          *,
          task_labels:task_label_assignments(
            task_labels(*)
          ),
          watchers:task_watchers(user_id),
          dependencies:task_dependencies(
            depends_on_task_id,
            dependency_type
          )
        `)
        .eq('board_id', boardId)
        .order('position', { ascending: true })
    );
  },

  async getTasksByProject(projectId: string) {
    return await safeQueryTable<TaskMasterTask>('tasks', (query) =>
      query.select('*').eq('project_id', projectId).order('created_at', { ascending: false })
    );
  },

  async createTask(taskData: Omit<TaskMasterTask, 'id' | 'task_number' | 'task_key' | 'created_at' | 'updated_at'>) {
    return await safeQueryTable<TaskMasterTask>('tasks', (query) =>
      query.insert(taskData).select().single()
    );
  },

  async updateTask(taskId: string, updates: Partial<TaskMasterTask>, updatedBy: string) {
    return await safeQueryTable<TaskMasterTask>('tasks', (query) =>
      query
        .update({ ...updates, updated_by: updatedBy, updated_at: new Date().toISOString() })
        .eq('id', taskId)
        .select().single()
    );
  },

  async deleteTask(taskId: string) {
    return await safeQueryTable('tasks', (query) =>
      query.delete().eq('id', taskId)
    );
  },

  // Task Labels
  async getTaskLabels(projectId: string) {
    return await safeQueryTable<TaskLabel>('task_labels', (query) =>
      query.select('*').eq('project_id', projectId).order('name', { ascending: true })
    );
  },

  async createTaskLabel(labelData: Omit<TaskLabel, 'id' | 'created_at'>) {
    return await safeQueryTable<TaskLabel>('task_labels', (query) =>
      query.insert(labelData).select().single()
    );
  },

  async assignLabelToTask(taskId: string, labelId: string) {
    return await safeQueryTable('task_label_assignments', (query) =>
      query.insert({ task_id: taskId, label_id: labelId })
    );
  },

  async removeLabelFromTask(taskId: string, labelId: string) {
    return await safeQueryTable('task_label_assignments', (query) =>
      query.delete().eq('task_id', taskId).eq('label_id', labelId)
    );
  },

  // Task Comments
  async getTaskComments(taskId: string) {
    return await safeQueryTable<TaskComment>('task_comments', (query) =>
      query.select('*').eq('task_id', taskId).order('created_at', { ascending: true })
    );
  },

  async addTaskComment(commentData: Omit<TaskComment, 'id' | 'created_at' | 'updated_at'>) {
    return await safeQueryTable<TaskComment>('task_comments', (query) =>
      query.insert(commentData).select().single()
    );
  },

  async updateTaskComment(commentId: string, content: string) {
    return await safeQueryTable<TaskComment>('task_comments', (query) =>
      query
        .update({ content, updated_at: new Date().toISOString() })
        .eq('id', commentId)
        .select().single()
    );
  },

  async deleteTaskComment(commentId: string) {
    return await safeQueryTable('task_comments', (query) =>
      query.delete().eq('id', commentId)
    );
  },

  // Task History
  async getTaskHistory(taskId: string) {
    return await safeQueryTable<TaskHistory>('task_history', (query) =>
      query.select('*').eq('task_id', taskId).order('created_at', { ascending: false })
    );
  },

  // Task Watchers
  async addTaskWatcher(taskId: string, userId: string) {
    return await safeQueryTable('task_watchers', (query) =>
      query.insert({ task_id: taskId, user_id: userId })
    );
  },

  async removeTaskWatcher(taskId: string, userId: string) {
    return await safeQueryTable('task_watchers', (query) =>
      query.delete().eq('task_id', taskId).eq('user_id', userId)
    );
  },

  // Task Dependencies
  async addTaskDependency(taskId: string, dependsOnTaskId: string, dependencyType: string = 'blocks') {
    return await safeQueryTable('task_dependencies', (query) =>
      query.insert({
        task_id: taskId,
        depends_on_task_id: dependsOnTaskId,
        dependency_type: dependencyType
      })
    );
  },

  async removeTaskDependency(taskId: string, dependsOnTaskId: string) {
    return await safeQueryTable('task_dependencies', (query) =>
      query.delete().eq('task_id', taskId).eq('depends_on_task_id', dependsOnTaskId)
    );
  }
};
