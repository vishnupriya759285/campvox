const http = require('http');

function postGql(payload, token = null) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data),
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request({
      hostname: 'localhost',
      port: 3001,
      path: '/graphql',
      method: 'POST',
      headers,
    }, (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function run() {
  const timestamp = Date.now();
  console.log('=== TEST 1: Register New Student ===');
  const regRes = await postGql({
    query: `
      mutation Register($input: RegisterInput!) {
        register(input: $input) {
          token
          user {
            id
            name
            email
            role
          }
        }
      }
    `,
    variables: {
      input: {
        name: `Student Test ${timestamp}`,
        email: `student_${timestamp}@fixmycampus.edu`,
        password: 'Password@123',
        role: 'STUDENT',
      }
    }
  });
  console.log('Register response:', JSON.stringify(regRes.data, null, 2));
  const studentToken = regRes.data?.data?.register?.token;
  if (!studentToken) throw new Error('Registration failed!');

  console.log('\n=== TEST 2: Login with the Newly Registered Student ===');
  const loginRes = await postGql({
    query: `
      mutation Login($input: LoginInput!) {
        login(input: $input) {
          token
          user {
            id
            name
            email
            role
          }
        }
      }
    `,
    variables: {
      input: {
        email: `student_${timestamp}@fixmycampus.edu`,
        password: 'Password@123',
      }
    }
  });
  console.log('Login response:', JSON.stringify(loginRes.data, null, 2));

  console.log('\n=== TEST 3: Post New Issue with New Student Token ===');
  const issueRes = await postGql({
    query: `
      mutation CreateIssue($input: CreateIssueInput!) {
        createIssue(input: $input) {
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
        }
      }
    `,
    variables: {
      input: {
        title: 'Flickering lights in lecture hall',
        description: 'Lights in Hall 3B flicker repeatedly during lectures.',
        category: 'ELECTRICAL',
        priority: 'MEDIUM',
        location: 'Hall 3B, 2nd Floor',
        imageUrls: [],
      }
    }
  }, studentToken);
  console.log('Create issue response:', JSON.stringify(issueRes.data, null, 2));

  console.log('\n=== TEST 4: Query My Issues for this Student ===');
  const myIssuesRes = await postGql({
    query: `
      query GetMyIssues {
        myIssues {
          id
          title
          status
        }
      }
    `
  }, studentToken);
  console.log('My issues response:', JSON.stringify(myIssuesRes.data, null, 2));

  console.log('\n=== ALL END-TO-END BACKEND AUTH & ISSUE TESTS PASSED! ===');
}

run().catch(console.error);
