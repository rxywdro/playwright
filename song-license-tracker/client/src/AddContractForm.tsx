import { useState } from 'react';
import type { FormEvent } from 'react';
import type { Song } from './types';
import { addContract } from './api';

export function AddContractForm({
  song,
  onDone,
  onCancel,
}: {
  song: Song;
  onDone: (song: Song) => void;
  onCancel: () => void;
}) {
  const [licensor, setLicensor] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const updated = await addContract(song.id, { licensor, startDate, endDate, notes });
      onDone(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add contract');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="panel-form" onSubmit={handleSubmit}>
      <h3>Add contract for “{song.title}”</h3>
      {error && <p className="form-error">{error}</p>}
      <label>
        Licensor
        <input value={licensor} onChange={e => setLicensor(e.target.value)} required />
      </label>
      <div className="form-row">
        <label>
          Start date
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required />
        </label>
        <label>
          End date
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required />
        </label>
      </div>
      <label>
        Notes
        <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="optional" />
      </label>
      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Saving…' : 'Save contract'}
        </button>
      </div>
    </form>
  );
}
