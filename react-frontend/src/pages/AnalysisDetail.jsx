import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Icon } from '@iconify/react';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import useAuthStore from '../store/authStore';

function AnalysisDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);

  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!accessToken) {
      navigate('/login');
      return;
    }

    const fetchAnalysis = async () => {
      try {
        setLoading(true);
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3333';
        const response = await fetch(`${apiUrl}/api/v1/scan/${id}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch analysis details');
        }

        const data = await response.json();
        setAnalysis(data);
      } catch (err) {
        setError(err.message);
        Toastify({
          text: 'Failed to load analysis details',
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

    fetchAnalysis();
  }, [id, accessToken, navigate]);

  const handleBack = () => {
    navigate('/logged-in');
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getScoreColor = (score) => {
    if (score < 0.3) return 'text-green-600';
    if (score < 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score) => {
    if (score < 0.3) return 'bg-green-100';
    if (score < 0.7) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getScoreBarColor = (score) => {
    if (score < 0.3) return 'bg-gradient-to-r from-green-500 to-emerald-400';
    if (score < 0.7) return 'bg-gradient-to-r from-yellow-500 to-amber-400';
    return 'bg-gradient-to-r from-red-500 to-rose-400';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Icon icon="mdi:loading" className="animate-spin text-4xl text-[#2563EB] mx-auto mb-4" />
          <p className="text-gray-600">Loading analysis details...</p>
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Icon icon="mdi:alert-circle" className="text-6xl text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Analysis Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The analysis you are looking for does not exist.'}</p>
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
                <span className="text-sm font-medium text-white hidden sm:inline">{user?.username}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 lg:px-20 py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Back Button */}
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Icon icon="mdi:arrow-left" className="text-lg" />
            Back to Dashboard
          </button>

          {/* Analysis Header */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{analysis.title}</h1>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Icon icon="mdi:calendar" className="text-lg" />
                    <span>{formatDate(analysis.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Icon icon="mdi:file-document-multiple" className="text-lg" />
                    <span>{analysis.documents?.length || 0} Document{analysis.documents?.length !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {analysis.tags?.map((tag) => (
                  <span
                    key={tag.id}
                    className="px-3 py-1 inline-flex text-sm font-semibold rounded-full bg-blue-100 text-blue-800 border border-blue-200"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* AI Providers Used */}
          {analysis.aiProviders && analysis.aiProviders.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Icon icon="mdi:robot" className="text-xl" />
                AI Detection Models Used
              </h2>
              <div className="flex flex-wrap gap-2">
                {analysis.aiProviders.map((provider, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 inline-flex items-center gap-2 text-sm font-medium rounded-lg bg-purple-100 text-purple-800 border border-purple-200"
                  >
                    <span className="size-2 rounded-full bg-purple-500"></span>
                    {provider}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Documents Analysis Results */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Icon icon="mdi:chart-bar" className="text-xl" />
              Document Analysis Results
            </h2>

            <div className="space-y-6">
              {analysis.documents?.map((document) => (
                <div
                  key={document.id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  {/* Document Header */}
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{document.name}</h3>
                      <p className="text-sm text-gray-600">
                        Analyzed by: <span className="font-medium text-gray-900">{document.detectedBy}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {document.classification === 'Human' ? (
                        <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 border border-green-200 rounded-lg">
                          <Icon icon="mdi:check-circle" className="text-xl" />
                          <span className="font-bold">Human Written</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-800 border border-red-200 rounded-lg">
                          <Icon icon="mdi:alert-circle" className="text-xl" />
                          <span className="font-bold">AI Generated</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* AI Detection Score */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-700">AI Detection Score</span>
                      <span className={`text-2xl font-bold ${getScoreColor(document.aiScore)}`}>
                        {(document.aiScore * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
                      <div
                        className={`h-4 rounded-full ${getScoreBarColor(document.aiScore)}`}
                        style={{ width: `${document.aiScore * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-gray-500">
                      <span>0% (Human)</span>
                      <span>50%</span>
                      <span>100% (AI)</span>
                    </div>
                  </div>

                  {/* Document Content Preview */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Content Preview:</p>
                    <p className="text-sm text-gray-600 line-clamp-3">{document.content}</p>
                  </div>

                  {/* Score Interpretation */}
                  <div className={`mt-4 p-4 rounded-lg border ${getScoreBgColor(document.aiScore)} ${document.aiScore < 0.3 ? 'border-green-200' : document.aiScore < 0.7 ? 'border-yellow-200' : 'border-red-200'}`}>
                    <p className="text-sm font-medium text-gray-900">
                      {document.aiScore < 0.3 && '✓ Low probability of AI generation. Content appears to be human-written.'}
                      {document.aiScore >= 0.3 && document.aiScore < 0.7 && '⚠ Moderate probability of AI generation. Content may be mixed or edited.'}
                      {document.aiScore >= 0.7 && '⚠ High probability of AI generation. Content likely produced by AI.'}
                    </p>
                  </div>
                </div>
              ))}

              {(!analysis.documents || analysis.documents.length === 0) && (
                <div className="text-center py-12">
                  <Icon icon="mdi:file-document-outline" className="text-6xl text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No documents found for this analysis.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AnalysisDetail;
