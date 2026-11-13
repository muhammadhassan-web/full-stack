export type Person = { _id: string; name: string };
export type Via = 'typed' | 'link' | 'back' | 'forward' | 'history' | 'search';
export type VisitResult = {
  found: boolean;
  address: string;
  site: { address: string; title: string; html: string } | null;
};
export type HistoryItem = { visitId: string; address: string; at: string; via: string; found: boolean };
export type SearchHit = { address: string; title: string; snippet: string };

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let msg = res.statusText;
    try {
      const b = await res.json();
      msg = Array.isArray(b.message) ? b.message.join(', ') : b.message ?? msg;
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export const getPeople = () => fetch('/api/people').then((r) => json<Person[]>(r));

export const recordVisit = (personId: string, address: string, via: Via, visitId: string) =>
  fetch(`/api/people/${personId}/visits`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address, via, visitId }),
  }).then((r) => json<VisitResult>(r));

export const getHistory = (personId: string) =>
  fetch(`/api/people/${personId}/history?limit=100`).then((r) =>
    json<{ items: HistoryItem[]; nextCursor: string | null }>(r),
  );

export const searchSites = (q: string) =>
  fetch(`/api/search?q=${encodeURIComponent(q)}`).then((r) => json<SearchHit[]>(r));

export const publishSite = (b: { address: string; title: string; html: string; authorId: string }) =>
  fetch('/api/sites', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(b),
  }).then((r) => json<{ address: string; title: string }>(r));