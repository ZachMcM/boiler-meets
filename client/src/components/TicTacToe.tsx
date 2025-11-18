import { useEffect, useState } from "react";
import type { Socket } from "socket.io-client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

export interface TicTacToeGameState {
  board: ('X' | 'O' | null)[];
  currentTurn: string;
  playerX: string;
  playerO: string;
  winner: string | null;
  turnNumber: number;
}

export default function TicTacToe({
  initialGameState,
  socketRef,
  roomId,
}: {
  initialGameState: TicTacToeGameState;
  socketRef: React.RefObject<Socket | null>;
  roomId: string;
}) {
  const [gameState, setGameState] =
    useState<TicTacToeGameState>(initialGameState);

  // Sync state with initialGameState when it changes (new game starts)
  useEffect(() => {
    setGameState(initialGameState);
  }, [initialGameState]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const handler = ({
      gameState,
      cellIndex,
    }: {
      gameState: TicTacToeGameState;
      cellIndex: number;
    }) => {
      setGameState(gameState);

      // Show winner/tie notification
      if (gameState.winner) {
        if (gameState.winner === 'tie') {
          toast.info("It's a tie!");
        } else if (gameState.winner === currentUserData?.user.id) {
          toast.success("You won!");
        } else {
          toast.error("You lost!");
        }
      }
    };

    socket.on("tictactoe-move-made", handler);

    return () => {
      socket.off("tictactoe-move-made", handler);
    };
  }, [socketRef]);

  const { data: currentUserData } = authClient.useSession();

  const handleCellClick = (cellIndex: number) => {
    // Validate it's the player's turn
    if (gameState.currentTurn !== currentUserData?.user.id) {
      toast.error("It's not your turn!");
      return;
    }

    // Validate cell is empty
    if (gameState.board[cellIndex] !== null) {
      toast.error("That cell is already taken!");
      return;
    }

    // Validate game is still ongoing
    if (gameState.winner) {
      return;
    }

    socketRef.current?.emit("tictactoe-move", { cellIndex });
  };

  const playerSymbol = currentUserData?.user.id === gameState.playerX ? 'X' : 'O';
  const isMyTurn = gameState.currentTurn === currentUserData?.user.id;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tic-Tac-Toe</CardTitle>
        <CardDescription>
          {gameState.winner
            ? gameState.winner === 'tie'
              ? "It's a tie!"
              : gameState.winner === currentUserData?.user.id
              ? "You won!"
              : "You lost!"
            : isMyTurn
            ? `Your turn (${playerSymbol})`
            : `Opponent's turn`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p>
            <span className="font-bold">You are: </span>
            {playerSymbol}
          </p>
          <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
            {gameState.board.map((cell, index) => (
              <button
                key={index}
                onClick={() => handleCellClick(index)}
                disabled={!isMyTurn || gameState.winner !== null || cell !== null}
                className={`
                  aspect-square w-full border-2 border-border rounded-lg
                  flex items-center justify-center text-4xl font-bold
                  transition-all duration-200
                  ${
                    !isMyTurn || gameState.winner !== null || cell !== null
                      ? 'cursor-not-allowed opacity-60'
                      : 'hover:bg-accent hover:border-primary cursor-pointer'
                  }
                  ${cell === 'X' ? 'text-blue-500' : ''}
                  ${cell === 'O' ? 'text-red-500' : ''}
                  ${!cell ? 'text-muted-foreground' : ''}
                `}
              >
                {cell || ''}
              </button>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground">
            Turn {gameState.turnNumber}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
