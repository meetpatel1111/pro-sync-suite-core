
export function generateMockTasks(count: number = 5) {
  const efforts = ["low", "medium", "high"] as const;
  const tasks = Array.from({ length: count }).map((_, i) => {
    const effort = efforts[Math.floor(Math.random() * efforts.length)];
    const dueDate = Math.random() > 0.5 ? new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000) : null;
    return {
      id: `task_${Date.now()}_${i}`,
      title: `Mock Task ${i + 1}`,
      description: "This is a generated mock task for testing.",
      due_date: dueDate ? dueDate.toISOString() : null,
      effort,
      status: "open",
    };
  });
  return tasks;
}
