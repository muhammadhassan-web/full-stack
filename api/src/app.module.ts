import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PeopleModule } from './people/people.module';
import { SitesModule } from './sites/sites.module';
import { VisitsModule } from './visits/visits.module';
import { SearchModule } from './search/search.module';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URI ?? 'mongodb://localhost:27017/smallweb'),
    PeopleModule,
    SitesModule,
    VisitsModule,
    SearchModule,
  ],
})
export class AppModule {}