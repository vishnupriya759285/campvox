import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import * as bcrypt from 'bcryptjs';
import { Role, IssueStatus, Priority, Category } from '../common/enums';

export interface UserEntity {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  departmentId?: string | null;
  createdAt: Date;
  updatedAt: Date;
  department?: DepartmentEntity | null;
}

export interface DepartmentEntity {
  id: string;
  name: string;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IssueEntity {
  id: string;
  title: string;
  description: string;
  category: Category;
  priority: Priority;
  location: string;
  status: IssueStatus;
  reporterId: string;
  assignedDepartmentId?: string | null;
  assignedStaffId?: string | null;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date | null;
  verifiedAt?: Date | null;
  reporter?: UserEntity;
  assignedDepartment?: DepartmentEntity | null;
  assignedStaff?: UserEntity | null;
  images?: IssueImageEntity[];
  comments?: IssueCommentEntity[];
  statusHistory?: IssueStatusHistoryEntity[];
}

export interface IssueImageEntity {
  id: string;
  issueId: string;
  url: string;
  createdAt: Date;
}

export interface IssueCommentEntity {
  id: string;
  issueId: string;
  userId: string;
  comment: string;
  createdAt: Date;
  user?: UserEntity;
}

export interface IssueStatusHistoryEntity {
  id: string;
  issueId: string;
  oldStatus?: IssueStatus | null;
  newStatus: IssueStatus;
  changedBy: string;
  createdAt: Date;
  changer?: UserEntity;
}

export interface NotificationEntity {
  id: string;
  userId: string;
  issueId?: string | null;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

@Injectable()
export class DbService implements OnModuleInit {
  private readonly logger = new Logger(DbService.name);

  // In-memory persistent data store
  public users: UserEntity[] = [];
  public departments: DepartmentEntity[] = [];
  public issues: IssueEntity[] = [];
  public issueImages: IssueImageEntity[] = [];
  public comments: IssueCommentEntity[] = [];
  public statusHistories: IssueStatusHistoryEntity[] = [];
  public notifications: NotificationEntity[] = [];

  constructor(public readonly prisma: PrismaService) {}

  async onModuleInit() {
    if (this.prisma.isConnected) {
      this.logger.log('Prisma is connected. Syncing seed data to PostgreSQL...');
      await this.seedToPrisma();
    } else {
      this.logger.log('Initializing local memory store with FixMyCampus seed records...');
      await this.seedInMemory();
    }
  }

