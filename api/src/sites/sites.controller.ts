import { Body, Controller, Post } from '@nestjs/common';
import { SitesService } from './sites.service';
import { CreateSiteDto } from './create-site.dto';

@Controller('sites')
export class SitesController {
  constructor(private svc: SitesService) {}

  @Post()
  create(@Body() dto: CreateSiteDto) {
    return this.svc.create(dto);
  }
}