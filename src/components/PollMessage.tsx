import React, { useEffect, useState } from 'react';
import collabService from '@/services/collabService';
import { useAuthContext } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

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
