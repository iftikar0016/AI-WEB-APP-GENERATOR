'use client';

import { useEffect, useState, useRef } from 'react';

interface HealthStatus {
  status: string;
  queue: {
    waiting: number;
    active: number;
    completed: number;
    failed: number;
  };
}

interface TaskStatus {
  taskId: string;
  status: 'waiting' | 'active' | 'completed' | 'failed';
  stage: string;
  progress: number;
  message?: string;
  githubUrl?: string;
  pagesUrl?: string;
  commitSha?: string;
  error?: string;
}

export default function Home() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    secret: '',
    email: '',
    task: '',
    round: 1,
    brief: '',
    nonce: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [taskStatus, setTaskStatus] = useState<TaskStatus | null>(null);
  const [polling, setPolling] = useState(false);
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);
  const pollingAttempts = useRef(0);
  const maxPollingAttempts = 60; // 60 attempts * 2 seconds = 2 minutes max

  const fetchHealth = () => {
    setLoading(true);
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        setHealth(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch health:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchHealth();
    // No auto-refresh to save Vercel costs
  }, []);

  // Poll task status
  const pollTaskStatus = async (taskId: string) => {
    pollingAttempts.current += 1;

    // Stop polling after max attempts (2 minutes)
    if (pollingAttempts.current > maxPollingAttempts) {
      console.error('Max polling attempts reached, stopping');
      setPolling(false);
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
        pollingInterval.current = null;
      }
      setTaskStatus({
        taskId,
        status: 'failed',
        stage: 'failed',
        progress: 0,
        error: 'Timeout: Could not retrieve task status',
      });
      return;
    }

    try {
      const response = await fetch(`/api/task-status?taskId=${encodeURIComponent(taskId)}`);
      if (response.ok) {
        const status: TaskStatus = await response.json();
        setTaskStatus(status);

        // Stop polling if completed or failed
        if (status.status === 'completed' || status.status === 'failed') {
          setPolling(false);
          if (pollingInterval.current) {
            clearInterval(pollingInterval.current);
            pollingInterval.current = null;
          }
          fetchHealth(); // Refresh health status
        }
      } else if (response.status === 404) {
        // Task not found - might be in different queue instance, keep polling for a bit
        console.warn('Task not found yet, continuing to poll...');
      } else {
        // Other error - stop polling
        console.error('Error polling task status:', response.status);
        setPolling(false);
        if (pollingInterval.current) {
          clearInterval(pollingInterval.current);
          pollingInterval.current = null;
        }
      }
    } catch (error) {
      console.error('Error polling task status:', error);
    }
  };

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTaskStatus(null);

    try {
      const response = await fetch('/api/api-endpoint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          secret: formData.secret,
          email: formData.email,
          task: formData.task,
          round: formData.round,
          brief: formData.brief,
          nonce: formData.nonce,
          checks: [],
          attachments: [],
        }),
      });

      const data = await response.json();

      if (response.ok && data.taskId) {
        // Start polling for task status
        pollingAttempts.current = 0; // Reset counter
        setPolling(true);
        setTaskStatus({
          taskId: data.taskId,
          status: 'waiting',
          stage: 'queued',
          progress: 0,
          message: 'Task queued for processing',
        });

        // Poll every 2 seconds
        pollingInterval.current = setInterval(() => {
          pollTaskStatus(data.taskId);
        }, 2000);

        // Also poll immediately
        pollTaskStatus(data.taskId);

        // Clear form
        setFormData({
          secret: '',
          email: '',
          task: '',
          round: 1,
          brief: '',
          nonce: '',
        });
      } else {
        setTaskStatus({
          taskId: '',
          status: 'failed',
          stage: 'failed',
          progress: 0,
          error: data.error || 'Failed to submit task',
        });
      }
    } catch (error) {
      setTaskStatus({
        taskId: '',
        status: 'failed',
        stage: 'failed',
        progress: 0,
        error: 'Network error. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTaskStatus(null);
    setPolling(false);
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
      pollingInterval.current = null;
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-800">
                Web App Generator API
              </h1>
              <p className="text-gray-600 mt-2">
                AI-powered web application generation with GitHub Pages deployment
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-all transform hover:scale-105"
            >
              + Create New App
            </button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Queue Status
              </h2>
              <button
                onClick={fetchHealth}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '🔄 Refreshing...' : '🔄 Refresh'}
              </button>
            </div>
            {loading ? (
              <p className="text-gray-600">Loading...</p>
            ) : health ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg p-4 text-center shadow">
                  <p className="text-3xl font-bold text-yellow-600">
                    {health.queue.waiting}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Waiting</p>
                </div>
                <div className="bg-white rounded-lg p-4 text-center shadow">
                  <p className="text-3xl font-bold text-blue-600">
                    {health.queue.active}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Active</p>
                </div>
                <div className="bg-white rounded-lg p-4 text-center shadow">
                  <p className="text-3xl font-bold text-green-600">
                    {health.queue.completed}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Completed</p>
                </div>
                <div className="bg-white rounded-lg p-4 text-center shadow">
                  <p className="text-3xl font-bold text-red-600">
                    {health.queue.failed}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Failed</p>
                </div>
              </div>
            ) : (
              <p className="text-red-600">Failed to load status</p>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                ✨ Features
              </h2>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>AI-powered HTML/CSS/JavaScript generation</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Automatic GitHub repository creation</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>GitHub Pages deployment</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Iterative improvements (Round 1 & 2)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Professional README and MIT License</span>
                </li>
              </ul>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                🚀 API Endpoints
              </h2>
              <div className="space-y-3">
                <div>
                  <code className="block bg-gray-800 text-green-400 px-3 py-2 rounded text-sm">
                    POST /api/api-endpoint
                  </code>
                  <p className="text-sm text-gray-600 mt-1">Submit task request</p>
                </div>
                <div>
                  <code className="block bg-gray-800 text-green-400 px-3 py-2 rounded text-sm">
                    GET /api/health
                  </code>
                  <p className="text-sm text-gray-600 mt-1">Check service health</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-500 to-purple-500">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Create New Web App</h2>
                <button
                  onClick={closeModal}
                  className="text-white hover:text-gray-200 text-3xl font-bold"
                  disabled={polling}
                >
                  ×
                </button>
              </div>
            </div>

            {/* Progress Display */}
            {taskStatus && (
              <div className="p-6 border-b border-gray-200 bg-gray-50">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">
                      {taskStatus.status === 'completed' ? '✅ Completed' :
                       taskStatus.status === 'failed' ? '❌ Failed' :
                       taskStatus.status === 'active' ? '⚙️ Processing' :
                       '⏳ Waiting'}
                    </span>
                    <span className="text-sm text-gray-600">{taskStatus.progress}%</span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${
                        taskStatus.status === 'completed' ? 'bg-green-500' :
                        taskStatus.status === 'failed' ? 'bg-red-500' :
                        'bg-indigo-600'
                      }`}
                      style={{ width: `${taskStatus.progress}%` }}
                    />
                  </div>

                  {/* Status Message */}
                  <p className="text-sm text-gray-700">
                    {taskStatus.message || 'Processing...'}
                  </p>

                  {/* Success Details */}
                  {taskStatus.status === 'completed' && taskStatus.pagesUrl && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
                      <p className="text-green-800 font-semibold">🎉 Your app is ready!</p>
                      {taskStatus.githubUrl && (
                        <a
                          href={taskStatus.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-sm text-blue-600 hover:underline"
                        >
                          📦 GitHub Repository →
                        </a>
                      )}
                      <a
                        href={taskStatus.pagesUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-sm text-blue-600 hover:underline font-medium"
                      >
                        🚀 View Live App →
                      </a>
                      <button
                        onClick={closeModal}
                        className="mt-2 w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition-all"
                      >
                        Close
                      </button>
                    </div>
                  )}

                  {/* Error Details */}
                  {taskStatus.status === 'failed' && taskStatus.error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-800 text-sm">{taskStatus.error}</p>
                      <button
                        onClick={closeModal}
                        className="mt-2 w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition-all"
                      >
                        Close
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-6 space-y-5" style={{ display: taskStatus?.status === 'completed' || taskStatus?.status === 'failed' ? 'none' : 'block' }}>
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="secret" className="block text-sm font-medium text-gray-700 mb-2">
                    Secret Key <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="secret"
                    type="password"
                    value={formData.secret}
                    onChange={(e) => setFormData({ ...formData, secret: e.target.value })}
                    placeholder="Your MY_SECRET value"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="user@example.com"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="task" className="block text-sm font-medium text-gray-700 mb-2">
                    Repository Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="task"
                    type="text"
                    value={formData.task}
                    onChange={(e) => setFormData({ ...formData, task: e.target.value })}
                    placeholder="my-calculator-app"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <p className="mt-1 text-xs text-gray-500">GitHub repo name (lowercase, hyphens)</p>
                </div>

                <div>
                  <label htmlFor="round" className="block text-sm font-medium text-gray-700 mb-2">
                    Round <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="round"
                    value={formData.round}
                    onChange={(e) => setFormData({ ...formData, round: parseInt(e.target.value) })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value={1}>Round 1 (Initial)</option>
                    <option value={2}>Round 2 (Improvement)</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="brief" className="block text-sm font-medium text-gray-700 mb-2">
                  App Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="brief"
                  value={formData.brief}
                  onChange={(e) => setFormData({ ...formData, brief: e.target.value })}
                  placeholder="Create a calculator app with basic operations (add, subtract, multiply, divide)"
                  required
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Detailed description of the web app you want to generate
                </p>
              </div>

              <div>
                <label htmlFor="nonce" className="block text-sm font-medium text-gray-700 mb-2">
                  Nonce <span className="text-red-500">*</span>
                </label>
                <input
                  id="nonce"
                  type="text"
                  value={formData.nonce}
                  onChange={(e) => setFormData({ ...formData, nonce: e.target.value })}
                  placeholder="unique-identifier-12345"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Unique identifier for tracking this request
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={submitting || polling}
                  className={`flex-1 bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-all ${
                    submitting || polling
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:bg-indigo-700 transform hover:scale-105'
                  }`}
                >
                  {submitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </span>
                  ) : (
                    '🚀 Generate App'
                  )}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={polling}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
