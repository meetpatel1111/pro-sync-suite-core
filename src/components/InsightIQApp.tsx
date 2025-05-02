
import React, { useEffect, useState } from 'react';
import {
  getReports,
  createReport,
} from '../services/insightiq';
import { Report } from '@/utils/dbtypes';
import { supabase } from '@/integrations/supabase/client';

const userId = 'CURRENT_USER_ID'; // TODO: Replace with real user context

const InsightIQApp: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [reportType, setReportType] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    const res = await getReports(userId);
    if (res.data) {
      setReports(res.data);
    } else {
      setReports([]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchReports(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createReport({ user_id: userId, report_type: reportType });
    setReportType('');
    fetchReports();
  };

  const handleDelete = async (id: string) => {
    // Since deleteReport is not available, we'll implement it differently
    // Using a direct call to supabase in this component for now
    try {
      await supabase.from('reports').delete().eq('id', id);
      fetchReports();
    } catch (error) {
      console.error("Error deleting report:", error);
    }
  };

  return (
    <div>
      <h2>InsightIQ</h2>
      <form onSubmit={handleCreate} style={{ marginBottom: 16 }}>
        <input
          value={reportType}
          onChange={e => setReportType(e.target.value)}
          placeholder="Report type"
          required
        />
        <button type="submit">Add Report</button>
      </form>
      {loading ? <p>Loading...</p> : (
        <ul>
          {reports.map(report => (
            <li key={report.id || report.report_id}>
              {report.report_type}
              <button onClick={() => handleDelete(report.id || report.report_id || '')}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default InsightIQApp;
