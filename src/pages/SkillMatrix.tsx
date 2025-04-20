import React from 'react';
import AppLayout from '@/components/AppLayout';

// SkillMatrix file intentionally left blank. All Skills Matrix logic now uses live data via ResourceHub.
type Skill = {
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
};
type UserSkill = {
  user: string;
  skills: Skill[];
};





const SkillMatrix: React.FC = () => {
  return (
    <AppLayout>
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Skill Matrix</h1>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300">
            <thead>
              <tr>
                <th className="border px-4 py-2 bg-gray-100">User</th>
                {/* Skill columns will be dynamically rendered from live data */}
              </tr>
            </thead>
            <tbody>
              {/*
  All mock members and sample data have been removed.
  Please integrate live data from ResourceHub or your API here.
*/}
<tr>
  <td colSpan={100} className="border px-4 py-6 text-center text-gray-500">
    No mock members. Connect to live data source to display the Skill Matrix.
  </td>
</tr>
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
};

export default SkillMatrix;
