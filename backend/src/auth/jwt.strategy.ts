import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { PrismaService } from '../prisma/prisma.service';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthUser } from './types/auth-user.type';

type JwtPayload = {
  sub: string;
  email: string;
  jti: string;
  exp: number;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<AuthUser> {
    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });

    if (!user) {
      throw new UnauthorizedException('Invalid authentication token.');
    }

    const revokedToken = await this.prisma.revokedToken.findUnique({
      where: { tokenJti: payload.jti },
    });

    if (revokedToken) {
      throw new UnauthorizedException('Token has been revoked.');
    }

    return {
      userId: payload.sub,
      email: payload.email,
      tokenJti: payload.jti,
      tokenExp: payload.exp,
    };
  }
}
