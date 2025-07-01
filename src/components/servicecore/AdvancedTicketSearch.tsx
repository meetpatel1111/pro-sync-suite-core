
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePickerWithRange } from '@/components/ui/date-picker';
import { 
  Search, 
  Filter, 
  Save, 
  Clock, 
  Tag, 
  User, 
  Calendar,
  MapPin,
  Star,
  Trash2,
  Download,
  RefreshCw,
  Zap,
  Target,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DateRange } from 'react-day-picker';

interface SearchFilter {
  id: string;
  name: string;
  query: string;
  filters: {
    status?: string[];
    priority?: string[];
    type?: string[];
    assignee?: string[];
    category?: string[];
    dateRange?: DateRange;
    tags?: string[];
    customFields?: Record<string, any>;
  };
  isDefault?: boolean;
  createdAt: string;
}

interface SearchResult {
  id: string;
  ticketNumber: string;
  title: string;
  status: string;
  priority: string;
  type: string;
  assignee?: string;
  submittedBy: string;
  category?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  slaStatus: 'on_time' | 'at_risk' | 'breached';
  relevanceScore: number;
}

const AdvancedTicketSearch: React.FC = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [savedFilters, setSavedFilters] = useState<SearchFilter[]>([]);
  const [activeFilter, setActiveFilter] = useState<SearchFilter | null>(null);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Advanced filter states
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [selectedPriority, setSelectedPriority] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<string[]>([]);
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [tagFilter, setTagFilter] = useState('');
  const [sortBy, setSortBy] = useState<'relevance' | 'created' | 'updated' | 'priority'>('relevance');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    loadSavedFilters();
  }, []);

  const loadSavedFilters = async () => {
    try {
      // Mock data - replace with actual API call
      const mockFilters: SearchFilter[] = [
        {
          id: '1',
          name: 'High Priority Open Tickets',
          query: 'status:open priority:high',
          filters: {
            status: ['open'],
            priority: ['high', 'critical']
          },
          isDefault: true,
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          name: 'My Assigned Tickets',
          query: 'assignee:me status:open,in_progress',
          filters: {
            status: ['open', 'in_progress'],
            assignee: ['current_user']
          },
          createdAt: new Date().toISOString()
        }
      ];
      setSavedFilters(mockFilters);
    } catch (error) {
      console.error('Error loading saved filters:', error);
    }
  };

  const performSearch = async () => {
    setLoading(true);
    try {
      // Mock search results - replace with actual API call
      const mockResults: SearchResult[] = [
        {
          id: '1',
          ticketNumber: 'INC-12345',
          title: 'Email server down - multiple users affected',
          status: 'open',
          priority: 'critical',
          type: 'incident',
          assignee: 'john.doe',
          submittedBy: 'jane.smith',
          category: 'infrastructure',
          tags: ['email', 'server', 'outage'],
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          slaStatus: 'at_risk',
          relevanceScore: 95
        },
        {
          id: '2',
          ticketNumber: 'REQ-12346',
          title: 'Request for additional storage space',
          status: 'in_progress',
          priority: 'medium',
          type: 'request',
          assignee: 'bob.wilson',
          submittedBy: 'alice.brown',
          category: 'hardware',
          tags: ['storage', 'capacity'],
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          slaStatus: 'on_time',
          relevanceScore: 82
        }
      ];

      // Apply filters
      let filteredResults = mockResults;
      
      if (selectedStatus.length > 0) {
        filteredResults = filteredResults.filter(r => selectedStatus.includes(r.status));
      }
      
      if (selectedPriority.length > 0) {
        filteredResults = filteredResults.filter(r => selectedPriority.includes(r.priority));
      }
      
      if (selectedType.length > 0) {
        filteredResults = filteredResults.filter(r => selectedType.includes(r.type));
      }

      // Sort results
      filteredResults.sort((a, b) => {
        let comparison = 0;
        switch (sortBy) {
          case 'relevance':
            comparison = b.relevanceScore - a.relevanceScore;
            break;
          case 'created':
            comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            break;
          case 'updated':
            comparison = new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
            break;
          case 'priority':
            const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
            comparison = priorityOrder[b.priority as keyof typeof priorityOrder] - 
                        priorityOrder[a.priority as keyof typeof priorityOrder];
            break;
        }
        return sortOrder === 'desc' ? comparison : -comparison;
      });

      setResults(filteredResults);
    } catch (error) {
      console.error('Error performing search:', error);
      toast({
        title: 'Error',
        description: 'Failed to perform search',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const saveCurrentFilter = async () => {
    const filterName = prompt('Enter a name for this filter:');
    if (!filterName) return;

    const newFilter: SearchFilter = {
      id: Date.now().toString(),
      name: filterName,
      query: searchQuery,
      filters: {
        status: selectedStatus,
        priority: selectedPriority,
        type: selectedType,
        assignee: selectedAssignees,
        dateRange,
        tags: tagFilter ? [tagFilter] : []
      },
      createdAt: new Date().toISOString()
    };

    setSavedFilters(prev => [newFilter, ...prev]);
    toast({
      title: 'Success',
      description: 'Filter saved successfully',
    });
  };

  const loadFilter = (filter: SearchFilter) => {
    setActiveFilter(filter);
    setSearchQuery(filter.query);
    setSelectedStatus(filter.filters.status || []);
    setSelectedPriority(filter.filters.priority || []);
    setSelectedType(filter.filters.type || []);
    setSelectedAssignees(filter.filters.assignee || []);
    setDateRange(filter.filters.dateRange);
    performSearch();
  };

  const deleteFilter = async (filterId: string) => {
    setSavedFilters(prev => prev.filter(f => f.id !== filterId));
    toast({
      title: 'Success',
      description: 'Filter deleted successfully',
    });
  };

  const exportResults = () => {
    // Mock export functionality
    toast({
      title: 'Export Started',
      description: 'Results are being exported to CSV',
    });
  };

  const getSlaStatusColor = (status: string) => {
    switch (status) {
      case 'on_time': return 'bg-green-100 text-green-800 border-green-200';
      case 'at_risk': return 'bg-yellow-100 text-yellow-800 border-yellow-200 animate-pulse';
      case 'breached': return 'bg-red-100 text-red-800 border-red-200 animate-pulse';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500 animate-pulse';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Search Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-blue-900">
            <div className="p-2 bg-blue-500 rounded-lg animate-pulse-glow">
              <Search className="h-6 w-6 text-white" />
            </div>
            Advanced Ticket Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search tickets... (e.g., 'email server' OR status:open priority:high)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && performSearch()}
                className="pl-10 shadow-sm"
              />
            </div>
            <Button onClick={performSearch} disabled={loading} className="hover-scale">
              {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Search
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="hover-scale"
            >
              <Filter className="h-4 w-4 mr-1" />
              Advanced
            </Button>
          </div>

          {showAdvanced && (
            <div className="border-t pt-4 animate-fade-in">
              <Tabs defaultValue="filters" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="filters">Filters</TabsTrigger>
                  <TabsTrigger value="sorting">Sorting</TabsTrigger>
                  <TabsTrigger value="saved">Saved Searches</TabsTrigger>
                </TabsList>

                <TabsContent value="filters" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
                      <div className="space-y-2">
                        {['open', 'in_progress', 'resolved', 'closed'].map((status) => (
                          <div key={status} className="flex items-center space-x-2">
                            <Checkbox
                              id={`status-${status}`}
                              checked={selectedStatus.includes(status)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedStatus(prev => [...prev, status]);
                                } else {
                                  setSelectedStatus(prev => prev.filter(s => s !== status));
                                }
                              }}
                            />
                            <label htmlFor={`status-${status}`} className="text-sm capitalize">
                              {status.replace('_', ' ')}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Priority</label>
                      <div className="space-y-2">
                        {['critical', 'high', 'medium', 'low'].map((priority) => (
                          <div key={priority} className="flex items-center space-x-2">
                            <Checkbox
                              id={`priority-${priority}`}
                              checked={selectedPriority.includes(priority)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedPriority(prev => [...prev, priority]);
                                } else {
                                  setSelectedPriority(prev => prev.filter(p => p !== priority));
                                }
                              }}
                            />
                            <label htmlFor={`priority-${priority}`} className="text-sm capitalize">
                              {priority}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Type</label>
                      <div className="space-y-2">
                        {['incident', 'request', 'problem', 'change'].map((type) => (
                          <div key={type} className="flex items-center space-x-2">
                            <Checkbox
                              id={`type-${type}`}
                              checked={selectedType.includes(type)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedType(prev => [...prev, type]);
                                } else {
                                  setSelectedType(prev => prev.filter(t => t !== type));
                                }
                              }}
                            />
                            <label htmlFor={`type-${type}`} className="text-sm capitalize">
                              {type}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Date Range</label>
                      <DatePickerWithRange
                        date={dateRange}
                        onDateChange={setDateRange}
                      />
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Input
                      placeholder="Filter by tags..."
                      value={tagFilter}
                      onChange={(e) => setTagFilter(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={saveCurrentFilter} variant="outline" className="hover-scale">
                      <Save className="h-4 w-4 mr-1" />
                      Save Filter
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="sorting" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Sort By</label>
                      <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="relevance">Relevance</SelectItem>
                          <SelectItem value="created">Created Date</SelectItem>
                          <SelectItem value="updated">Updated Date</SelectItem>
                          <SelectItem value="priority">Priority</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Order</label>
                      <Select value={sortOrder} onValueChange={(value: any) => setSortOrder(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="desc">Descending</SelectItem>
                          <SelectItem value="asc">Ascending</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="saved" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    {savedFilters.map((filter, index) => (
                      <div 
                        key={filter.id} 
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 animate-fade-in"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium">{filter.name}</h4>
                            {filter.isDefault && (
                              <Badge variant="outline" className="text-xs">
                                <Star className="h-3 w-3 mr-1" />
                                Default
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{filter.query}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => loadFilter(filter)}
                            className="hover-scale"
                          >
                            <Zap className="h-3 w-3 mr-1" />
                            Apply
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteFilter(filter.id)}
                            className="hover-scale text-red-600"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search Results */}
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Search Results ({results.length})
            </CardTitle>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={exportResults} className="hover-scale">
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
              <Button variant="outline" size="sm" className="hover-scale">
                <Settings className="h-4 w-4 mr-1" />
                Columns
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32 animate-fade-in">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 mx-auto mb-2 text-blue-500 animate-spin" />
                <p className="text-muted-foreground">Searching tickets...</p>
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-8 animate-fade-in">
              <Search className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">No tickets found</h3>
              <p className="text-muted-foreground">Try adjusting your search criteria</p>
            </div>
          ) : (
            <div className="space-y-3">
              {results.map((ticket, index) => (
                <Card 
                  key={ticket.id} 
                  className="transition-all duration-300 hover:shadow-md cursor-pointer hover-lift animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <Badge variant="outline" className="font-mono text-xs">
                            {ticket.ticketNumber}
                          </Badge>
                          <div className={`w-3 h-3 rounded-full ${getPriorityColor(ticket.priority)}`} />
                          <Badge className={getSlaStatusColor(ticket.slaStatus)}>
                            {ticket.slaStatus.replace('_', ' ')}
                          </Badge>
                          {sortBy === 'relevance' && (
                            <Badge variant="outline" className="text-xs">
                              {ticket.relevanceScore}% match
                            </Badge>
                          )}
                        </div>
                        
                        <h3 className="font-semibold text-gray-900 mb-2">{ticket.title}</h3>
                        
                        <div className="flex items-center space-x-6 text-sm text-gray-600">
                          <span className="flex items-center">
                            <User className="h-3 w-3 mr-1" />
                            {ticket.assignee || 'Unassigned'}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(ticket.createdAt).toLocaleDateString()}
                          </span>
                          <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {new Date(ticket.updatedAt).toLocaleString()}
                          </span>
                          {ticket.category && (
                            <span className="flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {ticket.category}
                            </span>
                          )}
                        </div>

                        {ticket.tags.length > 0 && (
                          <div className="flex items-center space-x-2 mt-2">
                            <Tag className="h-3 w-3 text-gray-400" />
                            <div className="flex flex-wrap gap-1">
                              {ticket.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col items-end space-y-2">
                        <Badge 
                          className={`${
                            ticket.status === 'open' ? 'bg-red-100 text-red-800' :
                            ticket.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                            ticket.status === 'resolved' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          } border`}
                        >
                          {ticket.status.replace('_', ' ')}
                        </Badge>
                        <Badge variant="outline" className="text-xs capitalize">
                          {ticket.type}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedTicketSearch;
