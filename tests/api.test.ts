import { POST } from '@/app/api/api-endpoint/route';
import { NextRequest } from 'next/server';

// Mock the queue module
jest.mock('@/lib/queue', () => ({
  addTaskToQueue: jest.fn().mockResolvedValue({ id: 'test-job-id' }),
}));

describe('/api/api-endpoint', () => {
  const validRequest = {
    secret: 'test_secret',
    email: 'test@example.com',
    task: 'test-repo',
    round: 1,
    brief: 'Create a todo app',
    nonce: 'test-nonce-123',
    evaluation_url: 'https://example.com/eval',
    checks: [],
  };

  it('should accept valid request and return 200', async () => {
    const request = new NextRequest('http://localhost:3000/api/api-endpoint', {
      method: 'POST',
      body: JSON.stringify(validRequest),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe('processing');
    expect(data.task).toBe('test-repo');
    expect(data.round).toBe(1);
  });

  it('should reject request with invalid secret', async () => {
    const invalidRequest = { ...validRequest, secret: 'wrong_secret' };
    
    const request = new NextRequest('http://localhost:3000/api/api-endpoint', {
      method: 'POST',
      body: JSON.stringify(invalidRequest),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should reject request with missing fields', async () => {
    const invalidRequest = { secret: 'test_secret', email: 'test@example.com' };
    
    const request = new NextRequest('http://localhost:3000/api/api-endpoint', {
      method: 'POST',
      body: JSON.stringify(invalidRequest),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid request');
  });

  it('should validate email format', async () => {
    const invalidRequest = { ...validRequest, email: 'invalid-email' };
    
    const request = new NextRequest('http://localhost:3000/api/api-endpoint', {
      method: 'POST',
      body: JSON.stringify(invalidRequest),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid request');
  });

  it('should validate round number (1 or 2 only)', async () => {
    const invalidRequest = { ...validRequest, round: 3 };
    
    const request = new NextRequest('http://localhost:3000/api/api-endpoint', {
      method: 'POST',
      body: JSON.stringify(invalidRequest),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid request');
  });
});
