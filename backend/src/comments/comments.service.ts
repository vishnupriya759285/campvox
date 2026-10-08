import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DbService, IssueCommentEntity } from '../prisma/db.service';
import { IssueCommentType } from '../common/types/graphql.types';

@Injectable()
export class CommentsService {
  constructor(private readonly db: DbService) {}

  async findByIssue(issueId: string): Promise<IssueCommentType[]> {
    const comments = this.db.comments.filter((c) => c.issueId === issueId);
    comments.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    return comments.map((c) => this.enrichComment(c));
  }

  async addComment(userId: string, issueId: string, commentText: string): Promise<IssueCommentType> {
    if (!commentText || commentText.trim().length === 0) {
      throw new BadRequestException('Comment cannot be empty');
    }

    const cleanId = (issueId || '').trim().replace(/^#/, '');
    const issue = this.db.issues.find(
      (i) =>
        i.id === cleanId ||
        i.id.toLowerCase() === cleanId.toLowerCase() ||
        i.id === issueId ||
        i.id === `#${cleanId}`,
    );
    if (!issue) {
      throw new NotFoundException(`Issue #${issueId} not found`);
    }

    const newComment: IssueCommentEntity = {
      id: 'comm-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
      issueId,
      userId,
      comment: commentText.trim(),
      createdAt: new Date(),
    };

    this.db.comments.push(newComment);

    // Notify issue reporter (if someone else commented)
    if (issue.reporterId !== userId) {
      const commenter = this.db.users.find((u) => u.id === userId);
      this.db.notifications.push({
        id: 'notif-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
        userId: issue.reporterId,
        issueId: issue.id,
        title: 'New Comment on Your Issue',
        message: `${commenter?.name || 'A team member'} added a comment on Issue #${issue.id}.`,
        isRead: false,
        createdAt: new Date(),
      });
    }

    // Notify assigned staff (if someone else commented)
    if (issue.assignedStaffId && issue.assignedStaffId !== userId) {
      const commenter = this.db.users.find((u) => u.id === userId);
      this.db.notifications.push({
        id: 'notif-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
        userId: issue.assignedStaffId,
        issueId: issue.id,
        title: 'New Comment on Assigned Task',
        message: `${commenter?.name || 'Someone'} commented on Issue #${issue.id}.`,
        isRead: false,
        createdAt: new Date(),
      });
    }

    return this.enrichComment(newComment);
  }

  private enrichComment(comment: IssueCommentEntity): IssueCommentType {
    const user = this.db.users.find((u) => u.id === comment.userId);
    return {
      id: comment.id,
      issueId: comment.issueId,
      userId: comment.userId,
      comment: comment.comment,
      createdAt: comment.createdAt,
      user: user
        ? {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            departmentId: user.departmentId || undefined,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          }
        : undefined,
    };
  }
}
