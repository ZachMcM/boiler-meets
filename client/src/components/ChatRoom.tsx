import { useEffect, useRef, useState } from 'react';
import { useRouter } from '@tanstack/react-router';
import { io, Socket } from 'socket.io-client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { authClient } from '@/lib/auth-client';
import { Video, VideoOff, Mic, MicOff, PhoneOff } from 'lucide-react';
import { toast } from 'sonner';

export function ChatRoom({ roomId }: { roomId: string }) {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const [socket, setSocket] = useState<Socket | null>(null);
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');
  const [otherUserId, setOtherUserId] = useState<string | null>(null);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const pendingIceCandidatesRef = useRef<RTCIceCandidate[]>([]);

  useEffect(() => {
    if (!session?.user?.id) {
      router.navigate({ to: '/login' });
      return;
    }

    // Only initialize if we don't already have a socket
    if (socketRef.current) {
      console.log('Socket already exists, skipping initialization');
      return;
    }

    console.log('Initializing WebRTC for room:', roomId, 'type:', typeof roomId);
    initializeWebRTC();

    return () => {
      console.log('Cleanup called');
      cleanup();
    };
  }, [session?.user?.id, roomId]);

  // Set remote video srcObject when remoteStream changes
  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      console.log('Setting remote video srcObject in effect');
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const initializeWebRTC = async () => {
    try {
      setConnectionStatus('Getting camera and microphone...');

      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      setLocalStream(stream);
      localStreamRef.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      setConnectionStatus('Creating peer connection...');

      // Create peer connection
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });

      // Add tracks to peer connection
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      // Handle remote stream
      pc.ontrack = (event) => {
        console.log('Received remote track', event.track.kind, event.streams);

        if (event.streams && event.streams.length > 0) {
          const [stream] = event.streams;
          console.log('Setting remote stream from event.streams');
          console.log('Stream tracks:', stream.getTracks().map(t => `${t.kind}: ${t.enabled}`));
          setRemoteStream(stream);
        } else {
          console.log('No streams in event, creating MediaStream from track');
          // Some browsers don't populate event.streams, so create our own
          setRemoteStream(prevStream => {
            if (prevStream) {
              prevStream.addTrack(event.track);
              return new MediaStream(prevStream.getTracks());
            } else {
              return new MediaStream([event.track]);
            }
          });
        }
      };

      // Handle connection state changes
      pc.onconnectionstatechange = () => {
        console.log('Connection state:', pc.connectionState);
        setConnectionStatus(pc.connectionState);
      };

      pc.oniceconnectionstatechange = () => {
        console.log('ICE connection state:', pc.iceConnectionState);
      };

      setPeerConnection(pc);
      peerConnectionRef.current = pc;

      setConnectionStatus('Connecting to server...');

      // Connect to video chat socket
      const videoChatSocket = io(`${import.meta.env.VITE_SERVER_URL}/video-chat`, {
        auth: { userId: session?.user.id, roomId },
      });

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('Sending ICE candidate');
          videoChatSocket.emit('ice-candidate', {
            candidate: event.candidate
          });
        }
      };

      // Socket event handlers
      videoChatSocket.on('user-ready', async ({ userId }) => {
        console.log('User ready:', userId, 'signaling state:', pc.signalingState);
        // Ignore our own events
        if (userId === session?.user.id) return;
        setOtherUserId(userId);

        // Only proceed if we're in stable state (not already negotiating)
        if (pc.signalingState !== 'stable') {
          console.log('Ignoring user-ready, already negotiating. State:', pc.signalingState);
          return;
        }

        // Only create offer if our userId is "greater" to avoid both peers creating offers
        const shouldCreateOffer = session!.user.id > userId;
        console.log('Should create offer:', shouldCreateOffer, session!.user.id, 'vs', userId);

        if (shouldCreateOffer) {
          try {
            // Create and send offer
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            videoChatSocket.emit('offer', { offer });
            setConnectionStatus('Sent offer, waiting for answer...');
          } catch (error) {
            console.error('Error creating offer:', error);
          }
        } else {
          setConnectionStatus('Waiting for offer...');
        }
      });

      videoChatSocket.on('offer', async ({ offer, from }) => {
        console.log('Received offer from:', from, 'current signaling state:', pc.signalingState);
        // Ignore our own events
        if (from === session?.user.id) return;
        setOtherUserId(from);

        // Handle glare condition - if we're also trying to send an offer
        if (pc.signalingState === 'have-local-offer') {
          console.log('Glare condition detected - both peers sent offers');
          // The peer with the "smaller" ID should rollback and accept the offer
          const shouldRollback = session!.user.id < from;
          if (!shouldRollback) {
            console.log('Ignoring incoming offer, our offer takes precedence');
            return;
          }
          console.log('Rolling back our offer to accept incoming offer');
          await pc.setLocalDescription({ type: 'rollback' });
        }

        setConnectionStatus('Received offer, sending answer...');

        try {
          await pc.setRemoteDescription(offer);
          // Add any queued ICE candidates
          for (const candidate of pendingIceCandidatesRef.current) {
            await pc.addIceCandidate(candidate);
          }
          pendingIceCandidatesRef.current = [];

          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          videoChatSocket.emit('answer', { answer });
          console.log('Sent answer');
        } catch (error) {
          console.error('Error handling offer:', error);
        }
      });

      videoChatSocket.on('answer', async ({ answer, from }) => {
        console.log('Received answer from:', from, 'signaling state:', pc.signalingState);
        // Ignore our own events
        if (from === session?.user.id) return;
        // Only process answer if we're expecting one (we sent an offer)
        if (pc.signalingState !== 'have-local-offer') {
          console.log('Ignoring answer, not in have-local-offer state. Current state:', pc.signalingState);
          return;
        }
        setConnectionStatus('Received answer, finalizing connection...');

        try {
          await pc.setRemoteDescription(answer);
          // Add any queued ICE candidates
          for (const candidate of pendingIceCandidatesRef.current) {
            await pc.addIceCandidate(candidate);
          }
          pendingIceCandidatesRef.current = [];

          console.log('Set remote description from answer');
        } catch (error) {
          console.error('Error handling answer:', error);
        }
      });

      videoChatSocket.on('ice-candidate', async ({ candidate, from }) => {
        console.log('Received ICE candidate from:', from);
        // Ignore our own events
        if (from === session?.user.id) return;

        try {
          // Only add ICE candidates if we have a remote description
          if (pc.remoteDescription) {
            await pc.addIceCandidate(candidate);
            console.log('Added ICE candidate');
          } else {
            console.log('Queuing ICE candidate until remote description is set');
            pendingIceCandidatesRef.current.push(candidate);
          }
        } catch (error) {
          console.error('Error adding ICE candidate:', error);
        }
      });

      videoChatSocket.on('user-left', ({ userId }) => {
        console.log('User left:', userId);
        setOtherUserId(null);
        setRemoteStream(null);
        setConnectionStatus('Other user left');
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = null;
        }
      });

      videoChatSocket.on('error', ({ message }) => {
        console.error('Socket error:', message);
        toast.error(message);
        router.navigate({ to: '/dashboard' });
      });

      setSocket(videoChatSocket);
      socketRef.current = videoChatSocket;
      setConnectionStatus('Waiting for other user...');
      console.log('Socket connected, waiting for signaling from server');

    } catch (error) {
      console.error('Error initializing WebRTC:', error);
      setConnectionStatus('Failed to initialize');
      toast.error('Failed to access camera/microphone. Please check permissions.');
      router.navigate({ to: '/dashboard' });
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const leaveRoom = () => {
    if (socket) {
      socket.emit('leave-room');
    }
    cleanup();
    router.navigate({ to: '/dashboard' });
  };

  const cleanup = () => {
    console.log('Cleaning up resources');
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
      setLocalStream(null);
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
      setPeerConnection(null);
    }
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
    }
    pendingIceCandidatesRef.current = [];
    setRemoteStream(null);
    setOtherUserId(null);
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Video Chat</h1>
            <p className="text-foreground">Room: {roomId}</p>
            <p className="text-foreground">Status: {connectionStatus}</p>
            {otherUserId && <p className="text-foreground">Connected to: {otherUserId}</p>}
          </div>
          <Button
            onClick={leaveRoom}
            variant="destructive"
            className="flex items-center gap-2"
          >
            <PhoneOff className="w-4 h-4" />
            Leave Room
          </Button>
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          {/* Local Video */}
          <Card className="relative overflow-hidden">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-64 lg:h-96 object-cover"
            />
            <div className="absolute bottom-2 left-2 bg-foreground bg-opacity-50 text-background px-2 py-1 rounded text-sm">
              You {!isVideoEnabled && '(Video Off)'}
            </div>
          </Card>

          {/* Remote Video */}
          <Card className="relative overflow-hidden">
            {remoteStream ? (
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-64 lg:h-96 object-cover"
              />
            ) : (
              <div className="w-full h-64 lg:h-96 flex items-center justify-center text-foreground">
                {otherUserId ? 'Connecting video...' : 'Waiting for other user to join...'}
              </div>
            )}
            {otherUserId && (
              <div className="absolute bottom-2 left-2 bg-foreground bg-opacity-50 text-background px-2 py-1 rounded text-sm">
                {otherUserId}
              </div>
            )}
          </Card>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4">
          <Button
            onClick={toggleVideo}
            variant={isVideoEnabled ? "default" : "destructive"}
            size="lg"
            className="flex items-center gap-2"
          >
            {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            {isVideoEnabled ? 'Turn Off Video' : 'Turn On Video'}
          </Button>

          <Button
            onClick={toggleAudio}
            variant={isAudioEnabled ? "default" : "destructive"}
            size="lg"
            className="flex items-center gap-2"
          >
            {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            {isAudioEnabled ? 'Mute' : 'Unmute'}
          </Button>
        </div>
      </div>
    </div>
  );
}