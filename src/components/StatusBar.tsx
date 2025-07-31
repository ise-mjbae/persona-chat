import React from 'react';

interface StatusBarProps {
  status: string;
  isSpeaking: boolean;
}

const StatusBar: React.FC<StatusBarProps> = ({ status, isSpeaking }) => {
  return (
    <div className={`status ${isSpeaking ? 'speaking' : ''}`}>
      {status}
    </div>
  );
};

export default StatusBar;