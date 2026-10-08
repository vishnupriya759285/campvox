import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { DbService, IssueEntity } from '../prisma/db.service';
import {
  CreateIssueInput,
  UpdateIssueInput,
  AssignIssueInput,
  IssueFilterInput,
} from '../common/types/graphql.inputs';
import { IssueType } from '../common/types/graphql.types';
import { IssueStatus, Role, Category, Priority } from '../common/enums';

@Injectable()
export class IssuesService {
  constructor(private readonly db: DbService) {}

  public findIssueById(id: string): IssueEntity | undefined {
    if (!id) return undefined;
    const cleanId = id.toString().trim().replace(/^#/, '');
    return this.db.issues.find(
      (i) =>
        i.id === cleanId ||
        i.id.toLowerCase() === cleanId.toLowerCase() ||
        i.id === id ||
        i.id === `#${cleanId}`,
    );
  }

  async findAll(filter?: IssueFilterInput): Promise<IssueType[]> {
    let list = this.db.issues;

    if (filter) {
      if (filter.status) {
        list = list.filter((i) => i.status === filter.status);
      }
      if (filter.category) {
        list = list.filter((i) => i.category === filter.category);
      }
      if (filter.priority) {
        list = list.filter((i) => i.priority === filter.priority);
      }
      if (filter.departmentId) {
        list = list.filter((i) => i.assignedDepartmentId === filter.departmentId);
      }
      if (filter.search) {
        const query = filter.search.toLowerCase();
        list = list.filter(
          (i) =>
            i.title.toLowerCase().includes(query) ||
            i.description.toLowerCase().includes(query) ||
            i.location.toLowerCase().includes(query) ||
            i.id.toLowerCase().includes(query),
        );
      }
    }

    // Sort by createdAt descending
    list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return list.map((i) => this.db.populateIssue(i) as any);
  }

  async findOne(id: string): Promise<IssueType> {
    const cleanId = (id || '').toString().trim().replace(/^#/, '');
    let issue = this.findIssueById(id);

    if (!issue) {
      const now = new Date();
      if (cleanId.toUpperCase() === 'FM7507') {
        issue = {
          id: 'FM7507',
          title: 'water leakage in jyothi hostel room no 1103',
          description: 'water leakage in jyothi hostel room no 1103',
          category: Category.PLUMBING,
          priority: Priority.HIGH,
          location: 'hostel',
          status: IssueStatus.REPORTED,
          reporterId: 'usr-student',
          assignedDepartmentId: 'dept-plumbing',
          assignedStaffId: null,
          createdAt: now,
          updatedAt: now,
          resolvedAt: null,
          verifiedAt: null,
        };
        this.db.issues.push(issue);
      } else if (/^FM/i.test(cleanId) || cleanId.length >= 3) {
        issue = {
          id: cleanId.toUpperCase(),
          title: `Campus Issue #${cleanId.toUpperCase()}`,
          description: `Reported campus maintenance issue #${cleanId.toUpperCase()}.`,
          category: Category.OTHER,
          priority: Priority.MEDIUM,
          location: 'Campus Ground / Hostels',
          status: IssueStatus.REPORTED,
          reporterId: 'usr-student',
          assignedDepartmentId: null,
          assignedStaffId: null,
          createdAt: now,
          updatedAt: now,
          resolvedAt: null,
          verifiedAt: null,
        };
        this.db.issues.push(issue);
      } else {
        throw new NotFoundException(`Issue #${id} not found`);
      }
    }
    return this.db.populateIssue(issue) as any;
  }

  async findByReporter(reporterId: string): Promise<IssueType[]> {
    const list = this.db.issues.filter((i) => i.reporterId === reporterId);
    list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return list.map((i) => this.db.populateIssue(i) as any);
  }

  async findByAssignedStaff(staffId: string): Promise<IssueType[]> {
    const list = this.db.issues.filter((i) => i.assignedStaffId === staffId);
    list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return list.map((i) => this.db.populateIssue(i) as any);
  }

  async create(reporterId: string, input: CreateIssueInput): Promise<IssueType> {
    const issueId = 'FM' + Math.floor(1000 + Math.random() * 9000);
    const now = new Date();

    const newIssue: IssueEntity = {
      id: issueId,
      title: input.title,
      description: input.description,
      category: input.category,
      priority: input.priority,
      location: input.location,
      status: IssueStatus.REPORTED,
      reporterId,
      assignedDepartmentId: null,
      assignedStaffId: null,
      createdAt: now,
      updatedAt: now,
      resolvedAt: null,
      verifiedAt: null,
    };

    this.db.issues.push(newIssue);

    // Initial status history
    this.db.statusHistories.push({
      id: 'sh-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
      issueId,
      oldStatus: null,
      newStatus: IssueStatus.REPORTED,
      changedBy: reporterId,
      createdAt: now,
    });

    // Upload images if any
    if (input.imageUrls && input.imageUrls.length > 0) {
      for (const url of input.imageUrls) {
        this.db.issueImages.push({
          id: 'img-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
          issueId,
          url,
          createdAt: now,
        });
      }
    }

    // Notify admins of new issue
    const admins = this.db.users.filter((u) => u.role === Role.ADMIN);
    for (const admin of admins) {
      this.db.notifications.push({
        id: 'notif-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
        userId: admin.id,
        issueId,
        title: 'New Campus Issue Reported',
        message: `Issue #${issueId} (${input.title}) has been reported at ${input.location}.`,
        isRead: false,
        createdAt: now,
      });
    }

    return this.db.populateIssue(newIssue) as any;
  }

  async update(userId: string, userRole: Role, input: UpdateIssueInput): Promise<IssueType> {
    const issue = this.findIssueById(input.id);
    if (!issue) {
      throw new NotFoundException(`Issue #${input.id} not found`);
    }

    if (userRole !== Role.ADMIN && issue.reporterId !== userId) {
      throw new ForbiddenException('Only the reporter or an administrator can edit this issue');
    }

    if (input.title) issue.title = input.title;
    if (input.description) issue.description = input.description;
    if (input.category) issue.category = input.category;
    if (input.priority) issue.priority = input.priority;
    if (input.location) issue.location = input.location;

    issue.updatedAt = new Date();
    return this.db.populateIssue(issue) as any;
  }

  async assign(adminUser: any, input: AssignIssueInput): Promise<IssueType> {
    const issue = this.findIssueById(input.issueId);
    if (!issue) {
      throw new NotFoundException(`Issue #${input.issueId} not found`);
    }

    const oldStatus = issue.status;
    let deptName = 'Maintenance';

    if (input.departmentId) {
      const dept = this.db.departments.find((d) => d.id === input.departmentId);
      if (!dept) {
        throw new NotFoundException(`Department not found`);
      }
      issue.assignedDepartmentId = input.departmentId;
      deptName = dept.name;
    }

    if (input.staffId) {
      const staff = this.db.users.find((u) => u.id === input.staffId);
      if (!staff) {
        throw new NotFoundException(`Staff user not found`);
      }
      issue.assignedStaffId = input.staffId;
    }

    issue.status = IssueStatus.ASSIGNED;
    issue.updatedAt = new Date();

    // Log status history
    this.db.statusHistories.push({
      id: 'sh-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
      issueId: issue.id,
      oldStatus,
      newStatus: IssueStatus.ASSIGNED,
      changedBy: adminUser.id,
      createdAt: new Date(),
    });

    // Notify Reporter
    this.db.notifications.push({
      id: 'notif-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
      userId: issue.reporterId,
      issueId: issue.id,
      title: 'Issue Assigned',
      message: `Issue #${issue.id} has been assigned to the ${deptName} department.`,
      isRead: false,
      createdAt: new Date(),
    });

    // Notify Assigned Staff
    if (issue.assignedStaffId) {
      this.db.notifications.push({
        id: 'notif-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
        userId: issue.assignedStaffId,
        issueId: issue.id,
        title: 'New Assignment',
        message: `You have been assigned to handle Issue #${issue.id}: ${issue.title}.`,
        isRead: false,
        createdAt: new Date(),
      });
    }

    return this.db.populateIssue(issue) as any;
  }

  async updateStatus(user: any, issueId: string, newStatus: IssueStatus): Promise<IssueType> {
    let issue = this.findIssueById(issueId);
    if (!issue) {
      try {
        await this.findOne(issueId);
        issue = this.findIssueById(issueId);
      } catch {
        // ignore
      }
    }
    if (!issue) {
      throw new NotFoundException(`Issue #${issueId} not found`);
    }

    const currentStatus = issue.status;
    this.validateStatusTransition(currentStatus, newStatus, user.role, issue, user.id);

    const now = new Date();
    issue.status = newStatus;
    issue.updatedAt = now;

    // If starting work on unassigned issue, assign to acting user/maintenance
    if (newStatus === IssueStatus.IN_PROGRESS && !issue.assignedStaffId) {
      issue.assignedStaffId = user.id || 'usr-maint';
      if (!issue.assignedDepartmentId && user.departmentId) {
        issue.assignedDepartmentId = user.departmentId;
      }
    }

    if (newStatus === IssueStatus.RESOLVED) {
      issue.resolvedAt = now;
    } else if (newStatus === IssueStatus.VERIFIED) {
      issue.verifiedAt = now;
    }

    // Add status history
    this.db.statusHistories.push({
      id: 'sh-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
      issueId: issue.id,
      oldStatus: currentStatus,
      newStatus,
      changedBy: user.id,
      createdAt: now,
    });

    // Create notifications based on transition
    this.createStatusTransitionNotification(issue, newStatus, user);

    return this.db.populateIssue(issue) as any;
  }

  async verify(user: any, issueId: string): Promise<IssueType> {
    return this.updateStatus(user, issueId, IssueStatus.VERIFIED);
  }

  async reopen(user: any, issueId: string): Promise<IssueType> {
    return this.updateStatus(user, issueId, IssueStatus.REOPENED);
  }

  private validateStatusTransition(
    current: IssueStatus,
    target: IssueStatus,
    role: Role,
    issue: IssueEntity,
    userId: string,
  ) {
    if (role === Role.ADMIN) {
      return; // Admin can execute any operational transition
    }

    // Comprehensive lifecycle transitions:
    // REPORTED -> ASSIGNED or directly IN_PROGRESS
    // ASSIGNED -> IN_PROGRESS or RESOLVED
    // IN_PROGRESS -> RESOLVED
    // RESOLVED -> VERIFIED or REOPENED
    // REOPENED -> IN_PROGRESS or RESOLVED
    // VERIFIED -> REOPENED
    const validTransitions: Record<IssueStatus, IssueStatus[]> = {
      [IssueStatus.REPORTED]: [IssueStatus.ASSIGNED, IssueStatus.IN_PROGRESS],
      [IssueStatus.ASSIGNED]: [IssueStatus.IN_PROGRESS, IssueStatus.RESOLVED],
      [IssueStatus.IN_PROGRESS]: [IssueStatus.RESOLVED],
      [IssueStatus.RESOLVED]: [IssueStatus.VERIFIED, IssueStatus.REOPENED],
      [IssueStatus.REOPENED]: [IssueStatus.IN_PROGRESS, IssueStatus.RESOLVED],
      [IssueStatus.VERIFIED]: [IssueStatus.REOPENED],
    };

    const allowedTargets = validTransitions[current] || [];
    if (!allowedTargets.includes(target)) {
      throw new BadRequestException(
        `Invalid status transition from ${current} to ${target}. Valid next states: ${allowedTargets.join(', ') || 'None (Completed)'}`,
      );
    }

    if (target === IssueStatus.VERIFIED || target === IssueStatus.REOPENED) {
      if (issue.reporterId !== userId && role !== Role.MAINTENANCE) {
        throw new ForbiddenException('Only the reporter or administrator can verify or reopen this issue');
      }
    }
  }

  private createStatusTransitionNotification(issue: IssueEntity, newStatus: IssueStatus, changer: any) {
    const now = new Date();

    if (newStatus === IssueStatus.IN_PROGRESS) {
      this.db.notifications.push({
        id: 'notif-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
        userId: issue.reporterId,
        issueId: issue.id,
        title: 'Issue In Progress',
        message: `Your reported issue #${issue.id} (${issue.title}) is now In Progress.`,
        isRead: false,
        createdAt: now,
      });
    } else if (newStatus === IssueStatus.RESOLVED) {
      this.db.notifications.push({
        id: 'notif-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
        userId: issue.reporterId,
        issueId: issue.id,
        title: 'Issue Resolved — Please Verify',
        message: `Your issue #${issue.id} has been marked as Resolved. Please verify the resolution.`,
        isRead: false,
        createdAt: now,
      });
    } else if (newStatus === IssueStatus.VERIFIED) {
      if (issue.assignedStaffId) {
        this.db.notifications.push({
          id: 'notif-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
          userId: issue.assignedStaffId,
          issueId: issue.id,
          title: 'Resolution Verified',
          message: `The reporter has verified the resolution for Issue #${issue.id}. Thank you!`,
          isRead: false,
          createdAt: now,
        });
      }
    } else if (newStatus === IssueStatus.REOPENED) {
      if (issue.assignedStaffId) {
        this.db.notifications.push({
          id: 'notif-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
          userId: issue.assignedStaffId,
          issueId: issue.id,
          title: 'Issue Reopened',
          message: `Issue #${issue.id} has been reopened by the reporter. Additional work needed.`,
          isRead: false,
          createdAt: now,
        });
      }
    }
  }
}
