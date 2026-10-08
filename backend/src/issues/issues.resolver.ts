import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { IssuesService } from './issues.service';
import { IssueType } from '../common/types/graphql.types';
import {
  CreateIssueInput,
  UpdateIssueInput,
  AssignIssueInput,
  UpdateIssueStatusInput,
  IssueFilterInput,
} from '../common/types/graphql.inputs';
import { GqlAuthGuard } from '../common/guards/gql-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '../common/enums';

@Resolver(() => IssueType)
export class IssuesResolver {
  constructor(private readonly issuesService: IssuesService) {}

  @Query(() => [IssueType])
  async issues(
    @Args('filter', { nullable: true }) filter?: IssueFilterInput,
  ): Promise<IssueType[]> {
    return this.issuesService.findAll(filter);
  }

  @Query(() => IssueType)
  async issue(@Args('id', { type: () => ID }) id: string): Promise<IssueType> {
    return this.issuesService.findOne(id);
  }

  @Query(() => [IssueType])
  @UseGuards(GqlAuthGuard)
  async myIssues(@CurrentUser() user: any): Promise<IssueType[]> {
    return this.issuesService.findByReporter(user.id);
  }

  @Query(() => [IssueType])
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(Role.MAINTENANCE, Role.ADMIN)
  async assignedIssues(@CurrentUser() user: any): Promise<IssueType[]> {
    return this.issuesService.findByAssignedStaff(user.id);
  }

  @Mutation(() => IssueType)
  @UseGuards(GqlAuthGuard)
  async createIssue(
    @CurrentUser() user: any,
    @Args('input') input: CreateIssueInput,
  ): Promise<IssueType> {
    return this.issuesService.create(user.id, input);
  }

  @Mutation(() => IssueType)
  @UseGuards(GqlAuthGuard)
  async updateIssue(
    @CurrentUser() user: any,
    @Args('input') input: UpdateIssueInput,
  ): Promise<IssueType> {
    return this.issuesService.update(user.id, user.role, input);
  }

  @Mutation(() => IssueType)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async assignIssue(
    @CurrentUser() adminUser: any,
    @Args('input') input: AssignIssueInput,
  ): Promise<IssueType> {
    return this.issuesService.assign(adminUser, input);
  }

  @Mutation(() => IssueType)
  @UseGuards(GqlAuthGuard)
  async updateIssueStatus(
    @CurrentUser() user: any,
    @Args('input') input: UpdateIssueStatusInput,
  ): Promise<IssueType> {
    return this.issuesService.updateStatus(user, input.issueId, input.status);
  }

  @Mutation(() => IssueType)
  @UseGuards(GqlAuthGuard)
  async verifyIssue(
    @CurrentUser() user: any,
    @Args('issueId', { type: () => ID }) issueId: string,
  ): Promise<IssueType> {
    return this.issuesService.verify(user, issueId);
  }

  @Mutation(() => IssueType)
  @UseGuards(GqlAuthGuard)
  async reopenIssue(
    @CurrentUser() user: any,
    @Args('issueId', { type: () => ID }) issueId: string,
  ): Promise<IssueType> {
    return this.issuesService.reopen(user, issueId);
  }
}
