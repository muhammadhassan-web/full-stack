import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { VisitsService } from './visits.service';
import { CreateVisitDto } from './create-visit.dto';

@Controller('people/:id')
export class VisitsController {
  constructor(private svc: VisitsService) {}

  @Post('visits')
  record(@Param('id') id: string, @Body() dto: CreateVisitDto) {
    return this.svc.record(id, dto);
  }

  @Get('history')
  history(
    @Param('id') id: string,
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
    @Query('q') q?: string,
  ) {
    return this.svc.history(id, limit ? parseInt(limit, 10) || 30 : 30, cursor, q);
  }
}