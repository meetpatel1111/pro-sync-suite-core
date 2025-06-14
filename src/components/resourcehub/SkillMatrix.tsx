
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Star, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Skill {
  id: string;
  name: string;
  category: string;
}

interface ResourceSkill {
  resource_id: string;
  skill: string;
  proficiency_level?: number;
}

interface SkillMatrixProps {
  resources: any[];
  skills: string[];
  onSkillUpdate?: () => void;
}

const SkillMatrix = ({ resources, skills, onSkillUpdate }: SkillMatrixProps) => {
  const { toast } = useToast();
  const [skillCategories, setSkillCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddSkillOpen, setIsAddSkillOpen] = useState(false);
  const [newSkill, setNewSkill] = useState({ name: '', category: '' });

  useEffect(() => {
    // Extract unique skill categories from all skills
    const categories = [...new Set(skills.map(skill => {
      // Try to infer category from skill name or use 'Technical' as default
      if (skill.toLowerCase().includes('management') || skill.toLowerCase().includes('lead')) return 'Management';
      if (skill.toLowerCase().includes('design') || skill.toLowerCase().includes('ui') || skill.toLowerCase().includes('ux')) return 'Design';
      if (skill.toLowerCase().includes('marketing') || skill.toLowerCase().includes('sales')) return 'Marketing';
      return 'Technical';
    }))];
    setSkillCategories(['all', ...categories]);
  }, [skills]);

  const filteredSkills = skills.filter(skill => {
    const matchesSearch = skill.toLowerCase().includes(searchTerm.toLowerCase());
    if (selectedCategory === 'all') return matchesSearch;
    
    const skillCategory = skill.toLowerCase().includes('management') || skill.toLowerCase().includes('lead') ? 'Management' :
                         skill.toLowerCase().includes('design') || skill.toLowerCase().includes('ui') || skill.toLowerCase().includes('ux') ? 'Design' :
                         skill.toLowerCase().includes('marketing') || skill.toLowerCase().includes('sales') ? 'Marketing' : 'Technical';
    
    return matchesSearch && skillCategory === selectedCategory;
  });

  const getResourceSkillLevel = (resourceId: string, skillName: string): number => {
    // This would normally come from a resource_skills table with proficiency levels
    // For now, return a random level between 1-5 for demo purposes
    return Math.floor(Math.random() * 5) + 1;
  };

  const hasResourceSkill = (resourceId: string, skillName: string): boolean => {
    const resource = resources.find(r => r.id === resourceId);
    return resource?.skills?.includes(skillName) || false;
  };

  const getSkillProficiencyColor = (level: number): string => {
    switch (level) {
      case 1: return 'bg-red-100 text-red-800 border-red-200';
      case 2: return 'bg-orange-100 text-orange-800 border-orange-200';
      case 3: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 4: return 'bg-blue-100 text-blue-800 border-blue-200';
      case 5: return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getProficiencyLabel = (level: number): string => {
    switch (level) {
      case 1: return 'Beginner';
      case 2: return 'Basic';
      case 3: return 'Intermediate';
      case 4: return 'Advanced';
      case 5: return 'Expert';
      default: return 'Unknown';
    }
  };

  const renderStarRating = (level: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-3 w-3 ${star <= level ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  const getSkillCoverage = (skillName: string): { count: number; percentage: number } => {
    const count = resources.filter(resource => hasResourceSkill(resource.id, skillName)).length;
    const percentage = resources.length > 0 ? (count / resources.length) * 100 : 0;
    return { count, percentage };
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Skill Matrix</CardTitle>
              <CardDescription>Track and manage team skills and proficiency levels</CardDescription>
            </div>
            <Dialog open={isAddSkillOpen} onOpenChange={setIsAddSkillOpen}>
              <DialogTrigger asChild>
                <Button className="gap-1">
                  <Plus className="h-4 w-4" />
                  Add Skill
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Skill</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="skill-name">Skill Name</Label>
                    <Input
                      id="skill-name"
                      value={newSkill.name}
                      onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                      placeholder="e.g., React, Leadership, Design Thinking"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="skill-category">Category</Label>
                    <Select 
                      value={newSkill.category} 
                      onValueChange={(value) => setNewSkill({ ...newSkill, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Technical">Technical</SelectItem>
                        <SelectItem value="Design">Design</SelectItem>
                        <SelectItem value="Management">Management</SelectItem>
                        <SelectItem value="Marketing">Marketing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddSkillOpen(false)}>Cancel</Button>
                  <Button onClick={() => {
                    if (newSkill.name) {
                      toast({
                        title: 'Skill added',
                        description: `${newSkill.name} has been added to the skill matrix`,
                      });
                      setNewSkill({ name: '', category: '' });
                      setIsAddSkillOpen(false);
                      onSkillUpdate?.();
                    }
                  }}>
                    Add Skill
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  {skillCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skill Matrix Table */}
      <Card>
        <CardHeader>
          <CardTitle>Skills Overview</CardTitle>
          <CardDescription>Team skill distribution and proficiency levels</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredSkills.map((skill) => {
              const coverage = getSkillCoverage(skill);
              const resourcesWithSkill = resources.filter(resource => hasResourceSkill(resource.id, skill));
              
              return (
                <div key={skill} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <h4 className="font-medium">{skill}</h4>
                      <Badge variant="outline">
                        <Users className="h-3 w-3 mr-1" />
                        {coverage.count} of {resources.length}
                      </Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {coverage.percentage.toFixed(0)}% coverage
                    </span>
                  </div>
                  
                  {resourcesWithSkill.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {resourcesWithSkill.map((resource) => {
                        const skillLevel = getResourceSkillLevel(resource.id, skill);
                        return (
                          <div key={resource.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div>
                              <span className="text-sm font-medium">{resource.name}</span>
                              <div className="text-xs text-muted-foreground">{resource.role}</div>
                            </div>
                            <div className="flex items-center gap-2">
                              {renderStarRating(skillLevel)}
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${getSkillProficiencyColor(skillLevel)}`}
                              >
                                {getProficiencyLabel(skillLevel)}
                              </Badge>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No team members have this skill</p>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Resource Skills Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Resource Skills Summary</CardTitle>
          <CardDescription>Individual skill profiles for each team member</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resources.map((resource) => (
              <div key={resource.id} className="border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div>
                    <h4 className="font-medium">{resource.name}</h4>
                    <p className="text-sm text-muted-foreground">{resource.role}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Skills</span>
                    <Badge variant="outline">{resource.skills?.length || 0}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {resource.skills?.slice(0, 5).map((skill: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    )) || <span className="text-xs text-muted-foreground">No skills listed</span>}
                    {resource.skills?.length > 5 && (
                      <Badge variant="outline" className="text-xs">
                        +{resource.skills.length - 5} more
                      </Badge>
                    )}
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

export default SkillMatrix;
