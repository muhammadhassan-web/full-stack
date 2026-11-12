export type Entry = {
  id: string;
  kind: 'page' | 'search';
  address?: string;
  query?: string;
  found?: boolean;
  snapshot?: { title: string; html: string };
  results?: { address: string; title: string; snippet: string }[];
  scrollY: number;
};

export type Nav = { entries: Entry[]; index: number };

export const emptyNav: Nav = { entries: [], index: -1 };

export type Action =
  | { t: 'push'; entry: Entry }
  | { t: 'back' }
  | { t: 'forward' }
  | { t: 'scroll'; y: number };

export function navReducer(s: Nav, a: Action): Nav {
  switch (a.t) {
    case 'push': {
      const cur = s.entries[s.index];
      if (
        cur &&
        cur.kind === a.entry.kind &&
        cur.address === a.entry.address &&
        cur.query === a.entry.query
      ) {
        return s; // same place: no duplicate entry
      }
      const entries = [...s.entries.slice(0, s.index + 1), a.entry]; // forward is lost here
      return { entries, index: entries.length - 1 };
    }
    case 'back':
      return s.index > 0 ? { ...s, index: s.index - 1 } : s;
    case 'forward':
      return s.index < s.entries.length - 1 ? { ...s, index: s.index + 1 } : s;
    case 'scroll':
      if (s.index < 0) return s;
      return {
        ...s,
        entries: s.entries.map((e, i) => (i === s.index ? { ...e, scrollY: a.y } : e)),
      };
  }
}