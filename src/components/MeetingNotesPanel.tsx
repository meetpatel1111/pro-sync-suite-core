
import React from 'react';
import collabService from '@/services/collabService';

interface MeetingNotesPanelProps {
  meetingId: string;
  userId: string;
}

// TODO: Fetch and add meeting notes using collabService
export const MeetingNotesPanel: React.FC<MeetingNotesPanelProps> = ({ meetingId, userId }) => {
  // Use collabService.getMeetingNotes and addMeetingNote
  return <div>Meeting notes UI goes here</div>;
};
