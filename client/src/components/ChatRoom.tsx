import { useEffect, useRef, useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { io, Socket } from "socket.io-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  User,
  Phone,
} from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { getUser } from "@/endpoints";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export function ChatRoom({ roomId }: { roomId: string }) {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const [socket, setSocket] = useState<Socket | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [savedRemoteStream, setSavedRemoteStream] = useState<MediaStream | null>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState("Connecting...");
  const [otherUserId, setOtherUserId] = useState<string | null>(null);
  const [feedbackPage, setFeedbackPage] = useState(false);
  const [waitingOtherResponse, setWaitingOtherResponse] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const pendingIceCandidatesRef = useRef<RTCIceCandidate[]>([]);

  const { data: otherUser, isPending: otherUserPending } = useQuery({
    queryKey: ["user", otherUserId],
    queryFn: async () => await getUser(otherUserId!),
    enabled: !!otherUserId,
  });

  useEffect(() => {
    if (!session?.user?.id) {
      router.navigate({ to: "/login" });
      return;
    }

    // Only initialize if we don't already have a socket
    if (socketRef.current) {
      console.log("Socket already exists, skipping initialization");
      return;
    }

    console.log(
      "Initializing WebRTC for room:",
      roomId,
      "type:",
      typeof roomId
    );
    initializeWebRTC();

    return () => {
      console.log("Cleanup called");
      cleanup();
    };
  }, [session?.user?.id, roomId]);

  // Set remote video srcObject when remoteStream changes
  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      console.log("Setting remote video srcObject in effect");
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  useEffect(() => {
    if (remoteStream) {
      console.log("remoteStream updated:", remoteStream);
      setSavedRemoteStream(remoteStream);
    } else {
      console.log("remoteStream is null");
    }

    if (remoteVideoRef.current) {
      console.log("remoteVideoRef is set:", remoteVideoRef.current);
    } else {
      console.log("remoteVideoRef is null");
    }
  }, [remoteStream]);

  useEffect(() => {
    console.log("LOCAL STREAM: ", localStream);
  }, [localStream])

  useEffect(() => {
    console.log("REMOTE STREAM: ", remoteStream);
  }, [remoteStream])

  const initializeWebRTC = async () => {
    try {
      setConnectionStatus("Getting camera and microphone...");

      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      console.log("STREAM", stream);
      setLocalStream(stream);
      localStreamRef.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      setConnectionStatus("Creating peer connection...");

      // Create peer connection
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
        ],
      });

      // Add tracks to peer connection
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      // Handle remote stream
      pc.ontrack = (event) => {
        console.log("Received remote track", event.track.kind, event.streams);

        if (event.streams && event.streams.length > 0) {
          const [stream] = event.streams;
          console.log("Setting remote stream from event.streams");
          console.log(
            "Stream tracks:",
            stream.getTracks().map((t) => `${t.kind}: ${t.enabled}`)
          );
          setRemoteStream(stream);
        } else {
          console.log("No streams in event, creating MediaStream from track");
          // Some browsers don't populate event.streams, so create our own
          setRemoteStream((prevStream) => {
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
        console.log("Connection state:", pc.connectionState);
        setConnectionStatus(pc.connectionState);
      };

      pc.oniceconnectionstatechange = () => {
        console.log("ICE connection state:", pc.iceConnectionState);
      };

      peerConnectionRef.current = pc;

      setConnectionStatus("Connecting to server...");

      // Connect to video chat socket
      const videoChatSocket = io(
        `${import.meta.env.VITE_SERVER_URL}/video-chat`,
        {
          auth: { userId: session?.user.id, roomId },
        }
      );

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          console.log("Sending ICE candidate");
          videoChatSocket.emit("ice-candidate", {
            candidate: event.candidate,
          });
        }
      };

      // Socket event handlers
      videoChatSocket.on("user-ready", async ({ userId }) => {
        console.log(
          "User ready:",
          userId,
          "signaling state:",
          pc.signalingState
        );
        // Ignore our own events
        if (userId === session?.user.id) return;
        setOtherUserId(userId);

        // Only proceed if we're in stable state (not already negotiating)
        if (pc.signalingState !== "stable") {
          console.log(
            "Ignoring user-ready, already negotiating. State:",
            pc.signalingState
          );
          return;
        }

        // Only create offer if our userId is "greater" to avoid both peers creating offers
        const shouldCreateOffer = session!.user.id > userId;
        console.log(
          "Should create offer:",
          shouldCreateOffer,
          session!.user.id,
          "vs",
          userId
        );

        if (shouldCreateOffer) {
          try {
            // Create and send offer
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            videoChatSocket.emit("offer", { offer });
            setConnectionStatus("Sent offer, waiting for answer...");
          } catch (error) {
            console.error("Error creating offer:", error);
          }
        } else {
          setConnectionStatus("Waiting for offer...");
        }
      });

      videoChatSocket.on("offer", async ({ offer, from }) => {
        console.log(
          "Received offer from:",
          from,
          "current signaling state:",
          pc.signalingState
        );
        // Ignore our own events
        if (from === session?.user.id) return;
        setOtherUserId(from);

        // Handle glare condition - if we're also trying to send an offer
        if (pc.signalingState === "have-local-offer") {
          console.log("Glare condition detected - both peers sent offers");
          // The peer with the "smaller" ID should rollback and accept the offer
          const shouldRollback = session!.user.id < from;
          if (!shouldRollback) {
            console.log("Ignoring incoming offer, our offer takes precedence");
            return;
          }
          console.log("Rolling back our offer to accept incoming offer");
          await pc.setLocalDescription({ type: "rollback" });
        }

        setConnectionStatus("Received offer, sending answer...");

        try {
          await pc.setRemoteDescription(offer);
          // Add any queued ICE candidates
          for (const candidate of pendingIceCandidatesRef.current) {
            await pc.addIceCandidate(candidate);
          }
          pendingIceCandidatesRef.current = [];

          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          videoChatSocket.emit("answer", { answer });
          console.log("Sent answer");
        } catch (error) {
          console.error("Error handling offer:", error);
        }
      });

      videoChatSocket.on("answer", async ({ answer, from }) => {
        console.log(
          "Received answer from:",
          from,
          "signaling state:",
          pc.signalingState
        );
        // Ignore our own events
        if (from === session?.user.id) return;
        // Only process answer if we're expecting one (we sent an offer)
        if (pc.signalingState !== "have-local-offer") {
          console.log(
            "Ignoring answer, not in have-local-offer state. Current state:",
            pc.signalingState
          );
          return;
        }
        setConnectionStatus("Received answer, finalizing connection...");

        try {
          await pc.setRemoteDescription(answer);
          // Add any queued ICE candidates
          for (const candidate of pendingIceCandidatesRef.current) {
            await pc.addIceCandidate(candidate);
          }
          pendingIceCandidatesRef.current = [];

          console.log("Set remote description from answer");
        } catch (error) {
          console.error("Error handling answer:", error);
        }
      });

      videoChatSocket.on("ice-candidate", async ({ candidate, from }) => {
        console.log("Received ICE candidate from:", from);
        // Ignore our own events
        if (from === session?.user.id) return;

        try {
          // Only add ICE candidates if we have a remote description
          if (pc.remoteDescription) {
            await pc.addIceCandidate(candidate);
            console.log("Added ICE candidate");
          } else {
            console.log(
              "Queuing ICE candidate until remote description is set"
            );
            pendingIceCandidatesRef.current.push(candidate);
          }
        } catch (error) {
          console.error("Error adding ICE candidate:", error);
        }
      });

      videoChatSocket.on("user-left", ({ userId }) => {
        console.log("User left:", userId);
        setOtherUserId(null);
        setRemoteStream(null);
        setConnectionStatus("Other user left");
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = null;
        }

        leaveRoom();
      });

      videoChatSocket.on("timeout", () => { 
        console.log("feedbackPage: ", feedbackPage); 
        // setFeedbackPage(true); 
        console.log("LOCAL STREAM WHEN TOGGLING", localStream);
        console.log("REMOTE STREAM WHEN TIMING OUT", remoteStream);
        toggleAudio();
        toggleVideo();
      });

      videoChatSocket.on("call-again", () => {
        setWaitingOtherResponse(false); 
        // setRemoteStream()
        console.log("call-again received", remoteStream, waitingOtherResponse, remoteVideoRef.current, savedRemoteStream); 
        toggleAudio();
        toggleVideo();
      });

      /* TODO for when BOTH users match */
      videoChatSocket.on("match", () => {});

      videoChatSocket.on("user-call-again", () => {toast.info("The other user wants to call again!"); });

      videoChatSocket.on("error", ({ message }) => {
        console.error("Socket error:", message);
        toast.error(message);
        router.navigate({ to: "/dashboard" });
      });

      setSocket(videoChatSocket);
      socketRef.current = videoChatSocket;
      setConnectionStatus("Waiting for other user...");
      console.log("Socket connected, waiting for signaling from server");
    } catch (error) {
      console.error("Error initializing WebRTC:", error);
      setConnectionStatus("Failed to initialize");
      toast.error(
        "Failed to access camera/microphone. Please check permissions."
      );
      router.navigate({ to: "/dashboard" });
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      console.log("Video Track: ", videoTrack)
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
      socket.emit("leave-room");
    }
    cleanup();
    toast("Video Chat ended");
    router.navigate({ to: "/dashboard" });
  };

  /* TODO for when THIS USER wants to call again */
  const callAgain = async () => {
    // if (localStreamRef.current) {
    //   // Stop the current video tracks
    //   localStreamRef.current.getVideoTracks().forEach((track) => track.stop());
    // }

    try {
      // // Reinitialize the video feed
      // const stream = await navigator.mediaDevices.getUserMedia({
      //   video: true,
      //   audio: false, // Only reinitialize video feed
      // });
      // setLocalStream(stream);
      // localStreamRef.current = stream;

      // // Add the new video tracks to the peer connection
      // const pc = peerConnectionRef.current;
      // if (pc) {
      //   // stream.getVideoTracks().forEach((track) => {
      //   //   pc.addTrack(track, stream);
      //   // });
      //   // Add tracks to peer connection
      //   stream.getTracks().forEach((track) => {
      //     pc.addTrack(track, stream);
      //   });
      // }

      // // Update the local video element
      // if (localVideoRef.current) {
      //   localVideoRef.current.srcObject = stream;
      // }

      // Notify the server
      if (socket) {
        socket.emit("user-call-again");
      }
    } catch (error) {
      console.error("Error reinitializing video feed:", error);
      toast.error("Failed to reinitialize video feed. Please try again.");
    }
  }

  /* TODO for when THIS USER wants to match */
  const match = () => {
    if (socket) {
      socket.emit("user-match");
    }
  }

  const cleanup = () => {
    console.log("Cleaning up resources");
    if (localStreamRef.current) {
      console.log("LOCAL STREAM TO NULL");
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
      setLocalStream(null);
    }
    if (peerConnectionRef.current) {
      console.log("CLOSING PEER CONNECTION");
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (socketRef.current) {
      console.log("DISCONNECTING SOCKET");
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
    }
    pendingIceCandidatesRef.current = [];
    console.log("REMOTE STREAM TO NULL");
    setRemoteStream(null);
    setOtherUserId(null);

    // Ensure video refs are cleared
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent to-secondary">
      <div className="relative overflow-hidden">
        <div className="relative px-4 py-8 mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-bold">Video Chat</h1>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Room: {roomId}</p>
                <p className="text-sm font-medium text-foreground">
                  Status: {connectionStatus}
                </p>
              </div>
            </div>
          </div>

          {/* Video Grid */}
          {!feedbackPage ? (
            <div className="flex w-full justify-center">
              {/* Remote Video */}
              <Card className="max-w-3xl flex flex-1">
                {otherUser && !otherUserPending ? (
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Avatar>
                        <AvatarImage src={otherUser?.image!} />
                        <AvatarFallback>{otherUser?.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-foreground">
                          {otherUser.name || "Anonymous"}
                        </p>
                        <p>
                          {otherUser.year} | {otherUser.major}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {otherUser.username}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                ) : (
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-foreground" />
                      <p className="font-semibold text-foreground">
                        {otherUserId
                          ? "Connecting..."
                          : "Waiting for participant..."}
                      </p>
                    </div>
                  </CardHeader>
                )}
                <CardContent className="p-0 relative">
                  {remoteStream ? (
                    <div><video
                      ref={remoteVideoRef}
                      autoPlay
                      playsInline
                      className="w-full h-64 lg:h-96 object-cover bg-card"
                    /><Button>HERE 1</Button></div>
                  ) : (
                    <div className="w-full h-64 text-center lg:h-96 flex flex-col items-center justify-center">
                      <Video className="w-12 h-12" />
                      <p className="text-foreground font-medium">
                        {waitingOtherResponse
                          ? "Waiting for other user to respond..."
                          : "Reconnecting"}
                        {otherUserId && !waitingOtherResponse
                          ? "Connecting video..."
                          : "Waiting for other user to join..."}
                      </p>
                      <Button>HERE 2</Button>
                    </div>
                  )}
                  <div className="w-36 aspect-video absolute right-4 top-4">
                    <video
                      ref={localVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover bg-card rounded-md"
                    />
                    <Button>HERE 3</Button>
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="flex justify-center gap-4">
                    {/* <Button
                      onClick={toggleVideo}
                      variant={isVideoEnabled ? "default" : "destructive"}
                      size="icon"
                      className="rounded-full size-12"
                    >
                      {isVideoEnabled ? <Video /> : <VideoOff />}
                    </Button>
                    <Button
                      onClick={toggleAudio}
                      variant={isAudioEnabled ? "default" : "destructive"}
                      size="icon"
                      className="rounded-full size-12"
                    >
                      {isAudioEnabled ? <Mic /> : <MicOff />}
                    </Button> */}
                    <Button
                      onClick={leaveRoom}
                      variant="destructive"
                      size="icon"
                      className="rounded-full size-12"
                    >
                      <Phone />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </div>
          ) : (
            <Card className="max-w-3xl flex flex-1">
              {otherUser && !otherUserPending ? (
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Avatar>
                      <AvatarImage src={otherUser?.image!} />
                      <AvatarFallback>{otherUser?.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-foreground">
                        {otherUser.name || "Anonymous"}
                      </p>
                      <p>
                        {otherUser.year} | {otherUser.major}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {otherUser.username}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                ) : (
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-foreground" />
                      <p className="font-semibold text-foreground">
                        {"Other user has left!"}
                      </p>
                    </div>
                  </CardHeader>
                )}
                <CardContent>
                  <Button onClick={() => {setFeedbackPage(false); setWaitingOtherResponse(true); callAgain()}}>
                    Call again?
                  </Button>
                </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
