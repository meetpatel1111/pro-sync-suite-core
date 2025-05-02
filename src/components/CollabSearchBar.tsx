
import React, { useState } from 'react';
import collabService from '@/services/collabService';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

interface CollabSearchBarProps {
  onResults: (results: any[]) => void;
  filters?: { channel_id?: string; user_id?: string; from_date?: string; to_date?: string };
}

export const CollabSearchBar: React.FC<CollabSearchBarProps> = ({ onResults, filters }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Fix the function call to match the signature in collabService
      const res = await collabService.searchMessages(query, filters);
      if (res.error) setError(typeof res.error === 'string' ? res.error : 'Search failed');
      else onResults(res.data || []);
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8 }}>
      <Input
        type="text"
        placeholder="Search messages, files, tasks..."
        value={query}
        onChange={e => setQuery(e.target.value)}
        disabled={loading}
        style={{ flex: 1 }}
      />
      <Button type="submit" disabled={loading || !query}>
        {loading ? 'Searching...' : 'Search'}
      </Button>
      {error && <span style={{ color: 'red' }}>{error}</span>}
    </form>
  );
};
