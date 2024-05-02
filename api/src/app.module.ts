import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
 import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
 import { UtilityModule } from './utility/utility.module';
import { ProfilModule } from './profil/profil.module';
import { VoyageModule } from './voyage/voyage.module';


@Module({
  imports: [
    AuthModule,
    PrismaModule,
    ConfigModule.forRoot({
      isGlobal: true
    }),
    UtilityModule,
    ProfilModule,
    VoyageModule,
     
    ],
  providers: [],
 


})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
        
      
  }
}
