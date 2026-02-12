import { Icon } from '@iconify/react';
import PropTypes from 'prop-types';

/**
 * DetectionProgressBar Component
 * Displays AI detection progress with percentage, icons, and status messages
 * 
 * @param {Object} props
 * @param {number} props.progress - Progress percentage (0-100)
 * @param {string} props.status - Current status: 'detecting', 'aggregating', 'completed', 'failed'
 * @param {string} props.currentDoc - Name of the document being analyzed
 * @param {string} props.message - Optional status message
 * @param {number} props.chunksProcessed - Number of chunks processed
 * @param {number} props.totalChunks - Total number of chunks
 */
function DetectionProgressBar({ 
  progress = 0, 
  status = 'detecting', 
  currentDoc, 
  message,
  chunksProcessed,
  totalChunks 
}) {
  // Determine icon and color based on status
  const getStatusConfig = () => {
    switch (status) {
      case 'completed':
        return {
          icon: 'mdi:check-circle',
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-500',
          message: message || 'Detection complete',
        };
      case 'failed':
        return {
          icon: 'mdi:alert-circle',
          color: 'text-red-600 dark:text-red-400',
          bgColor: 'bg-red-500',
          message: message || 'Detection failed',
        };
      case 'aggregating':
        return {
          icon: 'mdi:cog-sync',
          color: 'text-blue-600 dark:text-blue-400',
          bgColor: 'bg-blue-500',
          message: message || 'Aggregating results...',
        };
      case 'detecting':
      default:
        return {
          icon: 'mdi:brain',
          color: 'text-purple-600 dark:text-purple-400',
          bgColor: 'bg-purple-500',
          message: message || 'Detecting AI content...',
        };
    }
  };

  const config = getStatusConfig();
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className="mb-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      {/* Header with icon and document name */}
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon
            icon={config.icon}
            className={`text-[20px] ${config.color} ${status === 'aggregating' || status === 'detecting' ? 'animate-spin' : ''}`}
          />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {currentDoc || 'Processing...'}
          </span>
        </div>
        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
          {clampedProgress}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
        <div
          className={`h-full transition-all duration-300 ease-out ${config.bgColor}`}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>

      {/* Status message and chunks info */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500 dark:text-slate-400">{config.message}</p>
        {chunksProcessed !== undefined && totalChunks !== undefined && (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {chunksProcessed}/{totalChunks} chunks
          </p>
        )}
      </div>
    </div>
  );
}

DetectionProgressBar.propTypes = {
  progress: PropTypes.number,
  status: PropTypes.oneOf(['detecting', 'aggregating', 'completed', 'failed']),
  currentDoc: PropTypes.string,
  message: PropTypes.string,
  chunksProcessed: PropTypes.number,
  totalChunks: PropTypes.number,
};

export default DetectionProgressBar;
