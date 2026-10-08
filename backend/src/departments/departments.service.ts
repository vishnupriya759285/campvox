import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { DbService, DepartmentEntity } from '../prisma/db.service';
import { CreateDepartmentInput, UpdateDepartmentInput } from '../common/types/graphql.inputs';
import { DepartmentType } from '../common/types/graphql.types';
import { IssueStatus } from '../common/enums';

@Injectable()
export class DepartmentsService {
  constructor(private readonly db: DbService) {}

  async findAll(): Promise<DepartmentType[]> {
    const depts = this.db.departments;
    return depts.map((d) => this.enrichDepartment(d));
  }

  async findOne(id: string): Promise<DepartmentType> {
    const dept = this.db.departments.find((d) => d.id === id);
    if (!dept) {
      throw new NotFoundException(`Department with id ${id} not found`);
    }
    return this.enrichDepartment(dept);
  }

  async create(input: CreateDepartmentInput): Promise<DepartmentType> {
    const exists = this.db.departments.find((d) => d.name.toLowerCase() === input.name.toLowerCase());
    if (exists) {
      throw new BadRequestException('A department with this name already exists');
    }

    const newDept: DepartmentEntity = {
      id: 'dept-' + Date.now().toString(36),
      name: input.name,
      description: input.description || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.db.departments.push(newDept);
    return this.enrichDepartment(newDept);
  }

  async update(input: UpdateDepartmentInput): Promise<DepartmentType> {
    const dept = this.db.departments.find((d) => d.id === input.id);
    if (!dept) {
      throw new NotFoundException(`Department with id ${input.id} not found`);
    }
    if (input.name) {
      const duplicate = this.db.departments.find(
        (d) => d.id !== input.id && d.name.toLowerCase() === input.name.toLowerCase(),
      );
      if (duplicate) {
        throw new BadRequestException('Another department with this name already exists');
      }
      dept.name = input.name;
    }
    if (input.description !== undefined) {
      dept.description = input.description;
    }
    dept.updatedAt = new Date();
    return this.enrichDepartment(dept);
  }

  async delete(id: string): Promise<boolean> {
    const dept = this.db.departments.find((d) => d.id === id);
    if (!dept) {
      throw new NotFoundException(`Department with id ${id} not found`);
    }

    const linkedIssues = this.db.issues.filter((i) => i.assignedDepartmentId === id);
    if (linkedIssues.length > 0) {
      throw new BadRequestException(
        `Cannot delete department because it has ${linkedIssues.length} assigned issues. Reassign them first.`,
      );
    }

    this.db.departments = this.db.departments.filter((d) => d.id !== id);
    // Disconnect users
    this.db.users.forEach((u) => {
      if (u.departmentId === id) {
        u.departmentId = null;
      }
    });
    return true;
  }

  private enrichDepartment(dept: DepartmentEntity): DepartmentType {
    const deptIssues = this.db.issues.filter((i) => i.assignedDepartmentId === dept.id);
    const openIssuesCount = deptIssues.filter(
      (i) => i.status === IssueStatus.REPORTED || i.status === IssueStatus.ASSIGNED || i.status === IssueStatus.REOPENED,
    ).length;
    const inProgressCount = deptIssues.filter((i) => i.status === IssueStatus.IN_PROGRESS).length;
    const resolvedCount = deptIssues.filter(
      (i) => i.status === IssueStatus.RESOLVED || i.status === IssueStatus.VERIFIED,
    ).length;

    return {
      id: dept.id,
      name: dept.name,
      description: dept.description || undefined,
      openIssuesCount,
      inProgressCount,
      resolvedCount,
      createdAt: dept.createdAt,
      updatedAt: dept.updatedAt,
    };
  }
}
