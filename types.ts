
export interface Round {
  id: string;
  pointsA: number;
  pointsB: number;
  timestamp: number;
}

export interface GameState {
  teamAName: string;
  teamBName: string;
  rounds: Round[];
  winningScore: number;
}

export type Team = 'A' | 'B';

export interface AIAnalysis {
  summary: string;
  prediction: string;
  tips: string[];
}
