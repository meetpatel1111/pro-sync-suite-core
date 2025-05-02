
// Only updating the problematic functions in TimeTrackingForm.tsx

const createManualEntry = async () => {
    if (!user) return;
    
    if (!selectedProject) {
      toast({
        title: "Error",
        description: "Please select a project",
        variant: "destructive"
      });
      return;
    }
    
    if (!hours && !minutes) {
      toast({
        title: "Error",
        description: "Please enter time spent",
        variant: "destructive"
      });
      return;
    }
    
    setSaving(true);
    
    try {
      const timeSpent = (parseInt(hours || "0") * 60) + parseInt(minutes || "0");
      
      const timeEntry = {
        project_id: selectedProject,
        task_id: selectedTask || null,
        description,
        time_spent: timeSpent,
        date: entryDate ? entryDate.toISOString() : new Date().toISOString(),
        project: projects.find(p => p.id === selectedProject)?.name || '',
        billable: true
      };
      
      // Fix: Just pass user.id
      const { error } = await dbService.createTimeEntry(user.id, timeEntry);
      
      if (error) throw error;
      
      // Reset form
      setHours("");
      setMinutes("");
      setDescription("");
      setSelectedTask(null);
      
      toast({
        title: "Time entry created",
        description: `Added ${timeSpent} minutes to ${projects.find(p => p.id === selectedProject)?.name}`
      });
    } catch (error) {
      console.error("Error creating time entry:", error);
      toast({
        title: "Error",
        description: "Failed to create time entry",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };
