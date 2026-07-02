import type { Status } from './types';

const LABELS: Record<Status, string> = {
  available: 'Available',
  licensed: 'Licensed',
  upcoming: 'Upcoming',
};

export function StatusBadge({ status }: { status: Status }) {
  return <span className={`badge badge-${status}`}>{LABELS[status]}</span>;
}
