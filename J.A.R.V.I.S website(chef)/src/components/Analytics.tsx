import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function Analytics() {
  const [timeRange, setTimeRange] = useState<"day" | "week" | "month">("week");
  
  const usageStats = useQuery(api.analytics.getUsageStats, { timeRange });
  const systemStats = useQuery(api.analytics.getSystemStats);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">📊 Analytics Dashboard</h2>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as any)}
          className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
        >
          <option value="day">Last 24 Hours</option>
          <option value="week">Last Week</option>
          <option value="month">Last Month</option>
        </select>
      </div>

      {/* System Overview */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">System Overview</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <div className="bg-white/5 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">{systemStats?.users || 0}</div>
            <div className="text-sm text-gray-300">Users</div>
          </div>
          
          <div className="bg-white/5 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400">{systemStats?.todos || 0}</div>
            <div className="text-sm text-gray-300">Todos</div>
          </div>
          
          <div className="bg-white/5 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">{systemStats?.notes || 0}</div>
            <div className="text-sm text-gray-300">Notes</div>
          </div>
          
          <div className="bg-white/5 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">{systemStats?.anime || 0}</div>
            <div className="text-sm text-gray-300">Anime</div>
          </div>
          
          <div className="bg-white/5 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-400">{systemStats?.games || 0}</div>
            <div className="text-sm text-gray-300">Games</div>
          </div>
          
          <div className="bg-white/5 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-pink-400">{systemStats?.images || 0}</div>
            <div className="text-sm text-gray-300">Images</div>
          </div>
          
          <div className="bg-white/5 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-cyan-400">{systemStats?.snippets || 0}</div>
            <div className="text-sm text-gray-300">Snippets</div>
          </div>
          
          <div className="bg-white/5 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-orange-400">{systemStats?.events || 0}</div>
            <div className="text-sm text-gray-300">Events</div>
          </div>
        </div>
      </div>

      {/* Usage Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Summary */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <h3 className="text-xl font-bold text-white mb-4">Activity Summary</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Total Events</span>
              <span className="text-2xl font-bold text-white">{usageStats?.totalEvents || 0}</span>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-lg font-semibold text-white">Top Features</h4>
              {usageStats?.topFeatures?.map((feature, index) => (
                <div key={feature.feature} className="flex justify-between items-center">
                  <span className="text-gray-300">
                    {index + 1}. {feature.feature.charAt(0).toUpperCase() + feature.feature.slice(1)}
                  </span>
                  <span className="text-blue-400 font-medium">{feature.count}</span>
                </div>
              )) || (
                <p className="text-gray-400 text-sm">No activity data available</p>
              )}
            </div>
          </div>
        </div>

        {/* Daily Activity Chart */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <h3 className="text-xl font-bold text-white mb-4">Daily Activity</h3>
          
          <div className="space-y-2">
            {usageStats?.dailyActivity?.map((day) => (
              <div key={day.date} className="flex items-center space-x-3">
                <span className="text-sm text-gray-300 w-20">
                  {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
                <div className="flex-1 bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.max((day.count / Math.max(...(usageStats?.dailyActivity?.map(d => d.count) || [1]))) * 100, 2)}%`
                    }}
                  />
                </div>
                <span className="text-sm text-gray-300 w-8">{day.count}</span>
              </div>
            )) || (
              <p className="text-gray-400 text-sm">No activity data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Feature Usage Breakdown */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">Feature Usage Breakdown</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(usageStats?.featureUsage || {}).map(([feature, count]) => (
            <div key={feature} className="bg-white/5 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-300 capitalize">
                  {feature.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <span className="text-lg font-bold text-white">{count}</span>
              </div>
              <div className="mt-2 bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.max((count / Math.max(...Object.values(usageStats?.featureUsage || {}))) * 100, 5)}%`
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {Object.keys(usageStats?.featureUsage || {}).length === 0 && (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📊</div>
            <p className="text-gray-400">No usage data available</p>
            <p className="text-sm text-gray-500 mt-1">Start using features to see analytics!</p>
          </div>
        )}
      </div>

      {/* Info Note */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="text-blue-400 text-xl">ℹ️</div>
          <div>
            <h4 className="text-blue-300 font-medium">Analytics Information</h4>
            <p className="text-blue-200/80 text-sm mt-1">
              This analytics dashboard shows usage patterns and system statistics. 
              Data is collected anonymously to help improve the JARVIS experience.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
