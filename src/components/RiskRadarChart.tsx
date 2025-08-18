
import React, { useEffect, useState } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ZAxis,
  Cell
} from 'recharts';
import { Risk, riskService } from '@/services/riskService';

const RiskRadarChart = () => {
  const [risks, setRisks] = useState<Risk[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRisks();
  }, []);

  const loadRisks = async () => {
    try {
      const data = await riskService.getRisks();
      setRisks(data);
    } catch (error) {
      console.error('Error loading risks:', error);
    } finally {
      setLoading(false);
    }
  };

  // Transform risks for chart display
  const chartData = risks.map(risk => ({
    id: risk.id,
    name: risk.title,
    probability: risk.probability * 5, // Scale to 1-5
    impact: risk.impact * 5, // Scale to 1-5
    category: risk.category,
    count: 1,
    riskScore: risk.risk_score
  }));

  // Get color based on risk score
  const getRiskColor = (riskScore: number) => {
    if (riskScore >= 0.7) return '#ef4444'; // High risk - red
    if (riskScore >= 0.3) return '#f59e0b';  // Medium risk - amber
    return '#10b981';                        // Low risk - green
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: any[] }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      let riskLevel;
      if (data.riskScore >= 0.7) riskLevel = 'High';
      else if (data.riskScore >= 0.3) riskLevel = 'Medium';
      else riskLevel = 'Low';
      
      return (
        <div className="bg-background p-3 shadow-sm border rounded-md">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-muted-foreground">Category: {data.category}</p>
          <p className="text-sm text-muted-foreground">Probability: {Math.round(data.probability * 20)}%</p>
          <p className="text-sm text-muted-foreground">Impact: {Math.round(data.impact * 20)}%</p>
          <p className="text-sm font-medium mt-1">
            Risk Level: <span style={{ color: getRiskColor(data.riskScore) }}>{riskLevel}</span>
          </p>
        </div>
      );
    }
    
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground mt-2">Loading risks...</p>
        </div>
      </div>
    );
  }

  if (risks.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <div className="text-center">
          <p className="text-lg font-medium">No risks found</p>
          <p className="text-sm text-muted-foreground">Create your first risk to see the risk matrix</p>
        </div>
      </div>
    );
  }

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
          range={[400, 800]} 
        />
        <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
        <Scatter name="Risks" data={chartData}>
          {chartData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={getRiskColor(entry.riskScore)} 
            />
          ))}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  );
};

export default RiskRadarChart;
