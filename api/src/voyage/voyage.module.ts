import { Module } from '@nestjs/common';
import { VoyageService } from './voyage.service';
import { VoyageController } from './voyage.controller';

@Module({
  controllers: [VoyageController],
  providers: [VoyageService],
})
export class VoyageModule {}
