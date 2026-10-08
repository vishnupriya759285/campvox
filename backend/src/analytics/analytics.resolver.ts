import { Resolver, Query } from '@nestjs/graphql';
import { AnalyticsService } from './analytics.service';
import {
  IssueStatistics,
  CategoryCount,
  LocationCount,
  DepartmentWorkload,
  ResolutionTimeStatistics,
  RecurringIssue,
  MonthlyTrend,
} from '../common/types/graphql.types';

@Resolver()
export class AnalyticsResolver {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Query(() => IssueStatistics)
  async issueStatistics(): Promise<IssueStatistics> {
    return this.analyticsService.getStatistics();
  }

  @Query(() => [CategoryCount])
  async issuesByCategory(): Promise<CategoryCount[]> {
    return this.analyticsService.getByCategory();
  }

  @Query(() => [LocationCount])
  async issuesByLocation(): Promise<LocationCount[]> {
    return this.analyticsService.getByLocation();
  }

  @Query(() => [DepartmentWorkload])
  async issuesByDepartment(): Promise<DepartmentWorkload[]> {
    return this.analyticsService.getByDepartment();
  }

  @Query(() => ResolutionTimeStatistics)
  async resolutionTimeStatistics(): Promise<ResolutionTimeStatistics> {
    return this.analyticsService.getResolutionTimeStatistics();
  }

  @Query(() => [RecurringIssue])
  async recurringIssues(): Promise<RecurringIssue[]> {
    return this.analyticsService.getRecurringIssues();
  }

  @Query(() => [MonthlyTrend])
  async monthlyIssueTrends(): Promise<MonthlyTrend[]> {
    return this.analyticsService.getMonthlyTrends();
  }
}