  async seedInMemory() {
    const salt = await bcrypt.genSalt(10);
    const adminHash = await bcrypt.hash('Admin@123', salt);
    const studentHash = await bcrypt.hash('Student@123', salt);
    const facultyHash = await bcrypt.hash('Faculty@123', salt);
    const maintHash = await bcrypt.hash('Maint@123', salt);

    this.departments = [
      { id: 'dept-electrical', name: 'Electrical', description: 'Power, wiring, fans, lighting, and electrical panels', createdAt: new Date(), updatedAt: new Date() },
      { id: 'dept-plumbing', name: 'Plumbing', description: 'Restrooms, water supply, washbasins, and pipeline leaks', createdAt: new Date(), updatedAt: new Date() },
      { id: 'dept-wifi', name: 'IT & Network', description: 'Campus Wi-Fi, computer labs, projectors, and networking', createdAt: new Date(), updatedAt: new Date() },
      { id: 'dept-facilities', name: 'Facilities', description: 'Furniture repair, carpentry, civil maintenance, and air conditioning', createdAt: new Date(), updatedAt: new Date() },
      { id: 'dept-it', name: 'IT Support', description: 'Campus Wi-Fi, computer labs, projectors, and networking', createdAt: new Date(), updatedAt: new Date() },
      { id: 'dept-maintenance', name: 'General Maintenance', description: 'Furniture repair, carpentry, civil maintenance, and air conditioning', createdAt: new Date(), updatedAt: new Date() },
      { id: 'dept-housekeeping', name: 'Housekeeping', description: 'Classroom cleanliness, waste management, and sanitization', createdAt: new Date(), updatedAt: new Date() },
    ];

    const workerHash = await bcrypt.hash('Worker@123', salt);

    // 12 Registered College Workers (3 per section of work)
    const collegeWorkers: UserEntity[] = [
      // 1. Electrical Section (3 Workers)
      { id: 'worker-elec-1', name: 'Rajesh Kumar', email: 'rajesh.electrician@campvox.edu', passwordHash: workerHash, role: Role.MAINTENANCE, departmentId: 'dept-electrical', createdAt: new Date(), updatedAt: new Date() },
      { id: 'worker-elec-2', name: 'Suresh Varma', email: 'suresh.electrician@campvox.edu', passwordHash: workerHash, role: Role.MAINTENANCE, departmentId: 'dept-electrical', createdAt: new Date(), updatedAt: new Date() },
      { id: 'worker-elec-3', name: 'Mohan Das', email: 'mohan.electrician@campvox.edu', passwordHash: workerHash, role: Role.MAINTENANCE, departmentId: 'dept-electrical', createdAt: new Date(), updatedAt: new Date() },

      // 2. Plumbing Section (3 Workers)
      { id: 'worker-plumb-1', name: 'Ramesh Babu', email: 'ramesh.plumber@campvox.edu', passwordHash: workerHash, role: Role.MAINTENANCE, departmentId: 'dept-plumbing', createdAt: new Date(), updatedAt: new Date() },
      { id: 'worker-plumb-2', name: 'K. Venkatesh', email: 'venkatesh.plumber@campvox.edu', passwordHash: workerHash, role: Role.MAINTENANCE, departmentId: 'dept-plumbing', createdAt: new Date(), updatedAt: new Date() },
      { id: 'worker-plumb-3', name: 'Anand Swamy', email: 'anand.plumber@campvox.edu', passwordHash: workerHash, role: Role.MAINTENANCE, departmentId: 'dept-plumbing', createdAt: new Date(), updatedAt: new Date() },

      // 3. IT & Network Section (3 Workers)
      { id: 'worker-it-1', name: 'Karthik Reddy', email: 'karthik.it@campvox.edu', passwordHash: workerHash, role: Role.MAINTENANCE, departmentId: 'dept-wifi', createdAt: new Date(), updatedAt: new Date() },
      { id: 'worker-it-2', name: 'Priya Sharma', email: 'priya.it@campvox.edu', passwordHash: workerHash, role: Role.MAINTENANCE, departmentId: 'dept-wifi', createdAt: new Date(), updatedAt: new Date() },
      { id: 'worker-it-3', name: 'Vignesh Nair', email: 'vignesh.it@campvox.edu', passwordHash: workerHash, role: Role.MAINTENANCE, departmentId: 'dept-wifi', createdAt: new Date(), updatedAt: new Date() },

      // 4. Facilities & Maintenance Section (3 Workers)
      { id: 'worker-fac-1', name: 'Murugan Selvam', email: 'murugan.facilities@campvox.edu', passwordHash: workerHash, role: Role.MAINTENANCE, departmentId: 'dept-facilities', createdAt: new Date(), updatedAt: new Date() },
      { id: 'worker-fac-2', name: 'G. Balaji', email: 'balaji.facilities@campvox.edu', passwordHash: workerHash, role: Role.MAINTENANCE, departmentId: 'dept-facilities', createdAt: new Date(), updatedAt: new Date() },
      { id: 'worker-fac-3', name: 'Lakshmi Narayanan', email: 'lakshmi.facilities@campvox.edu', passwordHash: workerHash, role: Role.MAINTENANCE, departmentId: 'dept-facilities', createdAt: new Date(), updatedAt: new Date() },
    ];

    this.users = [
      { id: 'usr-admin', name: 'Admin Operations', email: 'admin@fixmycampus.edu', passwordHash: adminHash, role: Role.ADMIN, departmentId: 'dept-facilities', createdAt: new Date(), updatedAt: new Date() },
      { id: 'usr-student', name: 'Vishnupriya M. V.', email: 'student@fixmycampus.edu', passwordHash: studentHash, role: Role.STUDENT, departmentId: null, createdAt: new Date(), updatedAt: new Date() },
      { id: 'usr-faculty', name: 'Dr. Animesh Roy', email: 'faculty@fixmycampus.edu', passwordHash: facultyHash, role: Role.FACULTY, departmentId: null, createdAt: new Date(), updatedAt: new Date() },
      { id: 'usr-maint', name: 'Sajeev K.', email: 'maintenance@fixmycampus.edu', passwordHash: maintHash, role: Role.MAINTENANCE, departmentId: 'dept-facilities', createdAt: new Date(), updatedAt: new Date() },
      ...collegeWorkers,
    ];

    const now = new Date();
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    const fourHoursAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

    this.issues = [
      {
        id: 'FM1024',
        title: 'Broken Classroom Fan',
        description: 'The classroom fan is not working. It makes a slight noise when we try to turn it on.',
        category: Category.EQUIPMENT,
        priority: Priority.HIGH,
        location: 'Block A - Room 204',
        status: IssueStatus.IN_PROGRESS,
        reporterId: 'usr-student',
        assignedDepartmentId: 'dept-maintenance',
        assignedStaffId: 'usr-maint',
        createdAt: fourHoursAgo,
        updatedAt: twoHoursAgo,
        resolvedAt: null,
        verifiedAt: null,
      },
      {
        id: 'FM1025',
        title: 'Wi-Fi not working in Computer Lab',
        description: 'No internet connectivity in Computer Lab 2 on the third floor. Router light is blinking red.',
        category: Category.WIFI,
        priority: Priority.HIGH,
        location: 'Lab Block - Room 302',
        status: IssueStatus.REPORTED,
        reporterId: 'usr-student',
        assignedDepartmentId: null,
        assignedStaffId: null,
        createdAt: twoHoursAgo,
        updatedAt: twoHoursAgo,
        resolvedAt: null,
        verifiedAt: null,
      },
      {
        id: 'FM1026',
        title: 'Water leakage near Block B',
        description: 'Pipeline valve leaking continuously in ground floor restroom. Water spreading across the corridor.',
        category: Category.PLUMBING,
        priority: Priority.HIGH,
        location: 'Block B - Restroom 1F',
        status: IssueStatus.REOPENED,
        reporterId: 'usr-faculty',
        assignedDepartmentId: 'dept-plumbing',
        assignedStaffId: null,
        createdAt: oneDayAgo,
        updatedAt: fourHoursAgo,
        resolvedAt: null,
        verifiedAt: null,
      },
      {
        id: 'FM1027',
        title: 'Damaged laboratory chair',
        description: 'Hydraulic wheel snapped off student work bench chair 14.',
        category: Category.FURNITURE,
        priority: Priority.LOW,
        location: 'Lab Block - Chemistry Lab',
        status: IssueStatus.RESOLVED,
        reporterId: 'usr-student',
        assignedDepartmentId: 'dept-maintenance',
        assignedStaffId: 'usr-maint',
        createdAt: twoDaysAgo,
        updatedAt: oneDayAgo,
        resolvedAt: oneDayAgo,
        verifiedAt: null,
      },
      {
        id: 'FM1028',
        title: 'Electrical socket not working',
        description: 'Front presentation podium 3-pin socket gives no power to laptop chargers.',
        category: Category.ELECTRICAL,
        priority: Priority.MEDIUM,
        location: 'Block C - Room 108',
        status: IssueStatus.VERIFIED,
        reporterId: 'usr-student',
        assignedDepartmentId: 'dept-electrical',
        assignedStaffId: null,
        createdAt: new Date(now.getTime() - 72 * 60 * 60 * 1000),
        updatedAt: twoDaysAgo,
        resolvedAt: twoDaysAgo,
        verifiedAt: twoDaysAgo,
      },
      {
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
      },
    ];

    this.issueImages = [
      {
        id: 'img-1',
        issueId: 'FM1024',
        url: 'https://images.unsplash.com/photo-1594916892694-82ee12389369?auto=format&fit=crop&w=800&q=80',
        createdAt: fourHoursAgo,
      },
      {
        id: 'img-2',
        issueId: 'FM1026',
        url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
        createdAt: oneDayAgo,
      },
      {
        id: 'img-fm7507',
        issueId: 'FM7507',
        url: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=800&q=80',
        createdAt: now,
      },
    ];

    this.statusHistories = [
      {
        id: 'sh-fm7507-1',
        issueId: 'FM7507',
        oldStatus: null,
        newStatus: IssueStatus.REPORTED,
        changedBy: 'usr-student',
        createdAt: now,
      },
      {
        id: 'sh-1',
        issueId: 'FM1024',
        oldStatus: null,
        newStatus: IssueStatus.REPORTED,
        changedBy: 'usr-student',
        createdAt: fourHoursAgo,
      },
      {
        id: 'sh-2',
        issueId: 'FM1024',
        oldStatus: IssueStatus.REPORTED,
        newStatus: IssueStatus.ASSIGNED,
        changedBy: 'usr-admin',
        createdAt: new Date(fourHoursAgo.getTime() + 30 * 60 * 1000),
      },
      {
        id: 'sh-3',
        issueId: 'FM1024',
        oldStatus: IssueStatus.ASSIGNED,
        newStatus: IssueStatus.IN_PROGRESS,
        changedBy: 'usr-maint',
        createdAt: twoHoursAgo,
      },
    ];

    this.comments = [
      {
        id: 'comm-1',
        issueId: 'FM1024',
        userId: 'usr-maint',
        comment: 'Started working on the issue. Replacement capacitor required, will update soon.',
        createdAt: twoHoursAgo,
      },
      {
        id: 'comm-2',
        issueId: 'FM1024',
        userId: 'usr-student',
        comment: 'Thank you! Please let me know once it is fixed so we can resume lecture recording.',
        createdAt: new Date(twoHoursAgo.getTime() + 15 * 60 * 1000),
      },
    ];

    this.notifications = [
      {
        id: 'notif-1',
        userId: 'usr-student',
        issueId: 'FM1024',
        title: 'Issue Assigned to Maintenance',
        message: 'Issue #FM1024 has been assigned to General Maintenance.',
        isRead: false,
        createdAt: new Date(fourHoursAgo.getTime() + 30 * 60 * 1000),
      },
      {
        id: 'notif-2',
        userId: 'usr-student',
        issueId: 'FM1024',
        title: 'Work In Progress',
        message: 'Your reported classroom fan issue is now In Progress with Sajeev K.',
        isRead: false,
        createdAt: twoHoursAgo,
      },
      {
        id: 'notif-3',
        userId: 'usr-maint',
        issueId: 'FM1024',
        title: 'New Task Assignment',
        message: 'You have been assigned to Issue #FM1024 (Broken Classroom Fan).',
        isRead: false,
        createdAt: new Date(fourHoursAgo.getTime() + 30 * 60 * 1000),
      },
    ];

    this.logger.log('Seed records loaded into database store.');
  }

  async seedToPrisma() {
    try {
      const deptCount = await this.prisma.department.count();
      if (deptCount === 0) {
        for (const dept of this.departments) {
          await this.prisma.department.create({
            data: { id: dept.id, name: dept.name, description: dept.description },
          });
        }
      }
    } catch (e) {
      this.logger.warn(`Failed to seed to PostgreSQL: ${e.message}`);
    }
  }

  // Populate helper
  populateIssue(issue: IssueEntity): IssueEntity {
    return {
      ...issue,
      reporter: this.users.find((u) => u.id === issue.reporterId),
      assignedDepartment: this.departments.find((d) => d.id === issue.assignedDepartmentId) || null,
      assignedStaff: this.users.find((u) => u.id === issue.assignedStaffId) || null,
      images: this.issueImages.filter((img) => img.issueId === issue.id),
      comments: this.comments
        .filter((c) => c.issueId === issue.id)
        .map((c) => ({
          ...c,
          user: this.users.find((u) => u.id === c.userId),
        })),
      statusHistory: this.statusHistories
        .filter((h) => h.issueId === issue.id)
        .map((h) => ({
          ...h,
          changer: this.users.find((u) => u.id === h.changedBy),
        })),
    };
  }
}
