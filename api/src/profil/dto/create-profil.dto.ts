import { IsString, IsOptional, IsInt, IsDate, IsMongoId, IsUrl, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProfileDto {
  @IsString()
  firstname: string;

  @IsString()
  lastname: string;

  @IsNumber()
  phone: number;

  @Type(() => Date)
  @IsDate()
  age: Date;

  @IsString()
  address: string;

  @IsString()
  region: string;

 
}
