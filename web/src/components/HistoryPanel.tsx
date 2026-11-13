'use client';
import { useEffect, useState } from 'react';
import { HistoryItem, getHistory } from '@/lib/api';

export function HistoryPanel({
  personId,
  refresh,
  onJump,
  onClose,
}: {
  personId: string;
  refresh: number;
  onJump: (address: string) => void;
  onClose: () => void;
}) {
  const [items, setItems] = useState<HistoryItem[]>([]);
  useEffect(() => {
    if (!personId) return;
    getHistory(personId).then((r) => setItems(r.items)).catch(() => setItems([]));
  }, [personId, refresh]);

  return (
    <aside className="side">
      <div className="sidehead">
        <b>History</b>
        <button onClick={onClose}>✕</button>
      </div>
      {items.length === 0 && <p className="muted">Nothing yet.</p>}
      {items.map((v) => (
        <button
          key={v.visitId}
          className={'hrow' + (v.found ? '' : ' dead')}
          onClick={() => onJump(v.address)}
        >
          <span>{v.address}</span>
          <small>
            {v.via} · {new Date(v.at).toLocaleString()}
          </small>
        </button>
      ))}
    </aside>
  );
}