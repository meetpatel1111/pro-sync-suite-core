
import React, { useEffect, useState } from 'react';
import {
  getAllTimesheets,
  createTimesheet,
  deleteTimesheet,
  Timesheet
} from '../services/timetrackpro';

const userId = 'CURRENT_USER_ID'; // TODO: Replace with real user context

const TimeTrackProApp: React.FC = () => {
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [date, setDate] = useState('');
  const [hours, setHours] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchTimesheets = async () => {
    setLoading(true);
    const res = await getAllTimesheets(userId);
    setTimesheets(res.data as Timesheet[]);
    setLoading(false);
  };

  useEffect(() => { fetchTimesheets(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createTimesheet({ user_id: userId, date, hours: parseFloat(hours) });
    setDate('');
    setHours('');
    fetchTimesheets();
  };

  const handleDelete = async (id: string) => {
    await deleteTimesheet(id);
    fetchTimesheets();
  };

  return (
    <div>
      <h2>TimeTrackPro</h2>
      <form onSubmit={handleCreate} style={{ marginBottom: 16 }}>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          required
        />
        <input
          type="number"
          value={hours}
          onChange={e => setHours(e.target.value)}
          placeholder="Hours"
          required
        />
        <button type="submit">Add Timesheet</button>
      </form>
      {loading ? <p>Loading...</p> : (
        <ul>
          {timesheets.map(timesheet => (
            <li key={timesheet.id}>
              {timesheet.date}: {timesheet.hours} hours
              <button onClick={() => timesheet.id && handleDelete(timesheet.id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TimeTrackProApp;
