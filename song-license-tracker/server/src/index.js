import express from 'express';
import cors from 'cors';
import { db } from './db.js';
import { computeSongStatus, todayISO } from './status.js';

const app = express();
app.use(cors());
app.use(express.json());

const selectSongs = db.prepare('SELECT * FROM songs ORDER BY title COLLATE NOCASE');
const selectSong = db.prepare('SELECT * FROM songs WHERE id = ?');
const selectContractsForSong = db.prepare(
  'SELECT * FROM contracts WHERE song_id = ? ORDER BY start_date DESC'
);
const insertSong = db.prepare('INSERT INTO songs (title, artist, genre) VALUES (?, ?, ?)');
const insertContract = db.prepare(
  'INSERT INTO contracts (song_id, licensor, start_date, end_date, notes) VALUES (?, ?, ?, ?, ?)'
);

function hydrateSong(song) {
  const contracts = selectContractsForSong.all(song.id);
  const { status, activeContract, nextContract, lastContract } = computeSongStatus(contracts);
  return { ...song, status, activeContract, nextContract, lastContract, contracts };
}

app.get('/api/songs', (req, res) => {
  const { status, q } = req.query;
  let songs = selectSongs.all().map(hydrateSong);

  if (status && status !== 'all')
    songs = songs.filter(s => s.status === status);

  if (q) {
    const needle = String(q).toLowerCase();
    songs = songs.filter(
      s => s.title.toLowerCase().includes(needle) || s.artist.toLowerCase().includes(needle)
    );
  }

  res.json({ today: todayISO(), songs });
});

app.get('/api/songs/:id', (req, res) => {
  const song = selectSong.get(req.params.id);
  if (!song)
    return res.status(404).json({ error: 'Song not found' });
  res.json(hydrateSong(song));
});

app.post('/api/songs', (req, res) => {
  const { title, artist, genre } = req.body || {};
  if (!title || !artist)
    return res.status(400).json({ error: 'title and artist are required' });

  const result = insertSong.run(title, artist, genre || null);
  const song = selectSong.get(Number(result.lastInsertRowid));
  res.status(201).json(hydrateSong(song));
});

app.post('/api/songs/:id/contracts', (req, res) => {
  const song = selectSong.get(req.params.id);
  if (!song)
    return res.status(404).json({ error: 'Song not found' });

  const { licensor, startDate, endDate, notes } = req.body || {};
  if (!licensor || !startDate || !endDate)
    return res.status(400).json({ error: 'licensor, startDate and endDate are required' });
  if (startDate > endDate)
    return res.status(400).json({ error: 'startDate must be before endDate' });

  insertContract.run(song.id, licensor, startDate, endDate, notes || null);
  res.status(201).json(hydrateSong(song));
});

app.get('/api/stats', (req, res) => {
  const songs = selectSongs.all().map(hydrateSong);
  const stats = { total: songs.length, available: 0, licensed: 0, upcoming: 0 };
  for (const s of songs)
    stats[s.status]++;
  res.json(stats);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Song license tracker API listening on http://localhost:${PORT}`);
});
