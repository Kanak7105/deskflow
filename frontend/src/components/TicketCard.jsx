import React from 'react';
import { formatDistanceToNow } from 'date-fns';

const priorityColors = {
  urgent: 'bg-red-100 text-red-800 border-red-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  medium: 'bg-blue-100 text-blue-800 border-blue-200',
  low: 'bg-gray-100 text-gray-800 border-gray-200'
};

const formatAge = (minutes) => {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (hours < 24) return `${hours}h ${m}m`;
  const days = Math.floor(hours / 24);
  const h = hours % 24;
  return `${days}d ${h}h`;
};

const TicketCard = ({ ticket, onMove }) => {
  const { _id, subject, priority, status, ageMinutes, slaBreached, customerEmail } = ticket;

  // Status transitions allowed: open -> in_progress -> resolved -> closed
  // Backward allowed 1 step
  const STATUS_ORDER = ['open', 'in_progress', 'resolved', 'closed'];
  const currentIdx = STATUS_ORDER.indexOf(status);
  
  const canMoveForward = currentIdx < STATUS_ORDER.length - 1;
  const canMoveBackward = currentIdx > 0;
  
  const forwardStatus = canMoveForward ? STATUS_ORDER[currentIdx + 1] : null;
  const backwardStatus = canMoveBackward ? STATUS_ORDER[currentIdx - 1] : null;

  return (
    <div className={`p-4 bg-white border rounded-xl shadow-sm hover:shadow-md transition-shadow relative ${slaBreached ? 'border-red-300' : 'border-gray-200'}`}>
      {slaBreached && (
        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
          SLA Breached
        </div>
      )}
      
      <div className="flex justify-between items-start mb-3">
        <span className={`text-xs font-semibold px-2 py-1 rounded-md border ${priorityColors[priority]}`}>
          {priority.toUpperCase()}
        </span>
        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
          {formatAge(ageMinutes)}
        </span>
      </div>
      
      <h3 className="font-semibold text-gray-800 mb-1 leading-snug">{subject}</h3>
      <p className="text-xs text-gray-500 mb-4 truncate" title={customerEmail}>{customerEmail}</p>
      
      <div className="flex justify-between items-center pt-2 border-t border-gray-100 mt-2">
        {canMoveBackward ? (
          <button 
            onClick={() => onMove(_id, backwardStatus)}
            className="text-xs font-medium text-gray-500 hover:text-blue-600 transition-colors flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        ) : (
          <div /> // Placeholder to keep flex-between layout
        )}

        {canMoveForward && (
          <button 
            onClick={() => onMove(_id, forwardStatus)}
            className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors flex items-center bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded"
          >
            Move
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default TicketCard;
