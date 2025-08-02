
export const calculateTotalExpenses = (expenses: any[]): number => {
  return expenses.reduce((sum, expense) => {
    const amount = parseFloat(expense.amount?.toString() || '0');
    return sum + (isNaN(amount) ? 0 : amount);
  }, 0);
};

export const calculateTotalHours = (timeEntries: any[]): number => {
  return timeEntries.reduce((sum, entry) => {
    const duration = parseFloat(entry.duration?.toString() || '0');
    return sum + (isNaN(duration) ? 0 : duration);
  }, 0);
};

export const calculateDaysActive = (createdAt: string): number => {
  return Math.floor(
    (new Date().getTime() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );
};

export const filterByStatus = (items: any[], status: string) => {
  return items.filter(item => item.status === status);
};

export const filterByDateRange = (items: any[], days: number, dateField = 'created_at') => {
  const since = new Date();
  since.setDate(since.getDate() - days);
  
  return items.filter(item => {
    const itemDate = new Date(item[dateField]);
    return itemDate > since;
  });
};
