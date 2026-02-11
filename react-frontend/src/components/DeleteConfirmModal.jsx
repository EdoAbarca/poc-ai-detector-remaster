import { Icon } from '@iconify/react';
import PropTypes from 'prop-types';

function DeleteConfirmModal({ isOpen, onClose, onConfirm, tagName, isDeleting }) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-all duration-300"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isDeleting) onClose();
      }}
    >
      <div className="relative w-full max-w-[480px] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200 border border-gray-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100">
              <Icon icon="mdi:alert-circle" className="text-2xl text-red-600" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Delete Tag</h2>
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-md hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Icon icon="mdi:close" className="text-2xl" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-6 py-6 space-y-4">
          <div className="space-y-2">
            <p className="text-slate-700 text-base leading-relaxed">
              Are you sure you want to delete the tag <span className="font-bold text-slate-900">&ldquo;{tagName}&rdquo;</span>?
            </p>
            <p className="text-sm text-slate-500">
              This action will remove the tag from all associated analyses. This action cannot be undone.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 rounded-b-2xl border-t border-slate-100">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="inline-flex items-center justify-center rounded-lg h-11 px-5 bg-white border border-slate-300 hover:bg-slate-50 transition-colors text-slate-700 gap-2 text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="inline-flex items-center justify-center rounded-lg h-11 px-5 bg-red-600 hover:bg-red-700 transition-colors text-white gap-2 text-sm font-bold shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? (
              <>
                <Icon icon="mdi:loading" className="text-lg animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Icon icon="mdi:delete" className="text-lg" />
                <span>Delete Tag</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

DeleteConfirmModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  tagName: PropTypes.string.isRequired,
  isDeleting: PropTypes.bool.isRequired,
};

export default DeleteConfirmModal;
