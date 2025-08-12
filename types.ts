export enum GameState {
  SETUP = 'SETUP',
  IN_PROGRESS = 'IN_PROGRESS',
  INNINGS_BREAK = 'INNINGS_BREAK',
  FINISHED = 'FINISHED',
}

export enum DismissalType {
  BOWLED = 'Bowled',
  CAUGHT = 'Caught',
  LBW = 'LBW',
  RUN_OUT = 'Run Out',
  STUMPED = 'Stumped',
  HIT_WICKET = 'Hit Wicket',
  RETIRED_OUT = 'Retired Out',
  TIMED_OUT = 'Timed Out',
}

export interface Player {
  id: string;
  name: string;
}

export interface User extends Player {
    email: string;
    picture: string;
    driveConnected?: boolean;
}

export interface Batsman extends Player {
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  onStrike: boolean;
  out: boolean;
  dismissal?: Dismissal;
}

export interface Bowler extends Player {
  overs: number;
  balls: number;
  maidens: number;
  runsConceded: number;
  wickets: number;
}

export interface Dismissal {
  type: DismissalType;
  bowler: Player;
  fielder?: Player;
}

export interface FallOfWicket {
  score: number;
  overs: number;
  balls: number;
  player: Batsman;
}

export interface BallEvent {
  runs: number;
  isExtra: boolean;
  extraType?: 'Wd' | 'Nb' | 'B' | 'Lb';
  isWicket?: boolean;
  dismissal?: Dismissal;
  batsman: Player;
  bowler: Player;
}

export interface Innings {
  battingTeamId: string;
  bowlingTeamId: string;
  score: number;
  wickets: number;
  overs: number;
  balls: number;
  timeline: (string | number)[][]; // [["1", "Wd"], ["4"]]
  batsmen: Batsman[];
  bowlers: Bowler[];
  fallOfWickets: FallOfWicket[];
  extras: {
    wides: number;
    noBalls: number;
    byes: number;
    legByes: number;
    penalty: number;
  };
  currentStrikerId: string;
  currentNonStrikerId: string;
  currentBowlerId: string;
}

export interface Team {
  id: string;
  name: string;
  players: Player[];
}

export interface MatchState {
  id: string;
  gameState: GameState;
  team1: Team;
  team2: Team;
  maxOvers: number;
  innings: (Innings | Partial<Innings>)[];
  currentInnings: 1 | 2;
  toss: {
    winnerId: string;
    decision: 'BAT' | 'BOWL';
  };
  target: number | null;
  targetOvers: number | null;
  isChaseOnly?: boolean;
  manOfTheMatchId?: string;
}