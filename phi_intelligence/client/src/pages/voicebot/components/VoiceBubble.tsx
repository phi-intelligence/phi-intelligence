import React from 'react';

interface Voice {
  id: number;
  name: string;
  type: string;
  audio: string;
  description: string;
  gender: 'male' | 'female' | 'neutral';
  tone: 'professional' | 'casual' | 'energetic' | 'calm';
}

interface VoiceBubbleProps {
  voice: Voice;
  isSelected: boolean;
  onClick: () => void;
}

export default function VoiceBubble({ voice, isSelected, onClick }: VoiceBubbleProps) {
  const getGenderIcon = (gender: string) => {
    switch (gender) {
      case 'male': return '◼';
      case 'female': return '◯';
      case 'neutral': return '◊';
      default: return '●';
    }
  };

  const getToneColor = (tone: string) => {
    return 'border-phi-gray bg-phi-gray/20';
  };

  // Handle voice bubble click
  const handleVoiceBubbleClick = () => {
    onClick();
  };

  // Get CSS classes for animation states
  const getBubbleClasses = () => {
    let classes = 'relative w-32 h-32 rounded-full cursor-pointer transition-all duration-300 flex flex-col items-center justify-center group border-2';
    
    // Default styling
    classes += ` ${getToneColor(voice.tone)}`;
    
    if (isSelected) {
      classes += ' ring-2 ring-phi-light scale-105 shadow-lg';
    } else {
      classes += ' hover:scale-105 hover:shadow-md';
    }
    
    return classes;
  };

  return (
    <div
      className={getBubbleClasses()}
      onClick={handleVoiceBubbleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleVoiceBubbleClick();
        }
      }}
    >
      {/* Voice Icon */}
      <div className="text-4xl mb-2">
        {getGenderIcon(voice.gender)}
      </div>

      {/* Voice Name */}
      <div className="text-base text-phi-white font-medium truncate w-full text-center">
        {voice.name}
      </div>

      {/* Hover Effect */}
      <div className="absolute inset-0 rounded-full bg-phi-light/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-phi-light rounded-full" />
      )}
    </div>
  );
}