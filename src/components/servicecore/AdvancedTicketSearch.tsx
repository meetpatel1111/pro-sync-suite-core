
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { 
  Search, 
  Filter, 
  X, 
  Calendar,
  User,
  Tag,
  Clock,
  AlertTriangle,
  CheckCircle,
  ArrowUpDown,
  Download,
  Save
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SearchFilters {
  query: string;
  status: string;
  priority: string;
  assignee: string;
  category: string;
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
  tags: string[];
  customFields: Record<string, string>;
}

interface TicketResult {
  id: string;
  ticketNumber: string;
  title: string;
  status: string;
  priority: string;
  assignee: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

const AdvancedTicketSearch: React.FC = () => {
  const { toast } = useToast();
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    status: '',
    priority: '',
    assignee: '',
    category: '',
    dateFrom: undefined,
    dateTo: undefined,
    tags: [],
    customFields: {}
  });
  
  const [results, setResults] = useState<TicketResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Mock data for demonstration
  const mockResults: TicketResult[] = [
    {
      id: '1',
      ticketNumber: 'INC-001',
      title: 'Database connection timeout',
      status: 'in_progress',
      priority: 'high',
      assignee: 'John Doe',
      category: 'System',
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T14:20:00Z',
      tags: ['database', 'urgent']
    },
    {
      id: '2',
      ticketNumber: 'REQ-002',
      title: 'New user account setup',
      status: 'resolved',
      priority: 'medium',
      assignee: 'Jane Smith',
      category: 'Access',
      createdAt: '2024-01-14T09:15:00Z',
      updatedAt: '2024-01-14T16:45:00Z',
      tags: ['account', 'setup']
    }
  ];

  const handleSearch = async () => {
    setLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Apply filters to mock data (replace with actual API call)
      let filteredResults = mockResults;
      
      if (filters.query) {
        filteredResults = filteredResults.filter(ticket =>
          ticket.title.toLowerCase().includes(filters.query.toLowerCase()) ||
          ticket.ticketNumber.toLowerCase().includes(filters.query.toLowerCase())
        );
      }
      
      if (filters.status) {
        filteredResults = filteredResults.filter(ticket => ticket.status === filters.status);
      }
      
      if (filters.priority) {
        filteredResults = filteredResults.filter(ticket => ticket.priority === filters.priority);
      }
      
      setResults(filteredResults);
      
      toast({
        title: 'Search completed',
        description: `Found ${filteredResults.length} tickets`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to search tickets',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      status: '',
      priority: '',
      assignee: '',
      category: '',
      dateFrom: undefined,
      dateTo: undefined,
      tags: [],
      customFields: {}
    });
    setResults([]);
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'open': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Search Header */}
      <Card className="shadow-lg border-2 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Search className="h-6 w-6" />
            Advanced Ticket Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Basic Search */}
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search tickets by title, number, or content..."
                  value={filters.query}
                  onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
                  className="pl-10 shadow-sm"
                />
              </div>
            </div>
            <Button onClick={handleSearch} disabled={loading} className="hover-scale bg-gradient-to-r from-blue-500 to-purple-600">
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </>
              )}
            </Button>
          </div>

          {/* Quick Filters */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
              <SelectTrigger className="shadow-sm">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.priority} onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value }))}>
              <SelectTrigger className="shadow-sm">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Priorities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
              <SelectTrigger className="shadow-sm">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                <SelectItem value="System">System</SelectItem>
                <SelectItem value="Access">Access</SelectItem>
                <SelectItem value="Network">Network</SelectItem>
                <SelectItem value="Software">Software</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="hover-scale"
            >
              <Filter className="h-4 w-4 mr-2" />
              Advanced
            </Button>
          </div>

          {/* Advanced Filters */}
          {showAdvanced && (
            <div className="space-y-4 p-4 bg-white rounded-lg border animate-scale-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date From</label>
                  <DatePicker
                    date={filters.dateFrom}
                    onSelect={(date) => setFilters(prev => ({ ...prev, dateFrom: date }))}
                    placeholder="Select start date"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date To</label>
                  <DatePicker
                    date={filters.dateTo}
                    onSelect={(date) => setFilters(prev => ({ ...prev, dateTo: date }))}
                    placeholder="Select end date"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Assignee</label>
                <Input
                  placeholder="Enter assignee name or email"
                  value={filters.assignee}
                  onChange={(e) => setFilters(prev => ({ ...prev, assignee: e.target.value }))}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            <Button variant="outline" onClick={clearFilters} className="hover-scale">
              <X className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
            
            <div className="flex gap-2">
              <Button variant="outline" className="hover-scale">
                <Save className="h-4 w-4 mr-2" />
                Save Search
              </Button>
              <Button variant="outline" className="hover-scale">
                <Download className="h-4 w-4 mr-2" />
                Export Results
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {results.length > 0 && (
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                Search Results ({results.length})
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSort('created_at')}
                  className="hover-scale"
                >
                  <ArrowUpDown className="h-4 w-4 mr-1" />
                  Sort by Date
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.map((ticket, index) => (
                <div
                  key={ticket.id}
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors animate-fade-in hover-lift"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(ticket.status)}
                      <div>
                        <h3 className="font-semibold text-gray-900">{ticket.title}</h3>
                        <p className="text-sm text-gray-600">{ticket.ticketNumber}</p>
                      </div>
                    </div>
                    <Badge className={`${getPriorityColor(ticket.priority)} border`}>
                      {ticket.priority}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {ticket.assignee}
                    </div>
                    <div className="flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      {ticket.category}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(ticket.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      {ticket.tags.map((tag, tagIndex) => (
                        <Badge key={tagIndex} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <Button variant="outline" size="sm" className="hover-scale">
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdvancedTicketSearch;
