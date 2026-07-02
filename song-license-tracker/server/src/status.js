export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

// Given a song's contracts (each with start_date/end_date as 'YYYY-MM-DD'),
// figure out whether the song is free to use right now.
export function computeSongStatus(contracts, today = todayISO()) {
  const active = contracts.find(c => c.start_date <= today && c.end_date >= today);
  if (active)
    return { status: 'licensed', activeContract: active, nextContract: null, lastContract: null };

  const upcoming = contracts
    .filter(c => c.start_date > today)
    .sort((a, b) => a.start_date.localeCompare(b.start_date))[0];
  if (upcoming)
    return { status: 'upcoming', activeContract: null, nextContract: upcoming, lastContract: null };

  const past = contracts
    .filter(c => c.end_date < today)
    .sort((a, b) => b.end_date.localeCompare(a.end_date))[0] || null;
  return { status: 'available', activeContract: null, nextContract: null, lastContract: past };
}
