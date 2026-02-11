import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import useAuthStore from '../store/authStore';
import CreateTagModal from '../components/CreateTagModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

const TAG_COLOR_MAP = {
  blue: 'bg-blue-100 text-blue-700 border-blue-200',
  red: 'bg-red-100 text-red-700 border-red-200',
  emerald: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  purple: 'bg-purple-100 text-purple-700 border-purple-200',
  amber: 'bg-amber-100 text-amber-700 border-amber-200',
  gray: 'bg-gray-100 text-gray-700 border-gray-200',
  teal: 'bg-teal-100 text-teal-700 border-teal-200',
  orange: 'bg-orange-100 text-orange-700 border-orange-200',
};

const FALLBACK_TAG_COLORS = ['blue', 'emerald', 'purple', 'amber', 'teal', 'orange'];

function Tags() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [tagToDelete, setTagToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    if (!accessToken) {
      navigate('/login');
      return;
    }

    fetchTags();
  }, [accessToken, navigate]);

  const fetchTags = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3000/api/v1/tags/user/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tags');
      }

      const data = await response.json();
      setTags(data);
    } catch (error) {
      console.error('Error fetching tags:', error);
      Toastify({
        text: 'Failed to load tags. Please try again.',
        duration: 3000,
        gravity: 'top',
        position: 'right',
        style: {
          background: 'linear-gradient(to right, #ff5f6d, #ffc371)',
        },
      }).showToast();
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTag = async (tagName) => {
    try {
      const response = await fetch('http://localhost:3000/api/v1/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ name: tagName }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 409) {
          Toastify({
            text: 'A tag with this name already exists',
            duration: 3000,
            gravity: 'top',
            position: 'right',
            style: {
              background: 'linear-gradient(to right, #ff5f6d, #ffc371)',
            },
          }).showToast();
          throw new Error('Tag already exists');
        }
        throw new Error(errorData.message || 'Failed to create tag');
      }

      Toastify({
        text: 'Tag created successfully!',
        duration: 3000,
        gravity: 'top',
        position: 'right',
        style: {
          background: 'linear-gradient(to right, #00b09b, #96c93d)',
        },
      }).showToast();

      // Refresh the tags list
      await fetchTags();
    } catch (error) {
      console.error('Error creating tag:', error);
      if (error.message !== 'Tag already exists') {
        Toastify({
          text: 'Failed to create tag. Please try again.',
          duration: 3000,
          gravity: 'top',
          position: 'right',
          style: {
            background: 'linear-gradient(to right, #ff5f6d, #ffc371)',
          },
        }).showToast();
      }
      throw error;
    }
  };

  const handleDeleteClick = (tag) => {
    setTagToDelete(tag);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!tagToDelete) return;

    try {
      setIsDeleting(true);
      const response = await fetch(`http://localhost:3000/api/v1/tags/${tagToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete tag');
      }

      Toastify({
        text: 'Tag deleted successfully!',
        duration: 3000,
        gravity: 'top',
        position: 'right',
        style: {
          background: 'linear-gradient(to right, #00b09b, #96c93d)',
        },
      }).showToast();

      // Refresh the tags list
      await fetchTags();
      
      // Close the modal
      setIsDeleteModalOpen(false);
      setTagToDelete(null);
    } catch (error) {
      console.error('Error deleting tag:', error);
      Toastify({
        text: 'Failed to delete tag. Please try again.',
        duration: 3000,
        gravity: 'top',
        position: 'right',
        style: {
          background: 'linear-gradient(to right, #ff5f6d, #ffc371)',
        },
      }).showToast();
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteModalClose = () => {
    if (!isDeleting) {
      setIsDeleteModalOpen(false);
      setTagToDelete(null);
    }
  };

  const handleLogout = () => {
    clearAuth();

    Toastify({
      text: 'Logout successful! See you soon.',
      duration: 3000,
      gravity: 'top',
      position: 'right',
      style: {
        background: 'linear-gradient(to right, #00b09b, #96c93d)',
      },
    }).showToast();

    setTimeout(() => {
      navigate('/');
    }, 500);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mins ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 172800) return 'Yesterday';
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return formatDate(dateString);
  };

  const getTagColor = (index) => {
    return FALLBACK_TAG_COLORS[index % FALLBACK_TAG_COLORS.length];
  };

  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Icon icon="mdi:loading" className="animate-spin text-4xl text-[#2563EB] mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#1E40AF] shadow-sm">
        <div className="px-6 lg:px-10 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-white">
              <div className="flex items-center justify-center">
                <Icon icon="mdi:radar" className="text-2xl" />
              </div>
              <h2 className="text-xl font-bold">AI Detector</h2>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/logged-in')}
                className="text-white/80 hover:text-white transition-colors"
                title="Back to Dashboard"
              >
                <Icon icon="mdi:view-dashboard" className="text-xl" />
              </button>
              <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-lg">
                <Icon icon="mdi:account-circle" className="text-xl text-white" />
                <span className="text-sm font-medium text-white hidden sm:inline">{user.username}</span>
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                <Icon icon="mdi:logout" className="text-lg" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 lg:px-20 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Page Heading */}
          <div className="flex flex-wrap justify-between items-end gap-4 pb-2">
            <div className="flex flex-col gap-2">
              <h1 className="text-gray-900 text-3xl md:text-4xl font-bold leading-tight">Manage Tags</h1>
              <p className="text-gray-500 text-base font-normal leading-normal max-w-2xl">
                Organize AI detection scans with custom labels. Tags help you filter reports and analyze patterns across your dashboard.
              </p>
            </div>
          </div>

          {/* Toolbar Section */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="w-full md:w-96">
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400">
                  <Icon icon="mdi:magnify" className="text-xl" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex w-full rounded-full border border-gray-200 bg-gray-50 px-4 py-3 pl-11 text-sm focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] focus:outline-none transition-all placeholder:text-gray-400"
                  placeholder="Search tags..."
                />
              </div>
            </div>

            {/* Actions */}
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex whitespace-nowrap items-center justify-center rounded-full h-11 px-6 bg-[#2563EB] hover:bg-blue-700 transition-colors text-white gap-2 text-sm font-bold shadow-sm hover:shadow-md"
            >
              <Icon icon="mdi:plus-circle" className="text-xl" />
              <span>Create New Tag</span>
            </button>
          </div>

          {/* Data Table */}
          {loading ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <Icon icon="mdi:loading" className="animate-spin text-4xl text-[#2563EB] mx-auto mb-4" />
              <p className="text-gray-600">Loading tags...</p>
            </div>
          ) : filteredTags.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <Icon icon="mdi:tag-outline" className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No tags found</h3>
              <p className="text-gray-600 mb-6">
                {searchQuery ? 'Try adjusting your search query' : 'Get started by creating your first tag'}
              </p>
              {!searchQuery && (
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#2563EB] hover:bg-blue-700 text-white rounded-lg font-bold shadow-md transition-colors"
                >
                  <Icon icon="mdi:plus-circle" className="text-lg" />
                  Create Your First Tag
                </button>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <th className="p-4 pl-6 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Tag Name
                      </th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Scans Linked
                      </th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Date Created
                      </th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Last Used
                      </th>
                      <th className="p-4 pr-6 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredTags.map((tag, index) => {
                      const colorClass = TAG_COLOR_MAP[getTagColor(index)] || TAG_COLOR_MAP.blue;
                      return (
                        <tr key={tag.id} className="group hover:bg-blue-50/50 transition-colors">
                          <td className="p-4 pl-6">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${colorClass}`}>
                              <Icon icon="mdi:tag" className="text-base" />
                              {tag.name}
                            </span>
                          </td>
                          <td className="p-4 text-sm text-gray-900 font-medium">
                            {tag.scanCount} {tag.scanCount === 1 ? 'Scan' : 'Scans'}
                          </td>
                          <td className="p-4 text-sm text-gray-500">
                            {formatDate(tag.createdAt)}
                          </td>
                          <td className="p-4 text-sm text-gray-900">
                            {getRelativeTime(tag.createdAt)}
                          </td>
                          <td className="p-4 pr-6 text-right">
                            <button
                              onClick={() => handleDeleteClick(tag)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete tag"
                              data-testid={`delete-tag-${tag.id}`}
                            >
                              <Icon icon="mdi:close-circle" className="text-lg" />
                              <span>Delete</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination Footer */}
              <div className="border-t border-gray-100 p-4 bg-white flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-500">
                  Showing <span className="font-bold text-gray-900">{filteredTags.length}</span> {filteredTags.length === 1 ? 'tag' : 'tags'}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Create Tag Modal */}
      <CreateTagModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onTagCreated={handleCreateTag}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteModalClose}
        onConfirm={handleDeleteConfirm}
        tagName={tagToDelete?.name || ''}
        isDeleting={isDeleting}
      />
    </div>
  );
}

export default Tags;
