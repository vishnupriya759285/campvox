import { gql } from '@apollo/client';

export const ME_QUERY = gql`
  query Me {
    me {
      id
      name
      email
      role
      departmentId
      department {
        id
        name
      }
    }
  }
`;

export const GET_DEPARTMENTS = gql`
  query GetDepartments {
    departments {
      id
      name
      description
      openIssuesCount
      inProgressCount
      resolvedCount
      createdAt
    }
  }
`;

export const GET_USERS = gql`
  query GetUsers($role: Role, $departmentId: String) {
    users(role: $role, departmentId: $departmentId) {
      id
      name
      email
      role
      departmentId
      department {
        id
        name
      }
      createdAt
    }
  }
`;

export const GET_ISSUES = gql`
  query GetIssues($filter: IssueFilterInput) {
    issues(filter: $filter) {
      id
      title
      description
      category
      priority
      location
      status
      reporterId
      reporter {
        id
        name
        email
        role
      }
      assignedDepartmentId
      assignedDepartment {
        id
        name
      }
      assignedStaffId
      assignedStaff {
        id
        name
      }
      images {
        id
        url
      }
      createdAt
      updatedAt
      resolvedAt
      verifiedAt
    }
  }
`;

export const GET_MY_ISSUES = gql`
  query GetMyIssues {
    myIssues {
      id
      title
      description
      category
      priority
      location
      status
      assignedDepartment {
        id
        name
      }
      assignedStaff {
        id
        name
      }
      images {
        id
        url
      }
      createdAt
      updatedAt
      resolvedAt
      verifiedAt
    }
  }
`;

export const GET_ASSIGNED_ISSUES = gql`
  query GetAssignedIssues {
    assignedIssues {
      id
      title
      description
      category
      priority
      location
      status
      reporter {
        id
        name
        email
      }
      assignedDepartment {
        id
        name
      }
      images {
        id
        url
      }
      createdAt
      updatedAt
      resolvedAt
      verifiedAt
    }
  }
`;

export const GET_ISSUE = gql`
  query GetIssue($id: ID!) {
    issue(id: $id) {
      id
      title
      description
      category
      priority
      location
      status
      reporterId
      reporter {
        id
        name
        email
        role
      }
      assignedDepartmentId
      assignedDepartment {
        id
        name
      }
      assignedStaffId
      assignedStaff {
        id
        name
      }
      images {
        id
        url
      }
      comments {
        id
        userId
        comment
        createdAt
        user {
          id
          name
          role
        }
      }
      statusHistory {
        id
        oldStatus
        newStatus
        changedBy
        createdAt
        changer {
          id
          name
          role
        }
      }
      createdAt
      updatedAt
      resolvedAt
      verifiedAt
    }
  }
`;

export const GET_NOTIFICATIONS = gql`
  query GetNotifications {
    notifications {
      id
      userId
      issueId
      title
      message
      isRead
      createdAt
      issue {
        id
        title
        status
      }
    }
  }
`;

export const GET_UNREAD_COUNT = gql`
  query GetUnreadNotificationCount {
    unreadNotificationCount
  }
`;

export const GET_ANALYTICS_OVERVIEW = gql`
  query GetAnalyticsOverview {
    issueStatistics {
      total
      reported
      assigned
      inProgress
      resolved
      verified
      reopened
    }
    issuesByCategory {
      category
      count
    }
    issuesByLocation {
      location
      count
    }
    issuesByDepartment {
      departmentId
      departmentName
      openCount
      inProgressCount
      resolvedCount
    }
    resolutionTimeStatistics {
      avgResolutionTimeDays
      totalResolvedCount
    }
    recurringIssues {
      category
      location
      count
    }
    monthlyIssueTrends {
      month
      reportedCount
      resolvedCount
    }
  }
`;
