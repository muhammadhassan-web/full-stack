import { Controller, Get, Query } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Site } from '../sites/site.schema';

function makeSnippet(text: string, q: string): string {
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  const lower = text.toLowerCase();
  let at = -1;
  for (const w of words) {
    const i = lower.indexOf(w);
    if (i !== -1 && (at === -1 || i < at)) at = i;
  }
  if (at === -1) return text.slice(0, 160);
  const start = Math.max(0, at - 70);
  const end = Math.min(text.length, at + 110);
  return (start > 0 ? '…' : '') + text.slice(start, end) + (end < text.length ? '…' : '');
}

@Controller('search')
export class SearchController {
  constructor(@InjectModel(Site.name) private sites: Model<Site>) {}

  @Get()
  async search(@Query('q') raw = '') {
    const q = raw.trim().slice(0, 100);
    if (!q) return [];
    const docs: any[] = await this.sites
      .find({ $text: { $search: q } }, { score: { $meta: 'textScore' }, address: 1, title: 1, text: 1 })
      .sort({ score: { $meta: 'textScore' } })
      .limit(20)
      .lean();
    // Plain text only: the client renders it as text, never as HTML.
    return docs.map((d) => ({
      address: d.address,
      title: d.title,
      snippet: makeSnippet(d.text, q),
      score: d.score,
    }));
  }
}