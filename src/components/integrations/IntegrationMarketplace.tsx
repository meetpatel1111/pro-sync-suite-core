
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Filter, 
  Star, 
  Download, 
  ExternalLink,
  Zap,
  Shield,
  Clock,
  Users,
  TrendingUp,
  Award,
  CheckCircle
} from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  description: string;
  category: string;
  provider: string;
  rating: number;
  downloads: number;
  price: 'free' | 'paid' | 'freemium';
  verified: boolean;
  featured: boolean;
  icon?: string;
  screenshots: string[];
  tags: string[];
  lastUpdated: string;
  version: string;
}

const IntegrationMarketplace = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const integrations: Integration[] = [
    {
      id: '1',
      name: 'Slack Connector',
      description: 'Connect your workspace with Slack for seamless team communication and notifications.',
      category: 'Communication',
      provider: 'ProSync',
      rating: 4.8,
      downloads: 12500,
      price: 'free',
      verified: true,
      featured: true,
      tags: ['Slack', 'Messaging', 'Notifications', 'Team'],
      lastUpdated: '2024-01-15',
      version: '2.1.0',
      screenshots: []
    },
    {
      id: '2',
      name: 'GitHub Integration',
      description: 'Sync code repositories, track commits, and manage development workflows.',
      category: 'Development',
      provider: 'GitHub Inc.',
      rating: 4.9,
      downloads: 8900,
      price: 'freemium',
      verified: true,
      featured: true,
      tags: ['GitHub', 'Git', 'Code', 'Development'],
      lastUpdated: '2024-01-10',
      version: '3.2.1',
      screenshots: []
    },
    {
      id: '3',
      name: 'Google Drive Sync',
      description: 'Automatically sync files and documents with Google Drive cloud storage.',
      category: 'Storage',
      provider: 'Google',
      rating: 4.6,
      downloads: 15200,
      price: 'free',
      verified: true,
      featured: false,
      tags: ['Google Drive', 'Cloud', 'Files', 'Sync'],
      lastUpdated: '2024-01-12',
      version: '1.8.3',
      screenshots: []
    },
    {
      id: '4',
      name: 'Jira Workflow',
      description: 'Connect with Jira for enhanced project management and issue tracking.',
      category: 'Project Management',
      provider: 'Atlassian',
      rating: 4.7,
      downloads: 6800,
      price: 'paid',
      verified: true,
      featured: false,
      tags: ['Jira', 'Atlassian', 'Issues', 'Agile'],
      lastUpdated: '2024-01-08',
      version: '2.5.0',
      screenshots: []
    },
    {
      id: '5',
      name: 'Salesforce CRM',
      description: 'Integrate customer relationship management with your project workflows.',
      category: 'CRM',
      provider: 'Salesforce',
      rating: 4.5,
      downloads: 4200,
      price: 'paid',
      verified: true,
      featured: false,
      tags: ['Salesforce', 'CRM', 'Sales', 'Customers'],
      lastUpdated: '2024-01-05',
      version: '1.4.2',
      screenshots: []
    },
    {
      id: '6',
      name: 'Zapier Automation',
      description: 'Connect with 5000+ apps through Zapier automation workflows.',
      category: 'Automation',
      provider: 'Zapier',
      rating: 4.8,
      downloads: 9600,
      price: 'freemium',
      verified: true,
      featured: true,
      tags: ['Zapier', 'Automation', 'Workflows', 'API'],
      lastUpdated: '2024-01-14',
      version: '2.0.5',
      screenshots: []
    }
  ];

  const categories = ['all', 'Communication', 'Development', 'Storage', 'Project Management', 'CRM', 'Automation', 'Analytics'];
  const filters = ['all', 'featured', 'verified', 'free', 'paid', 'most-downloaded'];

  const filteredIntegrations = integrations.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         integration.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || integration.category === selectedCategory;
    
    const matchesFilter = selectedFilter === 'all' ||
                         (selectedFilter === 'featured' && integration.featured) ||
                         (selectedFilter === 'verified' && integration.verified) ||
                         (selectedFilter === 'free' && integration.price === 'free') ||
                         (selectedFilter === 'paid' && integration.price === 'paid');
    
    return matchesSearch && matchesCategory && matchesFilter;
  });

  const getPriceColor = (price: string) => {
    switch (price) {
      case 'free': return 'bg-green-100 text-green-800';
      case 'paid': return 'bg-blue-100 text-blue-800';
      case 'freemium': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDownloads = (downloads: number) => {
    if (downloads >= 1000) {
      return `${(downloads / 1000).toFixed(1)}k`;
    }
    return downloads.toString();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Integration Marketplace
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search integrations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border rounded-md px-3 py-2"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="border rounded-md px-3 py-2"
              >
                <option value="all">All Integrations</option>
                <option value="featured">Featured</option>
                <option value="verified">Verified</option>
                <option value="free">Free</option>
                <option value="paid">Paid</option>
                <option value="most-downloaded">Most Downloaded</option>
              </select>
            </div>
          </div>

          <Tabs defaultValue="grid" className="space-y-4">
            <TabsList>
              <TabsTrigger value="grid">Grid View</TabsTrigger>
              <TabsTrigger value="list">List View</TabsTrigger>
              <TabsTrigger value="featured">Featured</TabsTrigger>
            </TabsList>

            <TabsContent value="grid">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredIntegrations.map((integration) => (
                  <Card key={integration.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                            {integration.name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-semibold">{integration.name}</h3>
                            <p className="text-sm text-gray-600">{integration.provider}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {integration.featured && (
                            <Badge className="bg-yellow-100 text-yellow-800">
                              <Award className="h-3 w-3 mr-1" />
                              Featured
                            </Badge>
                          )}
                          {integration.verified && (
                            <CheckCircle className="h-4 w-4 text-blue-500" />
                          )}
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {integration.description}
                      </p>

                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span className="text-sm font-medium">{integration.rating}</span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-500">
                            <Download className="h-4 w-4" />
                            <span className="text-sm">{formatDownloads(integration.downloads)}</span>
                          </div>
                        </div>
                        <Badge className={getPriceColor(integration.price)}>
                          {integration.price === 'freemium' ? 'Freemium' : integration.price.charAt(0).toUpperCase() + integration.price.slice(1)}
                        </Badge>
                      </div>

                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1">
                          {integration.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {integration.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{integration.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1">
                          Install
                        </Button>
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="mt-3 text-xs text-gray-500">
                        Updated {integration.lastUpdated} • v{integration.version}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="list">
              <div className="space-y-2">
                {filteredIntegrations.map((integration) => (
                  <Card key={integration.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                            {integration.name.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{integration.name}</h3>
                              {integration.verified && (
                                <CheckCircle className="h-4 w-4 text-blue-500" />
                              )}
                              {integration.featured && (
                                <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                                  Featured
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{integration.description}</p>
                            <div className="flex items-center gap-4 mt-1">
                              <span className="text-xs text-gray-500">{integration.provider}</span>
                              <Badge variant="outline" className="text-xs">{integration.category}</Badge>
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 text-yellow-500 fill-current" />
                                <span className="text-xs">{integration.rating}</span>
                              </div>
                              <div className="flex items-center gap-1 text-gray-500">
                                <Download className="h-3 w-3" />
                                <span className="text-xs">{formatDownloads(integration.downloads)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getPriceColor(integration.price)}>
                            {integration.price === 'freemium' ? 'Freemium' : integration.price.charAt(0).toUpperCase() + integration.price.slice(1)}
                          </Badge>
                          <Button size="sm">
                            Install
                          </Button>
                          <Button variant="outline" size="sm">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="featured">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredIntegrations.filter(i => i.featured).map((integration) => (
                  <Card key={integration.id} className="border-2 border-yellow-200">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                          {integration.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-xl font-semibold">{integration.name}</h3>
                            <Badge className="bg-yellow-100 text-yellow-800">
                              <Award className="h-3 w-3 mr-1" />
                              Featured
                            </Badge>
                            {integration.verified && (
                              <CheckCircle className="h-5 w-5 text-blue-500" />
                            )}
                          </div>
                          <p className="text-gray-600 mb-3">{integration.description}</p>
                          <div className="flex items-center gap-6 text-sm">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              <span className="font-medium">{integration.rating}/5</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Download className="h-4 w-4 text-gray-500" />
                              <span>{formatDownloads(integration.downloads)} downloads</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4 text-gray-500" />
                              <span>{integration.provider}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {integration.tags.map((tag, index) => (
                          <Badge key={index} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center justify-between">
                        <Badge className={getPriceColor(integration.price)} className="px-3 py-1">
                          {integration.price === 'freemium' ? 'Freemium' : integration.price.charAt(0).toUpperCase() + integration.price.slice(1)}
                        </Badge>
                        <div className="flex gap-2">
                          <Button>
                            Install Integration
                          </Button>
                          <Button variant="outline">
                            Learn More
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntegrationMarketplace;
