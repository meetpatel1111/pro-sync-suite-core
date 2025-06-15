
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ShoppingCart, 
  Star, 
  Download, 
  Search,
  Filter,
  DollarSign,
  Shield,
  ExternalLink,
  Heart,
  TrendingUp,
  Award,
  Users,
  Zap,
  BookOpen
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { integrationDatabaseService, IntegrationMarketplaceItem } from '@/services/integrationDatabaseService';

const IntegrationMarketplace: React.FC = () => {
  const { toast } = useToast();
  const [marketplaceItems, setMarketplaceItems] = useState<IntegrationMarketplaceItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<IntegrationMarketplaceItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'Communication', name: 'Communication' },
    { id: 'Project Management', name: 'Project Management' },
    { id: 'Analytics', name: 'Analytics' },
    { id: 'Automation', name: 'Automation' },
    { id: 'Security', name: 'Security' },
    { id: 'Productivity', name: 'Productivity' },
    { id: 'File Management', name: 'File Management' },
    { id: 'CRM', name: 'CRM' },
    { id: 'Marketing', name: 'Marketing' }
  ];

  // Extended marketplace items with more variety
  const extendedMarketplaceItems: IntegrationMarketplaceItem[] = [
    {
      id: '1',
      name: 'Slack Integration Pro',
      description: 'Advanced Slack integration with custom workflows, bot commands, and team analytics',
      provider: 'ProSync Team',
      category: 'Communication',
      price: 29.99,
      rating: 4.8,
      downloads: 1250,
      features: ['Custom Notifications', 'Workflow Automation', 'File Sharing', 'Team Analytics', 'Bot Commands'],
      screenshots: [],
      documentation_url: 'https://docs.prosync.com/slack-pro',
      is_verified: true
    },
    {
      id: '2',
      name: 'Jira Sync Master',
      description: 'Seamlessly sync tasks between ProSync and Jira with advanced mapping and real-time updates',
      provider: 'Community Developers',
      category: 'Project Management',
      price: 0,
      rating: 4.5,
      downloads: 890,
      features: ['Bi-directional Sync', 'Custom Field Mapping', 'Real-time Updates', 'Bulk Operations'],
      screenshots: [],
      documentation_url: 'https://docs.prosync.com/jira-sync',
      is_verified: false
    },
    {
      id: '3',
      name: 'Advanced Analytics Suite',
      description: 'Comprehensive analytics with custom dashboards, predictive insights, and automated reporting',
      provider: 'Analytics Corp',
      category: 'Analytics',
      price: 79.99,
      rating: 4.9,
      downloads: 520,
      features: ['Custom Dashboards', 'Predictive Analytics', 'Automated Reports', 'Data Export', 'API Access'],
      screenshots: [],
      documentation_url: 'https://docs.prosync.com/analytics-suite',
      is_verified: true
    },
    {
      id: '4',
      name: 'Microsoft Teams Connector',
      description: 'Connect ProSync with Microsoft Teams for seamless collaboration and file sharing',
      provider: 'Microsoft Partner',
      category: 'Communication',
      price: 19.99,
      rating: 4.6,
      downloads: 780,
      features: ['Team Notifications', 'File Sync', 'Calendar Integration', 'Meeting Links'],
      screenshots: [],
      documentation_url: 'https://docs.prosync.com/teams-connector',
      is_verified: true
    },
    {
      id: '5',
      name: 'Zapier Integration Hub',
      description: 'Connect ProSync with 3000+ apps through Zapier automation platform',
      provider: 'Zapier Inc.',
      category: 'Automation',
      price: 0,
      rating: 4.7,
      downloads: 1850,
      features: ['3000+ App Integrations', 'Custom Workflows', 'Multi-step Automation', 'Conditional Logic'],
      screenshots: [],
      documentation_url: 'https://docs.prosync.com/zapier-hub',
      is_verified: true
    },
    {
      id: '6',
      name: 'Security Audit Module',
      description: 'Comprehensive security auditing and compliance monitoring for enterprise users',
      provider: 'SecureSync Ltd',
      category: 'Security',
      price: 149.99,
      rating: 4.4,
      downloads: 180,
      features: ['Audit Trails', 'Compliance Reports', 'Access Monitoring', 'Security Alerts', '2FA Integration'],
      screenshots: [],
      documentation_url: 'https://docs.prosync.com/security-audit',
      is_verified: true
    },
    {
      id: '7',
      name: 'Google Workspace Sync',
      description: 'Seamless integration with Google Drive, Calendar, Gmail, and other Workspace apps',
      provider: 'Google Partner',
      category: 'Productivity',
      price: 24.99,
      rating: 4.8,
      downloads: 1120,
      features: ['Drive Sync', 'Calendar Integration', 'Gmail Notifications', 'Docs Collaboration'],
      screenshots: [],
      documentation_url: 'https://docs.prosync.com/google-workspace',
      is_verified: true
    },
    {
      id: '8',
      name: 'HubSpot CRM Integration',
      description: 'Connect your projects with HubSpot CRM for client management and sales tracking',
      provider: 'HubSpot Partner',
      category: 'CRM',
      price: 39.99,
      rating: 4.5,
      downloads: 340,
      features: ['Contact Sync', 'Deal Tracking', 'Email Templates', 'Sales Pipeline'],
      screenshots: [],
      documentation_url: 'https://docs.prosync.com/hubspot-crm',
      is_verified: true
    },
    {
      id: '9',
      name: 'Time Doctor Integration',
      description: 'Advanced time tracking with screenshots, website monitoring, and productivity insights',
      provider: 'Time Doctor',
      category: 'Productivity',
      price: 15.99,
      rating: 4.3,
      downloads: 650,
      features: ['Screenshot Monitoring', 'Website Tracking', 'Productivity Reports', 'Payroll Integration'],
      screenshots: [],
      documentation_url: 'https://docs.prosync.com/time-doctor',
      is_verified: false
    },
    {
      id: '10',
      name: 'Mailchimp Marketing Sync',
      description: 'Sync client data with Mailchimp for automated email marketing campaigns',
      provider: 'Mailchimp Partner',
      category: 'Marketing',
      price: 9.99,
      rating: 4.2,
      downloads: 890,
      features: ['Contact Sync', 'Campaign Automation', 'Analytics Integration', 'Template Sharing'],
      screenshots: [],
      documentation_url: 'https://docs.prosync.com/mailchimp-sync',
      is_verified: true
    }
  ];

  useEffect(() => {
    loadMarketplaceItems();
  }, []);

  useEffect(() => {
    filterItems();
  }, [marketplaceItems, searchTerm, selectedCategory, priceFilter]);

  const loadMarketplaceItems = async () => {
    try {
      setLoading(true);
      // In a real app, this would fetch from the database
      const items = await integrationDatabaseService.getMarketplaceItems();
      const allItems = [...extendedMarketplaceItems, ...items];
      setMarketplaceItems(allItems);
    } catch (error) {
      console.error('Error loading marketplace items:', error);
      setMarketplaceItems(extendedMarketplaceItems);
    } finally {
      setLoading(false);
    }
  };

  const filterItems = () => {
    let filtered = marketplaceItems;

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.provider.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    if (priceFilter !== 'all') {
      if (priceFilter === 'free') {
        filtered = filtered.filter(item => item.price === 0);
      } else if (priceFilter === 'paid') {
        filtered = filtered.filter(item => item.price > 0);
      }
    }

    setFilteredItems(filtered);
  };

  const installItem = (item: IntegrationMarketplaceItem) => {
    if (item.price > 0) {
      toast({
        title: 'Purchase Required',
        description: `This integration costs $${item.price}. Redirecting to payment...`,
      });
    } else {
      toast({
        title: 'Integration Installed',
        description: `${item.name} has been installed successfully`,
      });
    }
  };

  const getFeaturedItems = () => {
    return marketplaceItems
      .filter(item => item.is_verified && item.rating >= 4.5)
      .sort((a, b) => b.downloads - a.downloads)
      .slice(0, 3);
  };

  const getPopularItems = () => {
    return marketplaceItems
      .sort((a, b) => b.downloads - a.downloads)
      .slice(0, 6);
  };

  const getNewItems = () => {
    return marketplaceItems
      .slice(-6)
      .reverse();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Integration Marketplace</h2>
          <p className="text-muted-foreground">
            Discover and install powerful integrations to extend ProSync
          </p>
        </div>
        <Button>
          <ShoppingCart className="mr-2 h-4 w-4" />
          My Purchases
        </Button>
      </div>

      <Tabs defaultValue="featured" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="featured" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            Featured
          </TabsTrigger>
          <TabsTrigger value="popular" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Popular
          </TabsTrigger>
          <TabsTrigger value="new" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            New
          </TabsTrigger>
          <TabsTrigger value="browse" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Browse All
          </TabsTrigger>
        </TabsList>

        <TabsContent value="featured" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {getFeaturedItems().map((item) => (
              <Card key={item.id} className="hover:shadow-lg transition-shadow border-2 border-primary/20">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="default" className="bg-primary">
                      <Award className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                    {item.is_verified && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        <Shield className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg">{item.name}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">by {item.provider}</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm">{item.rating}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {item.features.slice(0, 3).map((feature) => (
                      <Badge key={feature} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Download className="h-3 w-3" />
                        <span className="text-sm">{item.downloads}</span>
                      </div>
                      <div className="text-lg font-bold">
                        {item.price === 0 ? 'Free' : `$${item.price}`}
                      </div>
                    </div>
                  </div>

                  <Button className="w-full" onClick={() => installItem(item)}>
                    {item.price === 0 ? 'Install Free' : `Buy for $${item.price}`}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="popular" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getPopularItems().map((item) => (
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{item.category}</Badge>
                    {item.is_verified && (
                      <Shield className="h-4 w-4 text-blue-500" />
                    )}
                  </div>
                  <CardTitle className="text-lg">{item.name}</CardTitle>
                  <CardDescription className="line-clamp-2">{item.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">by {item.provider}</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span>{item.rating}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Download className="h-3 w-3" />
                      <span className="text-sm">{item.downloads}</span>
                    </div>
                    <div className="text-lg font-bold">
                      {item.price === 0 ? 'Free' : `$${item.price}`}
                    </div>
                  </div>

                  <Button className="w-full" onClick={() => installItem(item)}>
                    {item.price === 0 ? 'Install' : 'Buy Now'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="new" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getNewItems().map((item) => (
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="default" className="bg-green-500">
                      New
                    </Badge>
                    <Badge variant="outline">{item.category}</Badge>
                  </div>
                  <CardTitle className="text-lg">{item.name}</CardTitle>
                  <CardDescription className="line-clamp-2">{item.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">by {item.provider}</span>
                    <div className="text-lg font-bold">
                      {item.price === 0 ? 'Free' : `$${item.price}`}
                    </div>
                  </div>

                  <Button className="w-full" onClick={() => installItem(item)}>
                    {item.price === 0 ? 'Install' : 'Buy Now'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="browse" className="space-y-6">
          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search integrations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-input rounded-md bg-background"
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <select
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value)}
              className="px-3 py-2 border border-input rounded-md bg-background"
            >
              <option value="all">All Prices</option>
              <option value="free">Free Only</option>
              <option value="paid">Paid Only</option>
            </select>
          </div>

          {/* Results */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{item.category}</Badge>
                    {item.is_verified && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        <Shield className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg">{item.name}</CardTitle>
                  <CardDescription className="line-clamp-2">{item.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">by {item.provider}</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span>{item.rating}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {item.features.slice(0, 2).map((feature) => (
                      <Badge key={feature} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Download className="h-3 w-3" />
                      <span className="text-sm">{item.downloads}</span>
                    </div>
                    <div className="text-lg font-bold">
                      {item.price === 0 ? 'Free' : `$${item.price}`}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button className="flex-1" onClick={() => installItem(item)}>
                      {item.price === 0 ? 'Install' : 'Buy Now'}
                    </Button>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-16">
              <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Integrations Found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search criteria or browse our featured integrations
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IntegrationMarketplace;
