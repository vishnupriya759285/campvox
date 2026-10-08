const http = require('http');

async function testMutation(headerAuth, title, location) {
  const payload = JSON.stringify({
    query: `
      mutation CreateIssue($input: CreateIssueInput!) {
        createIssue(input: $input) {
          id
          title
          location
          status
          reporterId
        }
      }
    `,
    variables: {
      input: {
        title: title,
        category: "EQUIPMENT",
        location: location,
        priority: "HIGH",
        description: "Testing issue reporting to verify unauthorized error fix",
        imageUrls: []
      }
    }
  });

  return new Promise((resolve, reject) => {
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    };
    if (headerAuth) {
      headers['Authorization'] = headerAuth;
    }

    const req = http.request({
      hostname: 'localhost',
      port: 3001,
      path: '/graphql',
      method: 'POST',
      headers: headers
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch(e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function run() {
  console.log('--- Test 1: No Authorization header ---');
  const res1 = await testMutation(null, "wifi issue (no auth)", "DB Block A");
  console.log('Res 1:', JSON.stringify(res1, null, 2));

  console.log('\n--- Test 2: Bogus/Malformed Token ---');
  const res2 = await testMutation('Bearer invalid-old-fake-token', "wifi issue (bogus token)", "DB Block B");
  console.log('Res 2:', JSON.stringify(res2, null, 2));

  console.log('\n--- Test 3: Valid Student JWT ---');
  // First login
  const loginRes = await new Promise((resolve) => {
    const payload = JSON.stringify({
      query: `mutation { login(input: { email: "student@fixmycampus.edu", password: "Student@123" }) { token } }`
    });
    const req = http.request({
      hostname: 'localhost',
      port: 3001,
      path: '/graphql',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) }
    }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve(JSON.parse(d)));
    });
    req.write(payload);
    req.end();
  });

  const token = loginRes.data?.login?.token;
  console.log('Obtained token:', token ? 'Token OK' : 'Failed to get token');

  const res3 = await testMutation(`Bearer ${token}`, "wifi issue (valid JWT)", "DB Block C");
  console.log('Res 3:', JSON.stringify(res3, null, 2));
}

run().catch(console.error);
