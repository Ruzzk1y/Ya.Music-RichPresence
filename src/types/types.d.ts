export interface ElectronWindowPosition {
  x: number;
  y: number;
}

export interface PlayerStatus {
  title: string;
  album_title: string;
  artists: string[];
  playlist_title: string;
  progress: number;
  isPlaying: boolean;
  __DRP: boolean;
}

export interface DiscordRichPresence {
  state?: string;
  details?: string;

  largeImageKey?: string;
  largeImageText?: string;

  smallImageKey?: string;
  smallImageText?: string;

  startTimestamp?: number;
  endTimestamp?: number;

  instance?: boolean;
}
