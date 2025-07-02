
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ColorfulButton } from '@/components/ui/colorful-button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Filter,
  Edit,
  Eye,
  Share,
  Star,
  Clock,
  User,
  Tags,
  FileText,
  Lightbulb,
  TrendingUp
} from 'lucide-react';

const KnowledgeNestEnhanced = () => {
  const [newArticle, setNewArticle] = useState({
    title: '',
    content: '',
    tags: ''
  });

  const articles = [
    {
      id: 1,
      title: 'Getting Started with ProSync Suite',
      preview: 'Complete guide to setting up and using ProSync Suite for maximum productivity...',
      author: 'Sarah Johnson',
      created: '2024-07-01',
      updated: '2024-07-02',
      views: 245,
      likes: 18,
      tags: ['getting-started', 'tutorial', 'basics'],
      category: 'User Guide'
    },
    {
      id: 2,
      title: 'Best Practices for Task Management',
      preview: 'Learn the most effective ways to organize and manage your tasks using TaskMaster...',
      author: 'Mike Davis',
      created: '2024-06-28',
      updated: '2024-07-01',
      views: 189,
      likes: 23,
      tags: ['taskmaster', 'productivity', 'best-practices'],
      category: 'Best Practices'
    },
    {
      id: 3,
      title: 'Troubleshooting Common Issues',
      preview: 'Solutions to frequently encountered problems and their step-by-step resolutions...',
      author: 'Lisa Chen',
      created: '2024-06-25',
      updated: '2024-06-30',
      views: 156,
      likes: 31,
      tags: ['troubleshooting', 'support', 'faq'],
      category: 'Support'
    },
    {
      id: 4,
      title: 'Advanced Integration Techniques',
      preview: 'Deep dive into advanced integration patterns and automation workflows...',
      author: 'John Smith',
      created: '2024-06-20',
      updated: '2024-06-28',
      views: 98,
      likes: 15,
      tags: ['integration', 'automation', 'advanced'],
      category: 'Advanced'
    }
  ];

  const categories = [
    { name: 'User Guide', count: 12, color: 'from-blue-500 to-cyan-500' },
    { name: 'Best Practices', count: 8, color: 'from-green-500 to-teal-500' },
    { name: 'Support', count: 15, color: 'from-orange-500 to-red-500' },
    { name: 'Advanced', count: 6, color: 'from-purple-500 to-pink-500' }
  ];

  const handleCreateArticle = () => {
    console.log('Creating article:', newArticle);
    setNewArticle({ title: '', content: '', tags: '' });
  };

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { title: 'Total Articles', value: '156', icon: BookOpen, color: 'from-green-500 to-teal-600', bg: 'from-green-50 to-teal-50' },
          { title: 'Total Views', value: '12.4k', icon: Eye, color: 'from-blue-500 to-purple-600', bg: 'from-blue-50 to-purple-50' },
          { title: 'Contributors', value: '28', icon: User, color: 'from-orange-500 to-red-600', bg: 'from-orange-50 to-red-50' },
          { title: 'Avg Rating', value: '4.8', icon: Star, color: 'from-yellow-500 to-amber-600', bg: 'from-yellow-50 to-amber-50' }
        ].map((stat, index) => (
          <Card key={index} className={`overflow-hidden border-0 shadow-xl bg-gradient-to-br ${stat.bg} hover:shadow-2xl transition-all duration-300 hover:-translate-y-1`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} shadow-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <TrendingUp className="h-4 w-4 text-green-500 animate-pulse" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.title}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Categories */}
      <Card className="border-0 shadow-2xl bg-gradient-to-br from-white via-white/95 to-white/90 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-green-100/80 via-teal-100/80 to-cyan-100/80 rounded-t-2xl">
          <CardTitle className="text-2xl bg-gradient-to-r from-green-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent flex items-center gap-2">
            <Tags className="h-6 w-6 text-green-600" />
            Knowledge Categories
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <div 
                key={category.name}
                className="p-6 rounded-2xl border-2 border-gradient-to-r from-green-200/50 via-teal-200/50 to-cyan-200/50 bg-gradient-to-br from-white via-white/95 to-white/90 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              >
                <div className="text-center">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${category.color} flex items-center justify-center shadow-lg`}>
                    <Lightbulb className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{category.name}</h3>
                  <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent mb-1">
                    {category.count}
                  </p>
                  <p className="text-sm text-gray-600">Articles</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Create New Article */}
      <Card className="border-0 shadow-2xl bg-gradient-to-br from-white via-white/95 to-white/90 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-green-100/80 via-teal-100/80 to-cyan-100/80 rounded-t-2xl">
          <CardTitle className="text-2xl bg-gradient-to-r from-green-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent flex items-center gap-2">
            <Plus className="h-6 w-6 text-green-600" />
            Create New Article
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Article Title</label>
                <Input
                  placeholder="Enter article title"
                  value={newArticle.title}
                  onChange={(e) => setNewArticle({...newArticle, title: e.target.value})}
                  className="border-2 border-green-200 focus:border-green-400 rounded-xl"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Tags</label>
                <Input
                  placeholder="Enter tags separated by commas"
                  value={newArticle.tags}
                  onChange={(e) => setNewArticle({...newArticle, tags: e.target.value})}
                  className="border-2 border-green-200 focus:border-green-400 rounded-xl"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Content</label>
              <Textarea
                placeholder="Write your article content here..."
                value={newArticle.content}
                onChange={(e) => setNewArticle({...newArticle, content: e.target.value})}
                className="border-2 border-green-200 focus:border-green-400 rounded-xl h-40"
              />
            </div>
            <div className="flex justify-end">
              <ColorfulButton variant="secondary" onClick={handleCreateArticle} size="lg">
                <Plus className="h-5 w-5 mr-2" />
                Publish Article
              </ColorfulButton>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Articles List */}
      <Card className="border-0 shadow-2xl bg-gradient-to-br from-white via-white/95 to-white/90 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-green-100/80 via-teal-100/80 to-cyan-100/80 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl bg-gradient-to-r from-green-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent flex items-center gap-2">
              <FileText className="h-6 w-6 text-green-600" />
              Recent Articles
              <Badge className="ml-4 bg-gradient-to-r from-green-500 to-teal-500 text-white">
                {articles.length} Articles
              </Badge>
            </CardTitle>
            <div className="flex gap-2">
              <ColorfulButton variant="outline" size="sm">
                <Search className="h-4 w-4 mr-2" />
                Search
              </ColorfulButton>
              <ColorfulButton variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </ColorfulButton>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {articles.map((article, index) => (
              <div 
                key={article.id}
                className="p-6 rounded-2xl border-2 border-gradient-to-r from-green-200/50 via-teal-200/50 to-cyan-200/50 bg-gradient-to-br from-white via-white/95 to-white/90 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Badge className="bg-gradient-to-r from-green-100 to-teal-100 text-green-800 border-green-300 mb-2">
                        {article.category}
                      </Badge>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{article.title}</h3>
                      <p className="text-gray-600 text-sm line-clamp-2">{article.preview}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((tag, tagIndex) => (
                      <Badge key={tagIndex} variant="outline" className="text-xs bg-gradient-to-r from-gray-50 to-slate-50">
                        #{tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {article.author}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {article.updated}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {article.views}
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4" />
                        {article.likes}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex gap-2">
                      <ColorfulButton variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Read
                      </ColorfulButton>
                      <ColorfulButton variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </ColorfulButton>
                    </div>
                    <ColorfulButton variant="secondary" size="sm">
                      <Share className="h-4 w-4 mr-1" />
                      Share
                    </ColorfulButton>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default KnowledgeNestEnhanced;
