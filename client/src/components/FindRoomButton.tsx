import { authClient } from "@/lib/auth-client";
import { useRouter } from "@tanstack/react-router";
import { Loader2, Video } from "lucide-react";
import { useRef, useState } from "react";
import { io } from "socket.io-client";
import { toast } from "sonner";
import { Button } from "./ui/button";

export default function FindRoomButton() {
  const socketRef = useRef<ReturnType<typeof io> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const { data: currentUserData } = authClient.useSession();
  const router = useRouter();

  const startFindRoom = () => {
    setIsLoading(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        const randomIncrement = Math.floor(Math.random() * 6) + 5;
        const newProgress = prev + randomIncrement;
        return Math.min(newProgress, 95);
      });
    }, 2000);

    const socket = io(`${import.meta.env.VITE_SERVER_URL}/room-finder`, {
      auth: { userId: currentUserData?.user.id },
      transports: ["websocket"],
    });

    console.log("Socket created");

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Socket connected!");
    });

    socket.on("connect_error", (error) => {
      console.error("Connection error:", error);
    });

    socket.on("room-found", async ({ roomId }: { roomId: string }) => {
      clearInterval(interval);
      socket.disconnect();
      setIsLoading(false);
      setProgress(100);
      toast.success("Boilermaker found!");
      router.navigate({ to: "/chat-room/$roomId", params: { roomId } });
    });

    socket.on("error", ({ message }: { message: string}) => {
      clearInterval(interval);
      socket.disconnect()
      toast.error(message)
      setIsLoading(false);
      setProgress(0);
    });
  };

  const cancelFindRoom = () => {
    socketRef.current?.emit("cancel-find-room");
    socketRef.current?.disconnect();
    setIsLoading(false);
    setProgress(0);
  };

  function handleOnClick() {
    if (isLoading) {
      cancelFindRoom();
    } else {
      startFindRoom();
    }
  }

  return (
    <Button className="w-fit" onClick={handleOnClick}>
      {isLoading ? (
        <>
          <Loader2 className="animate-spin duration-500" />
          {progress}% Cancel
        </>
      ) : (
        <>
          <Video /> Start Video Chat
        </>
      )}
    </Button>
  );
}
