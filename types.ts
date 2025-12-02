export interface Metadata {
  title: string;
  artist: string;
  album: string;
  year: string;
  genre: string;
  lyrics: string;
  trackNumber: string;
}

export interface CoverArt {
  url: string; // Blob URL or Base64 for display
  file: Blob | null; // Actual file for writing
  mimeType: string;
}

export enum AppStatus {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  READY = 'READY',
  ERROR = 'ERROR'
}

export type ProcessingStage = 'reading' | 'generating_metadata' | 'generating_art' | 'writing' | null;