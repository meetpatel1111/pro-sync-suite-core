import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronDown,
  Copy,
  Edit,
  MoreHorizontal,
  Plus,
  Search,
  Trash,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { dbService } from "@/services/dbService";

interface Risk {
  id: string;
  name: string;
  description: string;
  category: string;
  probability: number;
  impact: number;
  owner: {
    name: string;
    avatar: string;
    initials: string;
  };
  status: string;
  lastReview: string;
  nextReview: string;
}

const RiskTable = () => {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [risks, setRisks] = useState<Risk[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch risks data
  const fetchRisks = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const { data } = await dbService.getRisks(user.id);
      // Map the data to match the expected Risk interface
      if (data) {
        const formattedRisks = data.map((risk: any) => ({
          id: risk.id,
          name: risk.title || 'Untitled Risk',
          description: risk.description || '',
          category: risk.category || 'General',
          probability: risk.probability || 0.5,
          impact: risk.impact || 0.5, 
          owner: {
            name: 'Unassigned',
            avatar: '',
            initials: 'UN'
          },
          status: risk.status || 'Open',
          lastReview: risk.last_review || new Date().toISOString(),
          nextReview: risk.next_review || new Date().toISOString()
        }));
        
        setRisks(formattedRisks);
      }
    } catch (error) {
      console.error("Error fetching risks:", error);
      toast({
        title: "Error",
        description: "Failed to load risks data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRisks();
  }, [user]);

  const categories = ["All", "Category 1", "Category 2", "Category 3"];
  const statuses = ["All", "Open", "In Progress", "Closed"];

  const filteredRisks = risks.filter((risk) => {
    const searchMatch = risk.name.toLowerCase().includes(search.toLowerCase());
    const categoryMatch =
      categoryFilter === "All" || risk.category === categoryFilter;
    const statusMatch = statusFilter === "All" || risk.status === statusFilter;
    return searchMatch && categoryMatch && statusMatch;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="relative w-80 mr-4">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search risks..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Category <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {categories.map((category) => (
                <DropdownMenuItem
                  key={category}
                  onClick={() => setCategoryFilter(category)}
                >
                  {category}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu className="ml-2">
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Status <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {statuses.map((status) => (
                <DropdownMenuItem
                  key={status}
                  onClick={() => setStatusFilter(status)}
                >
                  {status}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" /> Add Risk
        </Button>
      </div>
      <ScrollArea>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Probability</TableHead>
              <TableHead>Impact</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Review</TableHead>
              <TableHead>Next Review</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRisks.map((risk) => (
              <TableRow key={risk.id}>
                <TableCell className="font-medium">{risk.name}</TableCell>
                <TableCell>{risk.category}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{risk.probability}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{risk.impact}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarImage src={risk.owner.avatar} />
                      <AvatarFallback>{risk.owner.initials}</AvatarFallback>
                    </Avatar>
                    {risk.owner.name}
                  </div>
                </TableCell>
                <TableCell>{risk.status}</TableCell>
                <TableCell>{risk.lastReview}</TableCell>
                <TableCell>{risk.nextReview}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Copy className="h-4 w-4 mr-2" /> Copy
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Trash className="h-4 w-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
};

export default RiskTable;
