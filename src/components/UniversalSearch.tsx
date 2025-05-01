
import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, Clock, Star, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator
} from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuthContext } from '@/context/AuthContext';

interface SearchResult {
  id: string;
  title: string;
  description?: string;
  type: 'task' | 'file' | 'project' | 'client' | 'message' | 'risk' | 'time-entry';
  url: string;
  icon?: React.ReactNode;
}

interface RecentSearch {
  id: string;
  query: string;
  timestamp: number;
}

const SEARCH_TYPES = [
  { type: 'task', label: 'Tasks' },
  { type: 'file', label: 'Files' },
  { type: 'project', label: 'Projects' },
  { type: 'client', label: 'Clients' },
  { type: 'message', label: 'Messages' },
  { type: 'risk', label: 'Risks' },
  { type: 'time-entry', label: 'Time Entries' }
];

const UniversalSearch = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [savedSearches, setSavedSearches] = useState<RecentSearch[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const inputRef = useRef<HTMLInputElement>(null);
  const commandRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load recent searches from localStorage
    const loadRecentSearches = () => {
      const saved = localStorage.getItem('recentSearches');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setRecentSearches(parsed.slice(0, 5)); // Keep only the 5 most recent
        } catch (error) {
          console.error('Error parsing recent searches:', error);
        }
      }
    };

    // Load saved searches from localStorage
    const loadSavedSearches = () => {
      const saved = localStorage.getItem('savedSearches');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setSavedSearches(parsed);
        } catch (error) {
          console.error('Error parsing saved searches:', error);
        }
      }
    };

    loadRecentSearches();
    loadSavedSearches();

    const down = (e: KeyboardEvent) => {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || e.key === '/') {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // Save recent searches to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
  }, [recentSearches]);

  // Save saved searches to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('savedSearches', JSON.stringify(savedSearches));
  }, [savedSearches]);

  // Search function
  const performSearch = async () => {
    if (!query || !user) return;

    setSearching(true);

    try {
      // Add the current search to recent searches
      const newSearch = { id: Date.now().toString(), query, timestamp: Date.now() };
      const updatedRecentSearches = [newSearch, ...recentSearches.filter(s => s.query !== query).slice(0, 4)];
      setRecentSearches(updatedRecentSearches);

      const searchResults: SearchResult[] = [];

      // Filter types or search all if none selected
      const typesToSearch = selectedTypes.length > 0 ? selectedTypes : SEARCH_TYPES.map(t => t.type);

      // Search tasks
      if (typesToSearch.includes('task')) {
        const { data: tasks, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', user.id)
          .ilike('title', `%${query}%`)
          .order('created_at', { ascending: false })
          .limit(5);

        if (error) {
          console.error('Error searching tasks:', error);
        } else if (tasks) {
          searchResults.push(...tasks.map(task => ({
            id: task.id,
            title: task.title,
            description: task.description || `${task.status} - ${task.priority}`,
            type: 'task' as const,
            url: `/taskmaster?task=${task.id}`,
            icon: <div className="text-blue-600 bg-blue-100 p-1 rounded-md">T</div>
          })));
        }
      }

      // Search projects
      if (typesToSearch.includes('project')) {
        const { data: projects, error } = await supabase
          .from('projects')
          .select('*')
          .eq('user_id', user.id)
          .ilike('name', `%${query}%`)
          .order('created_at', { ascending: false })
          .limit(5);

        if (error) {
          console.error('Error searching projects:', error);
        } else if (projects) {
          searchResults.push(...projects.map(project => ({
            id: project.id,
            title: project.name,
            description: project.description || 'Project',
            type: 'project' as const,
            url: `/planboard?project=${project.id}`,
            icon: <div className="text-amber-600 bg-amber-100 p-1 rounded-md">P</div>
          })));
        }
      }

      // Search files
      if (typesToSearch.includes('file')) {
        const { data: files, error } = await supabase
          .from('files')
          .select('*')
          .eq('user_id', user.id)
          .ilike('name', `%${query}%`)
          .order('created_at', { ascending: false })
          .limit(5);

        if (error) {
          console.error('Error searching files:', error);
        } else if (files) {
          searchResults.push(...files.map(file => ({
            id: file.id,
            title: file.name,
            description: file.description || `File - ${file.file_type}`,
            type: 'file' as const,
            url: `/filevault?file=${file.id}`,
            icon: <div className="text-purple-600 bg-purple-100 p-1 rounded-md">F</div>
          })));
        }
      }

      // Search clients
      if (typesToSearch.includes('client')) {
        const { data: clients, error } = await supabase
          .from('clients')
          .select('*')
          .eq('user_id', user.id)
          .ilike('name', `%${query}%`)
          .order('created_at', { ascending: false })
          .limit(5);

        if (error) {
          console.error('Error searching clients:', error);
        } else if (clients) {
          searchResults.push(...clients.map(client => ({
            id: client.id,
            title: client.name,
            description: client.company || client.email || 'Client',
            type: 'client' as const,
            url: `/clientconnect?client=${client.id}`,
            icon: <div className="text-sky-600 bg-sky-100 p-1 rounded-md">C</div>
          })));
        }
      }

      // Add similar searches for other types...

      setResults(searchResults);
    } catch (error) {
      console.error('Error performing search:', error);
      toast({
        title: 'Search Error',
        description: 'An error occurred while searching. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSearching(false);
    }
  };

  // Run search when query changes
  useEffect(() => {
    const debounce = setTimeout(() => {
      if (query.trim().length >= 2) {
        performSearch();
      }
    }, 300);
    
    return () => clearTimeout(debounce);
  }, [query, selectedTypes]);

  const handleItemClick = (result: SearchResult) => {
    setOpen(false);
    navigate(result.url);
  };

  const toggleSavedSearch = (search: RecentSearch) => {
    const exists = savedSearches.some(s => s.query === search.query);
    if (exists) {
      setSavedSearches(savedSearches.filter(s => s.query !== search.query));
      toast({
        title: 'Search removed',
        description: `"${search.query}" has been removed from your saved searches`,
      });
    } else {
      setSavedSearches([...savedSearches, search]);
      toast({
        title: 'Search saved',
        description: `"${search.query}" has been added to your saved searches`,
      });
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
    toast({
      title: 'Recent searches cleared',
      description: 'Your recent search history has been cleared',
    });
  };

  const toggleType = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  return (
    <>
      <div className="relative w-full md:w-80 lg:w-96" onClick={() => setOpen(true)}>
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="search" 
          placeholder="Search ProSync... (Press / or Ctrl+K)"
          className="w-full pl-8 pr-10 bg-background"
          readOnly
        />
        <kbd className="absolute top-2 right-2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          ⌘K
        </kbd>
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <div ref={commandRef} className="universal-search">
          <CommandInput 
            placeholder="Search across all apps..." 
            value={query}
            onValueChange={setQuery}
          />
          
          {/* Filter chips */}
          <div className="flex flex-wrap gap-2 px-3 py-2 border-b">
            {SEARCH_TYPES.map((searchType) => (
              <Badge
                key={searchType.type}
                variant={selectedTypes.includes(searchType.type) ? "default" : "outline"}
                className={`cursor-pointer ${selectedTypes.includes(searchType.type) ? '' : 'text-muted-foreground'}`}
                onClick={() => toggleType(searchType.type)}
              >
                {searchType.label}
              </Badge>
            ))}
            {selectedTypes.length > 0 && (
              <Badge
                variant="outline"
                className="cursor-pointer text-muted-foreground"
                onClick={() => setSelectedTypes([])}
              >
                Clear filters
              </Badge>
            )}
          </div>

          <CommandList>
            {searching && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            )}

            {!searching && query.length < 2 && (
              <>
                {recentSearches.length > 0 && (
                  <CommandGroup heading="Recent Searches">
                    <div className="flex justify-between items-center px-2 -mt-2">
                      <span></span>
                      <Button
                        variant="ghost" 
                        size="sm" 
                        onClick={clearRecentSearches}
                        className="text-xs text-muted-foreground"
                      >
                        Clear
                      </Button>
                    </div>

                    {recentSearches.map((search) => (
                      <CommandItem
                        key={search.id}
                        onSelect={() => {
                          setQuery(search.query);
                        }}
                        className="flex justify-between"
                      >
                        <div className="flex items-center">
                          <Clock className="mr-2 h-4 w-4" />
                          <span>{search.query}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSavedSearch(search);
                          }}
                        >
                          <Star
                            className={`h-4 w-4 ${
                              savedSearches.some(s => s.query === search.query)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-muted-foreground'
                            }`}
                          />
                        </Button>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

                {savedSearches.length > 0 && (
                  <CommandGroup heading="Saved Searches">
                    {savedSearches.map((search) => (
                      <CommandItem
                        key={search.id}
                        onSelect={() => {
                          setQuery(search.query);
                        }}
                        className="flex justify-between"
                      >
                        <div className="flex items-center">
                          <Star className="mr-2 h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>{search.query}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSavedSearch(search);
                          }}
                        >
                          <X className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </>
            )}

            {!searching && results.length === 0 && query.length >= 2 && (
              <CommandEmpty>No results found for "{query}"</CommandEmpty>
            )}

            {results.length > 0 && (
              <>
                <CommandGroup heading="Search Results">
                  {results.map((result) => (
                    <CommandItem
                      key={`${result.type}-${result.id}`}
                      onSelect={() => handleItemClick(result)}
                    >
                      <div className="flex items-center">
                        {result.icon || <div className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded-md mr-2">{result.type[0].toUpperCase()}</div>}
                        <div className="ml-2">
                          <div className="font-medium">{result.title}</div>
                          <div className="text-xs text-muted-foreground">{result.description}</div>
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>

                <CommandSeparator />

                <CommandGroup>
                  <CommandItem onSelect={() => navigate(`/search?q=${encodeURIComponent(query)}`)}>
                    <Search className="mr-2 h-4 w-4" />
                    <span>See all results for "{query}"</span>
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>

          <div className="px-3 py-2 text-xs text-muted-foreground border-t">
            <div className="flex justify-between">
              <div>
                <span>Press </span>
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                  Enter
                </kbd>
                <span> to select</span>
              </div>
              <div>
                <span>Press </span>
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                  Esc
                </kbd>
                <span> to close</span>
              </div>
            </div>
          </div>
        </div>
      </CommandDialog>
    </>
  );
};

export default UniversalSearch;
