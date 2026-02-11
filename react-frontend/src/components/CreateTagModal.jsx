import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import PropTypes from 'prop-types';
import * as Yup from 'yup';

const TAG_COLORS = [
  { name: 'red', class: 'bg-red-500' },
  { name: 'orange', class: 'bg-orange-500' },
  { name: 'amber', class: 'bg-amber-400' },
  { name: 'emerald', class: 'bg-emerald-500' },
  { name: 'teal', class: 'bg-teal-500' },
  { name: 'blue', class: 'bg-blue-500' },
  { name: 'indigo', class: 'bg-indigo-500' },
  { name: 'purple', class: 'bg-purple-500' },
  { name: 'pink', class: 'bg-pink-500' },
  { name: 'slate', class: 'bg-slate-500' },
];

const tagSchema = Yup.object().shape({
  name: Yup.string()
    .required('Tag name is required')
    .min(2, 'Tag name must be at least 2 characters')
    .max(50, 'Tag name must be less than 50 characters')
    .trim(),
});

function CreateTagModal({ isOpen, onClose, onTagCreated }) {
  const [tagName, setTagName] = useState('');
  const [selectedColor, setSelectedColor] = useState('blue');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTagName('');
      setSelectedColor('blue');
      setDescription('');
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const validateForm = async () => {
    try {
      await tagSchema.validate({ name: tagName }, { abortEarly: false });
      setErrors({});
      return true;
    } catch (err) {
      const validationErrors = {};
      err.inner.forEach((error) => {
        validationErrors[error.path] = error.message;
      });
      setErrors(validationErrors);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const isValid = await validateForm();
    if (!isValid) return;

    setIsSubmitting(true);
    
    try {
      await onTagCreated(tagName.trim());
      onClose();
    } catch (error) {
      console.error('Error creating tag:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-all duration-300"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-[520px] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200 border border-gray-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Create New Tag</h2>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-md hover:bg-slate-100"
          >
            <Icon icon="mdi:close" className="text-2xl" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-6 space-y-6">
            {/* Tag Name Input + Preview */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-slate-700" htmlFor="tag-name">
                  Tag Name
                </label>
                {tagName && (
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>Preview:</span>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${TAG_COLORS.find(c => c.name === selectedColor)?.class || 'bg-blue-500'} text-white shadow-sm ring-1 ring-white/20`}>
                      {tagName || 'Tag Name'}
                    </span>
                  </div>
                )}
              </div>
              <div className="relative">
                <input
                  className={`block w-full h-12 rounded-lg border ${errors.name ? 'border-red-500' : 'border-slate-200'} bg-white text-slate-900 shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-4 placeholder:text-slate-400 font-normal transition-all`}
                  id="tag-name"
                  placeholder="e.g., Confidential"
                  type="text"
                  value={tagName}
                  onChange={(e) => setTagName(e.target.value)}
                  disabled={isSubmitting}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>
            </div>

            {/* Color Picker */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-700">Tag Color</label>
              <div className="grid grid-cols-5 gap-3 sm:grid-cols-8">
                {TAG_COLORS.map((color) => (
                  <label key={color.name} className="relative group cursor-pointer">
                    <input
                      className="sr-only"
                      name="tag-color"
                      type="radio"
                      value={color.name}
                      checked={selectedColor === color.name}
                      onChange={(e) => setSelectedColor(e.target.value)}
                      disabled={isSubmitting}
                    />
                    <span className={`block w-9 h-9 rounded-full ${color.class} ring-2 ${selectedColor === color.name ? 'ring-[#2563EB]' : 'ring-transparent'} ring-offset-2 ring-offset-white hover:scale-110 transition-all shadow-sm flex items-center justify-center`}>
                      {selectedColor === color.name && (
                        <Icon icon="mdi:check" className="text-white text-lg" />
                      )}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Description Input */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-700" htmlFor="description">
                Description <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <textarea
                className="block w-full rounded-lg border-slate-200 bg-white text-slate-900 shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-4 py-3 placeholder:text-slate-400 font-normal resize-none transition-all"
                id="description"
                placeholder="Briefly describe what this tag is for..."
                rows="3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50/50 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 text-sm font-medium text-white bg-[#2563EB] rounded-lg shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:ring-offset-2 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Icon icon="mdi:loading" className="text-lg animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Icon icon="mdi:plus-circle" className="text-lg" />
                  Create Tag
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

CreateTagModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onTagCreated: PropTypes.func.isRequired,
};

export default CreateTagModal;
