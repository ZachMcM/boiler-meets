export interface HeadsupGameState {
  turnNumber: number;
  currentTurn: string;
  turnOverTime: number;
  numCorrect: number;
  item: string;
  previousItemIndexes: number[],
}

export interface TicTacToeGameState {
  board: ('X' | 'O' | null)[];
  currentTurn: string;
  playerX: string;
  playerO: string;
  winner: string | null;
  turnNumber: number;
}

export interface TwoTruthsGameState {
  // Turn tracking
  turnNumber: number;           // 1-6 (6 total turns)
  roundNumber: number;          // 1-3 (calculated: Math.ceil(turnNumber / 2))
  currentPhase: 'submitting' | 'guessing' | 'revealing';
  currentTurn: string;          // userId of player who should act

  // Player identification
  player1: string;              // userId (submits on odd turns)
  player2: string;              // userId (submits on even turns)

  // Scoring
  scores: {
    [userId: string]: number;   // 0-6 points max
  };

  // Current round data
  currentStatements: string[] | null;  // [statement1, statement2, statement3]
  currentLieIndex: number | null;      // 0-2, index of the lie
  currentSubmitter: string | null;     // userId who submitted current statements

  // History tracking (for end-game display)
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