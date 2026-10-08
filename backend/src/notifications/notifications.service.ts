import { Injectable, NotFoundException } from '@nestjs/common';
import { DbService, NotificationEntity } from '../prisma/db.service';
import { NotificationType } from '../common/types/graphql.types';

@Injectable()
export class NotificationsService {
  constructor(private readonly db: DbService) {}

  async findByUser(userId: string): Promise<NotificationType[]> {
    const list = this.db.notifications.filter((n) => n.userId === userId);
    list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return list.map((n) => this.enrichNotification(n));
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.db.notifications.filter((n) => n.userId === userId && !n.isRead).length;
  }

  async markAsRead(userId: string, id: string): Promise<NotificationType> {
    const notif = this.db.notifications.find((n) => n.id === id && n.userId === userId);
    if (!notif) {
      throw new NotFoundException('Notification not found');
    }
    notif.isRead = true;
    return this.enrichNotification(notif);
  }

  async markAllAsRead(userId: string): Promise<boolean> {
    this.db.notifications.forEach((n) => {
      if (n.userId === userId) {
        n.isRead = true;
      }
    });
    return true;
  }

  private enrichNotification(notif: NotificationEntity): NotificationType {
    const issue = notif.issueId
      ? this.db.issues.find((i) => i.id === notif.issueId)
      : null;

    return {
      id: notif.id,
      userId: notif.userId,
      issueId: notif.issueId || undefined,
      title: notif.title,
      message: notif.message,
      isRead: notif.isRead,
      createdAt: notif.createdAt,
      issue: issue ? (this.db.populateIssue(issue) as any) : undefined,
    };
  }
}
