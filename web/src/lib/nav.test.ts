import { describe, it, expect } from 'vitest';
import { navReducer, emptyNav, Entry, Nav } from './nav';

const page = (address: string, extra: Partial<Entry> = {}): Entry => ({
  id: address, kind: 'page', address, found: true, scrollY: 0, ...extra,
});
const push = (s: Nav, e: Entry) => navReducer(s, { t: 'push', entry: e });
const build = (...addrs: string[]) => addrs.reduce((s, a) => push(s, page(a)), emptyNav);

describe('navReducer', () => {
  it('push into empty sets index 0', () => {
    const s = build('a.zz');
    expect(s.index).toBe(0);
    expect(s.entries).toHaveLength(1);
  });
  it('push appends and moves index to the end', () => {
    const s = build('a.zz', 'b.zz', 'c.zz');
    expect(s.index).toBe(2);
  });
  it('back moves index down by one', () => {
    const s = navReducer(build('a.zz', 'b.zz'), { t: 'back' });
    expect(s.index).toBe(0);
  });
  it('back at the start is a no-op', () => {
    const s = build('a.zz');
    expect(navReducer(s, { t: 'back' })).toBe(s);
  });
  it('forward at the end is a no-op', () => {
    const s = build('a.zz', 'b.zz');
    expect(navReducer(s, { t: 'forward' })).toBe(s);
  });
  it('back then forward returns to the same entry', () => {
    const s0 = build('a.zz', 'b.zz', 'c.zz');
    const s = navReducer(navReducer(s0, { t: 'back' }), { t: 'forward' });
    expect(s.entries[s.index].address).toBe('c.zz');
  });
  it('back, back, forward lands on the middle entry', () => {
    let s = build('a.zz', 'b.zz', 'c.zz');
    s = navReducer(s, { t: 'back' });
    s = navReducer(s, { t: 'back' });
    s = navReducer(s, { t: 'forward' });
    expect(s.entries[s.index].address).toBe('b.zz');
  });
  it('pushing after back throws away the forward entries', () => {
    let s = build('a.zz', 'b.zz', 'c.zz');
    s = navReducer(s, { t: 'back' });
    s = push(s, page('d.zz'));
    expect(s.entries.map((e) => e.address)).toEqual(['a.zz', 'b.zz', 'd.zz']);
    expect(navReducer(s, { t: 'forward' })).toBe(s); // forward is lost
  });
  it('pushing the current address again does not add a duplicate', () => {
    const s = build('a.zz', 'b.zz');
    expect(push(s, page('b.zz'))).toBe(s);
  });
  it('same address later in the trail is still a new entry', () => {
    const s = build('a.zz', 'b.zz', 'a.zz');
    expect(s.entries).toHaveLength(3);
  });
  it('scroll only changes the current entry', () => {
    let s = build('a.zz', 'b.zz');
    s = navReducer(s, { t: 'scroll', y: 420 });
    expect(s.entries[1].scrollY).toBe(420);
    expect(s.entries[0].scrollY).toBe(0);
  });
  it('scroll saved on an entry survives going back and returning', () => {
    let s = build('a.zz', 'b.zz');
    s = navReducer(s, { t: 'scroll', y: 300 });
    s = navReducer(s, { t: 'back' });
    s = navReducer(s, { t: 'forward' });
    expect(s.entries[s.index].scrollY).toBe(300);
  });
  it('back and forward keep the snapshot untouched', () => {
    const snap = { title: 'A', html: '<p>a</p>' };
    let s = push(emptyNav, page('a.zz', { snapshot: snap }));
    s = push(s, page('b.zz'));
    s = navReducer(s, { t: 'back' });
    expect(s.entries[s.index].snapshot).toBe(snap);
  });
  it('a search entry sits in the stack, so Back returns to the results', () => {
    let s = build('a.zz');
    s = push(s, { id: 's1', kind: 'search', query: 'salt', scrollY: 0, results: [] });
    s = push(s, page('salt-and-smoke.zz'));
    s = navReducer(s, { t: 'back' });
    expect(s.entries[s.index].kind).toBe('search');
    expect(s.entries[s.index].query).toBe('salt');
  });
});