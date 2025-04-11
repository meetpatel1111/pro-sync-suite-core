
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

// Sample data for the chart
const data = [
  {
    name: 'Apr',
    actual: 12845,
    planned: 15000,
  },
  {
    name: 'May',
    actual: 14680,
    planned: 15000,
  },
  {
    name: 'Jun',
    actual: 14655,
    planned: 15000,
  },
  {
    name: 'Jul',
    planned: 15000,
  },
  {
    name: 'Aug',
    planned: 15000,
  },
  {
    name: 'Sep',
    planned: 15000,
  },
];

const BudgetChart = () => {
  // Custom tooltip to format currency
  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border p-3 shadow-sm rounded-md">
          <p className="font-medium">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: ${entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" />
        <YAxis 
          tickFormatter={(value) => `$${value / 1000}k`}
          domain={[0, 20000]}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar dataKey="planned" name="Planned" fill="#e0e0e0" radius={[4, 4, 0, 0]} />
        <Bar dataKey="actual" name="Actual" fill="#8884d8" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default BudgetChart;
