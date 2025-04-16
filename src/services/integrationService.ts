
import { supabase } from '@/integrations/supabase/client';
import { Task, TimeEntry, Project } from '@/utils/dbtypes';

// Integration service to handle workflows between different apps
export const integrationService = {
  // Method to create a task from a meeting note or chat message
  async createTaskFromNote(
    title: string, 
    description: string, 
    projectId?: string,
    dueDate?: string,
    assigneeId?: string
  ): Promise<Task | null> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return null;
      
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title,
          description,
          status: 'todo',
          priority: 'medium',
          project: projectId,
          due_date: dueDate,
          assignee: assigneeId,
          user_id: userData.user.id
        })
        .select()
        .single();
      
      if (error) throw error;
      
      if (data) {
        return {
          id: data.id,
          title: data.title,
          description: data.description || '',
          status: data.status as 'todo' | 'inProgress' | 'review' | 'done',
          priority: data.priority as 'low' | 'medium' | 'high',
          due_date: data.due_date,
          assignee: data.assignee,
          project: data.project,
          created_at: data.created_at,
          user_id: data.user_id
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error creating task from note:', error);
      return null;
    }
  },
  
  // Method to log time against a task
  async logTimeForTask(
    taskId: string, 
    minutes: number, 
    description?: string
  ): Promise<TimeEntry | null> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return null;
      
      // Get task details to link the time entry to the correct project
      const { data: taskData, error: taskError } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single();
        
      if (taskError) throw taskError;
      
      if (!taskData) return null;
      
      const projectId = taskData.project;
      
      if (!projectId) {
        console.error('Task has no associated project');
        return null;
      }
      
      // Create time entry
      const { data, error } = await supabase
        .from('time_entries')
        .insert({
          description: description || `Work on task: ${taskData.title}`,
          project: projectId,
          time_spent: minutes,
          date: new Date().toISOString(),
          user_id: userData.user.id
        })
        .select()
        .single();
      
      if (error) throw error;
      
      if (data) {
        return {
          id: data.id,
          description: data.description,
          project: data.project,
          time_spent: data.time_spent,
          date: data.date,
          user_id: data.user_id,
          manual: data.manual
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error logging time for task:', error);
      return null;
    }
  },
  
  // Method to check project milestones and send notifications
  async checkProjectMilestones(): Promise<{ project: Project, tasksDue: Task[] }[]> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return [];
      
      // Get all projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userData.user.id);
        
      if (projectsError) throw projectsError;
      
      if (!projectsData || projectsData.length === 0) return [];
      
      const projects = projectsData as Project[];
      const result: { project: Project, tasksDue: Task[] }[] = [];
      
      // For each project, check for tasks due soon
      for (const project of projects) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const { data: tasksData, error: tasksError } = await supabase
          .from('tasks')
          .select('*')
          .eq('project', project.id)
          .lt('due_date', tomorrow.toISOString())
          .neq('status', 'done');
          
        if (tasksError) {
          console.error(`Error fetching tasks for project ${project.id}:`, tasksError);
          continue;
        }
        
        if (tasksData && tasksData.length > 0) {
          const mappedTasks: Task[] = tasksData.map((task): Task => ({
            id: task.id,
            title: task.title,
            description: task.description || '',
            status: task.status as 'todo' | 'inProgress' | 'review' | 'done',
            priority: task.priority as 'low' | 'medium' | 'high',
            due_date: task.due_date,
            assignee: task.assignee,
            project: task.project,
            created_at: task.created_at,
            user_id: task.user_id
          }));
          
          result.push({
            project,
            tasksDue: mappedTasks
          });
        }
      }
      
      return result;
    } catch (error) {
      console.error('Error checking project milestones:', error);
      return [];
    }
  },
  
  // Method to link documents to tasks
  async linkDocumentToTask(
    taskId: string, 
    documentUrl: string, 
    documentName: string
  ): Promise<boolean> {
    try {
      // This is a placeholder for document linking
      // In a real implementation, this would update a documents or task_documents table
      console.log('Linking document to task:', { taskId, documentUrl, documentName });
      return true;
    } catch (error) {
      console.error('Error linking document to task:', error);
      return false;
    }
  }
};
