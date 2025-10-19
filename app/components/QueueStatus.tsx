import { HealthStatus } from '../types';

interface QueueStatusProps {
  loading: boolean;
  health: HealthStatus | null;
  onRefresh: () => void;
}

export default function QueueStatus({ loading, health, onRefresh }: QueueStatusProps) {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-indigo-950 border border-blue-200/50 dark:border-blue-800/30 rounded-xl p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Queue Status
        </h2>
        <button
          onClick={onRefresh}
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
          <QueueMetric label="Waiting" value={health.queue.waiting} gradient="from-yellow-500 to-orange-500" />
          <QueueMetric label="Active" value={health.queue.active} gradient="from-blue-500 to-indigo-500" />
          <QueueMetric label="Completed" value={health.queue.completed} gradient="from-green-500 to-emerald-500" />
          <QueueMetric label="Failed" value={health.queue.failed} gradient="from-red-500 to-pink-500" />
        </div>
      ) : (
        <p className="text-red-600 dark:text-red-400">Failed to load status</p>
      )}
    </div>
  );
}

interface QueueMetricProps {
  label: string;
  value: number;
  gradient: string;
}

function QueueMetric({ label, value, gradient }: QueueMetricProps) {
  return (
    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-xl p-6 text-center shadow-lg border border-gray-200/50 dark:border-slate-700/50 hover:shadow-xl transition-all">
      <p className={`text-4xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
        {value}
      </p>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-medium">{label}</p>
    </div>
  );
}
