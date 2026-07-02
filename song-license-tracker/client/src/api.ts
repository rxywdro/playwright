import type { Song, SongsResponse, Status } from './types';

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export function fetchSongs(params: { status?: Status | 'all'; q?: string } = {}): Promise<SongsResponse> {
  const search = new URLSearchParams();
  if (params.status && params.status !== 'all')
    search.set('status', params.status);
  if (params.q)
    search.set('q', params.q);
  const qs = search.toString();
  return fetch(`/api/songs${qs ? `?${qs}` : ''}`).then(res => json<SongsResponse>(res));
}

export function createSong(data: { title: string; artist: string; genre?: string }): Promise<Song> {
  return fetch('/api/songs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(res => json<Song>(res));
}

export function addContract(
  songId: number,
  data: { licensor: string; startDate: string; endDate: string; notes?: string }
): Promise<Song> {
  return fetch(`/api/songs/${songId}/contracts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(res => json<Song>(res));
}
