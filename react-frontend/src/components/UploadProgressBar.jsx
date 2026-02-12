import { Icon } from '@iconify/react';
import PropTypes from 'prop-types';

/**
 * UploadProgressBar Component
 * Displays upload progress with percentage, icons, and status messages
 * 
 * @param {Object} props
 * @param {number} props.progress - Progress percentage (0-100)
 * @param {string} props.status - Current status: 'uploading', 'processing', 'completed', 'failed'
 * @param {string} props.fileName - Name of the file being uploaded
 * @param {string} props.message - Optional status message
 */
function UploadProgressBar({ progress = 0, status = 'uploading', fileName, message }) {
  // Determine icon and color based on status
  const getStatusConfig = () => {
    switch (status) {
      case 'completed':
        return {
          icon: 'mdi:check',
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-500',
          message: message || 'Upload complete',
        };
      case 'failed':
        return {
          icon: 'mdi:alert',
          color: 'text-red-600 dark:text-red-400',
          bgColor: 'bg-red-500',
          message: message || 'Upload failed',
        };
      case 'processing':
        return {
          icon: 'mdi:cog',
          color: 'text-blue-600 dark:text-blue-400',
          bgColor: 'bg-blue-500',
          message: message || 'Processing...',
        };
      case 'uploading':
      default:
        return {
          icon: 'mdi:upload',
          color: 'text-blue-600 dark:text-blue-400',
          bgColor: 'bg-blue-500',
          message: message || 'Uploading...',
        };
    }
  };

  const config = getStatusConfig();
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className="mb-3 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
      {/* Header with icon and filename */}
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon
            icon={config.icon}
            className={`text-[20px] ${config.color} ${status === 'processing' ? 'animate-spin' : ''}`}
          />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {fileName}
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

      {/* Status message */}
      <p className="text-xs text-slate-500 dark:text-slate-400">{config.message}</p>
    </div>
  );
}

UploadProgressBar.propTypes = {
  progress: PropTypes.number,
  status: PropTypes.oneOf(['uploading', 'processing', 'completed', 'failed']),
  fileName: PropTypes.string.isRequired,
  message: PropTypes.string,
};

export default UploadProgressBar;
