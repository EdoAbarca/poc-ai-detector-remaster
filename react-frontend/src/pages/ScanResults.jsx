import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Icon } from '@iconify/react';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import useAuthStore from '../store/authStore';

function ScanResults() {
  const navigate = useNavigate();
  const { id } = useParams();
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);

  const [scan, setScan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!accessToken) {
      navigate('/login');
      return;
    }

    const fetchScanResults = async () => {
      try {
        setLoading(true);
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3333';
        const response = await fetch(`${apiUrl}/api/v1/scan/${id}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch scan results');
        }

        const data = await response.json();
        setScan(data);
      } catch (err) {
        setError(err.message);
        Toastify({
          text: 'Failed to load scan results',
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

    fetchScanResults();
  }, [id, accessToken, navigate]);

  const handleBack = () => {
    navigate('/logged-in');
  };

  const handleRescan = () => {
    Toastify({
      text: 'Re-scan functionality coming soon!',
      duration: 2000,
      gravity: 'top',
      position: 'right',
      style: {
        background: 'linear-gradient(to right, #667eea, #764ba2)',
      },
    }).showToast();
  };

  const handleExport = () => {
    Toastify({
      text: 'Export functionality coming soon!',
      duration: 2000,
      gravity: 'top',
      position: 'right',
      style: {
        background: 'linear-gradient(to right, #667eea, #764ba2)',
      },
    }).showToast();
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
    });
  };

  const calculateOverallStats = () => {
    if (!scan?.documents || scan.documents.length === 0) {
      return {
        overallProbability: 0,
        aiDocsCount: 0,
        humanDocsCount: 0,
        totalDocs: 0,
      };
    }

    const totalDocs = scan.documents.length;
    const aiDocsCount = scan.documents.filter(doc => (doc.aiScore || 0) >= 0.5).length;
    const humanDocsCount = totalDocs - aiDocsCount;
    
    // Calculate average AI score across all documents
    const avgScore = scan.documents.reduce((sum, doc) => sum + (doc.aiScore || 0), 0) / totalDocs;
    const overallProbability = Math.round(avgScore * 100);

    return {
      overallProbability,
      aiDocsCount,
      humanDocsCount,
      totalDocs,
    };
  };

  const getFileIcon = (name) => {
    if (name.endsWith('.pdf')) return { icon: 'mdi:file-pdf-box', color: 'text-red-600', bg: 'bg-red-100' };
    if (name.endsWith('.docx') || name.endsWith('.doc')) return { icon: 'mdi:file-word-box', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (name.endsWith('.txt')) return { icon: 'mdi:file-document-outline', color: 'text-gray-600', bg: 'bg-gray-100' };
    return { icon: 'mdi:file-document', color: 'text-gray-600', bg: 'bg-gray-100' };
  };

  const getRiskLabel = (score) => {
    if (score < 0.3) return { label: 'Low Risk', color: 'text-green-700' };
    if (score < 0.7) return { label: 'Moderate Risk', color: 'text-yellow-700' };
    return { label: 'High Risk', color: 'text-teal-600' };
  };

  const getIndicatorBadge = (score) => {
    if (score >= 0.85) return { 
      label: 'High Perplexity', 
      bgColor: 'bg-orange-100', 
      textColor: 'text-orange-700', 
      borderColor: 'border-orange-200' 
    };
    if (score >= 0.7) return { 
      label: 'Unusual Syntax', 
      bgColor: 'bg-yellow-100', 
      textColor: 'text-yellow-700', 
      borderColor: 'border-yellow-200' 
    };
    if (score >= 0.5) return { 
      label: 'Repetitive Patterns', 
      bgColor: 'bg-purple-100', 
      textColor: 'text-purple-700', 
      borderColor: 'border-purple-200' 
    };
    if (score >= 0.3) return { 
      label: 'Mixed Signals', 
      bgColor: 'bg-slate-100', 
      textColor: 'text-slate-700', 
      borderColor: 'border-slate-200' 
    };
    return { 
      label: 'Natural Variation', 
      bgColor: 'bg-green-100', 
      textColor: 'text-green-700', 
      borderColor: 'border-green-200' 
    };
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Icon icon="mdi:loading" className="animate-spin text-4xl text-[#2563EB] mx-auto mb-4" />
          <p className="text-gray-600">Loading scan results...</p>
        </div>
      </div>
    );
  }

  if (error || !scan) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Icon icon="mdi:alert-circle" className="text-6xl text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Scan Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The scan you are looking for does not exist.'}</p>
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#2563EB] text-white rounded-lg font-bold hover:bg-blue-700 transition-colors"
          >
            <Icon icon="mdi:arrow-left" className="text-xl" />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const stats = calculateOverallStats();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="w-full bg-[#1E40AF] text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Brand */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={handleBack}>
              <Icon icon="mdi:radar" className="text-[28px]" />
              <h1 className="text-xl font-bold tracking-tight">PoC AI Detector</h1>
            </div>
            {/* Right Side Actions */}
            <div className="flex items-center gap-6">
              <button className="p-1 rounded-full hover:bg-white/10 transition-colors">
                <Icon icon="mdi:bell-outline" className="text-white/80 text-xl" />
              </button>
              <button className="p-1 rounded-full hover:bg-white/10 transition-colors">
                <Icon icon="mdi:cog-outline" className="text-white/80 text-xl" />
              </button>
              <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-lg">
                <Icon icon="mdi:account-circle" className="text-xl text-white" />
                <span className="text-sm font-medium text-white hidden sm:inline">{user?.username}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Page Heading & Metadata */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="space-y-2">
            <h2 className="text-4xl font-bold tracking-tight text-slate-900">{scan.title}</h2>
            <div className="flex flex-wrap items-center gap-4 text-slate-500 text-sm font-medium">
              <span className="flex items-center gap-1">
                <Icon icon="mdi:calendar-today" className="text-[18px]" />
                {formatDate(scan.createdAt)}
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-500"></span>
              <span className="flex items-center gap-1">
                <Icon icon="mdi:file-document-multiple" className="text-[18px]" />
                {stats.totalDocs} Document{stats.totalDocs !== 1 ? 's' : ''}
              </span>
              {scan.tags && scan.tags.length > 0 && (
                <>
                  <span className="w-1 h-1 rounded-full bg-slate-500"></span>
                  <div className="flex gap-2">
                    {scan.tags.map((tag) => (
                      <span 
                        key={tag.id} 
                        className="px-2.5 py-0.5 rounded-full bg-gray-200 border border-gray-300 text-xs text-slate-700"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 transition-colors text-gray-700 text-sm font-medium"
            >
              <Icon icon="mdi:export" className="text-[20px]" />
              Export
            </button>
            <button 
              onClick={handleRescan}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2563EB] hover:bg-blue-700 transition-colors text-white text-sm font-medium shadow-lg shadow-blue-500/20"
            >
              <Icon icon="mdi:refresh" className="text-[20px]" />
              Re-scan
            </button>
          </div>
        </div>

        {/* Summary Metrics Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Overall Probability (Radial Gauge) */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center relative overflow-hidden shadow-sm">
            <div className="text-sm font-medium text-gray-500 mb-4">Overall Probability</div>
            <div className="relative" style={{ width: '160px', height: '160px' }}>
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                {/* Background Circle */}
                <path 
                  className="text-gray-200" 
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="3"
                />
                {/* Progress Circle */}
                <path 
                  className="text-[#2563EB]" 
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeDasharray={`${stats.overallProbability}, 100`}
                  strokeLinecap="round" 
                  strokeWidth="3"
                  style={{ filter: 'drop-shadow(0 0 10px rgba(37,99,235,0.5))' }}
                />
              </svg>
              {/* Center Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-slate-900">{stats.overallProbability}%</span>
                <span className="text-xs font-semibold text-[#2563EB] uppercase tracking-wider">
                  {stats.overallProbability >= 50 ? 'AI Generated' : 'Human Written'}
                </span>
              </div>
            </div>
            <div className="mt-4 text-xs text-gray-500 text-center">
              Averaged across all documents
            </div>
          </div>

          {/* Card 2: Document Breakdown */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col shadow-sm">
            <p className="text-sm font-medium text-gray-500 mb-6">Document Breakdown</p>
            <div className="flex flex-1 items-center gap-6">
              {/* Visual Donut (CSS Conic Gradient) */}
              <div className="relative shrink-0" style={{ width: '112px', height: '112px' }}>
                <div 
                  className="w-full h-full rounded-full" 
                  style={{ 
                    background: `conic-gradient(#2563EB 0% ${(stats.aiDocsCount / stats.totalDocs) * 100}%, #cbd5e1 ${(stats.aiDocsCount / stats.totalDocs) * 100}% 100%)` 
                  }}
                >
                  <div className="absolute inset-2 bg-white rounded-full"></div>
                </div>
              </div>
              {/* Legend/Stats */}
              <div className="flex flex-col gap-4 w-full">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#2563EB]"></span>
                    <span className="text-sm text-slate-600">AI Docs</span>
                  </div>
                  <span className="text-xl font-bold text-slate-900">{stats.aiDocsCount}</span>
                </div>
                <div className="w-full h-px bg-gray-100"></div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-slate-400"></span>
                    <span className="text-sm text-slate-600">Human Docs</span>
                  </div>
                  <span className="text-xl font-bold text-slate-900">{stats.humanDocsCount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Document Detail Table Section */}
        <div className="flex flex-col gap-4">
          <h3 className="text-xl font-bold text-slate-900 px-1">Detailed Analysis</h3>
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500">Document Name</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500 w-1/4">AI Probability</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500">Primary Indicator</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {scan.documents && scan.documents.length > 0 ? (
                    scan.documents.map((document, index) => {
                      const fileIcon = getFileIcon(document.name || document.originalName || 'document.txt');
                      const riskInfo = getRiskLabel(document.aiScore || 0);
                      const indicator = getIndicatorBadge(document.aiScore || 0);
                      const aiProbability = Math.round((document.aiScore || 0) * 100);

                      return (
                        <tr key={document.id || index} className="group hover:bg-gray-50 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded ${fileIcon.bg} ${fileIcon.color}`}>
                                <Icon icon={fileIcon.icon} className="text-[20px]" />
                              </div>
                              <div>
                                <p className="font-medium text-slate-900 text-sm">
                                  {document.originalName || document.name || `Document ${index + 1}`}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {document.size ? formatFileSize(document.size) : 'N/A'}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex flex-col gap-1.5">
                              <div className="flex justify-between text-xs font-medium">
                                <span className={`${riskInfo.color}`}>{riskInfo.label}</span>
                                <span className="text-teal-600">{aiProbability}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-teal-500 h-2 rounded-full transition-all duration-500" 
                                  style={{ width: `${aiProbability}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md ${indicator.bgColor} ${indicator.textColor} text-xs font-medium border ${indicator.borderColor}`}>
                              {indicator.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="3" className="p-8 text-center text-gray-500">
                        <Icon icon="mdi:file-document-outline" className="text-6xl mx-auto mb-4 text-gray-300" />
                        No documents found for this scan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ScanResults;
