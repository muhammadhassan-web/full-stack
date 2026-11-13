'use client';
import { useState } from 'react';
import { Person, publishSite } from '@/lib/api';

export function PublishModal({
  people,
  defaultAuthor,
  onClose,
  onVisit,
}: {
  people: Person[];
  defaultAuthor: string;
  onClose: () => void;
  onVisit: (address: string) => void;
}) {
  const [address, setAddress] = useState('');
  const [title, setTitle] = useState('');
  const [html, setHtml] = useState('<h1>My site</h1>\n<p>Hello from the small web.</p>');
  const [authorId, setAuthorId] = useState(defaultAuthor);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const r = await publishSite({ address, title, html, authorId });
      setDone(r.address);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="modalbg">
      <form className="modal" onSubmit={submit}>
        <h2>Publish a site</h2>
        {done ? (
          <>
            <p>
              Published <code>{done}</code>.
            </p>
            <button type="button" onClick={() => onVisit(done)}>Visit it</button>{' '}
            <button type="button" onClick={onClose}>Close</button>
          </>
        ) : (
          <>
            <label>Address<input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="mysite.zz" /></label>
            <label>Title<input value={title} onChange={(e) => setTitle(e.target.value)} /></label>
            <label>Author
              <select value={authorId} onChange={(e) => setAuthorId(e.target.value)}>
                {people.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
              </select>
            </label>
            <label>HTML<textarea rows={8} value={html} onChange={(e) => setHtml(e.target.value)} /></label>
            {error && <div className="banner">{error}</div>}
            <button type="submit" disabled={busy}>Publish</button>{' '}
            <button type="button" onClick={onClose}>Cancel</button>
          </>
        )}
      </form>
    </div>
  );
}