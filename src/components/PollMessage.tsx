
import React from 'react';
import collabService from '@/services/collabService';

interface PollMessageProps {
  pollId: string;
  userId: string;
}

// TODO: Fetch poll, allow voting, show results
export const PollMessage: React.FC<PollMessageProps> = ({ pollId, userId }) => {
  // Fetch poll and votes using collabService
  // TODO: Implement UI for voting and results
  return <div>Poll goes here (ID: {pollId})</div>;
};
