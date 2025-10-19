export default function ApiEndpointsCard() {
  return (
    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-slate-700/50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-500 p-2.5 rounded-lg">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">API Endpoints</h2>
      </div>
      <div className="space-y-4">
        <Endpoint code="POST /api/api-endpoint" description="Submit task request" />
        <Endpoint code="GET /api/health" description="Check service health" />
      </div>
    </div>
  );
}

interface EndpointProps {
  code: string;
  description: string;
}

function Endpoint({ code, description }: EndpointProps) {
  return (
    <div>
      <code className="block bg-gradient-to-r from-gray-800 to-gray-900 dark:from-slate-950 dark:to-slate-900 text-green-400 px-4 py-2.5 rounded-lg text-sm font-mono shadow-inner">
        {code}
      </code>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 ml-1">{description}</p>
    </div>
  );
}
