
import React, { useState } from 'react';
import collabService from '@/services/collabService';

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
      const res = await collabService.searchMessages(query, filters || {});
      if (res.error) setError(res.error.message);
      else onResults(res.data || []);
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8 }}>
      <input
        type="text"
        placeholder="Search messages, files, tasks..."
        value={query}
        onChange={e => setQuery(e.target.value)}
        disabled={loading}
        style={{ flex: 1 }}
      />
      <button type="submit" disabled={loading || !query}>
        {loading ? 'Searching...' : 'Search'}
      </button>
      {error && <span style={{ color: 'red' }}>{error}</span>}
    </form>
  );
};
