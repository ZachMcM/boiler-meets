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
// import type { NotificationItem } from "./Notification";
// import { ProfileModuleCarousel } from "./ProfileModules";
// import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
// import { Input } from "./ui/input";
// import { Label } from "./ui/label";
// import { AspectRatio } from "./ui/aspect-ratio";
// import Headsup, { type HeadsupGameState } from "./Headsup";
// import TicTacToe, { type TicTacToeGameState } from "./TicTacToe";
// import TwoTruthsAndALie, { type TwoTruthsGameState } from "./TwoTruthsAndALie";
// import PurdueTrivia, { type TriviaGameState } from "./PurdueTrivia";
import type { NotificationItem } from "@/components/Notification";
import { ProfileModuleCarousel } from "@/components/ProfileModules";
import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { AspectRatio } from "@radix-ui/react-aspect-ratio";
import Headsup, {type HeadsupGameState} from "@/components/Headsup";
import TicTacToe, { type TicTacToeGameState } from "@/components/TicTacToe";
import TwoTruthsAndALie, {type TwoTruthsGameState} from "@/components/TwoTruthsAndALie";
import PurdueTrivia, {type TriviaGameState} from "@/components/PurdueTrivia";

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
  const [gameState, setGameState] = useState<
    | null
    | HeadsupGameState
    | TicTacToeGameState
    | TwoTruthsGameState
    | TriviaGameState
  >(null);
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
    {
      id: "trivia",
      name: "Purdue Trivia",
      description: "Test your Boilermaker knowledge!",
      image:
        "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=400",
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

  return (
    <div
      className="min-h-screen transition-all duration-500"
    >
      <div className="relative overflow-hidden">
        <div className="relative px-4 py-8 mx-auto max-w-7xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-8">Video Chat</h1>

          {/* Video Grid */}
          <div className="flex">
            {
              <div className="flex flex-[2] w-full">
                {/* Remote Video */}
                <Card className="max-w-3xl flex flex-1">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Avatar>
                          <AvatarFallback>
                            User
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-foreground">
                            {getDisplayName(otherUserId)}
                          </p>
                          <p>
                            Senior | CS
                          </p>
                          <p className="text-xs text-muted-foreground">
                            User123
                          </p>
                        </div>
                      </div>
                    </CardHeader>
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
                          Video will be here
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
                      {incomingGameRequest && (
                        <div className="flex flex-col space-y-2">
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
                      ) : (
                        gameState != null && (
                          <Button
                            variant="outline"
                            onClick={() =>
                              socketRef.current?.emit("game-ended")
                            }
                            className="px-4"
                          >
                            End Game
                          </Button>
                        )
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
                ) : selectedGame === "trivia" ? (
                  <PurdueTrivia
                    initialGameState={gameState as TriviaGameState}
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
