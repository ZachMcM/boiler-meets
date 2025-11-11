import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Video, VideoOff, Mic, MicOff, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/test")({
  beforeLoad: async ({ context }) => {
    // Require authentication to access test page
    if (!context.currentUserData) {
      throw redirect({ to: "/login" });
    }
    if (context.currentUserData.user.isBanned) {
      throw redirect({ to: "/banned" });
    }
  },
  component: TestPage,
});

function TestPage() {
  const navigate = useNavigate();

  // Media stream and refs
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // UI state
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [permissionStatus, setPermissionStatus] = useState<"pending" | "granted" | "denied">("pending");
  const [audioLevel, setAudioLevel] = useState(0);

  // Initialize media devices
  useEffect(() => {
    const initializeMedia = async () => {
      try {
        setPermissionStatus("pending");

        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        setLocalStream(stream);
        setPermissionStatus("granted");

        // Store permission granted flag
        localStorage.setItem("boilermeets_media_tested", "true");

        // Set up video preview
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // Set up audio analysis
        setupAudioAnalyzer(stream);

        toast.success("Camera and microphone access granted!");
      } catch (error) {
        console.error("Error accessing media devices:", error);
        setPermissionStatus("denied");
        toast.error("Failed to access camera/microphone. Please check permissions in your browser settings.");
      }
    };

    initializeMedia();

    // Cleanup on unmount
    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Set up audio analyzer for microphone level meter
  const setupAudioAnalyzer = (stream: MediaStream) => {
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const microphone = audioContext.createMediaStreamSource(stream);

    analyser.fftSize = 256;
    microphone.connect(analyser);

    audioContextRef.current = audioContext;
    analyserRef.current = analyser;

    // Start monitoring audio levels
    monitorAudioLevel();
  };

  // Monitor audio level for visualization
  const monitorAudioLevel = () => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

    const checkLevel = () => {
      if (!analyserRef.current) return;

      analyserRef.current.getByteFrequencyData(dataArray);

      // Calculate average volume level
      const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
      const normalizedLevel = Math.min(100, (average / 255) * 100);

      setAudioLevel(normalizedLevel);
      animationFrameRef.current = requestAnimationFrame(checkLevel);
    };

    checkLevel();
  };

  // Toggle video on/off
  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  // Toggle audio on/off
  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  // Navigate back to dashboard
  const handleBackToDashboard = () => {
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent to-secondary">
      <div className="container mx-auto px-4 py-8">
        {/* Header with Back Button */}
        <div className="mb-6">
          <Button
            onClick={handleBackToDashboard}
            variant="outline"
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

        {/* Status Message */}
        {permissionStatus === "pending" && (
          <div className="mb-6 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 p-4 rounded-lg">
            Requesting camera and microphone access...
          </div>
        )}
        {permissionStatus === "denied" && (
          <div className="mb-6 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 p-4 rounded-lg">
            ✗ Camera and microphone access denied. Please check your browser settings and refresh the page to try again.
          </div>
        )}

        {/* Video Card - Matches ChatRoom Layout */}
        <div className="flex justify-center">
          <Card className="max-w-3xl w-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-foreground" />
                <p className="font-semibold text-foreground">
                  Camera & Microphone Test
                </p>
              </div>
            </CardHeader>
            <CardContent className="p-0 relative">
              {/* Main Video Display */}
              <div>
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-64 lg:h-96 object-cover bg-card scale-x-[-1]"
                />
              </div>
              {!isVideoEnabled && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-card">
                  <VideoOff className="w-12 h-12 text-muted-foreground mb-2" />
                  <p className="text-foreground font-medium">Video Off</p>
                </div>
              )}

              {/* Microphone Level Meter Below Video */}
              {permissionStatus === "granted" && (
                <div className="p-4 bg-card border-t">
                  <p className="text-sm text-foreground mb-2">
                    {isAudioEnabled ? "Speak to test your microphone" : "Microphone is muted"}
                  </p>
                  <div className="w-full bg-muted rounded-full h-6 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-500 transition-all duration-100"
                      style={{ width: `${isAudioEnabled ? audioLevel : 0}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Level: {isAudioEnabled ? Math.round(audioLevel) : 0}%
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <div className="flex justify-center items-center gap-4">
                <Button
                  onClick={toggleVideo}
                  variant={isVideoEnabled ? "default" : "destructive"}
                  size="icon"
                  className="rounded-full size-12"
                  disabled={permissionStatus !== "granted"}
                >
                  {isVideoEnabled ? <Video /> : <VideoOff />}
                </Button>
                <Button
                  onClick={toggleAudio}
                  variant={isAudioEnabled ? "default" : "destructive"}
                  size="icon"
                  className="rounded-full size-12"
                  disabled={permissionStatus !== "granted"}
                >
                  {isAudioEnabled ? <Mic /> : <MicOff />}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
