export function normalizeAddress(raw: string): string | null {
  let a = (raw ?? '').trim().toLowerCase();
  a = a.replace(/^zz:\/\//, '').split('#')[0].split('?')[0].replace(/\/+$/, '');
  return /^[a-z0-9]([a-z0-9-]{0,40}[a-z0-9])?\.zz$/.test(a) ? a : null;
}