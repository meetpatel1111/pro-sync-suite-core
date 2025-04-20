import React from "react";

// --- 1. Team Calendar ---
export interface Allocation {
  id: string;
  resource_id: string;
  project_id: string;
  from_date: string;
  to_date: string;
  percent: number;
}
export interface Project {
  id: string;
  name: string;
}
export interface Unavailability {
  id: string;
  resource_id: string;
  from_date: string;
  to_date: string;
  reason?: string;
  status?: string;
}

export function TeamCalendar({ resources, allocations, projects, editable = false }: { resources: any[]; allocations: Allocation[]; projects: Project[]; editable?: boolean }) {
  // Show a 7-day window from today
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d.toISOString().slice(0, 10);
  });

  function isAllocated(resourceId: string, date: string) {
    return allocations.some(a => a.resource_id === resourceId && a.from_date <= date && a.to_date >= date);
  }
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-xs border">
        <thead>
          <tr>
            <th className="p-2 border">Resource</th>
            {days.map(day => (
              <th key={day} className="p-2 border">{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {resources.map(r => (
            <tr key={r.id}>
              <td className="p-2 border font-medium">{r.name}</td>
              {days.map((date, i) => (
                <td key={i} className="p-2 border">
                  {isAllocated(r.id, date) ? (
                    <span className="inline-block w-4 h-4 rounded bg-blue-400" title="Allocated" />
                  ) : null}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// --- 2. Allocation Board ---
export function AllocationBoard({ resources, allocations, projects }: { resources: any[]; allocations: Allocation[]; projects: Project[] }) {
  // Group allocations by project
  return (
    <div className="flex gap-4">
      {projects.map(project => (
        <div key={project.id} className="flex-1 bg-gray-100 rounded p-2">
          <h4 className="font-semibold mb-2">{project.name}</h4>
          <ul>
            {allocations.filter(a => a.project_id === project.id).map(a => {
              const res = resources.find(r => r.id === a.resource_id);
              return res ? (
                <li key={a.id} className="bg-white rounded p-2 mb-2 shadow text-sm">
                  {res.name} ({a.percent}%)
                </li>
              ) : null;
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}

// --- 3. Skills Matrix ---
export function SkillsMatrix({ resources }: { resources: any[] }) {
  // Get unique skills
  const allSkills = Array.from(new Set(resources.flatMap(r => r.skills || [])));
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-xs border">
        <thead>
          <tr>
            <th className="p-2 border">Resource</th>
            {allSkills.map(skill => (
              <th key={skill} className="p-2 border">{skill}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {resources.map(r => (
            <tr key={r.id}>
              <td className="p-2 border font-medium">{r.name}</td>
              {allSkills.map(skill => (
                <td key={skill} className="p-2 border text-center">
                  {r.skills && r.skills.includes(skill) ? "✔️" : ""}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// --- 4. Utilization Reports ---
function downloadCSV(resources: any[]) {
  const headers = ["Name", "Role", "Utilization", "Availability", "Skills"];
  const rows = resources.map(r => [r.name, r.role, r.utilization, r.availability, (r.skills || []).join("; ")]);
  const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "utilization_report.csv";
  a.click();
  URL.revokeObjectURL(url);
}
export function UtilizationReports({ resources }: { resources: any[] }) {
  return (
    <div>
      <button className="mb-2 px-3 py-1 bg-blue-600 text-white rounded" onClick={() => downloadCSV(resources)}>
        Download CSV
      </button>
      <table className="min-w-full text-xs border">
        <thead>
          <tr>
            <th className="p-2 border">Resource</th>
            <th className="p-2 border">Utilization (%)</th>
            <th className="p-2 border">Role</th>
            <th className="p-2 border">Availability</th>
          </tr>
        </thead>
        <tbody>
          {resources.map(r => (
            <tr key={r.id}>
              <td className="p-2 border font-medium">{r.name}</td>
              <td className="p-2 border">{r.utilization}</td>
              <td className="p-2 border">{r.role}</td>
              <td className="p-2 border">{r.availability}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// --- 5. Availability ---
export function AvailabilityTable({ resources, unavailability }: { resources: any[]; unavailability: Unavailability[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-xs border">
        <thead>
          <tr>
            <th className="p-2 border">Resource</th>
            <th className="p-2 border">Availability</th>
            <th className="p-2 border">Unavailable Dates</th>
          </tr>
        </thead>
        <tbody>
          {resources.map(r => (
            <tr key={r.id}>
              <td className="p-2 border font-medium">{r.name}</td>
              <td className="p-2 border">{r.availability}</td>
              <td className="p-2 border text-xs">
                {unavailability.filter(u => u.resource_id === r.id).map(u => (
                  <span key={u.id}>{u.from_date} to {u.to_date}</span>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
