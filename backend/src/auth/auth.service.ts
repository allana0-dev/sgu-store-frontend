import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { compare, hash } from 'bcryptjs';
import { randomUUID } from 'crypto';
import { AuthUser } from './types/auth-user.type';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({ where: { email: dto.email } });

    if (existingUser) {
      throw new ConflictException('An account with this email already exists.');
    }

    const passwordHash = await hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
      },
    });

    return this.issueToken(user.id, user.email);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const validPassword = await compare(dto.password, user.passwordHash);

    if (!validPassword) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    return this.issueToken(user.id, user.email);
  }

  async logout(user: AuthUser) {
    if (!user.tokenJti || !user.tokenExp) {
      throw new BadRequestException('Invalid token metadata.');
    }

    await this.prisma.revokedToken.upsert({
      where: { tokenJti: user.tokenJti },
      create: {
        tokenJti: user.tokenJti,
        userId: user.userId,
        expiresAt: new Date(user.tokenExp * 1000),
      },
      update: {},
    });

    return { success: true };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found.');
    }

    return user;
  }

  private async issueToken(userId: string, email: string) {
    const jti = randomUUID();
    const accessToken = await this.jwtService.signAsync({ sub: userId, email, jti });

    return {
      accessToken,
      user: {
        id: userId,
        email,
      },
    };
  }
}
