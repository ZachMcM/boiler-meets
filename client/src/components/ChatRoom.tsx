import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from '@tanstack/react-router';
import { io, Socket } from 'socket.io-client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { authClient } from '@/lib/auth-client';
import { Video, VideoOff, Mic, MicOff, PhoneOff } from 'lucide-react';

export function ChatRoom() {
  const { roomId } = useParams({ from: '/chat-room/$roomId' });
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

  useEffect(() => {
    if (!session?.user?.id) {
      router.navigate({ to: '/login' });
      return;
    }

    initializeWebRTC();

    return () => {
      cleanup();
    };
  }, [session, roomId]);

  const initializeWebRTC = async () => {
    try {
      setConnectionStatus('Getting camera and microphone...');

      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      setLocalStream(stream);

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
        console.log('Received remote stream');
        const [remoteStream] = event.streams;
        setRemoteStream(remoteStream);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
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

      setConnectionStatus('Connecting to server...');

      // Connect to video chat socket
      const videoChatSocket = io('http://localhost:3001/video-chat', {
        auth: { userId: session?.user.id },
        query: { roomId }
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
      videoChatSocket.on('user-joined', ({ userId }) => {
        console.log('User joined:', userId);
        setOtherUserId(userId);
        setConnectionStatus('User joined, establishing connection...');
      });

      videoChatSocket.on('user-ready', async ({ userId }) => {
        console.log('User ready, creating offer:', userId);
        setOtherUserId(userId);

        try {
          // Create and send offer
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          videoChatSocket.emit('offer', { offer });
          setConnectionStatus('Sent offer, waiting for answer...');
        } catch (error) {
          console.error('Error creating offer:', error);
        }
      });

      videoChatSocket.on('offer', async ({ offer, from }) => {
        console.log('Received offer from:', from);
        setOtherUserId(from);
        setConnectionStatus('Received offer, sending answer...');

        try {
          await pc.setRemoteDescription(offer);
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          videoChatSocket.emit('answer', { answer });
        } catch (error) {
          console.error('Error handling offer:', error);
        }
      });

      videoChatSocket.on('answer', async ({ answer, from }) => {
        console.log('Received answer from:', from);
        setConnectionStatus('Received answer, finalizing connection...');

        try {
          await pc.setRemoteDescription(answer);
        } catch (error) {
          console.error('Error handling answer:', error);
        }
      });

      videoChatSocket.on('ice-candidate', async ({ candidate, from }) => {
        console.log('Received ICE candidate from:', from);

        try {
          await pc.addIceCandidate(candidate);
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
        alert(`Error: ${message}`);
        router.navigate({ to: '/dashboard' });
      });

      setSocket(videoChatSocket);
      setConnectionStatus('Waiting for other user...');

      // Signal that we're ready
      videoChatSocket.emit('ready');

    } catch (error) {
      console.error('Error initializing WebRTC:', error);
      setConnectionStatus('Failed to initialize');
      alert('Failed to access camera/microphone. Please check permissions.');
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
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (peerConnection) {
      peerConnection.close();
    }
    if (socket) {
      socket.disconnect();
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Video Chat</h1>
            <p className="text-gray-400">Room: {roomId}</p>
            <p className="text-gray-400">Status: {connectionStatus}</p>
            {otherUserId && <p className="text-gray-400">Connected to: {otherUserId}</p>}
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
          <Card className="relative bg-gray-800 overflow-hidden">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-64 lg:h-96 object-cover"
            />
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
              You {!isVideoEnabled && '(Video Off)'}
            </div>
          </Card>

          {/* Remote Video */}
          <Card className="relative bg-gray-800 overflow-hidden">
            {remoteStream ? (
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-64 lg:h-96 object-cover"
              />
            ) : (
              <div className="w-full h-64 lg:h-96 flex items-center justify-center text-gray-400">
                {otherUserId ? 'Connecting video...' : 'Waiting for other user to join...'}
              </div>
            )}
            {otherUserId && (
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
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