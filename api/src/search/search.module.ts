import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Site, SiteSchema } from '../sites/site.schema';
import { SearchController } from './search.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Site.name, schema: SiteSchema }])],
  controllers: [SearchController],
})
export class SearchModule {}