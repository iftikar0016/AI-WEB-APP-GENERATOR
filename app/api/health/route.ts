import { NextResponse } from 'next/server';
import { getQueueHealth } from '@/lib/queue';

/**
 * GET /api/health
 * Health check endpoint with queue status
 */
export async function GET() {
  try {
    const queueHealth = await getQueueHealth();

    return NextResponse.json(
      {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        queue: queueHealth,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Health check error:', error);

    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
}
