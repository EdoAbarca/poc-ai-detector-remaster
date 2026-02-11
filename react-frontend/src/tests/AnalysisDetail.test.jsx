import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AnalysisDetail from '../pages/AnalysisDetail';
import useAuthStore from '../store/authStore';

// Mock useNavigate and useParams
const mockNavigate = vi.fn();
const mockParams = { id: '1' };

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => mockParams,
  };
});

// Mock Toastify
const mockShowToast = vi.fn();
vi.mock('toastify-js', () => ({
  default: vi.fn(() => ({
    showToast: mockShowToast,
  })),
}));

// Mock @iconify/react
vi.mock('@iconify/react', () => ({
  Icon: ({ icon }) => <span data-testid="icon" data-icon={icon}></span>,
}));

// Mock fetch
global.fetch = vi.fn();

describe('AnalysisDetail Component - US-005', () => {
  const mockUser = {
    id: 1,
    email: 'test@example.com',
    username: 'testuser',
    createdAt: new Date('2024-01-01').toISOString(),
  };

  const mockAnalysis = {
    id: 1,
    title: 'Student Essay Batch #42',
    content: 'Sample essay content for analysis...',
    aiProviders: ['GPT-4', 'Llama'],
    userId: 1,
    createdAt: '2023-10-23T14:15:00.000Z',
    updatedAt: '2023-10-23T14:15:00.000Z',
    tags: [
      { id: 1, name: 'Academic' },
      { id: 2, name: 'High Risk' },
    ],
    documents: [
      {
        id: 1,
        name: 'Student Essay Batch #42 - Document 1',
        aiScore: 0.23,
        classification: 'Human',
        detectedBy: 'GPT-4',
        content: 'Sample content for analysis...',
      },
      {
        id: 2,
        name: 'Student Essay Batch #42 - Document 2',
        aiScore: 0.87,
        classification: 'AI',
        detectedBy: 'Llama',
        content: 'Another sample content analyzed by different AI provider...',
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.getState().clearAuth();
    global.fetch.mockClear();
  });

  afterEach(() => {
    useAuthStore.getState().clearAuth();
    cleanup();
  });

  const renderAnalysisDetail = () => {
    return render(
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<AnalysisDetail />} />
        </Routes>
      </BrowserRouter>
    );
  };

  it('should redirect to login when not authenticated', () => {
    renderAnalysisDetail();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('should display loading state initially', () => {
    useAuthStore.getState().setAuth(mockUser, {
      accessToken: 'test-token',
      refreshToken: 'test-refresh-token',
    });

    global.fetch.mockImplementation(() => new Promise(() => {})); // Never resolves

    renderAnalysisDetail();

    expect(screen.getByText('Loading analysis details...')).toBeInTheDocument();
  });

  it('should fetch and display analysis details with relations', async () => {
    useAuthStore.getState().setAuth(mockUser, {
      accessToken: 'test-token',
      refreshToken: 'test-refresh-token',
    });

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockAnalysis,
    });

    renderAnalysisDetail();

    await waitFor(() => {
      expect(screen.getByText('Student Essay Batch #42')).toBeInTheDocument();
    });

    // Check analysis metadata
    expect(screen.getByText('2 Documents')).toBeInTheDocument();
    
    // Check tags
    expect(screen.getByText('Academic')).toBeInTheDocument();
    expect(screen.getByText('High Risk')).toBeInTheDocument();

    // Check AI providers - use getAllByText since they appear multiple times
    const gpt4Elements = screen.getAllByText('GPT-4');
    expect(gpt4Elements.length).toBeGreaterThan(0);
    const llamaElements = screen.getAllByText('Llama');
    expect(llamaElements.length).toBeGreaterThan(0);
  });

  it('should display document results with AI detection scores', async () => {
    useAuthStore.getState().setAuth(mockUser, {
      accessToken: 'test-token',
      refreshToken: 'test-refresh-token',
    });

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockAnalysis,
    });

    renderAnalysisDetail();

    await waitFor(() => {
      expect(screen.getByText('Student Essay Batch #42 - Document 1')).toBeInTheDocument();
    });

    // Check document 1 (Human)
    expect(screen.getByText('Human Written')).toBeInTheDocument();
    expect(screen.getByText('23.0%')).toBeInTheDocument();

    // Check document 2 (AI)
    expect(screen.getByText('AI Generated')).toBeInTheDocument();
    expect(screen.getByText('87.0%')).toBeInTheDocument();
  });

  it('should display AI vs Human classification clearly', async () => {
    useAuthStore.getState().setAuth(mockUser, {
      accessToken: 'test-token',
      refreshToken: 'test-refresh-token',
    });

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockAnalysis,
    });

    renderAnalysisDetail();

    await waitFor(() => {
      // Check for classification icons
      const icons = screen.getAllByTestId('icon');
      const checkIcon = icons.find(icon => icon.getAttribute('data-icon') === 'mdi:check-circle');
      const alertIcon = icons.find(icon => icon.getAttribute('data-icon') === 'mdi:alert-circle');
      
      expect(checkIcon).toBeInTheDocument();
      expect(alertIcon).toBeInTheDocument();
    });
  });

  it('should have back button that navigates to dashboard', async () => {
    useAuthStore.getState().setAuth(mockUser, {
      accessToken: 'test-token',
      refreshToken: 'test-refresh-token',
    });

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockAnalysis,
    });

    renderAnalysisDetail();

    await waitFor(() => {
      const backButtons = screen.getAllByText('Back to Dashboard');
      expect(backButtons.length).toBeGreaterThan(0);
    });
  });

  it('should display error message when analysis not found', async () => {
    useAuthStore.getState().setAuth(mockUser, {
      accessToken: 'test-token',
      refreshToken: 'test-refresh-token',
    });

    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    renderAnalysisDetail();

    await waitFor(() => {
      expect(screen.getByText('Analysis Not Found')).toBeInTheDocument();
    });
  });

  it('should use correct API endpoint with authentication', async () => {
    useAuthStore.getState().setAuth(mockUser, {
      accessToken: 'test-token',
      refreshToken: 'test-refresh-token',
    });

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockAnalysis,
    });

    renderAnalysisDetail();

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/scan/1'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token',
          }),
        })
      );
    });
  });

  it('should display all document information including AI model used', async () => {
    useAuthStore.getState().setAuth(mockUser, {
      accessToken: 'test-token',
      refreshToken: 'test-refresh-token',
    });

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockAnalysis,
    });

    renderAnalysisDetail();

    await waitFor(() => {
      // Check that each document shows which model analyzed it
      const analyzedByElements = screen.getAllByText(/Analyzed by:/);
      expect(analyzedByElements.length).toBeGreaterThan(0);
      expect(screen.getByText('Student Essay Batch #42 - Document 1')).toBeInTheDocument();
      expect(screen.getByText('Student Essay Batch #42 - Document 2')).toBeInTheDocument();
    });
  });

  it('should display score visualization bars', async () => {
    useAuthStore.getState().setAuth(mockUser, {
      accessToken: 'test-token',
      refreshToken: 'test-refresh-token',
    });

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockAnalysis,
    });

    renderAnalysisDetail();

    await waitFor(() => {
      // Check for chart-bar icon
      const icons = screen.getAllByTestId('icon');
      const chartIcon = icons.find(icon => icon.getAttribute('data-icon') === 'mdi:chart-bar');
      expect(chartIcon).toBeInTheDocument();
    });
  });

  it('should show content preview for each document', async () => {
    useAuthStore.getState().setAuth(mockUser, {
      accessToken: 'test-token',
      refreshToken: 'test-refresh-token',
    });

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockAnalysis,
    });

    renderAnalysisDetail();

    await waitFor(() => {
      expect(screen.getByText('Sample content for analysis...')).toBeInTheDocument();
      expect(screen.getByText('Another sample content analyzed by different AI provider...')).toBeInTheDocument();
    });
  });
});
