import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserType } from '../common/types/graphql.types';
import { GqlAuthGuard } from '../common/guards/gql-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '../common/enums';

@Resolver(() => UserType)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => [UserType])
  @UseGuards(GqlAuthGuard)
  async users(
    @Args('role', { type: () => Role, nullable: true }) role?: Role,
    @Args('departmentId', { nullable: true }) departmentId?: string,
  ): Promise<UserType[]> {
    return this.usersService.findAll(role, departmentId);
  }

  @Query(() => UserType)
  @UseGuards(GqlAuthGuard)
  async user(@Args('id', { type: () => ID }) id: string): Promise<UserType> {
    return this.usersService.findOne(id);
  }

  @Mutation(() => UserType)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async updateUserRole(
    @CurrentUser() adminUser: any,
    @Args('userId', { type: () => ID }) userId: string,
    @Args('role', { type: () => Role }) role: Role,
  ): Promise<UserType> {
    return this.usersService.updateRole(adminUser.id, userId, role);
  }

  @Mutation(() => UserType)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async updateUserDepartment(
    @Args('userId', { type: () => ID }) userId: string,
    @Args('departmentId', { nullable: true }) departmentId?: string,
  ): Promise<UserType> {
    return this.usersService.updateDepartment(userId, departmentId);
  }
}
