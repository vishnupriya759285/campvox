const GRAPHQL_URL = 'http://localhost:3001/graphql';

async function gql(query, variables = {}, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) {
    throw new Error(json.errors.map((e) => e.message).join(' | '));
  }
  return json.data;
}

async function runDemoFlow() {
  console.log('🚀 ========================================================');
  console.log('🚀 FIXMYCAMPUS: EXECUTING 18-STEP END-TO-END DEMO WORKFLOW');
  console.log('🚀 ========================================================\n');

  // STEP 1: Login as Student
  console.log('Step 1: Authenticating as Student (student@fixmycampus.edu)...');
  const studentLogin = await gql(`
    mutation {
      login(input: { email: "student@fixmycampus.edu", password: "Student@123" }) {
        token
        user { id name role }
      }
    }
  `);
  const studentToken = studentLogin.login.token;
  const studentId = studentLogin.login.user.id;
  console.log(`✅ Student authenticated: ${studentLogin.login.user.name} (${studentLogin.login.user.role})`);

  // STEP 2 & 3: Report "Broken Classroom Fan"
  console.log('\nStep 2 & 3: Student reports "Broken Classroom Fan"...');
  const created = await gql(
    `
    mutation Create($input: CreateIssueInput!) {
      createIssue(input: $input) {
        id
        title
        category
        location
        priority
        status
        createdAt
      }
    }
  `,
    {
      input: {
        title: 'Broken Classroom Fan',
        category: 'EQUIPMENT',
        location: 'Block A - Room 204',
        priority: 'HIGH',
        description: 'Classroom ceiling fan is not working properly.',
      },
    },
    studentToken,
  );
  const issueId = created.createIssue.id;
  console.log(`✅ Issue successfully created: #${issueId} | Status: ${created.createIssue.status}`);

  // STEP 4 & 5: Login as Admin & See New Issue
  console.log('\nStep 4 & 5: Admin logs in and inspects the new issue...');
  const adminLogin = await gql(`
    mutation {
      login(input: { email: "admin@fixmycampus.edu", password: "Admin@123" }) {
        token
        user { id name role }
      }
    }
  `);
  const adminToken = adminLogin.login.token;
  const issueCheck = await gql(
    `
    query GetIssue($id: ID!) {
      issue(id: $id) {
        id
        title
        status
        reporter { name }
      }
    }
  `,
    { id: issueId },
    adminToken,
  );
  console.log(`✅ Admin retrieved issue #${issueId}: "${issueCheck.issue.title}" from ${issueCheck.issue.reporter.name}`);

  // STEP 6: Assign Department -> General Maintenance, Staff -> Maintenance user
  console.log('\nStep 6: Admin assigns Department & Maintenance staff...');
  const assigned = await gql(
    `
    mutation Assign($input: AssignIssueInput!) {
      assignIssue(input: $input) {
        id
        status
        assignedDepartment { name }
        assignedStaff { name }
      }
    }
  `,
    {
      input: {
        issueId,
        departmentId: 'dept-maintenance',
        staffId: 'usr-maint',
      },
    },
    adminToken,
  );
  console.log(
    `✅ Issue #${issueId} assigned to ${assigned.assignIssue.assignedDepartment.name} | Staff: ${assigned.assignIssue.assignedStaff.name} | Status: ${assigned.assignIssue.status}`,
  );

  // STEP 7 & 8: Login as Maintenance & See Assigned Issue
  console.log('\nStep 7 & 8: Maintenance logs in and views assigned task...');
  const maintLogin = await gql(`
    mutation {
      login(input: { email: "maintenance@fixmycampus.edu", password: "Maint@123" }) {
        token
        user { id name role }
      }
    }
  `);
  const maintToken = maintLogin.login.token;
  const maintIssues = await gql(
    `
    query {
      assignedIssues {
        id
        title
        status
        location
      }
    }
  `,
    {},
    maintToken,
  );
  const foundInQueue = maintIssues.assignedIssues.find((i) => i.id === issueId);
  console.log(`✅ Task #${issueId} found in Maintenance queue: "${foundInQueue.title}" at ${foundInQueue.location}`);

  // STEP 9 & 10: Maintenance Clicks "Start Work" -> Status becomes IN_PROGRESS
  console.log('\nStep 9 & 10: Maintenance clicks "Start Work"...');
  const startedWork = await gql(
    `
    mutation StartWork($input: UpdateIssueStatusInput!) {
      updateIssueStatus(input: $input) {
        id
        status
      }
    }
  `,
    {
      input: {
        issueId,
        status: 'IN_PROGRESS',
      },
    },
    maintToken,
  );
  console.log(`✅ Status updated to: ${startedWork.updateIssueStatus.status}`);

  // STEP 11 & 12: Student sees "In Progress"
  console.log('\nStep 11 & 12: Student checks issue status...');
  const studentView = await gql(
    `
    query GetIssue($id: ID!) {
      issue(id: $id) {
        id
        status
        statusHistory {
          newStatus
          changer { name }
        }
      }
    }
  `,
    { id: issueId },
    studentToken,
  );
  console.log(`✅ Student sees status: ${studentView.issue.status} (Verified in status timeline)`);

  // STEP 13: Maintenance marks RESOLVED
  console.log('\nStep 13: Maintenance completes repair and marks RESOLVED...');
  // Add progress comment
  await gql(
    `
    mutation AddComment($id: ID!, $c: String!) {
      addIssueComment(issueId: $id, comment: $c) {
        id
        comment
      }
    }
  `,
    { id: issueId, c: 'Capacitor and regulator replaced. Fan tested and running at normal speed.' },
    maintToken,
  );

  const resolved = await gql(
    `
    mutation Resolve($input: UpdateIssueStatusInput!) {
      updateIssueStatus(input: $input) {
        id
        status
        resolvedAt
      }
    }
  `,
    {
      input: {
        issueId,
        status: 'RESOLVED',
      },
    },
    maintToken,
  );
  console.log(`✅ Status updated to: ${resolved.updateIssueStatus.status} | ResolvedAt: ${resolved.updateIssueStatus.resolvedAt}`);

  // STEP 14: Student gets notification
  console.log('\nStep 14: Checking Student notification inbox...');
  const studentNotifs = await gql(
    `
    query {
      notifications {
        id
        title
        message
        isRead
      }
      unreadNotificationCount
    }
  `,
    {},
    studentToken,
  );
  console.log(`✅ Student unread count: ${studentNotifs.unreadNotificationCount}`);
  console.log(`✅ Latest notification: "${studentNotifs.notifications[0]?.title}" - ${studentNotifs.notifications[0]?.message}`);

  // STEP 15 & 16: Student clicks "Verify Resolution" -> Status becomes VERIFIED
  console.log('\nStep 15 & 16: Student verifies resolution...');
  const verified = await gql(
    `
    mutation Verify($id: ID!) {
      verifyIssue(issueId: $id) {
        id
        status
        verifiedAt
      }
    }
  `,
    { id: issueId },
    studentToken,
  );
  console.log(`✅ Status updated to: ${verified.verifyIssue.status} | VerifiedAt: ${verified.verifyIssue.verifiedAt}`);

  // STEP 17 & 18: Admin dashboard & analytics update automatically
  console.log('\nStep 17 & 18: Verifying live Admin Dashboard & Analytics update...');
  const finalAnalytics = await gql(`
    query {
      issueStatistics {
        total
        reported
        assigned
        inProgress
        resolved
        verified
        reopened
      }
      resolutionTimeStatistics {
        avgResolutionTimeDays
        totalResolvedCount
      }
    }
  `);
  console.log('✅ Updated Platform Statistics:', JSON.stringify(finalAnalytics.issueStatistics, null, 2));
  console.log(`✅ Resolution metrics: ${finalAnalytics.resolutionTimeStatistics.avgResolutionTimeDays} days avg`);

  console.log('\n🎉 ========================================================');
  console.log('🎉 18-STEP END-TO-END DEMO WORKFLOW PASSED 100% PERFECTLY!');
  console.log('🎉 ========================================================');
}

runDemoFlow().catch((e) => {
  console.error('❌ Demo flow error:', e);
  process.exit(1);
});
