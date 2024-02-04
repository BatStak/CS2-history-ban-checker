export interface PlayerInfo {
  steamID64: string;
  name?: string;
  profileLink?: string;
  avatarLink?: string;
  lastPlayWith?: string;
  matches: string[];
}

export interface TeamInfo {
  playersSteamID64: string[];
  score?: number;
  win?: number;
}

export interface MatchInfo {
  id?: string;
  map?: string;
  format?: MatchFormat;
  overtime?: boolean;
  finished?: boolean;
  teamA?: TeamInfo;
  teamB?: TeamInfo;
  replayLink?: string;
  playersSteamID64: string[];
}

export interface Database {
  apiKey?: string;
  players?: PlayerInfo[];
  matches?: MatchInfo[];
}

export enum MatchFormat {
  MR24 = 'MR24',
  MR16 = 'MR16',
}

/**
 * This is from Steam API Results
 */
export interface BanInfo {
  CommunityBanned: boolean;
  DaysSinceLastBan: boolean;
  EconomyBan: string;
  NumberOfGameBans: number;
  NumberOfVACBans: number;
  SteamId: string;
  VACBanned: boolean;
}
