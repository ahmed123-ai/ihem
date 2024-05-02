import { IsString, IsOptional, IsInt, IsDate, IsNumber, IsMongoId, Min, isNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateVoyageDto {
 
  sub: string;

     // Validates that the value is a Date
  dateDebut: Date;

  dateFin: Date;

 
  lieuDeDepose: string;

 
  lieuDarrivée: string;
 
  prix: number;

 
  maxNbr: number;
}