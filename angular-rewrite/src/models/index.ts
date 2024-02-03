export interface PlayerInfo {
  steamID64?: string;
  avatarLink?: string;
  profileLink?: string;
  lastPlayWith?: Date;
  matches?: string[];
}

export interface MatchInfo {
  id?: string;
  map?: string;
  replayLink?: string;
  playersSteamID64?: string[];
}

export interface Database {
  apiKey?: string;
  players?: PlayerInfo[];
  matches?: MatchInfo[];
}
