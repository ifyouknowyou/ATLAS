import Link from 'next/link';

export default function IntelligenceDashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">ATLAS Intelligence Operations</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">Alerts</h2>
          <p className="text-gray-400">View and manage intelligence alerts</p>
          <Link href="/intelligence/alerts" className="text-blue-400 hover:underline">
            Go to Alerts →
          </Link>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">Workflows</h2>
          <p className="text-gray-400">Create and monitor automated workflows</p>
          <Link href="/intelligence/workflows" className="text-blue-400 hover:underline">
            Go to Workflows →
          </Link>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">Analytics</h2>
          <p className="text-gray-400">Run graph analytics and anomaly detection</p>
          <Link href="/intelligence/analytics" className="text-blue-400 hover:underline">
            Go to Analytics →
          </Link>
        </div>
      </div>
    </div>
  );
}