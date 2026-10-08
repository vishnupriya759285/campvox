import { gql } from '@apollo/client';

export const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user {
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
  }
`;

export const REGISTER_MUTATION = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      token
      user {
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
  }
`;

export const CREATE_ISSUE_MUTATION = gql`
  mutation CreateIssue($input: CreateIssueInput!) {
    createIssue(input: $input) {
      id
      title
      description
      category
      priority
      location
      status
      createdAt
    }
  }
`;

export const UPDATE_ISSUE_STATUS_MUTATION = gql`
  mutation UpdateIssueStatus($input: UpdateIssueStatusInput!) {
    updateIssueStatus(input: $input) {
      id
      status
      updatedAt
      resolvedAt
      verifiedAt
    }
  }
`;

export const ASSIGN_ISSUE_MUTATION = gql`
  mutation AssignIssue($input: AssignIssueInput!) {
    assignIssue(input: $input) {
      id
      status
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
    }
  }
`;

export const VERIFY_ISSUE_MUTATION = gql`
  mutation VerifyIssue($issueId: ID!) {
    verifyIssue(issueId: $issueId) {
      id
      status
      verifiedAt
    }
  }
`;

export const REOPEN_ISSUE_MUTATION = gql`
  mutation ReopenIssue($issueId: ID!) {
    reopenIssue(issueId: $issueId) {
      id
      status
      updatedAt
    }
  }
`;

export const ADD_ISSUE_COMMENT_MUTATION = gql`
  mutation AddIssueComment($issueId: ID!, $comment: String!) {
    addIssueComment(issueId: $issueId, comment: $comment) {
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
  }
`;

export const MARK_NOTIFICATION_READ_MUTATION = gql`
  mutation MarkNotificationRead($id: ID!) {
    markNotificationRead(id: $id) {
      id
      isRead
    }
  }
`;

export const MARK_ALL_NOTIFICATIONS_READ_MUTATION = gql`
  mutation MarkAllNotificationsRead {
    markAllNotificationsRead
  }
`;

export const CREATE_DEPARTMENT_MUTATION = gql`
  mutation CreateDepartment($input: CreateDepartmentInput!) {
    createDepartment(input: $input) {
      id
      name
      description
    }
  }
`;

export const UPDATE_USER_ROLE_MUTATION = gql`
  mutation UpdateUserRole($userId: ID!, $role: Role!) {
    updateUserRole(userId: $userId, role: $role) {
      id
      role
    }
  }
`;

export const UPDATE_USER_DEPARTMENT_MUTATION = gql`
  mutation UpdateUserDepartment($userId: ID!, $departmentId: String) {
    updateUserDepartment(userId: $userId, departmentId: $departmentId) {
      id
      departmentId
      department {
        id
        name
      }
    }
  }
`;

export const UPLOAD_IMAGE_MUTATION = gql`
  mutation UploadImage($base64Data: String!, $fileName: String) {
    uploadImage(base64Data: $base64Data, fileName: $fileName)
  }
`;
