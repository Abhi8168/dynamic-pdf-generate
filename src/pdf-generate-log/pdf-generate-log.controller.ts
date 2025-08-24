import {
  Controller,
  Get,
  InternalServerErrorException,
  Query,
} from '@nestjs/common';
import { PdgGenerateLogService } from './pdf-generate-log.service';

@Controller('pdf-generate-log')
export class PdgGenerateLogController {
  constructor(private readonly pdgGenerateLogService: PdgGenerateLogService) {}

  @Get('fetch')
  async fetchLogs(
    @Query('limit') limit: number = 10,
    @Query('skip') skip: number = 0,
  ) {
    try {
      limit = limit > 0 ? limit : 10;
      skip = skip >= 0 ? skip : 0;
      const data = await this.pdgGenerateLogService.fetchLogs(limit, skip);
      return {
        success: true,
        message: 'Logs fetched successfully',
        data: data.data,
        count: data.count,
      };
    } catch (err) {
      throw new InternalServerErrorException({
        success: false,
        message: 'Something went wrong',
      });
    }
  }
}
