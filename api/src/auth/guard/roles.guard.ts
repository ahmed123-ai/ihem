import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from 'src/prisma/prisma.service';
 

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prismaService : PrismaService 
    ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
  
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    const request = context.switchToHttp().getRequest();
 
    if (request?.user) {
       const { id } = request.user;

      const user = await this.prismaService.user.findUnique({
        where: {
          id
        },
        select: { id:true, username: true, password: true, role: true },
      })
      console.log(user)
      console.log(roles)
      if (roles.includes(user.role)) {
   
        return true;
      } else {
        throw new UnauthorizedException('Unauthorized');
      }
    }

    return false;
  }
}
