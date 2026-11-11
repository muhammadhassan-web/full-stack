import { Controller, Get } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Person } from './person.schema';

@Controller('people')
export class PeopleController {
  constructor(@InjectModel(Person.name) private people: Model<Person>) {}

  @Get()
  list() {
    return this.people.find().sort({ name: 1 }).lean();
  }
}