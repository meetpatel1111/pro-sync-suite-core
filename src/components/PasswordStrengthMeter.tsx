
import React, { useState, useEffect } from 'react';

interface PasswordStrengthMeterProps {
  password: string;
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password }) => {
  const [strength, setStrength] = useState(0);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    // Calculate password strength
    const calculateStrength = () => {
      let score = 0;
      
      if (!password) {
        setStrength(0);
        setFeedback('');
        return;
      }

      // Length check (8+ = strong, 6+ = medium)
      if (password.length >= 8) score += 25;
      else if (password.length >= 6) score += 10;

      // Character variety checks
      if (/[A-Z]/.test(password)) score += 15; // Uppercase
      if (/[a-z]/.test(password)) score += 10; // Lowercase
      if (/[0-9]/.test(password)) score += 25; // Numbers
      if (/[^A-Za-z0-9]/.test(password)) score += 25; // Special chars

      // Set strength score (0-100)
      setStrength(score);
      
      // Set feedback message
      if (score < 40) {
        setFeedback('Weak: Try adding numbers and special characters');
      } else if (score < 70) {
        setFeedback('Medium: Add more character variety');
      } else {
        setFeedback('Strong password');
      }
    };

    calculateStrength();
  }, [password]);

  // Style for the strength bar
  const getBarStyle = () => {
    if (strength < 40) {
      return 'bg-red-500'; // Weak
    } else if (strength < 70) {
      return 'bg-yellow-500'; // Medium
    } else {
      return 'bg-green-500'; // Strong
    }
  };

  return (
    <div className="mt-2">
      <div className="h-1 w-full bg-gray-200 rounded-full">
        <div 
          className={`h-1 rounded-full ${getBarStyle()}`} 
          style={{ width: `${strength}%`, transition: 'width 0.3s ease-in-out' }}
        ></div>
      </div>
      <p className="text-xs mt-1 text-muted-foreground">
        {feedback}
      </p>
    </div>
  );
};
