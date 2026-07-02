import { useEffect, useState } from 'react';
import type { Song, Status } from './types';
import { fetchSongs } from './api';
import { StatusBadge } from './StatusBadge';
import { AddSongForm } from './AddSongForm';
import { AddContractForm } from './AddContractForm';
import './App.css';

type Filter = Status | 'all';

const TABS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'available', label: 'Available' },
  { key: 'licensed', label: 'Licensed' },
  { key: 'upcoming', label: 'Upcoming' },
];

function detailText(song: Song): string {
  if (song.status === 'licensed' && song.activeContract)
    return `Locked until ${song.activeContract.end_date} · ${song.activeContract.licensor}`;
  if (song.status === 'upcoming' && song.nextContract)
    return `Starts ${song.nextContract.start_date} · ${song.nextContract.licensor}`;
  if (song.status === 'available' && song.lastContract)
    return `Contract expired ${song.lastContract.end_date} · ${song.lastContract.licensor}`;
  return 'Never licensed';
}

export default function App() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [today, setToday] = useState('');
  const [filter, setFilter] = useState<Filter>('available');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddSong, setShowAddSong] = useState(false);
  const [contractFormSongId, setContractFormSongId] = useState<number | null>(null);

  function load() {
    setLoading(true);
    setError(null);
    fetchSongs({ status: filter, q: query })
      .then(res => {
        setSongs(res.songs);
        setToday(res.today);
      })
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to load songs'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    const handle = setTimeout(load, 200);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, query]);

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <h1>Song Contract Tracker</h1>
          <p className="subtitle">
            Find songs whose license has expired and are free to use. {today && `Today: ${today}`}
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowAddSong(v => !v)}>
          {showAddSong ? 'Close' : '+ Add song'}
        </button>
      </header>

      {showAddSong && (
        <AddSongForm
          onCancel={() => setShowAddSong(false)}
          onDone={() => {
            setShowAddSong(false);
            load();
          }}
        />
      )}

      <nav className="tabs">
        {TABS.map(tab => (
          <button
            key={tab.key}
            className={`tab ${filter === tab.key ? 'tab-active' : ''}`}
            onClick={() => setFilter(tab.key)}
          >
            {tab.label}
          </button>
        ))}
        <input
          className="search"
          placeholder="Search title or artist…"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </nav>

      {error && <p className="form-error">{error}</p>}
      {loading && <p className="muted">Loading…</p>}

      {!loading && songs.length === 0 && !error && (
        <p className="muted">No songs match this view.</p>
      )}

      <ul className="song-list">
        {songs.map(song => (
          <li key={song.id} className="song-card">
            <div className="song-main">
              <div>
                <div className="song-title">{song.title}</div>
                <div className="song-artist">
                  {song.artist}
                  {song.genre && <span className="genre"> · {song.genre}</span>}
                </div>
              </div>
              <StatusBadge status={song.status} />
            </div>
            <div className="song-detail">{detailText(song)}</div>
            <div className="song-actions">
              <button
                className="btn-link"
                onClick={() => setContractFormSongId(id => (id === song.id ? null : song.id))}
              >
                {contractFormSongId === song.id ? 'Cancel' : 'Add contract'}
              </button>
            </div>
            {contractFormSongId === song.id && (
              <AddContractForm
                song={song}
                onCancel={() => setContractFormSongId(null)}
                onDone={() => {
                  setContractFormSongId(null);
                  load();
                }}
              />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
