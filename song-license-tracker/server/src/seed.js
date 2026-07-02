import { db } from './db.js';

function isoDaysFromNow(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

db.exec('DELETE FROM contracts');
db.exec('DELETE FROM songs');
db.exec("DELETE FROM sqlite_sequence WHERE name IN ('songs', 'contracts')");

const insertSong = db.prepare('INSERT INTO songs (title, artist, genre) VALUES (?, ?, ?)');
const insertContract = db.prepare(
  'INSERT INTO contracts (song_id, licensor, start_date, end_date, notes) VALUES (?, ?, ?, ?, ?)'
);

const songs = [
  { title: 'Neon Skyline', artist: 'The Midnight Owls', genre: 'Synthwave' },
  { title: 'Gravel Road', artist: 'Wren Callahan', genre: 'Folk' },
  { title: 'Static Bloom', artist: 'Kelsi Vane', genre: 'Indie Pop' },
  { title: 'Ashwood', artist: 'Ravenport', genre: 'Ambient' },
  { title: 'Concrete Garden', artist: 'The Midnight Owls', genre: 'Synthwave' },
  { title: 'Low Tide', artist: 'Marisol Ortega', genre: 'R&B' },
  { title: 'Paper Lantern', artist: 'Kelsi Vane', genre: 'Indie Pop' },
  { title: 'Iron & Ivy', artist: 'Dustbowl Prophets', genre: 'Country Rock' },
  { title: 'Halflight', artist: 'Ravenport', genre: 'Ambient' },
  { title: 'Borrowed Time', artist: 'Wren Callahan', genre: 'Folk' },
  { title: 'Echo Chamber', artist: 'Static & Sable', genre: 'Electronic' },
  { title: 'Salt & Cedar', artist: 'Marisol Ortega', genre: 'R&B' },
];

const songIds = songs.map(s => {
  const result = insertSong.run(s.title, s.artist, s.genre);
  return Number(result.lastInsertRowid);
});

const contracts = [
  // Expired -> available to use
  { song: 0, licensor: 'Harbor Light Music', start: -700, end: -30, notes: 'One-year sync license, not renewed.' },
  { song: 1, licensor: 'Dustbowl Publishing', start: -900, end: -200, notes: '' },
  { song: 2, licensor: 'Kelsi Vane Music LLC', start: -400, end: -1, notes: 'Expired yesterday.' },
  { song: 5, licensor: 'Ortega Sound Rights', start: -1000, end: -365, notes: '' },
  // Currently active -> still locked
  { song: 3, licensor: 'Ravenport Records', start: -100, end: 265, notes: 'Two-year exclusive placement license.' },
  { song: 4, licensor: 'Harbor Light Music', start: -30, end: 335, notes: '' },
  { song: 7, licensor: 'Prophets Music Group', start: -10, end: 355, notes: 'Renewed early.' },
  // Upcoming -> not yet started
  { song: 8, licensor: 'Ravenport Records', start: 30, end: 395, notes: 'Signed, starts next month.' },
  // Multiple contracts, most recent expired -> available
  { song: 9, licensor: 'Wren Callahan Music', start: -800, end: -500, notes: 'First term.' },
  { song: 9, licensor: 'Wren Callahan Music', start: -400, end: -60, notes: 'Renewal term, also lapsed.' },
  // Song 10 (Echo Chamber) and song 11 (Salt & Cedar) intentionally have no contracts -> available, never licensed
];

for (const c of contracts) {
  insertContract.run(
    songIds[c.song],
    c.licensor,
    isoDaysFromNow(c.start),
    isoDaysFromNow(c.end),
    c.notes
  );
}

console.log(`Seeded ${songs.length} songs and ${contracts.length} contracts.`);
