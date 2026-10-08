import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { DepartmentType } from '../common/types/graphql.types';
import { CreateDepartmentInput, UpdateDepartmentInput } from '../common/types/graphql.inputs';
import { GqlAuthGuard } from '../common/guards/gql-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums';

@Resolver(() => DepartmentType)
export class DepartmentsResolver {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Query(() => [DepartmentType])
  async departments(): Promise<DepartmentType[]> {
    return this.departmentsService.findAll();
  }

  @Query(() => DepartmentType)
  async department(@Args('id', { type: () => ID }) id: string): Promise<DepartmentType> {
    return this.departmentsService.findOne(id);
  }

  @Mutation(() => DepartmentType)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async createDepartment(@Args('input') input: CreateDepartmentInput): Promise<DepartmentType> {
    return this.departmentsService.create(input);
  }

  @Mutation(() => DepartmentType)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async updateDepartment(@Args('input') input: UpdateDepartmentInput): Promise<DepartmentType> {
    return this.departmentsService.update(input);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async deleteDepartment(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    return this.departmentsService.delete(id);
  }
}
