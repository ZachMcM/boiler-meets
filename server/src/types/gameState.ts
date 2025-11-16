export interface HeadsupGameState {
  turnNumber: number;
  currentTurn: string;
  turnOverTime: number;
  numCorrect: number;
  item: string;
  previousItemIndexes: number[],
}