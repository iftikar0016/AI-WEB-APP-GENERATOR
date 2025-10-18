import { NextRequest, NextResponse } from 'next/server';
import { getTaskStatus } from '@/lib/queue';

export const runtime = 'nodejs';

/**
 * GET /api/task-status?taskId=xxx
 * Returns the current status of a task
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const taskId = searchParams.get('taskId');

    if (!taskId) {
      return NextResponse.json(
        { error: 'taskId parameter is required' },
        { status: 400 }
      );
    }

    const status = getTaskStatus(taskId);

    if (!status) {
      console.log(`Task not found: ${taskId}`);
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    console.log(`Task status retrieved: ${taskId}, status: ${status.status}, progress: ${status.progress}%`);
    return NextResponse.json(status, { status: 200 });
  } catch (error) {
    console.error('Error getting task status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
