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
import { Button } from "./ui/button";
import { useCountdown } from "@/hooks/useCountdown";
import { Check, X, Clock } from "lucide-react";
import { toast } from "sonner";

export interface TriviaQuestion {
  id: number;
  question: string;
  type: "multiple_choice" | "true_false";
  options: string[];
  correctIndex: number;
  category: string;
}

export interface TriviaGameState {
  questionNumber: number;
  currentPhase: 'answering' | 'revealing';
  currentQuestion: TriviaQuestion;
  questionStartTime: number;
  player1: string;
  player2: string;
  player1Answer: number | null;
  player2Answer: number | null;
  teamScore: number;
  usedQuestionIds: number[];
  roundHistory: Array<{
    questionNumber: number;
    question: TriviaQuestion;
    player1Answer: number | null;
    player2Answer: number | null;
    correctIndex: number;
    player1Correct: boolean;
    player2Correct: boolean;
    teamScoredPoint: boolean;
  }>;
}

export default function PurdueTrivia({
  initialGameState,
  socketRef,
}: {
  initialGameState: TriviaGameState;
  socketRef: React.RefObject<Socket | null>;
  roomId: string;
}) {
  const [gameState, setGameState] = useState<TriviaGameState>(initialGameState);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);

  const { data: currentUserData } = authClient.useSession();
  const { secondsRemaining } = useCountdown(gameState.questionStartTime);

  // Sync with initialGameState
  useEffect(() => {
    setGameState(initialGameState);
  }, [initialGameState]);

  // Socket listeners
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const handleQuestionAdvanced = ({ gameState, result }: {
      gameState: TriviaGameState;
      result: {
        player1Correct: boolean;
        player2Correct: boolean;
      };
    }) => {
      setGameState(gameState);

      // Show feedback toast
      const isPlayer1 = currentUserData?.user.id === gameState.player1;
      const myCorrect = isPlayer1 ? result.player1Correct : result.player2Correct;
      const partnerCorrect = isPlayer1 ? result.player2Correct : result.player1Correct;

      if (myCorrect && partnerCorrect) {
        toast.success("Both correct! +1 point");
      } else if (myCorrect) {
        toast.success("You got it right! +1 point");
      } else if (partnerCorrect) {
        toast("Your partner got it! +1 point");
      } else {
        toast.error("Both incorrect. No points.");
      }
    };

    const handleQuestionStarted = ({ gameState }: { gameState: TriviaGameState }) => {
      setGameState(gameState);
      setSelectedAnswer(null);
      setHasAnswered(false);
    };

    socket.on("trivia-question-advanced", handleQuestionAdvanced);
    socket.on("trivia-question-started", handleQuestionStarted);

    return () => {
      socket.off("trivia-question-advanced", handleQuestionAdvanced);
      socket.off("trivia-question-started", handleQuestionStarted);
    };
  }, [socketRef, currentUserData?.user.id, gameState.player1]);

  const handleAnswerClick = (index: number) => {
    if (hasAnswered || gameState.currentPhase !== 'answering') return;

    setSelectedAnswer(index);
    setHasAnswered(true);
    socketRef.current?.emit("trivia-answer", { answerIndex: index });
  };

  const isPlayer1 = currentUserData?.user.id === gameState.player1;
  const myAnswer = isPlayer1 ? gameState.player1Answer : gameState.player2Answer;
  const partnerAnswer = isPlayer1 ? gameState.player2Answer : gameState.player1Answer;

  const getButtonVariant = (index: number) => {
    if (gameState.currentPhase === 'revealing') {
      if (index === gameState.currentQuestion.correctIndex) {
        return "default";  // Correct answer highlighted
      }
      if (index === myAnswer || index === partnerAnswer) {
        return "destructive";  // Wrong answer highlighted
      }
      return "outline";
    }

    if (selectedAnswer === index) {
      return "default";
    }
    return "outline";
  };

  const getAnswerLabel = (index: number) => {
    if (gameState.currentQuestion.type === "multiple_choice") {
      return String.fromCharCode(65 + index);  // A, B, C, D
    }
    return "";  // No label for true/false
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Purdue Trivia</CardTitle>
        <CardDescription>
          Question {gameState.questionNumber} of 10 - Team Score: {gameState.teamScore}/10
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Timer */}
          {gameState.currentPhase === 'answering' && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4" />
              <span className={secondsRemaining <= 5 ? "text-destructive font-bold" : ""}>
                {secondsRemaining}s remaining
              </span>
            </div>
          )}

          {/* Question */}
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">
              {gameState.currentQuestion.category.toUpperCase()}
            </p>
            <p className="font-medium text-lg">
              {gameState.currentQuestion.question}
            </p>
          </div>

          {/* Answering Phase */}
          {gameState.currentPhase === 'answering' && (
            <>
              <div className="grid gap-2">
                {gameState.currentQuestion.options.map((option, index) => (
                  <Button
                    key={index}
                    onClick={() => handleAnswerClick(index)}
                    disabled={hasAnswered}
                    variant={getButtonVariant(index)}
                    className="w-full justify-start text-left h-auto py-3"
                  >
                    <span className="font-bold mr-3">{getAnswerLabel(index)}.</span>
                    <span>{option}</span>
                  </Button>
                ))}
              </div>

              {hasAnswered && (
                <p className="text-sm text-muted-foreground text-center">
                  Answer submitted! {partnerAnswer === null ? "Waiting for partner..." : ""}
                </p>
              )}
            </>
          )}

          {/* Revealing Phase */}
          {gameState.currentPhase === 'revealing' && (
            <>
              <div className="grid gap-2">
                {gameState.currentQuestion.options.map((option, index) => {
                  const isCorrect = index === gameState.currentQuestion.correctIndex;
                  const isMyAnswer = index === myAnswer;
                  const isPartnerAnswer = index === partnerAnswer;

                  return (
                    <div
                      key={index}
                      className={`p-3 border rounded-lg ${
                        isCorrect
                          ? "border-green-600 bg-green-50 dark:bg-green-950"
                          : (isMyAnswer || isPartnerAnswer)
                          ? "border-destructive bg-destructive/10"
                          : ""
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {isCorrect ? (
                          <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        ) : (isMyAnswer || isPartnerAnswer) ? (
                          <X className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                        ) : (
                          <div className="w-5 h-5 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <p className="font-medium">
                            <span className="font-bold">{getAnswerLabel(index)}.</span> {option}
                          </p>
                          {(isMyAnswer || isPartnerAnswer) && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {isMyAnswer && isPartnerAnswer
                                ? "Both answered"
                                : isMyAnswer
                                ? "Your answer"
                                : "Partner's answer"}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  {gameState.questionNumber >= 10
                    ? "Game complete!"
                    : "Next question loading..."}
                </p>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
