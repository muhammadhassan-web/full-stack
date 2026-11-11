import { JSDOM } from 'jsdom';
import createDOMPurify from 'dompurify';

const purify = createDOMPurify(new JSDOM('').window as any);

// Layer 1b: only relative or zz:// links survive; any other scheme is dropped.
purify.addHook('afterSanitizeAttributes', (node: any) => {
  if (node.tagName === 'A') {
    const href = (node.getAttribute('href') || '').trim();
    if (/^[a-z][a-z0-9+.-]*:/i.test(href) && !/^zz:/i.test(href)) {
      node.removeAttribute('href');
    }
  }
});

export function sanitizeHtml(dirty: string): string {
  return purify.sanitize(dirty, {
    FORBID_TAGS: [
      'script', 'iframe', 'object', 'embed', 'form', 'meta', 'link', 'base',
      'img', 'svg', 'math', 'video', 'audio', 'input', 'button', 'textarea', 'select',
    ],
    FORBID_ATTR: ['target', 'src', 'srcset', 'action', 'formaction'],
    ALLOW_DATA_ATTR: false,
  }) as unknown as string;
}

export function toText(html: string): string {
  const doc = new JSDOM(html).window.document;
  return (doc.body.textContent ?? '').replace(/\s+/g, ' ').trim();
}