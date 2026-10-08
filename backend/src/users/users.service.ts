import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DbService, UserEntity } from '../prisma/db.service';
import { UserType } from '../common/types/graphql.types';
import { Role } from '../common/enums';

@Injectable()
export class UsersService {
  constructor(private readonly db: DbService) {}

  async findAll(role?: Role, departmentId?: string): Promise<UserType[]> {
    let users = this.db.users;
    if (role) {
      users = users.filter((u) => u.role === role);
    }
    if (departmentId) {
      users = users.filter((u) => u.departmentId === departmentId);
    }
    return users.map((u) => this.sanitizeUser(u));
  }

  async findOne(id: string): Promise<UserType> {
    const user = this.db.users.find((u) => u.id === id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return this.sanitizeUser(user);
  }

  async updateRole(adminUserId: string, targetUserId: string, newRole: Role): Promise<UserType> {
    const user = this.db.users.find((u) => u.id === targetUserId);
    if (!user) {
      throw new NotFoundException(`User with id ${targetUserId} not found`);
    }

    if (adminUserId === targetUserId && newRole !== Role.ADMIN) {
      throw new BadRequestException('You cannot demote your own administrator account');
    }

    user.role = newRole;
    user.updatedAt = new Date();
    return this.sanitizeUser(user);
  }

  async updateDepartment(targetUserId: string, departmentId?: string): Promise<UserType> {
    const user = this.db.users.find((u) => u.id === targetUserId);
    if (!user) {
      throw new NotFoundException(`User with id ${targetUserId} not found`);
    }

    if (departmentId) {
      const dept = this.db.departments.find((d) => d.id === departmentId);
      if (!dept) {
        throw new NotFoundException(`Department with id ${departmentId} not found`);
      }
      user.departmentId = departmentId;
    } else {
      user.departmentId = null;
    }

    user.updatedAt = new Date();
    return this.sanitizeUser(user);
  }

  private sanitizeUser(user: UserEntity): UserType {
    const department = user.departmentId
      ? this.db.departments.find((d) => d.id === user.departmentId)
      : null;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      departmentId: user.departmentId || undefined,
      department: department
        ? {
            id: department.id,
            name: department.name,
            description: department.description || undefined,
            createdAt: department.createdAt,
            updatedAt: department.updatedAt,
          }
        : undefined,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
