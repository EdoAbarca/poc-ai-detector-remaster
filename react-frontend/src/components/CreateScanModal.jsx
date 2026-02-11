import { useState, useRef, useEffect } from 'react';
import { Icon } from '@iconify/react';
import * as Yup from 'yup';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';

// Validation schema using Yup
const scanValidationSchema = Yup.object().shape({
  title: Yup.string()
    .required('Scan title is required')
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be less than 100 characters'),
  aiProviders: Yup.array()
    .of(Yup.string())
    .min(0, 'Select at least one AI provider'),
  tags: Yup.array()
    .of(Yup.string())
    .min(0, 'Add at least one tag'),
  documents: Yup.array()
    .min(1, 'At least one document is required')
    .test('fileSize', 'Each file must be less than 10MB', (files) => {
      if (!files) return false;
      return files.every((file) => file.size <= 10 * 1024 * 1024);
    })
    .test('fileType', 'Only PDF, DOCX, and TXT files are allowed', (files) => {
      if (!files) return false;
      const allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
      ];
      return files.every((file) => allowedTypes.includes(file.type));
    }),
});

// Available AI providers
const AI_PROVIDERS = [
  { id: 'gpt-4', name: 'GPT-4', color: 'purple' },
  { id: 'claude', name: 'Claude', color: 'orange' },
  { id: 'llama', name: 'Llama', color: 'green' },
  { id: 'gemini', name: 'Gemini', color: 'blue' },
];

// Available tags
const AVAILABLE_TAGS = [
  { id: 'academic', name: 'Academic', color: 'blue' },
  { id: 'marketing', name: 'Marketing', color: 'gray' },
  { id: 'internal', name: 'Internal', color: 'gray' },
  { id: 'high-risk', name: 'High Risk', color: 'red' },
  { id: 'verified-human', name: 'Verified Human', color: 'teal' },
];

