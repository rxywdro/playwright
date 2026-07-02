import { useState } from 'react';
import type { FormEvent } from 'react';
import type { Song } from './types';
import { createSong } from './api';

export function AddSongForm({ onDone, onCancel }: { onDone: (song: Song) => void; onCancel: () => void }) {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [genre, setGenre] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const song = await createSong({ title, artist, genre: genre || undefined });
      onDone(song);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add song');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="panel-form" onSubmit={handleSubmit}>
      <h3>Add a song</h3>
      {error && <p className="form-error">{error}</p>}
      <div className="form-row">
        <label>
          Title
          <input value={title} onChange={e => setTitle(e.target.value)} required />
        </label>
        <label>
          Artist
          <input value={artist} onChange={e => setArtist(e.target.value)} required />
        </label>
        <label>
          Genre
          <input value={genre} onChange={e => setGenre(e.target.value)} placeholder="optional" />
        </label>
      </div>
      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Saving…' : 'Add song'}
        </button>
      </div>
    </form>
  );
}
