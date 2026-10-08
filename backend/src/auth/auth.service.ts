import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { DbService, UserEntity } from '../prisma/db.service';
import { RegisterInput, LoginInput } from '../common/types/graphql.inputs';
import { AuthPayload, UserType } from '../common/types/graphql.types';
import { Role } from '../common/enums';

@Injectable()
export class AuthService {
  constructor(
    private readonly db: DbService,
    private readonly jwtService: JwtService,
  ) {}

  async register(input: RegisterInput): Promise<AuthPayload> {
    const existing = this.db.prisma.isConnected
      ? await this.db.prisma.user.findUnique({ where: { email: input.email.toLowerCase() } })
      : this.db.users.find((u) => u.email.toLowerCase() === input.email.toLowerCase());

    if (existing) {
      throw new BadRequestException('A user with this email address already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(input.password, salt);

    let createdUser: UserEntity;

    if (this.db.prisma.isConnected) {
      const dbUser = await this.db.prisma.user.create({
        data: {
          name: input.name,
          email: input.email.toLowerCase(),
          passwordHash,
          role: input.role || Role.STUDENT,
          departmentId: input.departmentId || null,
        },
        include: { department: true },
      });
      createdUser = {
        ...dbUser,
        role: dbUser.role as Role,
        department: dbUser.department,
      };
    } else {
      const id = 'usr-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
      createdUser = {
        id,
        name: input.name,
        email: input.email.toLowerCase(),
        passwordHash,
        role: input.role || Role.STUDENT,
        departmentId: input.departmentId || null,
        createdAt: new Date(),
        updatedAt: new Date(),
        department: input.departmentId
          ? this.db.departments.find((d) => d.id === input.departmentId) || null
          : null,
      };
      this.db.users.push(createdUser);
    }

    const token = this.jwtService.sign({
      sub: createdUser.id,
      email: createdUser.email,
      role: createdUser.role,
    });

    return {
      token,
      user: this.sanitizeUser(createdUser),
    };
  }

  async login(input: LoginInput): Promise<AuthPayload> {
    const user = this.db.prisma.isConnected
      ? await this.db.prisma.user.findUnique({
          where: { email: input.email.toLowerCase() },
          include: { department: true },
        })
      : this.db.users.find((u) => u.email.toLowerCase() === input.email.toLowerCase());

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(input.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    const populatedUser: UserEntity = {
      ...user,
      role: user.role as Role,
      department:
        user.department ||
        (user.departmentId ? this.db.departments.find((d) => d.id === user.departmentId) || null : null),
    };

    return {
      token,
      user: this.sanitizeUser(populatedUser),
    };
  }

  async validateUserById(id: string): Promise<UserType> {
    const user = this.db.prisma.isConnected
      ? await this.db.prisma.user.findUnique({
          where: { id },
          include: { department: true },
        })
      : this.db.users.find((u) => u.id === id);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const populatedUser: UserEntity = {
      ...user,
      role: user.role as Role,
      department:
        user.department ||
        (user.departmentId ? this.db.departments.find((d) => d.id === user.departmentId) || null : null),
    };

    return this.sanitizeUser(populatedUser);
  }

  private sanitizeUser(user: UserEntity): UserType {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      departmentId: user.departmentId || undefined,
      department: user.department || undefined,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
