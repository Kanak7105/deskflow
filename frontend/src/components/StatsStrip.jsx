import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = {
  open: '#3b82f6',        // blue-500
  in_progress: '#f59e0b', // amber-500
  resolved: '#10b981',    // emerald-500
  closed: '#6b7280'       // gray-500
};

const StatsStrip = ({ stats }) => {
  if (!stats || !stats.status) return null;

  const data = [
    { name: 'Open', value: stats.status.open || 0, color: COLORS.open },
    { name: 'In Progress', value: stats.status.in_progress || 0, color: COLORS.in_progress },
    { name: 'Resolved', value: stats.status.resolved || 0, color: COLORS.resolved },
    { name: 'Closed', value: stats.status.closed || 0, color: COLORS.closed },
  ].filter(item => item.value > 0);

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between text-sm shadow-sm sticky top-0 z-20">
      <div className="flex items-center space-x-8">
        
        {/* Simple Pie Chart */}
        <div className="flex items-center space-x-4 border-r border-gray-100 pr-8">
          <div className="w-16 h-16">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  innerRadius={15}
                  outerRadius={30}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Status Overview</p>
            <p className="text-lg font-bold text-gray-800">{stats.totalTickets || 0} <span className="text-sm font-medium text-gray-500">Tickets</span></p>
          </div>
        </div>

        {/* Status Counts */}
        <div className="flex space-x-6">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span className="text-gray-600 font-medium">Open: <span className="text-gray-900">{stats.status.open || 0}</span></span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span className="text-gray-600 font-medium">In Progress: <span className="text-gray-900">{stats.status.in_progress || 0}</span></span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-gray-600 font-medium">Resolved: <span className="text-gray-900">{stats.status.resolved || 0}</span></span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-gray-500"></span>
            <span className="text-gray-600 font-medium">Closed: <span className="text-gray-900">{stats.status.closed || 0}</span></span>
          </div>
        </div>

      </div>

      {/* SLA Status */}
      <div className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-700 rounded-xl border border-red-100 font-medium shadow-sm">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>SLA Breached (Open):</span>
        <span className="font-bold text-lg">{stats.breachedOpen || 0}</span>
      </div>
    </div>
  );
};

export default StatsStrip;
