import React, { useState } from 'react';
import collabService from '@/services/collabService';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash } from 'lucide-react';

interface PollComposerProps {
  channelId: string;
  messageCallback?: () => void;
}

// TODO: Style and integrate with chat input area
export const PollComposer: React.FC<PollComposerProps> = ({ channelId, messageCallback }) => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [loading, setLoading] = useState(false);

  const handleOptionChange = (idx: number, value: string) => {
    setOptions(opts => opts.map((opt, i) => (i === idx ? value : opt)));
  };

  const addOption = () => setOptions(opts => [...opts, '']);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // TODO: Create a message first, then create poll linked to message
    // (Assume you have user_id from context)
    // await collabService.createPoll(...)
    setLoading(false);
    if (messageCallback) messageCallback();
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input
        type="text"
        placeholder="Poll question"
        value={question}
        onChange={e => setQuestion(e.target.value)}
        required
      />
      {options.map((opt, idx) => (
        <Input
          key={idx}
          type="text"
          placeholder={`Option ${idx + 1}`}
          value={opt}
          onChange={e => handleOptionChange(idx, e.target.value)}
          required
        />
      ))}
      <Button type="button" onClick={addOption}>
        <PlusCircle />
      </Button>
      <Button type="submit" disabled={loading}>
        Create Poll
      </Button>
    </form>
  );
};
