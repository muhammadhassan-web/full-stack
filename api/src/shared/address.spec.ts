import { normalizeAddress as n } from './address';

describe('normalizeAddress', () => {
  it('lowercases', () => expect(n('TidePool.ZZ')).toBe('tidepool.zz'));
  it('strips zz:// prefix', () => expect(n('zz://tidepool.zz')).toBe('tidepool.zz'));
  it('strips trailing slash', () => expect(n('tidepool.zz/')).toBe('tidepool.zz'));
  it('strips fragment', () => expect(n('tidepool.zz#top')).toBe('tidepool.zz'));
  it('trims spaces', () => expect(n('  tidepool.zz ')).toBe('tidepool.zz'));
  it('rejects http links', () => expect(n('http://x.com')).toBeNull());
  it('rejects empty', () => expect(n('')).toBeNull());
  it('rejects double dots', () => expect(n('a..zz')).toBeNull());
  it('rejects inner spaces', () => expect(n('a b.zz')).toBeNull());
});