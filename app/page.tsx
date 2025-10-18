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
  const [darkMode, setDarkMode] = useState(false);
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

  // Initialize and toggle dark mode
  useEffect(() => {
    // Check for saved preference or default to false
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);

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
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950 transition-colors duration-300 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Card */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-2xl p-6 sm:p-8 mb-6 border border-gray-200/50 dark:border-gray-700/50">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                  Web App Generator
                </h1>
              </div>
              <p className="text-gray-600 dark:text-gray-400 ml-15">
                AI-powered web application generation with instant GitHub Pages deployment
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-3 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-all shadow-md hover:shadow-lg"
                title={darkMode ? 'Light mode' : 'Dark mode'}
              >
                {darkMode ? (
                  <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create New App
              </button>
            </div>
          </div>

          {/* Queue Status */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-indigo-950 border border-blue-200/50 dark:border-blue-800/30 rounded-xl p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Queue Status
              </h2>
              <button
                onClick={fetchHealth}
                disabled={loading}
                className="bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 text-white text-sm font-medium py-2 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg flex items-center gap-2"
              >
                <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
            {loading ? (
              <p className="text-gray-600 dark:text-gray-400">Loading...</p>
            ) : health ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-xl p-6 text-center shadow-lg border border-gray-200/50 dark:border-slate-700/50 hover:shadow-xl transition-all">
                  <p className="text-4xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                    {health.queue.waiting}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-medium">Waiting</p>
                </div>
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-xl p-6 text-center shadow-lg border border-gray-200/50 dark:border-slate-700/50 hover:shadow-xl transition-all">
                  <p className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
                    {health.queue.active}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-medium">Active</p>
                </div>
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-xl p-6 text-center shadow-lg border border-gray-200/50 dark:border-slate-700/50 hover:shadow-xl transition-all">
                  <p className="text-4xl font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
                    {health.queue.completed}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-medium">Completed</p>
                </div>
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-xl p-6 text-center shadow-lg border border-gray-200/50 dark:border-slate-700/50 hover:shadow-xl transition-all">
                  <p className="text-4xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
                    {health.queue.failed}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-medium">Failed</p>
                </div>
              </div>
            ) : (
              <p className="text-red-600 dark:text-red-400">Failed to load status</p>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-slate-700/50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2.5 rounded-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                  Features
                </h2>
              </div>
              <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                <li className="flex items-start">
                  <span className="text-green-500 dark:text-green-400 mr-3 text-xl">✓</span>
                  <span>AI-powered HTML/CSS/JavaScript generation</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 dark:text-green-400 mr-3 text-xl">✓</span>
                  <span>Automatic GitHub repository creation</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 dark:text-green-400 mr-3 text-xl">✓</span>
                  <span>GitHub Pages deployment</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 dark:text-green-400 mr-3 text-xl">✓</span>
                  <span>Iterative improvements (Round 1 & 2)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 dark:text-green-400 mr-3 text-xl">✓</span>
                  <span>Professional README and MIT License</span>
                </li>
              </ul>
            </div>

            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-slate-700/50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-500 p-2.5 rounded-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                  API Endpoints
                </h2>
              </div>
              <div className="space-y-4">
                <div>
                  <code className="block bg-gradient-to-r from-gray-800 to-gray-900 dark:from-slate-950 dark:to-slate-900 text-green-400 px-4 py-2.5 rounded-lg text-sm font-mono shadow-inner">
                    POST /api/api-endpoint
                  </code>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 ml-1">Submit task request</p>
                </div>
                <div>
                  <code className="block bg-gradient-to-r from-gray-800 to-gray-900 dark:from-slate-950 dark:to-slate-900 text-green-400 px-4 py-2.5 rounded-lg text-sm font-mono shadow-inner">
                    GET /api/health
                  </code>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 ml-1">Check service health</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-slate-700">
            <div className="p-6 border-b border-gray-200 dark:border-slate-700 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Create New Web App</h2>
                <button
                  onClick={closeModal}
                  className="text-white hover:text-gray-200 text-3xl font-bold hover:rotate-90 transition-transform"
                  disabled={polling}
                >
                  ×
                </button>
              </div>
            </div>

            {/* Progress Display */}
            {taskStatus && (
              <div className="p-6 border-b border-gray-200 dark:border-slate-700 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-slate-800 dark:to-slate-900">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      {taskStatus.status === 'completed' ? '✅ Completed' :
                       taskStatus.status === 'failed' ? '❌ Failed' :
                       taskStatus.status === 'active' ? '⚙️ Processing' :
                       '⏳ Waiting'}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400 font-semibold">{taskStatus.progress}%</span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden shadow-inner">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${
                        taskStatus.status === 'completed' ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                        taskStatus.status === 'failed' ? 'bg-gradient-to-r from-red-500 to-pink-500' :
                        'bg-gradient-to-r from-indigo-500 to-purple-500'
                      }`}
                      style={{ width: `${taskStatus.progress}%` }}
                    />
                  </div>

                  {/* Status Message */}
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {taskStatus.message || 'Processing...'}
                  </p>

                  {/* Success Details */}
                  {taskStatus.status === 'completed' && taskStatus.pagesUrl && (
                    <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-xl p-4 space-y-2">
                      <p className="text-green-800 dark:text-green-300 font-semibold">🎉 Your app is ready!</p>
                      {taskStatus.githubUrl && (
                        <a
                          href={taskStatus.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-sm text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          📦 GitHub Repository →
                        </a>
                      )}
                      <a
                        href={taskStatus.pagesUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
                      >
                        🚀 View Live App →
                      </a>
                      <button
                        onClick={closeModal}
                        className="mt-2 w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-2.5 rounded-lg transition-all shadow-lg hover:shadow-xl font-medium"
                      >
                        Close
                      </button>
                    </div>
                  )}

                  {/* Error Details */}
                  {taskStatus.status === 'failed' && taskStatus.error && (
                    <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-xl p-4">
                      <p className="text-red-800 dark:text-red-300 text-sm">{taskStatus.error}</p>
                      <button
                        onClick={closeModal}
                        className="mt-2 w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white py-2.5 rounded-lg transition-all shadow-lg hover:shadow-xl font-medium"
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
                  <label htmlFor="secret" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Secret Key <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="secret"
                    type="password"
                    value={formData.secret}
                    onChange={(e) => setFormData({ ...formData, secret: e.target.value })}
                    placeholder="Your MY_SECRET value"
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="user@example.com"
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="task" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Repository Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="task"
                    type="text"
                    value={formData.task}
                    onChange={(e) => setFormData({ ...formData, task: e.target.value })}
                    placeholder="my-calculator-app"
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">GitHub repo name (lowercase, hyphens)</p>
                </div>

                <div>
                  <label htmlFor="round" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Round <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="round"
                    value={formData.round}
                    onChange={(e) => setFormData({ ...formData, round: parseInt(e.target.value) })}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-purple-500 focus:border-transparent transition-all"
                  >
                    <option value={1}>Round 1 (Initial)</option>
                    <option value={2}>Round 2 (Improvement)</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="brief" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  App Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="brief"
                  value={formData.brief}
                  onChange={(e) => setFormData({ ...formData, brief: e.target.value })}
                  placeholder="Create a calculator app with basic operations (add, subtract, multiply, divide)"
                  required
                  rows={4}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-purple-500 focus:border-transparent transition-all"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Detailed description of the web app you want to generate
                </p>
              </div>

              <div>
                <label htmlFor="nonce" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nonce <span className="text-red-500">*</span>
                </label>
                <input
                  id="nonce"
                  type="text"
                  value={formData.nonce}
                  onChange={(e) => setFormData({ ...formData, nonce: e.target.value })}
                  placeholder="unique-identifier-12345"
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-purple-500 focus:border-transparent transition-all"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Unique identifier for tracking this request
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={submitting || polling}
                  className={`flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-all ${
                    submitting || polling
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:from-indigo-700 hover:to-purple-700 transform hover:scale-[1.02] hover:shadow-xl'
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
                  className="px-6 py-3 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 font-semibold hover:bg-gray-50 dark:hover:bg-slate-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
