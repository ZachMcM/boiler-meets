// MyContext.ts
import type { VideoCallData } from '@/types/video_call';
import { createContext, useContext, useState, type ReactNode } from 'react';

type VideoCallContextValues = {
    callSession: VideoCallData[] | null,
    addNewCall: (
        data: VideoCallData
    ) => void,
    clearCallSession: () => void,
}

export const VideoCallContext = createContext<VideoCallContextValues | null>(null);

export function VideoCallContextProvider({ children }: { children: ReactNode }) {
    const [callSession, setCallSession] = useState<VideoCallData[] | null>(null);

    const addNewCall = (data: VideoCallData) => {
        if (!callSession) {
            setCallSession([data] as VideoCallData[]);
        } else {
            setCallSession([...callSession, data]);
            console.log("callSession: ", callSession);
        }
    }

    const clearCallSession = () => {
        setCallSession(null);
    }

      return (
    <VideoCallContext.Provider
      value={{
        callSession,
        addNewCall,
        clearCallSession,
      }}
    >
      {children}
    </VideoCallContext.Provider>
  );
}

// Create a custom hook for easier consumption and type safety
export const useVideoCallContext = () => {
  const context = useContext(VideoCallContext) as VideoCallContextValues;
  if (!context) {
    throw new Error('useVideoCallContext must be used within a VideoCallContextProvider');
  }
  return context;
};