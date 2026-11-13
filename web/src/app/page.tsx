'use client';

import { useEffect, useReducer, useRef, useState } from 'react';
import { Action, Entry, Nav, emptyNav, navReducer } from '@/lib/nav';
import { Person, Via, getPeople, recordVisit, searchSites } from '@/lib/api';
import { PageFrame } from '@/components/PageFrame';
import { HistoryPanel } from '@/components/HistoryPanel';
import { PublishModal } from '@/components/PublishModal';

type Navs = Record<string, Nav>;
type Msg = { p: string; action: Action };
const navsReducer = (s: Navs, m: Msg): Navs => ({
  ...s,
  [m.p]: navReducer(s[m.p] ?? emptyNav, m.action),
});

export default function Browser() {
  const [people, setPeople] = useState<Person[]>([]);
  const [personId, setPersonId] = useState('');
  const [navs, dispatch] = useReducer(navsReducer, {});
  const [addr, setAddr] = useState('');
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showPublish, setShowPublish] = useState(false);
  const [hv, setHv] = useState(0); // bumps to refresh history
  const token = useRef(0);

  useEffect(() => {
    getPeople()
      .then((p) => {
        setPeople(p);
        setPersonId((cur) => cur || p[0]?._id || '');
      })
      .catch(() => setError('Cannot reach the API. Is it running on port 4000?'));
  }, []);

  const nav = navs[personId] ?? emptyNav;
  const entry: Entry | undefined = nav.entries[nav.index];

  useEffect(() => {
    setAddr(entry?.kind === 'page' ? entry.address ?? '' : '');
    setQ(entry?.kind === 'search' ? entry.query ?? '' : '');
  }, [entry?.id, personId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function go(raw: string, via: Via) {
    const text = raw.trim();
    if (!text || !personId) return;
    const my = ++token.current;
    setAddr(text);
    setLoading(true);
    setError(null);
    try {
      const r = await recordVisit(personId, text, via, crypto.randomUUID());
      if (my !== token.current) return;
      dispatch({
        p: personId,
        action: {
          t: 'push',
          entry: {
            id: crypto.randomUUID(),
            kind: 'page',
            address: r.address,
            found: r.found,
            snapshot: r.site ? { title: r.site.title, html: r.site.html } : undefined,
            scrollY: 0,
          },
        },
      });
      setAddr(r.address);
      setLoading(false);
      setHv((v) => v + 1);
    } catch (e) {
      if (my !== token.current) return;
      setError(e instanceof Error ? e.message : 'Something went wrong');
      setLoading(false);
    }
  }

  async function doSearch(text: string) {
    const query = text.trim();
    if (!query || !personId) return;
    const my = ++token.current;
    setLoading(true);
    setError(null);
    try {
      const results = await searchSites(query);
      if (my !== token.current) return;
      dispatch({
        p: personId,
        action: { t: 'push', entry: { id: crypto.randomUUID(), kind: 'search', query, results, scrollY: 0 } },
      });
      setLoading(false);
    } catch (e) {
      if (my !== token.current) return;
      setError(e instanceof Error ? e.message : 'Search failed');
      setLoading(false);
    }
  }

  function step(dir: 'back' | 'forward') {
    token.current++;
    setLoading(false);
    setError(null);
    const target = dir === 'back' ? nav.entries[nav.index - 1] : nav.entries[nav.index + 1];
    if (!target) return;
    dispatch({ p: personId, action: { t: dir } });
    if (target.kind === 'page' && target.address) {
      recordVisit(personId, target.address, dir, crypto.randomUUID())
        .then(() => setHv((v) => v + 1))
        .catch(() => {});
    }
  }

  function switchPerson(id: string) {
    token.current++;
    setLoading(false);
    setError(null);
    setPersonId(id);
  }

  return (
    <div className="app">
      <header className="chrome">
        <select value={personId} onChange={(e) => switchPerson(e.target.value)} aria-label="Browsing as">
          {people.map((p) => (
            <option key={p._id} value={p._id}>{p.name}</option>
          ))}
        </select>
        <button onClick={() => step('back')} disabled={nav.index <= 0} aria-label="Back">←</button>
        <button onClick={() => step('forward')} disabled={nav.index >= nav.entries.length - 1} aria-label="Forward">→</button>
        <form className="addr" onSubmit={(e) => { e.preventDefault(); go(addr, 'typed'); }}>
          <input value={addr} onChange={(e) => setAddr(e.target.value)} placeholder="Type an address, e.g. the-index.zz" spellCheck={false} />
          <button type="submit">Go</button>
        </form>
        <form className="srch" onSubmit={(e) => { e.preventDefault(); doSearch(q); }}>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search the web" />
          <button type="submit">Search</button>
        </form>
        <button onClick={() => setShowHistory((s) => !s)}>History</button>
        <button onClick={() => setShowPublish(true)}>Publish</button>
      </header>

      {error && <div className="banner">{error}</div>}
      {loading && <div className="banner info">Loading…</div>}

      <div className="body">
        <main className="viewport">
          {!entry && (
            <div className="blank">
              <h1>The small web</h1>
              <p>Type an address above, for example <code>the-index.zz</code>.</p>
            </div>
          )}
          {entry?.kind === 'page' && entry.found && entry.snapshot && (
            <PageFrame
              key={entry.id}
              html={entry.snapshot.html}
              scrollY={entry.scrollY}
              onLink={(href) => go(href, 'link')}
              onScroll={(y) => dispatch({ p: personId, action: { t: 'scroll', y } })}
            />
          )}
          {entry?.kind === 'page' && !entry.found && (
            <div className="nowhere">
              <h1>Nowhere</h1>
              <p>No site lives at <code>{entry.address}</code>.</p>
            </div>
          )}
          {entry?.kind === 'search' && (
            <div className="results">
              <h2>Results for “{entry.query}”</h2>
              {entry.results?.length === 0 && <p>No pages match.</p>}
              {entry.results?.map((r) => (
                <button key={r.address} className="hit" onClick={() => go(r.address, 'search')}>
                  <b>{r.title}</b>
                  <span>{r.address}</span>
                  <p>{r.snippet}</p>
                </button>
              ))}
            </div>
          )}
        </main>
        {showHistory && (
          <HistoryPanel
            personId={personId}
            refresh={hv}
            onJump={(a) => go(a, 'history')}
            onClose={() => setShowHistory(false)}
          />
        )}
      </div>

      {showPublish && (
        <PublishModal
          people={people}
          defaultAuthor={personId}
          onClose={() => setShowPublish(false)}
          onVisit={(a) => { setShowPublish(false); go(a, 'typed'); }}
        />
      )}
    </div>
  );
}