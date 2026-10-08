import { ObjectType, Field, ID, Int, Float } from '@nestjs/graphql';
import { Role, IssueStatus, Priority, Category } from '../enums';

@ObjectType()
export class DepartmentType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Int, { defaultValue: 0 })
  openIssuesCount?: number;

  @Field(() => Int, { defaultValue: 0 })
  inProgressCount?: number;

  @Field(() => Int, { defaultValue: 0 })
  resolvedCount?: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class UserType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  email: string;

  @Field(() => Role)
  role: Role;

  @Field({ nullable: true })
  departmentId?: string;

  @Field(() => DepartmentType, { nullable: true })
  department?: DepartmentType;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class AuthPayload {
  @Field()
  token: string;

  @Field(() => UserType)
  user: UserType;
}

@ObjectType()
export class IssueImageType {
  @Field(() => ID)
  id: string;

  @Field()
  issueId: string;

  @Field()
  url: string;

  @Field()
  createdAt: Date;
}

@ObjectType()
export class IssueCommentType {
  @Field(() => ID)
  id: string;

  @Field()
  issueId: string;

  @Field()
  userId: string;

  @Field()
  comment: string;

  @Field()
  createdAt: Date;

  @Field(() => UserType, { nullable: true })
  user?: UserType;
}

@ObjectType()
export class IssueStatusHistoryType {
  @Field(() => ID)
  id: string;

  @Field()
  issueId: string;

  @Field(() => IssueStatus, { nullable: true })
  oldStatus?: IssueStatus;

  @Field(() => IssueStatus)
  newStatus: IssueStatus;

  @Field()
  changedBy: string;

  @Field()
  createdAt: Date;

  @Field(() => UserType, { nullable: true })
  changer?: UserType;
}

@ObjectType()
export class IssueType {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field()
  description: string;

  @Field(() => Category)
  category: Category;

  @Field(() => Priority)
  priority: Priority;

  @Field()
  location: string;

  @Field(() => IssueStatus)
  status: IssueStatus;

  @Field()
  reporterId: string;

  @Field(() => UserType, { nullable: true })
  reporter?: UserType;

  @Field({ nullable: true })
  assignedDepartmentId?: string;

  @Field(() => DepartmentType, { nullable: true })
  assignedDepartment?: DepartmentType;

  @Field({ nullable: true })
  assignedStaffId?: string;

  @Field(() => UserType, { nullable: true })
  assignedStaff?: UserType;

  @Field(() => [IssueImageType], { defaultValue: [] })
  images?: IssueImageType[];

  @Field(() => [IssueCommentType], { defaultValue: [] })
  comments?: IssueCommentType[];

  @Field(() => [IssueStatusHistoryType], { defaultValue: [] })
  statusHistory?: IssueStatusHistoryType[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field({ nullable: true })
  resolvedAt?: Date;

  @Field({ nullable: true })
  verifiedAt?: Date;
}

@ObjectType()
export class NotificationType {
  @Field(() => ID)
  id: string;

  @Field()
  userId: string;

  @Field({ nullable: true })
  issueId?: string;

  @Field()
  title: string;

  @Field()
  message: string;

  @Field()
  isRead: boolean;

  @Field()
  createdAt: Date;

  @Field(() => IssueType, { nullable: true })
  issue?: IssueType;
}

// Analytics Object Types
@ObjectType()
export class IssueStatistics {
  @Field(() => Int)
  total: number;

  @Field(() => Int)
  reported: number;

  @Field(() => Int)
  assigned: number;

  @Field(() => Int)
  inProgress: number;

  @Field(() => Int)
  resolved: number;

  @Field(() => Int)
  verified: number;

  @Field(() => Int)
  reopened: number;
}

@ObjectType()
export class CategoryCount {
  @Field(() => Category)
  category: Category;

  @Field(() => Int)
  count: number;
}

@ObjectType()
export class LocationCount {
  @Field()
  location: string;

  @Field(() => Int)
  count: number;
}

@ObjectType()
export class DepartmentWorkload {
  @Field()
  departmentId: string;

  @Field()
  departmentName: string;

  @Field(() => Int)
  openCount: number;

  @Field(() => Int)
  inProgressCount: number;

  @Field(() => Int)
  resolvedCount: number;
}

@ObjectType()
export class ResolutionTimeStatistics {
  @Field(() => Float)
  avgResolutionTimeDays: number;

  @Field(() => Int)
  totalResolvedCount: number;
}

@ObjectType()
export class RecurringIssue {
  @Field(() => Category)
  category: Category;

  @Field()
  location: string;

  @Field(() => Int)
  count: number;
}

@ObjectType()
export class MonthlyTrend {
  @Field()
  month: string;

  @Field(() => Int)
  reportedCount: number;

  @Field(() => Int)
  resolvedCount: number;
}