function CreateScanModal({ isOpen, onClose, onScanCreated }) {
  const [formData, setFormData] = useState({
    title: '',
    aiProviders: [],
    tags: [],
    documents: [],
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        title: '',
        aiProviders: [],
        tags: [],
        documents: [],
      });
      setErrors({});
      setIsDragging(false);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isOpen && !isSubmitting) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, isSubmitting, onClose]);

  const handleFileSelect = (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (selectedFiles.length > 0) {
      setFormData((prev) => ({
        ...prev,
        documents: [...prev.documents, ...selectedFiles],
      }));
      setErrors((prev) => ({ ...prev, documents: '' }));
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(event.dataTransfer.files || []);
    if (droppedFiles.length > 0) {
      setFormData((prev) => ({
        ...prev,
        documents: [...prev.documents, ...droppedFiles],
      }));
      setErrors((prev) => ({ ...prev, documents: '' }));
    }
  };

  const handleRemoveFile = (index) => {
    setFormData((prev) => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index),
    }));
  };

  const toggleAIProvider = (providerId) => {
    setFormData((prev) => ({
      ...prev,
      aiProviders: prev.aiProviders.includes(providerId)
        ? prev.aiProviders.filter((id) => id !== providerId)
        : [...prev.aiProviders, providerId],
    }));
  };

  const toggleTag = (tagId) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tagId)
        ? prev.tags.filter((id) => id !== tagId)
        : [...prev.tags, tagId],
    }));
  };

  const getFileIcon = (file) => {
    if (file.type === 'application/pdf') {
      return { icon: 'mdi:file-pdf', color: 'text-red-500' };
    } else if (
      file.type ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      return { icon: 'mdi:file-word', color: 'text-blue-500' };
    } else {
      return { icon: 'mdi:file-document', color: 'text-gray-500' };
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors({});

    try {
      // Validate form data
      await scanValidationSchema.validate(formData, { abortEarly: false });

      setIsSubmitting(true);

      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('aiProviders', JSON.stringify(formData.aiProviders));
      formDataToSend.append('tags', JSON.stringify(formData.tags));

      // Append all documents
      formData.documents.forEach((file) => {
        formDataToSend.append('documents', file);
      });

      // Send to backend
      const response = await fetch('http://localhost:3000/api/v1/scan/with-files', {
        method: 'POST',
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create scan');
      }

      const result = await response.json();

      Toastify({
        text: 'Scan created successfully!',
        duration: 3000,
        gravity: 'top',
        position: 'right',
        style: {
          background: 'linear-gradient(to right, #00b09b, #96c93d)',
        },
      }).showToast();

      // Call callback with result
      if (onScanCreated) {
        onScanCreated(result);
      }

      // Close modal
      onClose();
    } catch (err) {
      if (err.name === 'ValidationError') {
        // Yup validation errors
        const validationErrors = {};
        err.inner.forEach((error) => {
          validationErrors[error.path] = error.message;
        });
        setErrors(validationErrors);
      } else {
        // API errors
        Toastify({
          text: err.message || 'Failed to create scan',
          duration: 3000,
          gravity: 'top',
          position: 'right',
          style: {
            background: 'linear-gradient(to right, #ff5f6d, #ffc371)',
          },
        }).showToast();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget && !isSubmitting) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm transition-opacity"
        onClick={handleBackdropClick}
      ></div>

      {/* Modal */}
      <div className="relative w-full max-w-2xl transform overflow-hidden rounded-xl bg-white shadow-2xl transition-all dark:bg-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Create New Scan
          </h3>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-500 dark:hover:bg-slate-700 disabled:opacity-50"
          >
            <Icon icon="mdi:close" className="text-[20px]" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* File Upload Section */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300">
              Upload Documents
            </label>
            <div
              className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-10 transition-colors ${
                isDragging
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-slate-300 bg-slate-50 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800/50'
              } ${errors.documents ? 'border-red-500' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="rounded-full bg-blue-50 p-3 dark:bg-blue-900/20">
                <Icon
                  icon="mdi:upload"
                  className="text-[32px] text-blue-600 dark:text-blue-400"
                />
              </div>
              <p className="mt-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                Drag &amp; drop files here or{' '}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-blue-600 hover:underline cursor-pointer"
                >
                  click to browse
                </button>
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Supports .txt, .pdf, .docx (max 10MB each)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
            {errors.documents && (
              <p className="mt-1 text-xs text-red-600">{errors.documents}</p>
            )}

            {/* File List */}
            {formData.documents.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Ready to upload ({formData.documents.length})
                </p>
                {formData.documents.map((file, index) => {
                  const { icon, color } = getFileIcon(file);
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 shadow-sm dark:border-slate-700 dark:bg-slate-800"
                    >
                      <div className="flex items-center gap-3">
                        <Icon icon={icon} className={`text-[20px] ${color}`} />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {file.name}
                        </span>
                        <span className="text-xs text-slate-400">
                          {formatFileSize(file.size)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(index)}
                        className="text-slate-400 hover:text-red-500"
                      >
                        <Icon icon="mdi:close" className="text-[18px]" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Scan Configuration */}
          <div className="mb-6 border-t border-slate-100 pt-6 dark:border-slate-700">
            <h4 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-500">
              Scan Configuration
            </h4>

            {/* Title Input */}
            <div className="mb-4">
              <label className="mb-1.5 block text-sm font-bold text-slate-700 dark:text-slate-300">
                Scan Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                className={`block w-full rounded-lg border shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-slate-900 dark:text-white ${
                  errors.title
                    ? 'border-red-500 dark:border-red-500'
                    : 'border-slate-300 dark:border-slate-600'
                }`}
                placeholder="e.g. Q4 Performance Reviews"
              />
              {errors.title && (
                <p className="mt-1 text-xs text-red-600">{errors.title}</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* AI Providers */}
              <div>
                <label className="mb-1.5 flex items-center gap-1 text-sm font-bold text-slate-700 dark:text-slate-300">
                  <Icon icon="mdi:smart_toy" className="text-[16px]" />
                  AI Providers
                </label>
                <div className="space-y-2">
                  {AI_PROVIDERS.map((provider) => (
                    <label
                      key={provider.id}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.aiProviders.includes(provider.id)}
                        onChange={() => toggleAIProvider(provider.id)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-700 dark:text-slate-300">
                        {provider.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="mb-1.5 flex items-center gap-1 text-sm font-bold text-slate-700 dark:text-slate-300">
                  <Icon icon="mdi:tag" className="text-[16px]" />
                  Tags
                </label>
                <div className="space-y-2">
                  {AVAILABLE_TAGS.map((tag) => (
                    <label
                      key={tag.id}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.tags.includes(tag.id)}
                        onChange={() => toggleTag(tag.id)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-700 dark:text-slate-300">
                        {tag.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating...' : 'Start Scan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateScanModal;
