export type Status = 'available' | 'licensed' | 'upcoming';

export interface Contract {
  id: number;
  song_id: number;
  licensor: string;
  start_date: string;
  end_date: string;
  notes: string | null;
}

export interface Song {
  id: number;
  title: string;
  artist: string;
  genre: string | null;
  status: Status;
  activeContract: Contract | null;
  nextContract: Contract | null;
  lastContract: Contract | null;
  contracts: Contract[];
}

export interface SongsResponse {
  today: string;
  songs: Song[];
}
