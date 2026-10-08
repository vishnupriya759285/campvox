import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { IssueCommentType } from '../common/types/graphql.types';
import { GqlAuthGuard } from '../common/guards/gql-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Resolver(() => IssueCommentType)
export class CommentsResolver {
  constructor(private readonly commentsService: CommentsService) {}

  @Query(() => [IssueCommentType])
  async issueComments(
    @Args('issueId', { type: () => ID }) issueId: string,
  ): Promise<IssueCommentType[]> {
    return this.commentsService.findByIssue(issueId);
  }

  @Mutation(() => IssueCommentType)
  @UseGuards(GqlAuthGuard)
  async addIssueComment(
    @CurrentUser() user: any,
    @Args('issueId', { type: () => ID }) issueId: string,
    @Args('comment') comment: string,
  ): Promise<IssueCommentType> {
    return this.commentsService.addComment(user.id, issueId, comment);
  }
}
