import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useVideoCallContext } from "@/contexts/VideoCallContext";
import {
  createMatch,
  getNicknames,
  getUser,
  saveCallHistory,
  submitReport,
} from "@/endpoints";
import { authClient } from "@/lib/auth-client";
import type { User as User_Type } from "@/types/user";
import type { VideoCallData } from "@/types/video_call";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import {
  Check,
  Flag,
  Heart,
  Loader,
  Mic,
  MicOff,
  Palette,
  Phone,
  PhoneCall,
  User,
  Users,
  Video,
  VideoOff,
  X,
  XCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";
import type { NotificationItem } from "./Notification";
import { ProfileModuleCarousel } from "./ProfileModules";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { AspectRatio } from "./ui/aspect-ratio";
import Headsup, { type HeadsupGameState } from "./Headsup";
import TicTacToe, { type TicTacToeGameState } from "./TicTacToe";
import TwoTruthsAndALie, { type TwoTruthsGameState } from "./TwoTruthsAndALie";

const BACKGROUND_OPTIONS = [
  {
    type: "default",
    name: "Default Gradient",
    preview:
      "linear-gradient(to bottom right, oklch(0.98 0.005 85), #CFB991, oklch(0.92 0.02 85))",
    url: null,
  },
  {
    type: "hearts",
    name: "Love Hearts",
    preview: null,
    url: "https://www.hdwallpapers.in/download/love_hearts_red_background_4k-HD.jpg",
  },
  {
    type: "minecraft",
    name: "Minecraft",
    preview: null,
    url: "https://i.redd.it/h8bdmuyl6xea1.jpg",
  },
  {
    type: "purdue",
    name: "Purdue Campus",
    preview: null,
    url: "https://www.purdue.edu/newsroom/wp-content/uploads/2024/07/submit-news-pu-today-hero-banner-1920x1080-1.jpg",
  },
  {
    type: "luka",
    name: "Luka Doncic",
    preview: null,
    url: "https://www.kget.com/wp-content/uploads/sites/2/2024/06/6660bbadb5a153.04086348.jpeg?w=2560&h=1440&crop=1",
  },
  {
    type: "ocean",
    name: "Ocean",
    preview: null,
    url: "https://blog.myuvci.com/wp-content/uploads/2025/03/Update-on-Mandatory-Government-Fees-in-Cabo-scaled.jpg",
  },
  {
    type: "space",
    name: "Space",
    preview: null,
    url: "https://wallpapercave.com/wp/wp11709719.jpg",
  },
  {
    type: "neil",
    name: "Neil Armstrong",
    preview: null,
    url: "https://media.newyorker.com/photos/5fd93148f6a2407ddb7ecfcf/16:9/w_2560,h_1440,c_limit/Borowitz-NeilArmstrong.jpg",
  },
];

export function ChatRoom({ roomId }: { roomId: string }) {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const queryClient = useQueryClient();

  const [socket, setSocket] = useState<Socket | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState("Connecting...");
  const [otherUserId, setOtherUserId] = useState<string | null>(null);
  const otherUserIdRef = useRef<string | null>(null);
  const [feedbackPage, setFeedbackPage] = useState(false);
  const [waitingUserResponse, setWaitingUserResponse] = useState(false);
  const [passedFirstCall, setPassedFirstCall] = useState(false);
  const [userHasMatched, setUserHasMatched] = useState(false);
  const [callAgainButtonClicked, setCallAgainButtonClicked] = useState(false);
  const [callStart] = useState(new Date().getTime());
  const [matchCompleted, setMatchCompleted] = useState(false);
  // const [unmatched, setUnmatched] = useState(false);
  const [unmatchedDialog, setUnmatchedDialog] = useState(false);
  const [incomingCall, setIncomingCall] = useState<{
    callerName: string;
    roomId: string;
  } | null>(null);
  const [directCallSocket, setDirectCallSocket] = useState<Socket | null>(null); // socket for direct calling feature

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const pendingIceCandidatesRef = useRef<RTCIceCandidate[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordedAudioBlobRef = useRef<Blob | null>(null);
  const [background, setBackground] = useState<string>("default");
  const [backgroundDialogOpen, setBackgroundDialogOpen] = useState(false);

  const [minigamesDialogOpen, setMinigamesDialogOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  // TODO Add more types here
  const [gameState, setGameState] = useState<null | HeadsupGameState | TicTacToeGameState | TwoTruthsGameState>(null);
  const [outgoingGameRequest, setOutgoingGameRequest] = useState<string | null>(
    null
  );
  const [incomingGameRequest, setIncomingGameRequest] = useState<string | null>(
    null
  );

  const MINIGAME_OPTIONS = [
    {
      id: "headsup",
      name: "Headsup",
      description: "Guess the word on your forehead!",
      image:
        "https://irs.www.warnerbros.com/hero-banner-v2-mobile-jpeg/game/media/browser/heads_up_mobile_app_uber_4320x1080jpg.jpg",
    },
    {
      id: "tictactoe",
      name: "Tic-Tac-Toe",
      description: "Classic strategy game - get three in a row!",
      image:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Tic_tac_toe.svg/1200px-Tic_tac_toe.svg.png",
    },
    {
      id: "twotruthslie",
      name: "Two Truths and a Lie",
      description: "Guess which statement is false!",
      image:
        "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400",
    },
  ];

  const { data: otherUser, isPending: otherUserPending } = useQuery({
    queryKey: ["user", otherUserId],
    queryFn: async () => await getUser(otherUserId!),
    enabled: !!otherUserId,
  });

  const videoCallData = useRef<VideoCallData>({
    otherUser: null,
    matched: false,
    callLength: 0,
    numberCallExtensions: 0,
    callEndedByUser: false,
    unmatched: false,
    callType: "friend",
  } as VideoCallData);

  const { callSession, addNewCall } = useVideoCallContext();

  function changeBackground(newBackground: string) {
    setBackground(newBackground);
    socketRef.current?.emit("background-changed", {
      background: newBackground,
    });
    setBackgroundDialogOpen(false);
    toast.success(
      `Background changed to ${BACKGROUND_OPTIONS.find((b) => b.type === newBackground)?.name}`
    );
  }

  const getBackgroundStyle = (bgType: string) => {
    const option = BACKGROUND_OPTIONS.find((b) => b.type === bgType);
    if (!option) return {};

    if (option.url) {
      return {
        backgroundImage: `url(${option.url})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      };
    } else if (option.preview) {
      return {
        background: option.preview,
      };
    }
    return {};
  };

  // To solve problems associated with React states not updating
  useEffect(() => {
    otherUserIdRef.current = otherUserId;
  }, [otherUserId]);

  // Listen for incoming calls while user is already in an active call
  useEffect(() => {
    if (!session?.user?.id) return;

    const socket = io(`${import.meta.env.VITE_SERVER_URL}/direct-call`, {
      auth: { userId: session.user.id },
      withCredentials: true,
    });

    socket.on(
      "incoming-call",
      (data: { callerName: string; roomId: string }) => {
        setIncomingCall(data);
      }
    );

    setDirectCallSocket(socket);

    return () => {
      socket.disconnect();
    };
  }, [session?.user?.id]);

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
  }, [localStream]);

  useEffect(() => {
    console.log("REMOTE STREAM: ", remoteStream);
  }, [remoteStream]);

  // Start recording when both streams are available
  useEffect(() => {
    if (localStream && remoteStream && !mediaRecorderRef.current) {
      console.log("Both streams available, starting recording");
      startRecording();
    }
  }, [localStream, remoteStream]);

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const startRecording = () => {
    try {
      // Create a mixed audio stream from both local and remote audio
      const audioContext = new AudioContext();
      const destination = audioContext.createMediaStreamDestination();

      // Add local audio
      if (localStreamRef.current) {
        const localAudioTrack = localStreamRef.current.getAudioTracks()[0];
        if (localAudioTrack) {
          const localSource = audioContext.createMediaStreamSource(
            new MediaStream([localAudioTrack])
          );
          localSource.connect(destination);
        }
      }

      // Add remote audio
      if (remoteStream) {
        const remoteAudioTrack = remoteStream.getAudioTracks()[0];
        if (remoteAudioTrack) {
          const remoteSource = audioContext.createMediaStreamSource(
            new MediaStream([remoteAudioTrack])
          );
          remoteSource.connect(destination);
        }
      }

      // Create MediaRecorder with the mixed stream
      const mediaRecorder = new MediaRecorder(destination.stream, {
        mimeType: "audio/webm",
      });

      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          console.log("Audio data chunk received:", event.data.size, "bytes");
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        recordedAudioBlobRef.current = audioBlob;
        console.log(
          "Recording stopped, blob size:",
          audioBlob.size,
          "chunks:",
          audioChunksRef.current.length
        );
      };

      // Request data every second to ensure we capture audio
      mediaRecorder.start(1000);
      mediaRecorderRef.current = mediaRecorder;
      console.log("Started recording audio");
    } catch (error) {
      console.error("Error starting audio recording:", error);
    }
  };

  const stopRecording = (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        mediaRecorderRef.current.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, {
            type: "audio/webm",
          });
          recordedAudioBlobRef.current = audioBlob;
          console.log("Recording stopped, blob size:", audioBlob.size);
          resolve(audioBlob);
        };
        mediaRecorderRef.current.stop();
        console.log("Stopped recording audio");
      } else if (recordedAudioBlobRef.current) {
        // Already stopped, return existing blob
        console.log("Recording already stopped, using existing blob");
        resolve(recordedAudioBlobRef.current);
      } else {
        console.log("No active recording to stop");
        resolve(null);
      }
    });
  };

  const timeoutTransmissions = (disconnect: boolean) => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !disconnect;
        setIsAudioEnabled(!disconnect);
      }
      if (videoTrack) {
        videoTrack.enabled = !disconnect;
        setIsVideoEnabled(!disconnect);
      }
    }
  };

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
        otherUserIdRef.current = userId;
        if (otherUserIdRef.current)
          videoCallData.current.otherUser = await getUser(
            otherUserIdRef.current
          );

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

      videoChatSocket.on("offer", async ({ offer, from, callType }) => {
        console.log(
          "Received offer from:",
          from,
          "current signaling state:",
          pc.signalingState
        );
        // Ignore our own events
        if (from === session?.user.id) return;
        setOtherUserId(from);
        otherUserIdRef.current = from;
        if (otherUserIdRef.current)
          videoCallData.current.otherUser = await getUser(
            otherUserIdRef.current
          );
        videoCallData.current.callType = callType;

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

      videoChatSocket.on("answer", async ({ answer, from, callType }) => {
        console.log(
          "Received answer from:",
          from,
          "signaling state:",
          pc.signalingState
        );
        // Ignore our own events
        if (from === session?.user.id) return;
        videoCallData.current.callType = callType;
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
        toast("Video Chat ended by other user.");
        setOtherUserId(null);
        setRemoteStream(null);
        setConnectionStatus("Other user left");
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = null;
        }

        leaveRoom();
      });

      videoChatSocket.on("timeout", () => {
        setLocalStream(localStreamRef.current);
        console.log("REMOTE VIDEO", remoteVideoRef.current);
        timeoutTransmissions(true);
        setFeedbackPage(true);
      });

      videoChatSocket.on("call-again", () => {
        videoCallData.current.numberCallExtensions =
          videoCallData.current.numberCallExtensions + 1;
        setWaitingUserResponse(false);
        setCallAgainButtonClicked(false);
        setFeedbackPage(false);
        console.log("call-again received");
        timeoutTransmissions(false);
        setPassedFirstCall(true);
      });

      /* When BOTH users match */
      videoChatSocket.on(
        "match",
        async ({ matchType }: { matchType: "friend" | "romantic" }) => {
          /* Do not delete or alter this if statement, it fixes a critical bug where matching with a user causes 
           the user who clicked match second to not receive the other user's data in the after-call summary */
          if (otherUserIdRef.current) {
            videoCallData.current.otherUser = await getUser(
              otherUserIdRef.current
            );
          }
          setWaitingUserResponse(false);
          setFeedbackPage(false);
          console.log("Match received with type:", matchType);
          console.log("otherUserIdRef.current:", otherUserIdRef.current); // Debug log
          videoCallData.current.matched = true;
          toast("It's a Match!");

          // Use the ref instead of state
          try {
            if (
              otherUserIdRef.current &&
              session?.user?.id &&
              session.user.id < otherUserIdRef.current
            ) {
              await createMatch(
                session.user.id,
                otherUserIdRef.current,
                matchType
              );
              console.log("Match created successfully");
              queryClient.invalidateQueries({ queryKey: ["matches"] });
            } else {
              console.log(
                "Other user will create match or otherUserId is null"
              );
            }
          } catch (error) {
            console.error("Failed to create match:", error);
            toast.error("Failed to save match");
          }

          setMatchCompleted(true);
          timeoutTransmissions(false);
        }
      );

      videoChatSocket.on("match-deleted", async () => {
        setMatchCompleted(false);
        videoCallData.current.matched = false;
        if (session?.user) {
          let currentNotifications: NotificationItem[];
          if (session.user.notifications) {
            currentNotifications = JSON.parse(
              session.user.notifications
            ) as NotificationItem[];
          } else {
            currentNotifications = [] as NotificationItem[];
          }
          const newNotification = {
            timestamp: Date.now(),
            type: "unmatch",
            text: `You have unmatched with ${videoCallData.current.otherUser?.name}`,
            title: "Unmatch",
          } as NotificationItem;
          const updatedList = currentNotifications.concat([newNotification]);

          await authClient.updateUser(
            {
              notifications: JSON.stringify(updatedList),
            },
            {
              onError: ({ error }) => {
                toast.error(error.message || "Notification Update Failed");
              },
            }
          );
        }
        toast.info("You have been unmatched!");
        videoCallData.current.unmatched = true;
        leaveRoom();
      });

      videoChatSocket.on("user-call-again", () => {
        toast.info("The other user wants to call again!");
      });

      videoChatSocket.on(
        "background-changed",
        ({ background }: { background: string }) => {
          console.log("Background changed event received:", background);
          setBackground(background);
          toast.info(
            `Background changed to ${BACKGROUND_OPTIONS.find((b) => b.type === background)?.name}`
          );
        }
      );

      videoChatSocket.on(
        "game-request",
        ({
          gameId,
          outgoingUserId,
        }: {
          gameId: string;
          outgoingUserId: string;
        }) => {
          if (session?.user.id === outgoingUserId) {
            setOutgoingGameRequest(gameId);
          } else {
            setIncomingGameRequest(gameId);
          }
        }
      );

      videoChatSocket.on("cancel-game-request", () => {
        setOutgoingGameRequest(null);
        setIncomingGameRequest(null);
      });

      videoChatSocket.on("game-ended", () => {
        setSelectedGame(null);
        setGameState(null);
        toast("Game Over!")
      });

      videoChatSocket.on(
        "game-started",
        ({
          gameState,
          gameId,
        }: {
          gameState: HeadsupGameState | TicTacToeGameState | TwoTruthsGameState;
          gameId: string;
        }) => {
          setIncomingGameRequest(null);
          setOutgoingGameRequest(null);
          setSelectedGame(gameId);
          setGameState(gameState);
        }
      );

      videoChatSocket.on("twotruthslie-phase-changed", ({ gameState }: { gameState: TwoTruthsGameState }) => {
        setGameState(gameState);
      });

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

  const softLeave = () => {
    if (socket) {
      socket.emit("soft-leave");
    }
  };

  const leaveRoom = async (toDashboard: boolean = false) => {
    // Stop recording before leaving
    await stopRecording();
    if (socket) {
      socket.emit("leave-room");
    }
    if (matchCompleted) {
      videoCallData.current.matched = true;
    }
    if (videoCallData.current.unmatched) {
      videoCallData.current.matched = false;
    }
    const now = new Date().getTime();
    videoCallData.current.callLength = now - callStart;
    console.log(now, callStart);
    if (otherUserIdRef.current) {
      // Save call history
      try {
        await saveCallHistory(
          otherUserIdRef.current,
          videoCallData.current.callType,
          videoCallData.current.callLength,
          videoCallData.current.matched
        );
      } catch (error) {
        console.error("Failed to save call history:", error);
        toast.error("Failed to save call history");
      }
    }
    addNewCall(videoCallData.current);
    cleanup();
    console.log("Leaving call with data:", videoCallData.current);
    if (toDashboard) {
      router.navigate({ to: "/dashboard" });
    } else {
      router.navigate({ to: "/end_of_call" });
    }
  };

  const toggleCallAgain = async () => {
    if (!callAgainButtonClicked) {
      setWaitingUserResponse(true);
      setCallAgainButtonClicked(true);
      if (socket) {
        socket.emit("user-call-again");
      }
    } else {
      setWaitingUserResponse(false);
      setCallAgainButtonClicked(false);
      if (socket) {
        socket.emit("user-uncall");
      }
    }
  };

  const toggleMatch = async () => {
    if (!userHasMatched) {
      setWaitingUserResponse(true);
      setUserHasMatched(true);
      if (socket) {
        socket.emit("user-match");
      }
    } else {
      setWaitingUserResponse(false);
      setUserHasMatched(false);
      if (socket) {
        socket.emit("user-unmatch");
      }
    }
  };

  const deleteMatch = () => {
    videoCallData.current.callEndedByUser = true;
    videoCallData.current.unmatched = true;
    videoCallData.current.unmatched = true;
    if (socket) {
      socket.emit("delete-match");
    }
  };

  const cleanup = () => {
    console.log("Cleaning up resources");

    // Stop recording if still active (don't await to avoid blocking cleanup)
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      try {
        mediaRecorderRef.current.stop();
      } catch (error) {
        console.error("Error stopping recording during cleanup:", error);
      }
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
      setLocalStream(null);
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
    }
    pendingIceCandidatesRef.current = [];
    setRemoteStream(null);
    setOtherUserId(null);

    // Clear recording refs
    mediaRecorderRef.current = null;
    audioChunksRef.current = [];
  };

  // Synchronize localStreamRef with localStream
  useEffect(() => {
    localStreamRef.current = localStream;
  }, [localStream]);

  const [reportDetails, setReportDetails] = useState<string>("");

  const reportMutation = useMutation({
    mutationFn: submitReport,
    onSuccess: () => {
      toast.success("Report submitted successfully");
      setReportDetails("");
      leaveRoom();
    },
    onError: (error: Error) => {
      console.error("Error submitting report:", error);
      toast.error(error.message || "Failed to submit report");
    },
  });

  async function onReportSubmit() {
    // Ensure recording is stopped and blob is created
    const audioBlob = await stopRecording();

    if (!audioBlob || audioBlob.size === 0) {
      toast.error("No audio recording available");
      console.error("Audio blob missing or empty:", audioBlob);
      return;
    }

    if (!reportDetails.trim()) {
      toast.error("Please provide report details");
      return;
    }

    if (!otherUserId || !session?.user.id) {
      toast.error("No user to report");
      return;
    }

    console.log("Submitting report with audio blob size:", audioBlob.size);

    reportMutation.mutate({
      audioBlob: audioBlob,
      submissionDetails: reportDetails,
      incomingUserId: otherUserId,
      outgoingUserId: session.user.id,
    });
  }

  const { data: nicknames } = useQuery({
    queryKey: ["nicknames"],
    queryFn: getNicknames,
  });

  // Helper function to get display name (nickname or real name)
  const getDisplayName = (userId: string | null) => {
    if (!userId) return "Anonymous";
    if (!nicknames) return otherUser?.name || "Anonymous";
    return userId && nicknames[userId]
      ? nicknames[userId]
      : otherUser?.name || "Anonymous";
  };

  const handleAcceptIncomingCall = () => {
    if (!incomingCall || !directCallSocket) return;

    directCallSocket.emit("accept-call", { roomId: incomingCall.roomId });
    const newRoomId = incomingCall.roomId;
    setIncomingCall(null);

    // end current call and switch to the new one
    cleanup();
    router.navigate({
      to: "/chat-room/$roomId",
      params: { roomId: newRoomId },
    });
  };

  const handleDeclineIncomingCall = () => {
    if (!incomingCall || !directCallSocket) return;

    directCallSocket.emit("decline-call", { roomId: incomingCall.roomId });
    setIncomingCall(null);
  };

  return (
    <div
      className="min-h-screen transition-all duration-500"
      style={getBackgroundStyle(background)}
    >
      <div className="relative overflow-hidden">
        <div className="relative px-4 py-8 mx-auto max-w-7xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-8">Video Chat</h1>

          {/* incoming call notification card */}
          {incomingCall && (
            <Card className="mb-4 p-4 bg-blue-50 border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <PhoneCall className="w-5 h-5 text-blue-600 animate-pulse" />
                  <div>
                    <p className="font-semibold text-blue-900">Incoming Call</p>
                    <p className="text-sm text-blue-700">
                      {incomingCall.callerName} is calling you
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleDeclineIncomingCall}
                    variant="outline"
                    size="sm"
                    className="bg-white hover:bg-red-50"
                  >
                    Decline
                  </Button>
                  <Button
                    onClick={handleAcceptIncomingCall}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Accept
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Dialog */}
          <Dialog open={feedbackPage}>
            <DialogContent
              className="[&>button:first-of-type]:hidden"
              onInteractOutside={(e) => {
                e.preventDefault();
              }}
            >
              <div className="flex flex-col space-y-4">
                <DialogTitle>End of Call!</DialogTitle>
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
                            {getDisplayName(otherUserId) || "Anonymous"}
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
                    {waitingUserResponse && (
                      <p className="text-foreground font-medium">
                        "User is still responding..."
                      </p>
                    )}
                    <div className="flex items-center gap-2 justify-between">
                      <Button onClick={toggleCallAgain}>
                        {callAgainButtonClicked ? (
                          <PhoneCall fill="orange" />
                        ) : (
                          <Phone />
                        )}
                        Call again?
                      </Button>
                      <Button
                        onClick={toggleMatch}
                        className={`rounded-full ${videoCallData.current.callType == "romantic" ? "bg-pink-200" : "bg-blue-200"}`}
                      >
                        {videoCallData.current.callType == "romantic" ? (
                          <Heart fill={userHasMatched ? "red" : "none"} />
                        ) : (
                          <Users fill={userHasMatched ? "green" : "none"} />
                        )}
                        Match?
                      </Button>
                      <Button
                        onClick={() => {
                          toast("Video Chat ended");
                          videoCallData.current.callEndedByUser = true;
                          leaveRoom();
                        }}
                        variant="destructive"
                        size="icon"
                        className="rounded-full size-12"
                      >
                        <Phone />
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="destructive">
                            <Flag />
                            Report
                          </Button>
                        </DialogTrigger>
                        <ReportDialogContent
                          details={reportDetails}
                          setDetails={setReportDetails}
                          onSubmit={onReportSubmit}
                          otherUser={otherUser!}
                          isSubmitting={reportMutation.isPending}
                        />
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog
            open={backgroundDialogOpen}
            onOpenChange={setBackgroundDialogOpen}
          >
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Choose Background</DialogTitle>
                <DialogDescription>
                  Select a background for your video chat room. Both users will
                  see the same background.
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                {BACKGROUND_OPTIONS.map((option) => (
                  <button
                    key={option.type}
                    onClick={() => changeBackground(option.type)}
                    className={`relative group overflow-hidden rounded-lg border-2 transition-all hover:scale-105 ${
                      background === option.type
                        ? "border-primary ring-2 ring-primary ring-offset-2"
                        : "border-muted hover:border-primary/50"
                    }`}
                  >
                    <div
                      className="aspect-video w-full"
                      style={
                        option.url
                          ? {
                              backgroundImage: `url(${option.url})`,
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                            }
                          : option.preview
                            ? { background: option.preview }
                            : {}
                      }
                    >
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                        <div className="text-center">
                          <p className="text-white font-semibold text-lg drop-shadow-lg">
                            {option.name}
                          </p>
                          {background === option.type && (
                            <div className="mt-2 inline-flex items-center gap-1 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm">
                              <Check className="w-4 h-4" />
                              Active
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </DialogContent>
          </Dialog>

          <Dialog
            open={minigamesDialogOpen}
            onOpenChange={setMinigamesDialogOpen}
          >
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Choose a Minigame</DialogTitle>
                <DialogDescription>
                  Select a game to play together with your chat partner. Have
                  fun!
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                {MINIGAME_OPTIONS.map((game) => (
                  <button
                    key={game.id}
                    onClick={() => {
                      setMinigamesDialogOpen(false);
                      socketRef.current?.emit("game-request", {
                        gameId: game.id,
                      });
                      setOutgoingGameRequest(game.id);
                    }}
                    className="relative group overflow-hidden rounded-lg border-2 transition-all hover:scale-105"
                  >
                    <div
                      className="aspect-video w-full"
                      style={{
                        backgroundImage: `url(${game.image})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                      }}
                    >
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                        <div className="text-center px-2">
                          <p className="text-white font-semibold text-lg drop-shadow-lg">
                            {game.name}
                          </p>
                          <p className="text-white/90 text-sm drop-shadow-lg mt-1">
                            {game.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={unmatchedDialog}>
            <DialogContent
              className="[&>button:first-of-type]:hidden"
              onInteractOutside={(e) => {
                e.preventDefault();
              }}
            >
              <div className="flex flex-col space-y-4">
                <DialogTitle>Really Unmatch?</DialogTitle>
                <Card className="flex flex-1">
                  <CardHeader>This action will end the call!</CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 justify-between">
                      <Button
                        onClick={() => setUnmatchedDialog(false)}
                        className="rounded-full"
                        size="lg"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => deleteMatch()}
                        variant="destructive"
                        size="lg"
                        className="rounded-full"
                      >
                        Unmatch
                        <XCircle />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </DialogContent>
          </Dialog>

          {/* Video Grid */}
          <div className="flex">
            {
              <div className="flex flex-[2] w-full">
                {/* Remote Video */}
                <Card className="max-w-3xl flex flex-1">
                  {otherUser && !otherUserPending ? (
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Avatar>
                          <AvatarImage src={otherUser?.image!} />
                          <AvatarFallback>
                            {getDisplayName(otherUserId)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-foreground">
                            {getDisplayName(otherUserId)}
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
                      <div>
                        <video
                          ref={remoteVideoRef}
                          autoPlay
                          playsInline
                          className="w-full h-64 lg:h-96 object-cover bg-card"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-64 text-center lg:h-96 flex flex-col items-center justify-center">
                        <Video className="w-12 h-12" />
                        <p className="text-foreground font-medium">
                          {waitingUserResponse
                            ? "User is still responding..."
                            : otherUserId
                              ? "Connecting video..."
                              : "Waiting for other user to join..."}
                        </p>
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
                    </div>
                  </CardContent>
                  <CardFooter>
                    <div className="flex justify-center items-center gap-4">
                      <Button
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
                      </Button>
                      <Button
                        onClick={() => setBackgroundDialogOpen(true)}
                        variant="outline"
                        size="icon"
                        className="rounded-full size-12"
                        title="Change Background"
                      >
                        <Palette />
                      </Button>
                      <Button
                        onClick={softLeave}
                        variant="destructive"
                        size="icon"
                        className="rounded-full size-12"
                      >
                        <Phone />
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="destructive">
                            <Flag />
                            Report
                          </Button>
                        </DialogTrigger>
                        <ReportDialogContent
                          details={reportDetails}
                          setDetails={setReportDetails}
                          onSubmit={onReportSubmit}
                          otherUser={otherUser!}
                          isSubmitting={reportMutation.isPending}
                        />
                      </Dialog>
                      {incomingGameRequest && (
                        <div className="space-y-2">
                          <Button
                            variant="outline"
                            className="animate-pulse"
                            onClick={() => {
                              setSelectedGame(incomingGameRequest);
                              setIncomingGameRequest(null);
                              socketRef.current?.emit("accept-game-request", {
                                gameId: incomingGameRequest,
                              });
                            }}
                          >
                            <Check /> Accept{" "}
                            {
                              MINIGAME_OPTIONS.find(
                                (mg) => mg.id == incomingGameRequest
                              )?.name
                            }{" "}
                            Request
                          </Button>
                          <Button
                            className="animate-pulse"
                            variant="destructive"
                            onClick={() => {
                              setIncomingGameRequest(null);
                              socketRef.current?.emit("cancel-game-request");
                            }}
                          >
                            <X /> Cancel{" "}
                            {
                              MINIGAME_OPTIONS.find(
                                (mg) => mg.id == incomingGameRequest
                              )?.name
                            }{" "}
                            Request
                          </Button>
                        </div>
                      )}
                      {outgoingGameRequest && (
                        <Button
                          className="animate-pulse"
                          variant="destructive"
                          onClick={() => {
                            setOutgoingGameRequest(null);
                            socketRef.current?.emit("cancel-game-request");
                          }}
                        >
                          <X /> Cancel{" "}
                          {
                            MINIGAME_OPTIONS.find(
                              (mg) => mg.id == outgoingGameRequest
                            )?.name
                          }{" "}
                          Request
                        </Button>
                      )}
                      {!incomingGameRequest &&
                      !outgoingGameRequest &&
                      !selectedGame ? (
                        <Button
                          variant="outline"
                          onClick={() => setMinigamesDialogOpen(true)}
                          className="px-4"
                        >
                          Play Games
                        </Button>
                      ) : gameState != null && (
                        <Button
                          variant="outline"
                          onClick={() => socketRef.current?.emit("game-ended")}
                          className="px-4"
                        >
                          End Game
                        </Button>
                      )}
                      {passedFirstCall && !matchCompleted && (
                        <Button
                          onClick={toggleMatch}
                          className={`rounded-full ${videoCallData.current.callType == "romantic" ? "bg-pink-200" : "bg-blue-200"}`}
                        >
                          {videoCallData.current.callType == "romantic" ? (
                            <Heart fill={userHasMatched ? "red" : "none"} />
                          ) : (
                            <Users fill={userHasMatched ? "green" : "none"} />
                          )}
                          Match?
                        </Button>
                      )}
                      {matchCompleted && (
                        <Button
                          onClick={() => setUnmatchedDialog(true)}
                          className="rounded-full bg-gray-200"
                        >
                          <XCircle />
                          Unmatch?
                        </Button>
                      )}
                    </div>
                  </CardFooter>
                </Card>
              </div>
            }
            <div className="flex-1 min-w-0 max-w-md space-y-4">
              {selectedGame ? (
                gameState == null ? (
                  <Loader className="animate-spin" />
                ) : selectedGame === "headsup" ? (
                  <Headsup
                    initialGameState={gameState as HeadsupGameState}
                    roomId={roomId}
                    socketRef={socketRef}
                  />
                ) : selectedGame === "tictactoe" ? (
                  <TicTacToe
                    initialGameState={gameState as TicTacToeGameState}
                    roomId={roomId}
                    socketRef={socketRef}
                  />
                ) : selectedGame === "twotruthslie" ? (
                  <TwoTruthsAndALie
                    initialGameState={gameState as TwoTruthsGameState}
                    roomId={roomId}
                    socketRef={socketRef}
                  />
                ) : null
              ) : (
                <>
                  <Card>
                    <CardContent>
                      <div className="text-xl">About Me</div>
                    </CardContent>
                  </Card>
                  {otherUser?.profile?.modules ? (
                    <ProfileModuleCarousel
                      initialModules={otherUser.profile.modules}
                    />
                  ) : (
                    <Card className="p-4 text-center text-3xl">
                      No profile :(
                    </Card>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ReportDialogContent({
  otherUser,
  details,
  setDetails,
  onSubmit,
  isSubmitting = false,
}: {
  otherUser: User_Type;
  details: string;
  setDetails: (val: string) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
}) {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Report User</DialogTitle>
        <DialogDescription>
          Report this user for violating our terms. The call audio will be
          included for review.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div>
          <Label>Reporting: {otherUser?.name || "Unknown User"}</Label>
        </div>
        <div className="space-y-2">
          <Label>Report Details</Label>
          <Input
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Describe the issue..."
            disabled={isSubmitting}
          />
        </div>
      </div>
      <DialogFooter>
        <DialogClose
          onClick={() => setDetails("")}
          asChild
          disabled={isSubmitting}
        >
          <Button variant="outline" disabled={isSubmitting}>
            Cancel
          </Button>
        </DialogClose>
        <DialogClose asChild>
          <Button
            type="submit"
            onClick={onSubmit}
            disabled={isSubmitting || !details.trim()}
          >
            <Check />
            {isSubmitting ? "Submitting..." : "Submit Report"}
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
}
