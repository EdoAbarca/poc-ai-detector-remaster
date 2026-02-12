import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ScanResults from '../pages/ScanResults';
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

describe('ScanResults Component - US-013', () => {
  const mockUser = {
    id: 1,
    email: 'test@example.com',
    username: 'testuser',
  };

  const mockScanData = {
    id: 1,
    title: 'Quarterly Analysis',
    createdAt: new Date('2023-10-24T10:42:00').toISOString(),
    tags: [
      { id: 1, name: 'Academic' },
      { id: 2, name: 'Research' },
    ],
    documents: [
      {
        id: 1,
        name: 'Introduction.pdf',
        originalName: 'Introduction.pdf',
        aiScore: 0.85,
        classification: 'AI',
        detectedBy: 'Fast Detect GPT',
        size: 1258291,
      },
      {
        id: 2,
        name: 'Methodology.docx',
        originalName: 'Methodology.docx',
        aiScore: 0.12,
        classification: 'Human',
        detectedBy: 'Fast Detect GPT',
        size: 865280,
      },
      {
        id: 3,
        name: 'Conclusion.txt',
        originalName: 'Conclusion.txt',
        aiScore: 0.92,
        classification: 'AI',
        detectedBy: 'Fast Detect GPT',
        size: 12288,
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

  const renderScanResults = () => {
    return render(
      <MemoryRouter initialEntries={['/scan-results/1']}>
        <ScanResults />
      </MemoryRouter>
    );
  };

  it('should redirect to login when not authenticated', () => {
    renderScanResults();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('should render loading state initially', () => {
    useAuthStore.getState().setAuth(mockUser, {
      accessToken: 'test-token',
      refreshToken: 'test-refresh-token',
    });

    global.fetch.mockImplementation(() => 
      new Promise(() => {}) // Never resolves to keep loading
    );

    renderScanResults();

    expect(screen.getByText('Loading scan results...')).toBeInTheDocument();
  });

  it('should fetch and display scan results', async () => {
    useAuthStore.getState().setAuth(mockUser, {
      accessToken: 'test-token',
      refreshToken: 'test-refresh-token',
    });

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockScanData,
    });

    renderScanResults();

    await waitFor(() => {
      expect(screen.getByText('Quarterly Analysis')).toBeInTheDocument();
    });

    // Check overall probability is calculated correctly
    // (0.85 + 0.12 + 0.92) / 3 = 0.63 = 63%
    expect(screen.getByText('63%')).toBeInTheDocument();
    expect(screen.getByText('AI Generated')).toBeInTheDocument();

    // Check document breakdown
    expect(screen.getByText('2')).toBeInTheDocument(); // 2 AI docs
    expect(screen.getByText('1')).toBeInTheDocument(); // 1 human doc
  });

  it('should display document details in table', async () => {
    useAuthStore.getState().setAuth(mockUser, {
      accessToken: 'test-token',
      refreshToken: 'test-refresh-token',
    });

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockScanData,
    });

    renderScanResults();

    await waitFor(() => {
      expect(screen.getByText('Introduction.pdf')).toBeInTheDocument();
      expect(screen.getByText('Methodology.docx')).toBeInTheDocument();
      expect(screen.getByText('Conclusion.txt')).toBeInTheDocument();
    });

    // Check AI scores are displayed
    expect(screen.getByText('85%')).toBeInTheDocument();
    expect(screen.getByText('12%')).toBeInTheDocument();
    expect(screen.getByText('92%')).toBeInTheDocument();

    // Check risk labels
    expect(screen.getAllByText('High Risk').length).toBeGreaterThan(0);
    expect(screen.getByText('Low Risk')).toBeInTheDocument();
  });

  it('should display tags when present', async () => {
    useAuthStore.getState().setAuth(mockUser, {
      accessToken: 'test-token',
      refreshToken: 'test-refresh-token',
    });

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockScanData,
    });

    renderScanResults();

    await waitFor(() => {
      expect(screen.getByText('Academic')).toBeInTheDocument();
      expect(screen.getByText('Research')).toBeInTheDocument();
    });
  });

  it('should handle error when fetching scan fails', async () => {
    useAuthStore.getState().setAuth(mockUser, {
      accessToken: 'test-token',
      refreshToken: 'test-refresh-token',
    });

    global.fetch.mockResolvedValueOnce({
      ok: false,
    });

    renderScanResults();

    await waitFor(() => {
      expect(screen.getByText('Scan Not Found')).toBeInTheDocument();
    });
  });

  it('should navigate back to dashboard when back button is clicked', async () => {
    useAuthStore.getState().setAuth(mockUser, {
      accessToken: 'test-token',
      refreshToken: 'test-refresh-token',
    });

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockScanData,
    });

    renderScanResults();

    await waitFor(() => {
      expect(screen.getByText('Quarterly Analysis')).toBeInTheDocument();
    });

    const logoButton = screen.getByText('PoC AI Detector');
    fireEvent.click(logoButton);

    expect(mockNavigate).toHaveBeenCalledWith('/logged-in');
  });

  it('should show toast notification on export button click', async () => {
    useAuthStore.getState().setAuth(mockUser, {
      accessToken: 'test-token',
      refreshToken: 'test-refresh-token',
    });

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockScanData,
    });

    renderScanResults();

    await waitFor(() => {
      expect(screen.getByText('Quarterly Analysis')).toBeInTheDocument();
    });

    const exportButton = screen.getByText('Export');
    fireEvent.click(exportButton);

    expect(mockShowToast).toHaveBeenCalled();
  });

  it('should show toast notification on re-scan button click', async () => {
    useAuthStore.getState().setAuth(mockUser, {
      accessToken: 'test-token',
      refreshToken: 'test-refresh-token',
    });

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockScanData,
    });

    renderScanResults();

    await waitFor(() => {
      expect(screen.getByText('Quarterly Analysis')).toBeInTheDocument();
    });

    const rescanButton = screen.getByText('Re-scan');
    fireEvent.click(rescanButton);

    expect(mockShowToast).toHaveBeenCalled();
  });

  it('should handle scan with no documents', async () => {
    useAuthStore.getState().setAuth(mockUser, {
      accessToken: 'test-token',
      refreshToken: 'test-refresh-token',
    });

    const emptyScanData = {
      ...mockScanData,
      documents: [],
    };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => emptyScanData,
    });

    renderScanResults();

    await waitFor(() => {
      expect(screen.getByText('No documents found for this scan.')).toBeInTheDocument();
    });

    // Overall probability should be 0% with no documents
    expect(screen.getByText('0%')).toBeInTheDocument();
    expect(screen.getByText('Human Written')).toBeInTheDocument();
  });

  it('should format file sizes correctly', async () => {
    useAuthStore.getState().setAuth(mockUser, {
      accessToken: 'test-token',
      refreshToken: 'test-refresh-token',
    });

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockScanData,
    });

    renderScanResults();

    await waitFor(() => {
      expect(screen.getByText('1.2 MB')).toBeInTheDocument(); // Introduction.pdf
      expect(screen.getByText('845 KB')).toBeInTheDocument(); // Methodology.docx
      expect(screen.getByText('12 KB')).toBeInTheDocument(); // Conclusion.txt
    });
  });

  it('should display correct primary indicators based on AI score', async () => {
    useAuthStore.getState().setAuth(mockUser, {
      accessToken: 'test-token',
      refreshToken: 'test-refresh-token',
    });

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockScanData,
    });

    renderScanResults();

    await waitFor(() => {
      // High score (0.85) and very high score (0.92) should both show "High Perplexity"
      expect(screen.getAllByText('High Perplexity').length).toBe(2);
      
      // Low score (0.12) should show "Natural Variation"
      expect(screen.getByText('Natural Variation')).toBeInTheDocument();
    });
  });

  it('should calculate overall stats correctly', async () => {
    useAuthStore.getState().setAuth(mockUser, {
      accessToken: 'test-token',
      refreshToken: 'test-refresh-token',
    });

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockScanData,
    });

    renderScanResults();

    await waitFor(() => {
      expect(screen.getByText('Quarterly Analysis')).toBeInTheDocument();
    });

    // Check document count in header
    expect(screen.getByText('3 Documents')).toBeInTheDocument();

    // Check AI vs Human breakdown
    // AI docs (score >= 0.5): Introduction.pdf (0.85), Conclusion.txt (0.92) = 2 docs
    // Human docs (score < 0.5): Methodology.docx (0.12) = 1 doc
    const aiDocsElement = screen.getByText('AI Docs').closest('div').parentElement;
    expect(aiDocsElement).toHaveTextContent('2');

    const humanDocsElement = screen.getByText('Human Docs').closest('div').parentElement;
    expect(humanDocsElement).toHaveTextContent('1');
  });
});
