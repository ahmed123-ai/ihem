import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
 

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: ConfigService,
    private prismaService: PrismaService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get('SIGN_IN_SK'),
    })
  }

  async validate(payload: any) {

    const user = await this.prismaService.user.findUnique({
      where: {
        id: payload.id
      },
      select: { id: true, username: true,    password: true, role: true  },
    });
    console.log(user)
    if (!user) {
      throw new UnauthorizedException('Unauthorized');
    }

    const responseObject: any = {
      id: user.id,
      username: user.username,
      role: user.role,
 
    };

   
    return responseObject;

  }
}

