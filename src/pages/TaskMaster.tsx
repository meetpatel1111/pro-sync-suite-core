
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, ListTodo, BarChart2, Users, Settings } from 'lucide-react';
import TaskBoard from '@/components/taskmaster/TaskBoard';
import TaskCalendar from '@/components/taskmaster/TaskCalendar';
import TaskList from '@/components/taskmaster/TaskList';
import TaskReports from '@/components/taskmaster/TaskReports';
import TaskSettings from '@/components/taskmaster/TaskSettings';

const TaskMaster = () => {
  const [activeTab, setActiveTab] = useState('board');

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col space-y-2 md:flex-row md:justify-between md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">TaskMaster</h1>
            <p className="text-muted-foreground">
              Manage your tasks and workflows efficiently
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 gap-2">
            <TabsTrigger value="board" className="flex items-center gap-2">
              <ListTodo className="h-4 w-4" />
              <span>Board</span>
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center gap-2">
              <ListTodo className="h-4 w-4" />
              <span>List</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Calendar</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <BarChart2 className="h-4 w-4" />
              <span>Reports</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="board" className="space-y-4">
            <TaskBoard />
          </TabsContent>

          <TabsContent value="list" className="space-y-4">
            <TaskList />
          </TabsContent>

          <TabsContent value="calendar" className="space-y-4">
            <TaskCalendar />
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <TaskReports />
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <TaskSettings />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default TaskMaster;
