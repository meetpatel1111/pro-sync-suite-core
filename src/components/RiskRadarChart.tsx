
import React from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ZAxis,
  Legend,
  Cell
} from 'recharts';

// Sample risk data
const risks = [
  { id: 1, name: 'Server Outage', probability: 2, impact: 5, category: 'Technical', count: 1 },
  { id: 2, name: 'Data Breach', probability: 1, impact: 5, category: 'Technical', count: 1 },
  { id: 3, name: 'API Integration Delay', probability: 4, impact: 3, category: 'Technical', count: 1 },
  { id: 4, name: 'Resource Shortage', probability: 3, impact: 3, category: 'Resource', count: 1 },
  { id: 5, name: 'Scope Creep', probability: 4, impact: 4, category: 'Schedule', count: 1 },
  { id: 6, name: 'Budget Overrun', probability: 3, impact: 4, category: 'Financial', count: 1 },
  { id: 7, name: 'Vendor Delays', probability: 3, impact: 2, category: 'Schedule', count: 1 },
  { id: 8, name: 'Compliance Issues', probability: 2, impact: 4, category: 'Technical', count: 1 },
  { id: 9, name: 'Staff Turnover', probability: 3, impact: 3, category: 'Resource', count: 1 },
  { id: 10, name: 'Technology Change', probability: 2, impact: 3, category: 'Technical', count: 1 },
];

// Get color based on probability and impact
const getRiskColor = (probability: number, impact: number) => {
  const riskScore = probability * impact;
  if (riskScore >= 15) return '#ef4444'; // High risk - red
  if (riskScore >= 8) return '#f59e0b';  // Medium risk - amber
  return '#10b981';                      // Low risk - green
};

// Get size based on priority
const getRiskSize = (probability: number, impact: number) => {
  const riskScore = probability * impact;
  if (riskScore >= 15) return 1000;  // High risk
  if (riskScore >= 8) return 800;    // Medium risk
  return 600;                        // Low risk
};

const RiskRadarChart = () => {
  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: any[] }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const riskScore = data.probability * data.impact;
      
      let riskLevel;
      if (riskScore >= 15) riskLevel = 'High';
      else if (riskScore >= 8) riskLevel = 'Medium';
      else riskLevel = 'Low';
      
      return (
        <div className="bg-background p-3 shadow-sm border rounded-md">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-muted-foreground">Category: {data.category}</p>
          <p className="text-sm text-muted-foreground">Probability: {data.probability}/5</p>
          <p className="text-sm text-muted-foreground">Impact: {data.impact}/5</p>
          <p className="text-sm font-medium mt-1">
            Risk Level: <span style={{ color: getRiskColor(data.probability, data.impact) }}>{riskLevel}</span>
          </p>
        </div>
      );
    }
    
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart
        margin={{
          top: 20,
          right: 20,
          bottom: 20,
          left: 20,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          type="number" 
          dataKey="probability" 
          name="Probability" 
          domain={[0, 5]} 
          label={{ value: 'Probability', position: 'bottom', offset: 0 }}
          ticks={[1, 2, 3, 4, 5]}
        />
        <YAxis 
          type="number" 
          dataKey="impact" 
          name="Impact" 
          domain={[0, 5]} 
          label={{ value: 'Impact', angle: -90, position: 'left' }}
          ticks={[1, 2, 3, 4, 5]}
        />
        <ZAxis 
          type="number" 
          dataKey="count" 
          range={[600, 1000]} 
        />
        <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
        <Legend />
        <Scatter name="Risks" data={risks}>
          {risks.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={getRiskColor(entry.probability, entry.impact)} 
            />
          ))}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  );
};

export default RiskRadarChart;
