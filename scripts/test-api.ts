#!/usr/bin/env node
import http from 'http';

const BASE_URL = 'http://localhost:5000/api';
let authToken: string | null = null;
const testResults: Array<{ name: string; passed: boolean; result: string }> = [];

const makeRequest = (
  method: string,
  path: string,
  data?: Record<string, unknown>,
): Promise<{ status: number | undefined; body: any }> => {
  return new Promise((resolve, reject) => {
    const url = new URL(`${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`);

    const req = http.request(
      url,
      {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () => {
          try {
            resolve({
              status: res.statusCode,
              body: body ? JSON.parse(body) : {},
            });
          } catch {
            resolve({
              status: res.statusCode,
              body,
            });
          }
        });
      },
    );

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
};

const addResult = async (name: string, testFn: () => Promise<string>): Promise<void> => {
  try {
    const result = await testFn();
    testResults.push({ name, passed: true, result });
  } catch (error) {
    testResults.push({
      name,
      passed: false,
      result: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

void (async () => {
  await addResult('Health Check', async () => {
    const res = await makeRequest('GET', '/health');
    if (res.status !== 200 || res.body.status !== 'OK') {
      throw new Error(`Expected 200/OK, received ${res.status}`);
    }
    return 'Health endpoint responded successfully';
  });

  await addResult('Register User', async () => {
    const suffix = Date.now();
    const res = await makeRequest('POST', '/auth/register', {
      username: `caseuser_${suffix}`,
      email: `case_${suffix}@example.com`,
      password: 'CaseStudy123',
    });

    if (res.status !== 201) {
      throw new Error(`Expected 201, received ${res.status}`);
    }

    return 'Registration succeeded';
  });

  await addResult('Login User', async () => {
    const suffix = Date.now();
    const username = `login_${suffix}`;
    await makeRequest('POST', '/auth/register', {
      username,
      email: `${username}@example.com`,
      password: 'CaseStudy123',
    });

    const res = await makeRequest('POST', '/auth/login', {
      username,
      password: 'CaseStudy123',
    });

    if (res.status !== 200 || !res.body.token) {
      throw new Error(`Expected token, received ${res.status}`);
    }

    authToken = res.body.token;
    return 'Login succeeded';
  });

  await addResult('Get My Profile', async () => {
    const res = await makeRequest('GET', '/auth/me');
    if (res.status !== 200 || !res.body.user) {
      throw new Error(`Expected 200 with user payload, received ${res.status}`);
    }
    return 'Authenticated profile retrieved';
  });

  console.log('\nAPI smoke test results\n');
  testResults.forEach((test) => {
    const prefix = test.passed ? '[PASS]' : '[FAIL]';
    console.log(`${prefix} ${test.name}: ${test.result}`);
  });

  const passed = testResults.filter((test) => test.passed).length;
  console.log(`\nTotal: ${passed}/${testResults.length} checks passed`);
  process.exit(passed === testResults.length ? 0 : 1);
})().catch((error) => {
  console.error('API smoke test failed:', error);
  process.exit(1);
});
