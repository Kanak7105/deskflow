import React from 'react';

const FilterBar = ({ filters, setFilters, onNewTicket }) => {
  const handlePriorityChange = (e) => {
    setFilters(prev => ({ ...prev, priority: e.target.value }));
  };

  const handleBreachToggle = () => {
    setFilters(prev => ({ ...prev, breached: prev.breached === 'true' ? '' : 'true' }));
  };

  return (
    <div className="flex justify-between items-center px-8 py-5 bg-white border-b border-gray-100">
      <div className="flex items-center space-x-6">
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">DeskFlow</h1>
        <div className="h-6 w-px bg-gray-300"></div>
        <div className="flex items-center space-x-3">
          <label className="text-sm font-medium text-gray-500 uppercase tracking-wider">Filters</label>
          <select 
            value={filters.priority || ''} 
            onChange={handlePriorityChange}
            className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors cursor-pointer"
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>

          <button 
            onClick={handleBreachToggle}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filters.breached === 'true' 
                ? 'bg-red-100 text-red-700 border border-red-200' 
                : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
            }`}
          >
            {filters.breached === 'true' ? 'Showing SLA Breached' : 'Show SLA Breached'}
          </button>
        </div>
      </div>

      <button 
        onClick={onNewTicket}
        className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm hover:shadow transition-all flex items-center space-x-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        <span>New Ticket</span>
      </button>
    </div>
  );
};

export default FilterBar;
