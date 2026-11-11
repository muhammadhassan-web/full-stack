import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Visit } from './visit.schema';
import { Site } from '../sites/site.schema';
import { Person } from '../people/person.schema';
import { normalizeAddress } from '../shared/address';
import { CreateVisitDto } from './create-visit.dto';

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

@Injectable()
export class VisitsService {
  constructor(
    @InjectModel(Visit.name) private visits: Model<Visit>,
    @InjectModel(Site.name) private sites: Model<Site>,
    @InjectModel(Person.name) private people: Model<Person>,
  ) {}

  async record(personId: string, dto: CreateVisitDto) {
    if (!(await this.people.exists({ _id: personId }))) throw new NotFoundException('Unknown person');

    const address = normalizeAddress(dto.address);
    const site: any = address ? await this.sites.findOne({ address }).lean() : null;
    const found = !!site;
    const stored = address ?? dto.address.trim().toLowerCase().slice(0, 200);

    // Idempotent: the same visitId can never be recorded twice (StrictMode / retries).
    await this.visits.updateOne(
      { visitId: dto.visitId },
      { $setOnInsert: { visitId: dto.visitId, personId, address: stored, at: new Date(), via: dto.via, found } },
      { upsert: true },
    );

    return {
      found,
      address: stored,
      site: site ? { address: site.address, title: site.title, html: site.html } : null,
    };
  }

  async history(personId: string, limit = 30, cursor?: string, q?: string) {
    const filter: any = { personId };
    if (cursor) {
      const d = new Date(cursor);
      if (isNaN(d.getTime())) throw new BadRequestException('Bad cursor');
      filter.at = { $lt: d };
    }
    if (q?.trim()) filter.address = { $regex: escapeRegex(q.trim().toLowerCase()) };

    const n = Math.min(Math.max(limit, 1), 100);
    const rows: any[] = await this.visits.find(filter).sort({ at: -1, _id: -1 }).limit(n + 1).lean();
    const hasMore = rows.length > n;
    const items = hasMore ? rows.slice(0, n) : rows;
    return {
      items: items.map((v) => ({ visitId: v.visitId, address: v.address, at: v.at, via: v.via, found: v.found })),
      nextCursor: hasMore ? new Date(items[items.length - 1].at).toISOString() : null,
    };
  }
}