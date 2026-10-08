import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { DbService } from '../prisma/db.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly db: DbService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'fixmycampus-super-secret-jwt-key-2026-production-ready',
    });
  }

  async validate(payload: { sub: string; email: string; role: string }) {
    let user;
    if (this.db.prisma.isConnected) {
      user = await this.db.prisma.user.findUnique({
        where: { id: payload.sub },
        include: { department: true },
      });
    } else {
      user = this.db.users.find((u) => u.id === payload.sub);
      if (user && user.departmentId) {
        user.department = this.db.departments.find((d) => d.id === user.departmentId) || null;
      }
    }

    if (!user) {
      throw new UnauthorizedException('User not found or session expired');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      departmentId: user.departmentId,
      department: user.department,
    };
  }
}
