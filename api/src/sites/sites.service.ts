import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Site } from './site.schema';
import { Person } from '../people/person.schema';
import { normalizeAddress } from '../shared/address';
import { sanitizeHtml, toText } from './sanitize';
import { CreateSiteDto } from './create-site.dto';

const RESERVED = ['nowhere.zz', 'history.zz', 'search.zz', 'about.zz'];

@Injectable()
export class SitesService {
  constructor(
    @InjectModel(Site.name) private sites: Model<Site>,
    @InjectModel(Person.name) private people: Model<Person>,
  ) {}

  async create(dto: CreateSiteDto) {
    const address = normalizeAddress(dto.address);
    if (!address) throw new BadRequestException('Address must look like name.zz');
    if (RESERVED.includes(address)) throw new BadRequestException('That address is reserved');
    if (!(await this.people.exists({ _id: dto.authorId }))) {
      throw new BadRequestException('Unknown author');
    }
    const html = sanitizeHtml(dto.html);
    try {
      const doc = await this.sites.create({
        address,
        title: dto.title.trim(),
        authorId: dto.authorId,
        html,
        text: toText(html),
      });
      return { address: doc.address, title: doc.title };
    } catch (e: any) {
      if (e?.code === 11000) throw new ConflictException('That address is already taken');
      throw e;
    }
  }
}