import React, { useEffect, useState } from 'react';
import collabService from '@/services/collabService';
import { useAuthContext } from '@/context/AuthContext';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface MeetingNotesPanelProps {
  meetingId: string;
  userId: string;
}

// TODO: Fetch and add meeting notes using collabService
export const MeetingNotesPanel: React.FC<MeetingNotesPanelProps> = ({ meetingId, userId }) => {
  // Use collabService.getMeetingNotes and addMeetingNote
  return <div>Meeting notes UI goes here</div>;
};
