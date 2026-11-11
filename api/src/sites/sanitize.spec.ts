import { sanitizeHtml, toText } from './sanitize';

const hostile: Record<string, string> = {
  script: '<p>hi</p><script>alert(1)</script>',
  onerror: '<img src=x onerror=alert(1)>',
  jsLink: '<a href="javascript:alert(1)">x</a>',
  iframe: '<iframe src="//evil.example"></iframe>',
  metaRefresh: '<meta http-equiv="refresh" content="0;url=//evil.example">',
  svg: '<svg onload=alert(1)></svg>',
  form: '<form action="//evil.example"><input name=a></form>',
  onclick: '<p onclick="alert(1)">x</p>',
};

describe('sanitizeHtml', () => {
  it.each(Object.entries(hostile))('neutralises %s', (_name, payload) => {
    const out = sanitizeHtml(payload).toLowerCase();
    for (const bad of ['<script', 'onerror', 'onload', 'onclick', 'javascript:', '<iframe', '<meta', '<svg', '<form', '<img', '<input']) {
      expect(out).not.toContain(bad);
    }
  });

  it('keeps normal prose and zz links', () => {
    const out = sanitizeHtml('<h1>Tides</h1><p>See <a href="tidepool.zz">pool</a></p>');
    expect(out).toContain('<h1>Tides</h1>');
    expect(out).toContain('href="tidepool.zz"');
  });

  it('drops http links', () => {
    expect(sanitizeHtml('<a href="http://evil.example">x</a>')).not.toContain('http');
  });

  it('keeps style (it is contained by the iframe and CSP)', () => {
    expect(sanitizeHtml('<p style="color:red">x</p>')).toContain('style=');
  });

  it('extracts plain text for search', () => {
    expect(toText('<h1>Hello</h1><p>big   world</p>')).toBe('Hellobig world');
  });
});