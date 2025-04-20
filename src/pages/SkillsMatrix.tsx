import React, { useState, useMemo } from 'react';

interface Resource {
  id: string;
  name: string;
  role: string;
  skills: Skill[];
}

interface Skill {
  name: string;
  proficiency: string; // e.g., Beginner, Intermediate, Expert
}

// Placeholder data - replace with API call or props
const sampleResources: Resource[] = [
  {
    id: '1',
    name: 'Alex Johnson',
    role: 'Designer',
    skills: [
      { name: 'Figma', proficiency: 'Expert' },
      { name: 'Photoshop', proficiency: 'Intermediate' }
    ]
  },
  {
    id: '2',
    name: 'Jamie Smith',
    role: 'Developer',
    skills: [
      { name: 'React', proficiency: 'Expert' },
      { name: 'Node.js', proficiency: 'Intermediate' }
    ]
  },
  {
    id: '3',
    name: 'Taylor Lee',
    role: 'Project Manager',
    skills: [
      { name: 'Agile', proficiency: 'Expert' },
      { name: 'Scrum', proficiency: 'Expert' }
    ]
  }
];

const proficiencyLevels = ['Beginner', 'Intermediate', 'Expert'];

export default function SkillsMatrix() {
  const [search, setSearch] = useState('');
  const [filterSkill, setFilterSkill] = useState('');
  const [filterProficiency, setFilterProficiency] = useState('');

  // Filtered resources based on search and filters
  const filteredResources = useMemo(() => {
    return sampleResources.filter(resource => {
      const matchesName = resource.name.toLowerCase().includes(search.toLowerCase());
      const matchesSkill = filterSkill
        ? resource.skills.some(skill => skill.name.toLowerCase().includes(filterSkill.toLowerCase()))
        : true;
      const matchesProficiency = filterProficiency
        ? resource.skills.some(skill => skill.proficiency === filterProficiency)
        : true;
      return matchesName && matchesSkill && matchesProficiency;
    });
  }, [search, filterSkill, filterProficiency]);

  // Validation: Check for duplicate skills per resource
  const validateSkills = (skills: Skill[]) => {
    const seen = new Set();
    for (const skill of skills) {
      if (seen.has(skill.name.toLowerCase())) return false;
      seen.add(skill.name.toLowerCase());
    }
    return true;
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Skills Matrix</h2>
      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ marginRight: 8 }}
        />
        <input
          type="text"
          placeholder="Filter by skill..."
          value={filterSkill}
          onChange={e => setFilterSkill(e.target.value)}
          style={{ marginRight: 8 }}
        />
        <select
          value={filterProficiency}
          onChange={e => setFilterProficiency(e.target.value)}
        >
          <option value="">All Proficiency</option>
          {proficiencyLevels.map(level => (
            <option key={level} value={level}>{level}</option>
          ))}
        </select>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ccc', padding: 8 }}>Name</th>
            <th style={{ border: '1px solid #ccc', padding: 8 }}>Role</th>
            <th style={{ border: '1px solid #ccc', padding: 8 }}>Skills</th>
            <th style={{ border: '1px solid #ccc', padding: 8 }}>Validation</th>
          </tr>
        </thead>
        <tbody>
          {filteredResources.map(resource => (
            <tr key={resource.id}>
              <td style={{ border: '1px solid #ccc', padding: 8 }}>{resource.name}</td>
              <td style={{ border: '1px solid #ccc', padding: 8 }}>{resource.role}</td>
              <td style={{ border: '1px solid #ccc', padding: 8 }}>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                  {resource.skills.map(skill => (
                    <li key={skill.name}>
                      {skill.name} <span style={{ color: '#888' }}>({skill.proficiency})</span>
                    </li>
                  ))}
                </ul>
              </td>
              <td style={{ border: '1px solid #ccc', padding: 8 }}>
                {validateSkills(resource.skills) ? (
                  <span style={{ color: 'green' }}>Valid</span>
                ) : (
                  <span style={{ color: 'red' }}>Duplicate Skills</span>
                )}
              </td>
            </tr>
          ))}
          {filteredResources.length === 0 && (
            <tr>
              <td colSpan={4} style={{ textAlign: 'center', padding: 16 }}>
                No resources found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
