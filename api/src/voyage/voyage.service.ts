import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateVoyageDto } from './dto/create_voyage.dto';

@Injectable()
export class VoyageService {

    constructor( 
        private prismaService :PrismaService
     ){ }

     
    async create_voyage(dto : any){ 
        try {
            console.log(dto)
         const data =    await this.prismaService.voyage.create({ 
                data : { 
                    userId: dto.userId,
                    dateDebut:dto.dateDebut,
                    dateFin:dto.dateFin,
                    lieuDeDepose: dto.lieuDeDepose,
                    lieuDarrivee:dto.lieuDarrivee,
                    prix:dto.prix,
                    maxNbr: dto.maxNbr,
                }
            });
         console.log(data)
            return false;
        } catch (error) {
            console.log(error)
            return true;
        }
    }
    async find_all(){ 
        try {
         const data =    await this.prismaService.voyage.findMany( {
            include: {
                user:true
            }
         });
             return data;
        } catch (error) {
            console.log(error)
            return true;
        }
    }
    async find_last_three() {
        try {
          const data = await this.prismaService.voyage.findMany({
            include: {
              user: true,
            },
            orderBy: {
              createdAt: 'desc', // Sort by creation time in descending order
            },
            take: 3, // Limit to the last three records
          });
      
          return data;
        } catch (error) {
          console.error('Error fetching last three records:', error);
          throw new Error('Could not retrieve data');
        }
      }

      
    async find_by_id(id:string){ 
        try {
         const data =    await this.prismaService.voyage.findFirst( {
            where  : {
                id
            },
            include: {
                user:true
            }
         });
             return data;
        } catch (error) {
            console.log(error)
            return true;
        }
    }
}
