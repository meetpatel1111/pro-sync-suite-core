
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ColorfulButton } from '@/components/ui/colorful-button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  AlertTriangle, 
  TrendingUp, 
  Eye, 
  Plus, 
  Filter,
  Target,
  Activity,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { GradientBackground } from '@/components/ui/gradient-background';

const RiskRadar = () => {
  return (
    <GradientBackground variant="rose" className="min-h-screen">
      <div className="p-6 space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-rose-600 via-red-600 to-orange-600 bg-clip-text text-transparent">
              RiskRadar
            </h1>
            <p className="text-muted-foreground text-lg mt-2">
              Advanced risk assessment and issue tracking system
            </p>
          </div>
          <div className="flex items-center gap-4">
            <ColorfulButton variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </ColorfulButton>
            <ColorfulButton variant="secondary" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Monitor
            </ColorfulButton>
            <ColorfulButton variant="primary">
              <Plus className="h-4 w-4 mr-2" />
              Add Risk
            </ColorfulButton>
          </div>
        </div>

        {/* Risk Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { title: 'High Risk Items', value: '3', icon: AlertTriangle, color: 'from-red-500 to-rose-600', status: 'critical' },
            { title: 'Medium Risk Items', value: '7', icon: Shield, color: 'from-orange-500 to-red-600', status: 'warning' },
            { title: 'Monitored Risks', value: '15', icon: Eye, color: 'from-blue-500 to-indigo-600', status: 'info' },
            { title: 'Resolved Issues', value: '42', icon: CheckCircle, color: 'from-green-500 to-emerald-600', status: 'success' }
          ].map((stat, index) => (
            <Card key={index} className="border-0 shadow-xl bg-gradient-to-br from-white/90 to-white/80 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} shadow-lg`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className={`w-3 h-3 rounded-full ${
                    stat.status === 'critical' ? 'bg-red-500 animate-pulse' :
                    stat.status === 'warning' ? 'bg-orange-500' :
                    stat.status === 'info' ? 'bg-blue-500' : 'bg-green-500'
                  }`} />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.title}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Risk Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Active Risks */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-2xl bg-gradient-to-br from-white via-white/95 to-white/90">
              <CardHeader className="bg-gradient-to-r from-rose-100/80 via-red-100/80 to-orange-100/80 rounded-t-2xl">
                <CardTitle className="text-xl bg-gradient-to-r from-rose-600 via-red-600 to-orange-600 bg-clip-text text-transparent flex items-center gap-2">
                  <Shield className="h-5 w-5 text-rose-600" />
                  Active Risk Items
                  <Badge className="ml-auto bg-gradient-to-r from-rose-500 to-red-500 text-white">
                    10 Active
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {[
                    { title: 'Server Infrastructure Vulnerability', level: 'High', probability: '75%', impact: 'Critical', status: 'Open' },
                    { title: 'Data Backup System Failure', level: 'Medium', probability: '40%', impact: 'High', status: 'Monitoring' },
                    { title: 'Third-party API Dependency', level: 'Low', probability: '20%', impact: 'Medium', status: 'Tracked' }
                  ].map((risk, index) => (
                    <div key={index} className="p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 hover:from-rose-50 hover:to-red-50 transition-all duration-300 border border-gray-200">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{risk.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>Probability: {risk.probability}</span>
                            <span>Impact: {risk.impact}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={
                            risk.level === 'High' ? 'destructive' : 
                            risk.level === 'Medium' ? 'default' : 'secondary'
                          }>
                            {risk.level}
                          </Badge>
                          <Badge variant="outline">{risk.status}</Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <ColorfulButton variant="outline" size="sm">
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </ColorfulButton>
                        <ColorfulButton variant="secondary" size="sm">
                          <Target className="h-3 w-3 mr-1" />
                          Mitigate
                        </ColorfulButton>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Risk Analytics */}
          <div>
            <Card className="border-0 shadow-2xl bg-gradient-to-br from-white via-white/95 to-white/90">
              <CardHeader className="bg-gradient-to-r from-rose-100/80 via-red-100/80 to-orange-100/80 rounded-t-2xl">
                <CardTitle className="text-lg bg-gradient-to-r from-rose-600 via-red-600 to-orange-600 bg-clip-text text-transparent">
                  Risk Analytics
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-center py-8">
                  <Activity className="h-16 w-16 mx-auto mb-4 text-rose-500 animate-pulse" />
                  <h3 className="text-lg font-semibold mb-2">Risk Heat Map</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Visual representation of risk probability vs impact analysis
                  </p>
                  <ColorfulButton variant="primary" size="sm">
                    View Heat Map
                  </ColorfulButton>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </GradientBackground>
  );
};

export default RiskRadar;
