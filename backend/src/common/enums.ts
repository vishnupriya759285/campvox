import { registerEnumType } from '@nestjs/graphql';

export enum Role {
  STUDENT = 'STUDENT',
  FACULTY = 'FACULTY',
  STAFF = 'STAFF',
  MAINTENANCE = 'MAINTENANCE',
  ADMIN = 'ADMIN',
}

export enum IssueStatus {
  REPORTED = 'REPORTED',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  VERIFIED = 'VERIFIED',
  REOPENED = 'REOPENED',
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum Category {
  ELECTRICAL = 'ELECTRICAL',
  PLUMBING = 'PLUMBING',
  WIFI = 'WIFI',
  FURNITURE = 'FURNITURE',
  CLEANING = 'CLEANING',
  EQUIPMENT = 'EQUIPMENT',
  CLASSROOM = 'CLASSROOM',
  LABORATORY = 'LABORATORY',
  OTHER = 'OTHER',
}

// Register enums with NestJS GraphQL
registerEnumType(Role, { name: 'Role' });
registerEnumType(IssueStatus, { name: 'IssueStatus' });
registerEnumType(Priority, { name: 'Priority' });
registerEnumType(Category, { name: 'Category' });
