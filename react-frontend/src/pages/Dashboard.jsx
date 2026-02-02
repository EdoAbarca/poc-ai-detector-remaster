import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Icon } from '@iconify/react';

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const accessToken = localStorage.getItem('accessToken');
    const userStr = localStorage.getItem('user');

    if (!accessToken) {
      // Redirect to login if not authenticated
      navigate('/login');
      return;
    }

    if (userStr) {
      try {
        const parsedUser = JSON.parse(userStr);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setUser(parsedUser);
      } catch (err) {
        console.error('Failed to parse user data:', err);
      }
    }
  }, [navigate]);

  const handleLogout = () => {
    // Clear tokens and user data
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');

    // Redirect to login
    navigate('/login');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Icon icon="mdi:loading" className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-2">
              <Icon icon="mdi:shield-check" className="text-3xl text-[#2563EB]" />
              <span className="text-xl font-bold text-gray-900">PoC AI Detector</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Icon icon="mdi:account-circle" className="text-2xl text-gray-600" />
                <span className="text-sm font-medium text-gray-700">{user.username}</span>
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2563EB] transition-colors"
              >
                <Icon icon="mdi:logout" className="text-lg" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.username}!
          </h1>
          <p className="text-gray-600">
            You&apos;re successfully logged in to your dashboard.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Icon icon="mdi:file-document-multiple" className="text-2xl text-[#2563EB]" />
              </div>
              <span className="text-3xl font-bold text-gray-900">0</span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Total Analyses</h3>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Icon icon="mdi:clock-outline" className="text-2xl text-green-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">0</span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Recent Scans</h3>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Icon icon="mdi:shield-check" className="text-2xl text-purple-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">100%</span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Account Security</h3>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button className="flex items-center gap-3 p-4 text-left border border-gray-200 rounded-lg hover:border-[#2563EB] hover:bg-blue-50 transition-colors">
              <div className="p-2 bg-[#2563EB] rounded-lg">
                <Icon icon="mdi:text-box-plus" className="text-xl text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">New Analysis</h3>
                <p className="text-sm text-gray-600">Scan text for AI-generated content</p>
              </div>
            </button>

            <button className="flex items-center gap-3 p-4 text-left border border-gray-200 rounded-lg hover:border-[#2563EB] hover:bg-blue-50 transition-colors">
              <div className="p-2 bg-[#2563EB] rounded-lg">
                <Icon icon="mdi:history" className="text-xl text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">View History</h3>
                <p className="text-sm text-gray-600">Check your past analyses</p>
              </div>
            </button>
          </div>
        </div>

        {/* User Info */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Account Information</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Icon icon="mdi:account" className="text-xl text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Username</p>
                <p className="font-medium text-gray-900">{user.username}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Icon icon="mdi:email" className="text-xl text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium text-gray-900">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Icon icon="mdi:calendar" className="text-xl text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Member Since</p>
                <p className="font-medium text-gray-900">
                  {new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
