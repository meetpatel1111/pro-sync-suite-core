
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Star, Edit, Trash2, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { safeQueryTable } from '@/utils/db-helpers';

interface Skill {
  id: string;
  name: string;
  category: string;
  proficiency_level?: number;
  resource_count?: number;
}

interface SkillManagementProps {
  resources: any[];
  onSkillUpdate?: () => void;
}

const SkillManagement = ({ resources, onSkillUpdate }: SkillManagementProps) => {
  const { toast } = useToast();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isAddSkillOpen, setIsAddSkillOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [newSkill, setNewSkill] = useState({ name: '', category: 'Technical' });
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
  }, []);

  useEffect(() => {
    if (session) {
      fetchSkills();
    }
  }, [session, resources]);

  const fetchSkills = async () => {
    try {
      const { data: skillsData, error } = await safeQueryTable(
        'resource_skills',
        (query) => query.select('skill').eq('user_id', session.user.id)
      );

      if (error) throw error;

      if (skillsData) {
        const uniqueSkills = [...new Set(skillsData.map(s => s.skill))];
        const skillsWithCounts = uniqueSkills.map(skillName => {
          const resourceCount = resources.filter(r => r.skills?.includes(skillName)).length;
          return {
            id: skillName,
            name: skillName,
            category: inferCategory(skillName),
            resource_count: resourceCount
          };
        });
        setSkills(skillsWithCounts);
      }
    } catch (error) {
      console.error('Error fetching skills:', error);
    }
  };

  const inferCategory = (skillName: string): string => {
    const name = skillName.toLowerCase();
    if (name.includes('management') || name.includes('lead')) return 'Management';
    if (name.includes('design') || name.includes('ui') || name.includes('ux')) return 'Design';
    if (name.includes('marketing') || name.includes('sales')) return 'Marketing';
    if (name.includes('data') || name.includes('analytics')) return 'Analytics';
    return 'Technical';
  };

  const handleAddSkill = async () => {
    if (!newSkill.name.trim()) {
      toast({
        title: 'Missing information',
        description: 'Please enter a skill name',
        variant: 'destructive'
      });
      return;
    }

    const skillExists = skills.some(s => s.name.toLowerCase() === newSkill.name.toLowerCase());
    if (skillExists) {
      toast({
        title: 'Skill exists',
        description: 'This skill already exists in the system',
        variant: 'destructive'
      });
      return;
    }

    const newSkillObj: Skill = {
      id: newSkill.name,
      name: newSkill.name,
      category: newSkill.category,
      resource_count: 0
    };

    setSkills(prev => [...prev, newSkillObj]);
    setNewSkill({ name: '', category: 'Technical' });
    setIsAddSkillOpen(false);

    toast({
      title: 'Skill added',
      description: `${newSkill.name} has been added to the skill library`,
    });

    onSkillUpdate?.();
  };

  const handleDeleteSkill = async (skillToDelete: Skill) => {
    if (skillToDelete.resource_count && skillToDelete.resource_count > 0) {
      toast({
        title: 'Cannot delete skill',
        description: 'This skill is assigned to resources. Remove it from all resources first.',
        variant: 'destructive'
      });
      return;
    }

    setSkills(prev => prev.filter(s => s.id !== skillToDelete.id));
    
    toast({
      title: 'Skill deleted',
      description: `${skillToDelete.name} has been removed from the skill library`,
    });

    onSkillUpdate?.();
  };

  const getSkillsByCategory = () => {
    const categories = ['Technical', 'Design', 'Management', 'Marketing', 'Analytics'];
    return categories.map(category => ({
      category,
      skills: skills.filter(skill => skill.category === category)
    })).filter(group => group.skills.length > 0);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Skill Management</CardTitle>
              <CardDescription>Manage skills and proficiency levels across your team</CardDescription>
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
                      placeholder="e.g., React, Leadership, Data Analysis"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="skill-category">Category</Label>
                    <Select 
                      value={newSkill.category} 
                      onValueChange={(value) => setNewSkill({ ...newSkill, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Technical">Technical</SelectItem>
                        <SelectItem value="Design">Design</SelectItem>
                        <SelectItem value="Management">Management</SelectItem>
                        <SelectItem value="Marketing">Marketing</SelectItem>
                        <SelectItem value="Analytics">Analytics</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddSkillOpen(false)}>Cancel</Button>
                  <Button onClick={handleAddSkill}>Add Skill</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-700">{skills.length}</div>
                <div className="text-sm text-blue-600">Total Skills</div>
              </div>
            </Card>
            <Card className="p-4 bg-gradient-to-r from-green-50 to-green-100 border-green-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-700">
                  {skills.filter(s => (s.resource_count || 0) > 0).length}
                </div>
                <div className="text-sm text-green-600">Skills in Use</div>
              </div>
            </Card>
            <Card className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-700">
                  {getSkillsByCategory().length}
                </div>
                <div className="text-sm text-purple-600">Categories</div>
              </div>
            </Card>
          </div>
        </CardContent>
      </Card>

      {getSkillsByCategory().map(({ category, skills: categorySkills }) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="text-lg">{category} Skills</CardTitle>
            <CardDescription>{categorySkills.length} skills in this category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {categorySkills.map((skill) => (
                <div key={skill.id} className="flex items-center justify-between p-3 border rounded-lg bg-card">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{skill.name}</Badge>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="h-3 w-3" />
                      {skill.resource_count || 0}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteSkill(skill)}
                    disabled={(skill.resource_count || 0) > 0}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {skills.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">No skills found. Add skills to start building your skill library.</p>
          <Button onClick={() => setIsAddSkillOpen(true)} className="gap-1">
            <Plus className="h-4 w-4" />
            Add First Skill
          </Button>
        </Card>
      )}
    </div>
  );
};

export default SkillManagement;
