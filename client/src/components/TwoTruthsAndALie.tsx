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
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Check, X } from "lucide-react";
import { toast } from "sonner";

export interface TwoTruthsGameState {
  turnNumber: number;
  roundNumber: number;
  currentPhase: 'submitting' | 'guessing' | 'revealing';
  currentTurn: string;
  player1: string;
  player2: string;
  scores: {
    [userId: string]: number;
  };
  currentStatements: string[] | null;
  currentLieIndex: number | null;
  currentSubmitter: string | null;
  roundHistory: Array<{
    roundNumber: number;
    submitter: string;
    statements: string[];
    lieIndex: number;
    guesser: string;
    guessedIndex: number;
    correct: boolean;
    pointsAwarded: {
      submitter: number;
      guesser: number;
    };
  }>;
}

export default function TwoTruthsAndALie({
  initialGameState,
  socketRef,
}: {
  initialGameState: TwoTruthsGameState;
  socketRef: React.RefObject<Socket | null>;
  roomId: string;
}) {
  const [gameState, setGameState] = useState<TwoTruthsGameState>(initialGameState);
  const [statements, setStatements] = useState<[string, string, string]>(['', '', '']);
  const [lieIndex, setLieIndex] = useState<string>('');
  const [guessedIndex, setGuessedIndex] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: currentUserData } = authClient.useSession();

  // Sync with initialGameState changes
  useEffect(() => {
    setGameState(initialGameState);
  }, [initialGameState]);

  // Socket listener for phase changes
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const handler = ({ gameState }: { gameState: TwoTruthsGameState }) => {
      setGameState(gameState);
      setIsSubmitting(false);

      // Reset form when entering new submitting phase
      if (gameState.currentPhase === 'submitting' &&
          gameState.currentTurn === currentUserData?.user.id) {
        setStatements(['', '', '']);
        setLieIndex('');
        setGuessedIndex('');
      }

      // Show toast notifications during revealing phase
      if (gameState.currentPhase === 'revealing' && gameState.roundHistory.length > 0) {
        const lastRound = gameState.roundHistory[gameState.roundHistory.length - 1];
        if (lastRound.guesser === currentUserData?.user.id) {
          if (lastRound.correct) {
            toast.success('Correct! You guessed the lie!');
          } else {
            toast.error('Wrong! You got fooled!');
          }
        } else if (lastRound.submitter === currentUserData?.user.id) {
          if (lastRound.correct) {
            toast.error('They guessed your lie!');
          } else {
            toast.success('You fooled them!');
          }
        }
      }
    };

    socket.on('twotruthslie-phase-changed', handler);

    return () => {
      socket.off('twotruthslie-phase-changed', handler);
    };
  }, [socketRef, currentUserData?.user.id]);

  const handleSubmitStatements = () => {
    if (statements.some(s => !s.trim()) || lieIndex === '') {
      toast.error('Please fill in all statements and mark which is the lie');
      return;
    }

    setIsSubmitting(true);
    socketRef.current?.emit('twotruthslie-submit-statements', {
      statements,
      lieIndex: parseInt(lieIndex),
    });
  };

  const handleSubmitGuess = () => {
    if (guessedIndex === '') {
      toast.error('Please select which statement you think is the lie');
      return;
    }

    setIsSubmitting(true);
    socketRef.current?.emit('twotruthslie-guess', {
      guessedIndex: parseInt(guessedIndex),
    });
  };

  const isMyTurn = gameState.currentTurn === currentUserData?.user.id;
  const opponentId = gameState.player1 === currentUserData?.user.id
    ? gameState.player2
    : gameState.player1;

  const myScore = gameState.scores[currentUserData?.user.id || ''] || 0;
  const opponentScore = gameState.scores[opponentId] || 0;

  const getTurnDescription = () => {
    if (gameState.currentPhase === 'submitting') {
      return isMyTurn
        ? 'Submit 2 truths and 1 lie!'
        : 'Opponent is submitting...';
    } else if (gameState.currentPhase === 'guessing') {
      return isMyTurn
        ? 'Which statement is the lie?'
        : 'Opponent is guessing...';
    } else {
      return 'Round results';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Two Truths and a Lie</CardTitle>
        <CardDescription>
          Round {gameState.roundNumber} of 3 - {getTurnDescription()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Score Display */}
          <div className="text-sm font-medium">
            Scores: You ({myScore}) | Opponent ({opponentScore})
          </div>

          {/* Submitting Phase */}
          {gameState.currentPhase === 'submitting' && (
            <>
              {isMyTurn ? (
                <div className="space-y-3">
                  <RadioGroup value={lieIndex} onValueChange={setLieIndex}>
                    {[0, 1, 2].map((index) => (
                      <div key={index} className="space-y-2">
                        <Label htmlFor={`statement-${index}`}>
                          Statement {index + 1}
                        </Label>
                        <div className="flex gap-2 items-center">
                          <Input
                            id={`statement-${index}`}
                            placeholder={`Enter statement ${index + 1}...`}
                            value={statements[index]}
                            onChange={(e) => {
                              const newStatements: [string, string, string] = [...statements] as [string, string, string];
                              newStatements[index] = e.target.value;
                              setStatements(newStatements);
                            }}
                            disabled={isSubmitting}
                          />
                          <div className="flex items-center gap-2 whitespace-nowrap">
                            <RadioGroupItem value={index.toString()} id={`lie-${index}`} />
                            <Label htmlFor={`lie-${index}`} className="cursor-pointer">
                              This is the lie
                            </Label>
                          </div>
                        </div>
                      </div>
                    ))}
                  </RadioGroup>
                  <Button
                    onClick={handleSubmitStatements}
                    disabled={isSubmitting || statements.some(s => !s.trim()) || lieIndex === ''}
                    className="w-full"
                  >
                    Submit Statements
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Waiting for opponent to submit their statements...
                </div>
              )}
            </>
          )}

          {/* Guessing Phase */}
          {gameState.currentPhase === 'guessing' && (
            <>
              {isMyTurn ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Select which statement you think is the lie:
                  </p>
                  <RadioGroup value={guessedIndex} onValueChange={setGuessedIndex}>
                    {gameState.currentStatements?.map((statement, index) => (
                      <div key={index} className="flex items-start gap-2 p-3 border rounded-lg hover:bg-accent">
                        <RadioGroupItem value={index.toString()} id={`guess-${index}`} />
                        <Label htmlFor={`guess-${index}`} className="cursor-pointer flex-1">
                          {statement}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                  <Button
                    onClick={handleSubmitGuess}
                    disabled={isSubmitting || guessedIndex === ''}
                    className="w-full"
                  >
                    Submit Guess
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground mb-3">
                    Opponent is guessing which is the lie:
                  </p>
                  {gameState.currentStatements?.map((statement, index) => (
                    <div key={index} className="p-3 border rounded-lg bg-muted/50">
                      {statement}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Revealing Phase */}
          {gameState.currentPhase === 'revealing' && gameState.currentStatements && (
            <div className="space-y-3">
              {gameState.currentStatements.map((statement, index) => {
                const isLie = index === gameState.currentLieIndex;
                const wasGuessed = index === gameState.roundHistory[gameState.roundHistory.length - 1]?.guessedIndex;

                return (
                  <div
                    key={index}
                    className={`p-3 border rounded-lg ${
                      wasGuessed ? 'border-primary bg-primary/10' : ''
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {isLie ? (
                        <X className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                      ) : (
                        <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p>{statement}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {isLie ? '(LIE)' : '(Truth)'}
                          {wasGuessed && ' ← Guessed'}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="text-center pt-2">
                {gameState.roundHistory.length > 0 && (() => {
                  const lastRound = gameState.roundHistory[gameState.roundHistory.length - 1];
                  const wasCorrect = lastRound.correct;

                  if (lastRound.guesser === currentUserData?.user.id) {
                    return (
                      <p className={`font-medium ${wasCorrect ? 'text-green-600' : 'text-destructive'}`}>
                        {wasCorrect ? '🎉 Correct! +1 point' : '❌ Incorrect! Opponent +1 point'}
                      </p>
                    );
                  } else {
                    return (
                      <p className={`font-medium ${wasCorrect ? 'text-destructive' : 'text-green-600'}`}>
                        {wasCorrect ? '❌ They guessed correctly! Opponent +1 point' : '🎉 You fooled them! +1 point'}
                      </p>
                    );
                  }
                })()}
                <p className="text-sm text-muted-foreground mt-2">
                  {gameState.turnNumber >= 6 ? 'Game Over!' : 'Next round starting...'}
                </p>
              </div>
            </div>
          )}

          {/* Turn Progress */}
          <div className="text-xs text-muted-foreground text-center pt-2 border-t">
            Turn {gameState.turnNumber} of 6
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
