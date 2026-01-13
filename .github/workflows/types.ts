export interface Member {
  id: string;
  nickname: string;
  role: string;
  roleColor: string; // Tailwind color class for border/text
  avatarUrl: string;
  stats?: {
    kd: number;
    headshotRate: string;
  };
}

export interface Tournament {
  id: string;
  name: string;
  date: string;
  position: string;
  prize?: string;
}

export interface ClanStats {
  matchesPlayed: number;
  matchesWon: number;
  tournamentsWon: number;
  level: number;
}