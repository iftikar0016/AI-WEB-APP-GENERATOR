'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import HeaderCard from './components/HeaderCard';
import QueueStatus from './components/QueueStatus';
import FeaturesCard from './components/FeaturesCard';
import ApiEndpointsCard from './components/ApiEndpointsCard';
import CreateAppModal from './components/CreateAppModal';
import { HealthStatus, TaskFormData, TaskStatus } from './types';

export default function Home() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [formData, setFormData] = useState<TaskFormData>({
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

  const updateFormData = <K extends keyof TaskFormData>(field: K, value: TaskFormData[K]) => {
    setFormData((previous) => ({ ...previous, [field]: value }));
  };

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

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
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
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-2xl p-6 sm:p-8 mb-6 border border-gray-200/50 dark:border-gray-700/50">
          <HeaderCard
            darkMode={darkMode}
            onToggleDarkMode={() => setDarkMode((previous) => !previous)}
            onOpenModal={() => setIsModalOpen(true)}
          />
          <QueueStatus loading={loading} health={health} onRefresh={fetchHealth} />
          <div className="grid md:grid-cols-2 gap-6">
            <FeaturesCard />
            <ApiEndpointsCard />
          </div>
        </div>
      </div>

      <CreateAppModal
        isOpen={isModalOpen}
        onClose={closeModal}
        taskStatus={taskStatus}
        formData={formData}
        onFormChange={updateFormData}
        onSubmit={handleSubmit}
        polling={polling}
        submitting={submitting}
      />
    </main>
  );
}
