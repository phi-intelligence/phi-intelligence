import React, { useState } from 'react';
import VoiceBubble from './VoiceBubble';

interface Voice {
  id: number;
  name: string;
  type: string;
  audio: string;
  description: string;
  gender: 'male' | 'female' | 'neutral';
  tone: 'professional' | 'casual' | 'energetic' | 'calm';
}

interface VoiceSelectionProps {
  selectedVoice: number | null;
  onVoiceSelect: (voiceId: number) => void;
}

const voices: Voice[] = [
  {
    id: 1,
    name: "Alex",
    type: "male",
    audio: "/audio/voices/alex.mp3",
    description: "Professional male voice",
    gender: "male",
    tone: "professional"
  },
  {
    id: 2,
    name: "Sarah",
    type: "female",
    audio: "/audio/voices/sarah.mp3",
    description: "Warm female voice",
    gender: "female",
    tone: "casual"
  },
  {
    id: 3,
    name: "Neo",
    type: "neutral",
    audio: "/audio/voices/neo.mp3",
    description: "Gender-neutral voice",
    gender: "neutral",
    tone: "professional"
  },
  {
    id: 4,
    name: "Marcus",
    type: "deep",
    audio: "/audio/voices/marcus.mp3",
    description: "Deep authoritative voice",
    gender: "male",
    tone: "professional"
  },
  {
    id: 5,
    name: "Luna",
    type: "soft",
    audio: "/audio/voices/luna.mp3",
    description: "Soft gentle voice",
    gender: "female",
    tone: "calm"
  },
  {
    id: 6,
    name: "Zara",
    type: "energetic",
    audio: "/audio/voices/zara.mp3",
    description: "Energetic upbeat voice",
    gender: "female",
    tone: "energetic"
  }
];

export default function VoiceSelection({ selectedVoice, onVoiceSelect }: VoiceSelectionProps) {
  const [playingVoice, setPlayingVoice] = useState<number | null>(null);

  const handleVoiceClick = (voice: Voice) => {
    // Stop any currently playing audio
    if (playingVoice !== null) {
      const currentAudio = document.getElementById(`audio-${playingVoice}`) as HTMLAudioElement;
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }
    }

    // Play the selected voice
    const audio = document.getElementById(`audio-${voice.id}`) as HTMLAudioElement;
    if (audio) {
      audio.play();
      setPlayingVoice(voice.id);
      
      // Reset playing state when audio ends
      audio.onended = () => {
        setPlayingVoice(null);
      };
    }

    // Select the voice
    onVoiceSelect(voice.id);
  };

  return (
    <div className="space-y-4">
      {/* Top Row - 3 voices */}
      <div className="grid grid-cols-3 gap-6">
        {voices.slice(0, 3).map((voice) => (
          <VoiceBubble
            key={voice.id}
            voice={voice}
            isSelected={selectedVoice === voice.id}
            onClick={() => handleVoiceClick(voice)}
          />
        ))}
      </div>

      {/* Bottom Row - 3 voices */}
      <div className="grid grid-cols-3 gap-6">
        {voices.slice(3, 6).map((voice) => (
          <VoiceBubble
            key={voice.id}
            voice={voice}
            isSelected={selectedVoice === voice.id}
            onClick={() => handleVoiceClick(voice)}
          />
        ))}
      </div>

      {/* Hidden audio elements */}
      {voices.map((voice) => (
        <audio
          key={voice.id}
          id={`audio-${voice.id}`}
          preload="auto"
          onError={() => {
            console.warn(`Failed to load audio for voice ${voice.name}`);
          }}
        >
          <source src={voice.audio} type="audio/mpeg" />
          <source src={voice.audio.replace('.mp3', '.wav')} type="audio/wav" />
        </audio>
      ))}

      {/* Voice Details */}
      {selectedVoice && (
        <div className="mt-4 p-3 bg-slate-700/50 rounded-lg">
          {(() => {
            const selectedVoiceData = voices.find(v => v.id === selectedVoice);
            return selectedVoiceData ? (
              <div>
                <h4 className="text-white font-semibold">{selectedVoiceData.name}</h4>
                <p className="text-gray-400 text-sm">{selectedVoiceData.description}</p>
                <div className="flex gap-2 mt-2">
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded">
                    {selectedVoiceData.gender}
                  </span>
                  <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded">
                    {selectedVoiceData.tone}
                  </span>
                </div>
              </div>
            ) : null;
          })()}
        </div>
      )}

      {/* Instructions */}
      <div className="text-center text-gray-400 text-sm">
        <p>Click on any voice to preview</p>
        <p className="text-xs mt-1">Audio samples will play automatically</p>
      </div>
    </div>
  );
}
