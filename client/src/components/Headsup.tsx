import { useEffect, useState } from "react";
import type { Socket } from "socket.io-client";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { authClient } from "@/lib/auth-client";
import { useCountdown } from "@/hooks/useCountdown";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Check } from "lucide-react";
import { toast } from "sonner";

export interface HeadsupGameState {
  turnNumber: number;
  currentTurn: string;
  turnOverTime: number;
  numCorrect: number;
  item: string;
}

export default function Headsup({
  initialGameState,
  socketRef,
  roomId,
}: {
  initialGameState: HeadsupGameState;
  socketRef: React.RefObject<Socket | null>;
  roomId: string;
}) {
  const [gameState, setGameState] =
    useState<HeadsupGameState>(initialGameState);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const handler = ({
      gameState,
      correct,
      correctAnswer,
    }: {
      gameState: HeadsupGameState;
      correct: boolean;
      correctAnswer: string;
    }) => {
      setGameState(gameState);
      if (correct) {
        toast.success(`You correctly guessed ${correctAnswer}`);
      } else {
        toast.error(`Oops, the correct answer was ${correctAnswer}`);
      }
    };

    socket.on("headsup-turn-advanced", handler);

    return () => {
      socket.off("headsup-turn-advanced", handler);
    };
  }, [socketRef]);

  const { data: currentUserData } = authClient.useSession();

  const { secondsRemaining } = useCountdown(gameState.turnOverTime);

  const [answer, setAnswer] = useState("");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Headsup!</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {gameState.currentTurn !== currentUserData?.user.id && (
            <p>
              Their item is a{" "}
              <span className="font-bold">{gameState.item}</span>
            </p>
          )}
          <p>
            {gameState.currentTurn !== currentUserData?.user.id
              ? "Their Turn"
              : "Your Turn"}
          </p>
          <p>
            Time Remaining:{" "}
            <span className="font-bold">{secondsRemaining}</span>
          </p>
          <p>
            <span className="font-bold">Score: </span>
            {gameState.numCorrect} / 10
          </p>
          <p>
            <span className="font-bold">Turn: </span>
            {gameState.turnNumber} / 10
          </p>
          {gameState.currentTurn === currentUserData?.user.id && (
            <div className="flex flex-1 gap-2">
              <Input
                placeholder="Answer:"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && answer.trim()) {
                    if (!answer.trim()) return;
                    socketRef.current?.emit("headsup-answer", { answer });
                    setAnswer("");
                  }
                }}
              />
              <Button
                onClick={() => {
                  if (!answer.trim()) return;
                  socketRef.current?.emit("headsup-answer", { answer });
                  setAnswer("");
                }}
                size="sm"
              >
                <Check /> Submit
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
