import { supabase } from '@/integrations/supabase/client';
import type { Sprint, SprintTask, BoardBacklog, BoardReport } from '@/types/taskmaster';

class SprintService {
  async getSprints(boardId: string) {
    const { data, error } = await supabase
      .from('sprints')
      .select('*')
      .eq('board_id', boardId)
      .order('created_at', { ascending: false });

    if (error) return { data: null, error };

    const sprints: Sprint[] = (data || []).map((item: any) => ({
      id: item.id,
      project_id: item.project_id,
      board_id: item.board_id,
      name: item.name,
      goal: item.goal,
      start_date: item.start_date,
      end_date: item.end_date,
      status: item.status as 'planned' | 'active' | 'completed',
      capacity: item.capacity || 0,
      velocity: item.velocity || 0,
      created_by: item.created_by,
      created_at: item.created_at,
      updated_at: item.updated_at
    }));

    return { data: sprints, error: null };
  }

  async createSprint(sprintData: Omit<Sprint, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('sprints')
      .insert([{
        project_id: sprintData.project_id,
        board_id: sprintData.board_id,
        name: sprintData.name,
        goal: sprintData.goal,
        start_date: sprintData.start_date,
        end_date: sprintData.end_date,
        status: sprintData.status,
        capacity: sprintData.capacity || 0,
        velocity: sprintData.velocity || 0,
        created_by: sprintData.created_by
      }])
      .select()
      .single();

    if (error) return { data: null, error };

    const sprint: Sprint = {
      id: data.id,
      project_id: data.project_id,
      board_id: data.board_id,
      name: data.name,
      goal: data.goal,
      start_date: data.start_date,
      end_date: data.end_date,
      status: data.status as 'planned' | 'active' | 'completed',
      capacity: (data as any).capacity || 0,
      velocity: (data as any).velocity || 0,
      created_by: data.created_by,
      created_at: data.created_at,
      updated_at: data.updated_at
    };

    return { data: sprint, error: null };
  }

  async updateSprint(sprintId: string, updates: Partial<Sprint>) {
    const { data, error } = await supabase
      .from('sprints')
      .update(updates)
      .eq('id', sprintId)
      .select()
      .single();

    if (error) return { data: null, error };

    const sprint: Sprint = {
      id: data.id,
      project_id: data.project_id,
      board_id: data.board_id,
      name: data.name,
      goal: data.goal,
      start_date: data.start_date,
      end_date: data.end_date,
      status: data.status as 'planned' | 'active' | 'completed',
      capacity: (data as any).capacity || 0,
      velocity: (data as any).velocity || 0,
      created_by: data.created_by,
      created_at: data.created_at,
      updated_at: data.updated_at
    };

    return { data: sprint, error: null };
  }

  async deleteSprint(sprintId: string) {
    const { error } = await supabase
      .from('sprints')
      .delete()
      .eq('id', sprintId);

    return { error };
  }

  async addTaskToSprint(sprintId: string, taskId: string, storyPoints?: number) {
    const { data, error } = await supabase
      .from('sprint_tasks')
      .insert([{
        sprint_id: sprintId,
        task_id: taskId,
        initial_story_points: storyPoints,
        current_story_points: storyPoints
      }])
      .select()
      .single();

    if (error) return { data: null, error };

    // Also update the task's sprint_id
    await supabase
      .from('tasks')
      .update({ sprint_id: sprintId })
      .eq('id', taskId);

    return { data, error: null };
  }

  async removeTaskFromSprint(sprintId: string, taskId: string) {
    const { error } = await supabase
      .from('sprint_tasks')
      .delete()
      .eq('sprint_id', sprintId)
      .eq('task_id', taskId);

    // Also clear the task's sprint_id
    await supabase
      .from('tasks')
      .update({ sprint_id: null })
      .eq('id', taskId);

    return { error };
  }

  async getSprintTasks(sprintId: string) {
    const { data, error } = await supabase
      .from('sprint_tasks')
      .select(`
        *,
        tasks (*)
      `)
      .eq('sprint_id', sprintId);

    if (error) return { data: null, error };
    return { data, error: null };
  }

  async getBacklogItems(boardId: string) {
    const { data, error } = await supabase
      .from('board_backlogs')
      .select(`
        *,
        tasks (*)
      `)
      .eq('board_id', boardId)
      .order('priority_order', { ascending: true });

    if (error) return { data: null, error };
    return { data, error: null };
  }

  async addToBacklog(backlogData: Omit<BoardBacklog, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('board_backlogs')
      .insert([backlogData])
      .select()
      .single();

    if (error) return { data: null, error };
    return { data, error: null };
  }

  async updateBacklogPriority(backlogId: string, newPriority: number) {
    const { data, error } = await supabase
      .from('board_backlogs')
      .update({ priority_order: newPriority })
      .eq('id', backlogId)
      .select()
      .single();

    if (error) return { data: null, error };
    return { data, error: null };
  }

  async generateReport(boardId: string, reportType: BoardReport['report_type'], parameters: Record<string, any> = {}) {
    // This would generate actual report data based on the report type
    const reportData = await this.calculateReportData(boardId, reportType, parameters);
    
    const { data, error } = await supabase
      .from('board_reports')
      .insert([{
        board_id: boardId,
        report_type: reportType,
        report_data: reportData,
        parameters,
        generated_by: (await supabase.auth.getUser()).data.user?.id
      }])
      .select()
      .single();

    if (error) return { data: null, error };
    return { data, error: null };
  }

  private async calculateReportData(boardId: string, reportType: string, parameters: Record<string, any>) {
    // Placeholder for actual report calculation logic
    switch (reportType) {
      case 'burndown':
        return { chartData: [], totalPoints: 0, remainingPoints: 0 };
      case 'velocity':
        return { averageVelocity: 0, sprintVelocities: [] };
      case 'cumulative_flow':
        return { flowData: [] };
      case 'sprint_summary':
        return { completedTasks: 0, totalTasks: 0, velocity: 0 };
      default:
        return {};
    }
  }
}

export const sprintService = new SprintService();
