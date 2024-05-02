import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { VoyageService } from './voyage.service';
import { CreateVoyageDto } from './dto/create_voyage.dto';

@Controller('voyage')
export class VoyageController {
  constructor(private  voyageService: VoyageService) {}


  @Post('add')
  async create(@Body() dto : any ){ 
    await this.voyageService.create_voyage(dto)
    return {status : 200 , data : 'ok'}
  }

  @Get('')
  async get( ){ 
    
    
    return {status : 200 , data : await this.voyageService.find_all()}
  }
  @Get('find_last_three')
  async Getlast( ){ 
    
    
    return {status : 200 , data : await this.voyageService.find_last_three()}
  }
  @Get('/:id')
  async getById(@Param('id') id :string ){ 
    
    
    return {status : 200 , data : await this.voyageService.find_by_id(id)}
  }

}
