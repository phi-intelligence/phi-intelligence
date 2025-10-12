import React, { useCallback } from 'react';
import { 
  Mic, 
  MicOff, 
  Loader2, 
  CheckCircle,
  WifiOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// Props interface
interface VoiceConnectionButtonProps {
  isConnected: boolean;
  isConnecting: boolean;
  isActive: boolean;
  isSpeaking: boolean;
  mediaDevicesSupported: boolean;
  error?: string;
  onConnect: () => Promise<void>;
  onDisconnect: () => Promise<void>;
  onRetry?: () => Promise<void>;
  companyName?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
}

const VoiceConnectionButton: React.FC<VoiceConnectionButtonProps> = ({
  isConnected,
  isConnecting,
  isActive,
  isSpeaking,
  mediaDevicesSupported,
  error,
  onConnect,
  onDisconnect,
  onRetry,
  companyName = 'Voice Assistant',
  className = '',
  size = 'lg',
  variant = 'default'
}) => {

  // Handle button click
  const handleButtonClick = useCallback(async () => {
    if (isConnected) {
      await onDisconnect();
    } else {
      await onConnect();
    }
  }, [isConnected, onConnect, onDisconnect]);

  // Get button content based on state
  const getButtonContent = () => {
    if (isConnected) {
      return (
        <>
          <MicOff className="w-5 h-5 mr-2" />
          Disconnect
        </>
      );
    } else if (isConnecting) {
      return (
        <>
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          Connecting...
        </>
      );
    } else {
      return (
        <>
          <Mic className="w-5 h-5 mr-2" />
          Connect
        </>
      );
    }
  };

  // Get button styling based on state
  const getButtonClasses = () => {
    const baseClasses = 'transition-all duration-300 font-medium';
    
    if (isConnected) {
      return `${baseClasses} bg-white hover:bg-gray-100 text-black border border-gray-300`;
    } else if (isConnecting) {
      return `${baseClasses} bg-blue-600 hover:bg-blue-700 text-white cursor-not-allowed`;
    } else {
      return `${baseClasses} bg-phi-light hover:bg-phi-light/90 text-black`;
    }
  };

  // Get size classes
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm';
      case 'md':
        return 'px-4 py-2 text-base';
      case 'lg':
        return 'px-6 py-3 text-lg';
      default:
        return 'px-6 py-3 text-lg';
    }
  };

  // Check if button should be disabled
  const isDisabled = () => {
    if (!mediaDevicesSupported) return true;
    if (isConnecting) return true;
    return false;
  };

  return (
    <div className={`voice-connection-button-container ${className}`}>
      {/* Main connection button */}
      <Button
        onClick={handleButtonClick}
        disabled={isDisabled()}
        className={`${getButtonClasses()} ${getSizeClasses()} w-full`}
        variant={variant}
      >
        {getButtonContent()}
      </Button>

      {/* Status indicator */}
      <div className="flex items-center justify-center mt-3 space-x-4">
        {/* Connection status */}
        <div className="flex items-center space-x-2">
          {isConnected ? (
            <CheckCircle className="w-4 h-4 text-green-400" />
          ) : (
            <WifiOff className="w-4 h-4 text-gray-400" />
          )}
          <span className="text-xs text-gray-400">
            {isConnected ? 'Connected' :
             isConnecting ? 'Connecting...' :
             'Disconnected'}
          </span>
        </div>

        {/* Microphone status */}
        <div className="flex items-center space-x-2">
          {mediaDevicesSupported ? (
            <Mic className="w-4 h-4 text-green-400" />
          ) : (
            <MicOff className="w-4 h-4 text-red-400" />
          )}
          <span className="text-xs text-gray-400">
            {mediaDevicesSupported ? 'Mic Ready' : 'Mic Unavailable'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default VoiceConnectionButton;
