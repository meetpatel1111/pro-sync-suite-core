
import React, { useEffect, useState } from 'react';
import {
  getAllTasks,
  createTask,
  deleteTask,
  Task
} from '../services/taskmaster';

const userId = 'CURRENT_USER_ID'; // TODO: Replace with real user context

const TaskMasterApp: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskTitle, setTaskTitle] = useState('');
  const [assignee, setAssignee] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchTasks = async () => {
    setLoading(true);
    const res = await getAllTasks(userId);
    setTasks(res.data as Task[]);
    setLoading(false);
  };

  useEffect(() => { fetchTasks(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createTask({ 
      title: taskTitle, 
      assignee: assignee,
      status: status || 'todo',
      priority: 'medium',
      user_id: userId
    });
    setTaskTitle('');
    setAssignee('');
    setStatus('');
    fetchTasks();
  };

  const handleDelete = async (id: string) => {
    await deleteTask(id);
    fetchTasks();
  };

  return (
    <div>
      <h2>TaskMaster</h2>
      <form onSubmit={handleCreate} style={{ marginBottom: 16 }}>
        <input
          value={taskTitle}
          onChange={e => setTaskTitle(e.target.value)}
          placeholder="Task title"
          required
        />
        <input
          value={assignee}
          onChange={e => setAssignee(e.target.value)}
          placeholder="Assigned to"
        />
        <input
          value={status}
          onChange={e => setStatus(e.target.value)}
          placeholder="Status"
        />
        <button type="submit">Add Task</button>
      </form>
      {loading ? <p>Loading...</p> : (
        <ul>
          {tasks.map(task => (
            <li key={task.id}>
              {task.title} (Assigned: {task.assignee}, Status: {task.status})
              <button onClick={() => task.id && handleDelete(task.id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TaskMasterApp;
