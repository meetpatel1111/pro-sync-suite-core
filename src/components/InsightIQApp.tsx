
import React, { useEffect, useState } from 'react';
import {
  getAllReports,
  createReport,
  deleteReport,
  Report
} from '../services/insightiq';

const userId = 'CURRENT_USER_ID'; // TODO: Replace with real user context

const InsightIQApp: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [reportType, setReportType] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    const res = await getAllReports(userId);
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
    await deleteReport(id);
    fetchReports();
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
