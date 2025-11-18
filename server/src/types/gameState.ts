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