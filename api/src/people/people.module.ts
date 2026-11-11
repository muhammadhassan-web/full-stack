import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Person, PersonSchema } from './person.schema';
import { PeopleController } from './people.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Person.name, schema: PersonSchema }])],
  controllers: [PeopleController],
})
export class PeopleModule {}