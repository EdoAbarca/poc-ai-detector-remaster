import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import useAuthStore from '../store/authStore';

// Mock scan data for US-004
const MOCK_SCANS = [
  {
    id: 1,
    title: 'Q3 Marketing Blog Post',
    documentCount: 1,
    createdAt: new Date('2023-10-24T10:42:00'),
    tags: ['Verified Human', 'Marketing'],
    aiProviders: [],
    tagColors: ['teal', 'gray'],
  },
  {
    id: 2,
    title: 'Student Essay Batch #42',
    documentCount: 25,
    createdAt: new Date('2023-10-23T14:15:00'),
    tags: ['High Risk', 'Academic'],
    aiProviders: ['GPT-4', 'Llama'],
    tagColors: ['red', 'blue'],
  },
  {
    id: 3,
    title: 'Tech Review Draft v2',
    documentCount: 12,
    createdAt: new Date('2023-10-22T09:30:00'),
    tags: ['Mixed Content'],
    aiProviders: ['Claude'],
    tagColors: ['yellow'],
  },
  {
    id: 4,
    title: 'Customer Support Scripts',
    documentCount: 48,
    createdAt: new Date('2023-10-21T16:45:00'),
    tags: ['Verified Human', 'Internal'],
    aiProviders: [],
    tagColors: ['teal', 'gray'],
  },
];

const TAG_COLOR_MAP = {
  red: 'bg-red-100 text-red-800 border-red-200',
  blue: 'bg-blue-100 text-blue-800 border-blue-200',
  yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  teal: 'bg-teal-100 text-teal-600 border-teal-200',
  gray: 'bg-gray-100 text-gray-600 border-gray-200',
  purple: 'bg-purple-100 text-purple-800 border-purple-200',
  green: 'bg-green-100 text-green-800 border-green-200',
  orange: 'bg-orange-100 text-orange-800 border-orange-200',
};

const AI_PROVIDER_COLORS = {
  'GPT-4': { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200', dot: 'bg-purple-500' },
  'Llama': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200', dot: 'bg-green-500' },
  'Claude': { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200', dot: 'bg-orange-500' },
};

function Dashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('Date');

  useEffect(() => {
    // Check if user is logged in
    if (!accessToken) {
      navigate('/login');
      return;
    }

    // Simulate API call with mock data
    setTimeout(() => {
      setScans(MOCK_SCANS);
      setLoading(false);
    }, 500);
  }, [accessToken, navigate]);

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

  const handleDeleteScan = (scanId) => {
    setScans(scans.filter(scan => scan.id !== scanId));
    
    Toastify({
      text: 'Scan deleted successfully',
      duration: 3000,
      gravity: 'top',
      position: 'right',
      style: {
        background: 'linear-gradient(to right, #00b09b, #96c93d)',
      },
    }).showToast();
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const filteredScans = scans.filter(scan =>
    scan.title.toLowerCase().includes(searchQuery.toLowerCase())
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
          {/* Scan Management */}
          <section>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-gray-200 pb-4 mb-6">
              <div>
                <h2 className="text-gray-900 text-3xl font-bold">Scan Management</h2>
                <p className="text-gray-500 text-sm mt-1">Manage your recent text analysis and reports.</p>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex flex-col lg:flex-row gap-4 justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6">
              <div className="flex flex-wrap gap-3">
                <button className="flex items-center gap-2 h-10 px-5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-bold transition-colors">
                  <Icon icon="mdi:tag-multiple" className="text-lg" />
                  <span>Manage Tags</span>
                </button>
                <button className="flex items-center gap-2 h-10 px-5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-bold transition-colors">
                  <Icon icon="mdi:robot" className="text-lg" />
                  <span>Manage AIs</span>
                </button>
                <button className="flex items-center gap-2 h-10 px-5 bg-[#6324eb] hover:bg-[#6324eb]/90 text-white rounded-lg text-sm font-bold shadow-md shadow-[#6324eb]/20 transition-colors">
                  <Icon icon="mdi:plus" className="text-lg" />
                  <span>Create Scan</span>
                </button>
              </div>
              <div className="flex flex-1 md:flex-none gap-3">
                <div className="relative flex-1 md:w-64">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                    <Icon icon="mdi:magnify" className="text-xl" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full h-10 pl-10 pr-3 py-2 border border-gray-200 rounded-lg leading-5 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#6324eb] focus:border-[#6324eb] text-sm transition duration-150 ease-in-out"
                    placeholder="Search scans..."
                  />
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="block w-full md:w-auto h-10 pl-3 pr-8 py-2 border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#6324eb] focus:border-[#6324eb] text-sm rounded-lg bg-gray-50 hover:bg-white text-gray-700 transition duration-150 ease-in-out cursor-pointer"
                >
                  <option>Date</option>
                  <option>Document Count</option>
                  <option>Tags</option>
                </select>
              </div>
            </div>

            {/* Scans Table */}
            {loading ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <Icon icon="mdi:loading" className="animate-spin text-4xl text-[#6324eb] mx-auto mb-4" />
                <p className="text-gray-600">Loading scans...</p>
              </div>
            ) : filteredScans.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <Icon icon="mdi:file-document-outline" className="text-6xl text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No scans found</h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery ? 'Try adjusting your search query' : 'Get started by creating your first scan'}
                </p>
                {!searchQuery && (
                  <button className="inline-flex items-center gap-2 px-6 py-3 bg-[#6324eb] hover:bg-[#6324eb]/90 text-white rounded-lg font-bold shadow-md shadow-[#6324eb]/20 transition-colors">
                    <Icon icon="mdi:plus" className="text-lg" />
                    Create Your First Scan
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Scan Title
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Tags
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                        AI Providers
                      </th>
                      <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredScans.map((scan) => (
                      <tr key={scan.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-[#6324eb]/10 flex items-center justify-center text-[#6324eb]">
                              <Icon icon="mdi:file-document" className="text-xl" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-bold text-gray-900">{scan.title}</div>
                              <div className="text-xs text-gray-500">{scan.documentCount} Document{scan.documentCount !== 1 ? 's' : ''}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">{formatDate(scan.createdAt)}</div>
                          <div className="text-xs text-gray-400">{formatTime(scan.createdAt)}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-2">
                            {scan.tags.map((tag, idx) => {
                              const colorClass = TAG_COLOR_MAP[scan.tagColors[idx]] || TAG_COLOR_MAP.gray;
                              return (
                                <span
                                  key={idx}
                                  className={`px-2 py-0.5 inline-flex text-xs font-semibold rounded-full border ${colorClass}`}
                                >
                                  {tag}
                                </span>
                              );
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {scan.aiProviders.length === 0 ? (
                            <span className="text-sm text-gray-600">-</span>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {scan.aiProviders.map((provider) => {
                                const colors = AI_PROVIDER_COLORS[provider] || AI_PROVIDER_COLORS['GPT-4'];
                                return (
                                  <span
                                    key={provider}
                                    className={`px-2 py-0.5 inline-flex items-center gap-1 text-xs font-medium rounded-full ${colors.bg} ${colors.text} border ${colors.border}`}
                                  >
                                    <span className={`size-1.5 rounded-full ${colors.dot}`}></span>
                                    {provider}
                                  </span>
                                );
                              })}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-3">
                            <button 
                              onClick={() => navigate(`/analysis/${scan.id}`)}
                              className="text-gray-400 hover:text-[#6324eb] transition-colors"
                            >
                              <Icon icon="mdi:eye" className="text-xl" />
                            </button>
                            <button
                              onClick={() => handleDeleteScan(scan.id)}
                              className="text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <Icon icon="mdi:delete" className="text-xl" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
