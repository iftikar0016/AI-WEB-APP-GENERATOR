import { FormEvent } from 'react';
import { TaskFormData, TaskStatus } from '../types';

interface CreateAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskStatus: TaskStatus | null;
  formData: TaskFormData;
  onFormChange: <K extends keyof TaskFormData>(field: K, value: TaskFormData[K]) => void;
  onSubmit: (event: FormEvent) => void;
  polling: boolean;
  submitting: boolean;
}

export default function CreateAppModal({
  isOpen,
  onClose,
  taskStatus,
  formData,
  onFormChange,
  onSubmit,
  polling,
  submitting,
}: CreateAppModalProps) {
  if (!isOpen) {
    return null;
  }

  const isFinalState = taskStatus?.status === 'completed' || taskStatus?.status === 'failed';

  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-slate-700">
        <div className="p-6 border-b border-gray-200 dark:border-slate-700 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">Create New Web App</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-3xl font-bold hover:rotate-90 transition-transform"
              disabled={polling}
            >
              ×
            </button>
          </div>
        </div>

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

              <p className="text-sm text-gray-700 dark:text-gray-300">
                {taskStatus.message || 'Processing...'}
              </p>

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
                    onClick={onClose}
                    className="mt-2 w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-2.5 rounded-lg transition-all shadow-lg hover:shadow-xl font-medium"
                  >
                    Close
                  </button>
                </div>
              )}

              {taskStatus.status === 'failed' && taskStatus.error && (
                <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-xl p-4">
                  <p className="text-red-800 dark:text-red-300 text-sm">{taskStatus.error}</p>
                  <button
                    onClick={onClose}
                    className="mt-2 w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white py-2.5 rounded-lg transition-all shadow-lg hover:shadow-xl font-medium"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {!isFinalState && (
          <form onSubmit={onSubmit} className="p-6 space-y-5">
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="secret" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Secret Key <span className="text-red-500">*</span>
                </label>
                <input
                  id="secret"
                  type="password"
                  value={formData.secret}
                  onChange={(event) => onFormChange('secret', event.target.value)}
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
                  onChange={(event) => onFormChange('email', event.target.value)}
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
                  onChange={(event) => onFormChange('task', event.target.value)}
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
                  onChange={(event) => onFormChange('round', Number(event.target.value))}
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
                onChange={(event) => onFormChange('brief', event.target.value)}
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
                onChange={(event) => onFormChange('nonce', event.target.value)}
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
                onClick={onClose}
                disabled={polling}
                className="px-6 py-3 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 font-semibold hover:bg-gray-50 dark:hover:bg-slate-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
