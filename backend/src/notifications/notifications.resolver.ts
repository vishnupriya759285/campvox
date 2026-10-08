import { Resolver, Query, Mutation, Args, ID, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationType } from '../common/types/graphql.types';
import { GqlAuthGuard } from '../common/guards/gql-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Resolver(() => NotificationType)
export class NotificationsResolver {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Query(() => [NotificationType])
  @UseGuards(GqlAuthGuard)
  async notifications(@CurrentUser() user: any): Promise<NotificationType[]> {
    return this.notificationsService.findByUser(user.id);
  }

  @Query(() => Int)
  @UseGuards(GqlAuthGuard)
  async unreadNotificationCount(@CurrentUser() user: any): Promise<number> {
    return this.notificationsService.getUnreadCount(user.id);
  }

  @Mutation(() => NotificationType)
  @UseGuards(GqlAuthGuard)
  async markNotificationRead(
    @CurrentUser() user: any,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<NotificationType> {
    return this.notificationsService.markAsRead(user.id, id);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async markAllNotificationsRead(@CurrentUser() user: any): Promise<boolean> {
    return this.notificationsService.markAllAsRead(user.id);
  }
}
