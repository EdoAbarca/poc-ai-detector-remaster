import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import useAuthStore from '../store/authStore';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock Toastify
const mockShowToast = vi.fn();
vi.mock('toastify-js', () => ({
  default: vi.fn(() => ({
    showToast: mockShowToast,
  })),
}));

// Mock @iconify/react to avoid async timer issues
vi.mock('@iconify/react', () => ({
  Icon: ({ icon }) => <span data-testid="icon" data-icon={icon}></span>,
}));

describe('Dashboard Component - US-004', () => {
  const mockUser = {
    id: 1,
    email: 'test@example.com',
    username: 'testuser',
    createdAt: new Date('2024-01-01').toISOString(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    
    // Clear Zustand store
    useAuthStore.getState().clearAuth();
  });

  afterEach(() => {
    vi.useRealTimers();
    
    // Clean up Zustand store
    useAuthStore.getState().clearAuth();
    
    // Ensure all components are unmounted
    cleanup();
  });

  const renderDashboard = () => {
    return render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );
  };

  it('should redirect to login when not authenticated', () => {
    renderDashboard();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('should render dashboard with scan management when authenticated', async () => {
    // Set authenticated user
    useAuthStore.getState().setAuth(mockUser, {
      accessToken: 'test-token',
      refreshToken: 'test-refresh-token',
    });

    renderDashboard();

    // Advance timers to load scans
    vi.advanceTimersByTime(600);

    await waitFor(() => {
      expect(screen.getByText('Scan Management')).toBeInTheDocument();
      expect(screen.getByText('Metrics Overview')).toBeInTheDocument();
    });
  });

  it('should display metrics overview section', async () => {
    useAuthStore.getState().setAuth(mockUser, {
      accessToken: 'test-token',
      refreshToken: 'test-refresh-token',
    });

    renderDashboard();
    vi.advanceTimersByTime(600);

    await waitFor(() => {
      expect(screen.getByText('Total Scans (30 Days)')).toBeInTheDocument();
      expect(screen.getByText('AI vs Human Distribution')).toBeInTheDocument();
    });
  });

  it('should show loading state initially', () => {
    useAuthStore.getState().setAuth(mockUser, {
      accessToken: 'test-token',
      refreshToken: 'test-refresh-token',
    });

    renderDashboard();

    expect(screen.getByText('Loading scans...')).toBeInTheDocument();
  });

  it('should display scans after loading', async () => {
    useAuthStore.getState().setAuth(mockUser, {
      accessToken: 'test-token',
      refreshToken: 'test-refresh-token',
    });

    renderDashboard();

    // Wait for loading to complete
    vi.advanceTimersByTime(600);

    await waitFor(() => {
      expect(screen.queryByText('Loading scans...')).not.toBeInTheDocument();
      expect(screen.getByText('Q3 Marketing Blog Post')).toBeInTheDocument();
      expect(screen.getByText('Student Essay Batch #42')).toBeInTheDocument();
    });
  });

  it('should display scan details correctly', async () => {
    useAuthStore.getState().setAuth(mockUser, {
      accessToken: 'test-token',
      refreshToken: 'test-refresh-token',
    });

    renderDashboard();
    vi.advanceTimersByTime(600);

    await waitFor(() => {
      // Check scan title and document count
      expect(screen.getByText('Q3 Marketing Blog Post')).toBeInTheDocument();
      expect(screen.getByText('1 Document')).toBeInTheDocument();
      
      // Check tags
      expect(screen.getByText('Verified Human')).toBeInTheDocument();
      expect(screen.getByText('Marketing')).toBeInTheDocument();
      
      // Check another scan with AI providers
      expect(screen.getByText('GPT-4')).toBeInTheDocument();
      expect(screen.getByText('Llama')).toBeInTheDocument();
    });
  });

  it('should allow searching for scans', async () => {
    useAuthStore.getState().setAuth(mockUser, {
      accessToken: 'test-token',
      refreshToken: 'test-refresh-token',
    });

    renderDashboard();
    vi.advanceTimersByTime(600);

    await waitFor(() => {
      expect(screen.getByText('Q3 Marketing Blog Post')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search scans...');
    fireEvent.change(searchInput, { target: { value: 'Marketing' } });

    // Should show only matching scans
    expect(screen.getByText('Q3 Marketing Blog Post')).toBeInTheDocument();
    expect(screen.queryByText('Student Essay Batch #42')).not.toBeInTheDocument();
  });

  it('should show empty state when no scans match search', async () => {
    useAuthStore.getState().setAuth(mockUser, {
      accessToken: 'test-token',
      refreshToken: 'test-refresh-token',
    });

    renderDashboard();
    vi.advanceTimersByTime(600);

    await waitFor(() => {
      expect(screen.getByText('Q3 Marketing Blog Post')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search scans...');
    fireEvent.change(searchInput, { target: { value: 'NonExistentScan' } });

    expect(screen.getByText('No scans found')).toBeInTheDocument();
    expect(screen.getByText('Try adjusting your search query')).toBeInTheDocument();
  });

  it('should handle scan deletion', async () => {
    useAuthStore.getState().setAuth(mockUser, {
      accessToken: 'test-token',
      refreshToken: 'test-refresh-token',
    });

    renderDashboard();
    vi.advanceTimersByTime(600);

    await waitFor(() => {
      expect(screen.getByText('Q3 Marketing Blog Post')).toBeInTheDocument();
    });

    // Find and click delete button for the first scan
    const deleteButtons = screen.getAllByTestId('icon').filter(
      el => el.getAttribute('data-icon') === 'mdi:delete'
    );
    
    fireEvent.click(deleteButtons[0]);

    // Should show success toast
    expect(mockShowToast).toHaveBeenCalled();

    // Scan should be removed from the list
    await waitFor(() => {
      expect(screen.queryByText('Q3 Marketing Blog Post')).not.toBeInTheDocument();
    });
  });

  it('should display correct metrics', async () => {
    useAuthStore.getState().setAuth(mockUser, {
      accessToken: 'test-token',
      refreshToken: 'test-refresh-token',
    });

    renderDashboard();
    vi.advanceTimersByTime(600);

    await waitFor(() => {
      // Total scans
      const totalScansElements = screen.getAllByText('4');
      expect(totalScansElements.length).toBeGreaterThan(0);
      
      // AI vs Human distribution
      expect(screen.getByText(/AI Generated/i)).toBeInTheDocument();
      expect(screen.getByText(/Human Written/i)).toBeInTheDocument();
    });
  });

  it('should render action buttons', async () => {
    useAuthStore.getState().setAuth(mockUser, {
      accessToken: 'test-token',
      refreshToken: 'test-refresh-token',
    });

    renderDashboard();
    vi.advanceTimersByTime(600);

    await waitFor(() => {
      expect(screen.getByText('Manage Tags')).toBeInTheDocument();
      expect(screen.getByText('Manage AIs')).toBeInTheDocument();
      expect(screen.getByText('Create Scan')).toBeInTheDocument();
    });
  });

  it('should display username in header', async () => {
    useAuthStore.getState().setAuth(mockUser, {
      accessToken: 'test-token',
      refreshToken: 'test-refresh-token',
    });

    renderDashboard();
    vi.advanceTimersByTime(600);

    await waitFor(() => {
      expect(screen.getByText(mockUser.username)).toBeInTheDocument();
    });
  });

  it('should handle logout', () => {
    useAuthStore.getState().setAuth(mockUser, {
      accessToken: 'test-token',
      refreshToken: 'test-refresh-token',
    });

    renderDashboard();

    const logoutButton = screen.getByRole('button', { name: /logout/i });
    fireEvent.click(logoutButton);

    // Should clear auth state
    const state = useAuthStore.getState();
    expect(state.accessToken).toBeNull();
    expect(state.refreshToken).toBeNull();
    expect(state.user).toBeNull();

    // Should show toast
    expect(mockShowToast).toHaveBeenCalled();

    // Should redirect
    vi.advanceTimersByTime(500);
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('should render table headers correctly', async () => {
    useAuthStore.getState().setAuth(mockUser, {
      accessToken: 'test-token',
      refreshToken: 'test-refresh-token',
    });

    renderDashboard();
    vi.advanceTimersByTime(600);

    await waitFor(() => {
      expect(screen.getByText('SCAN TITLE')).toBeInTheDocument();
      expect(screen.getByText('DATE')).toBeInTheDocument();
      expect(screen.getByText('TAGS')).toBeInTheDocument();
      expect(screen.getByText('AI PROVIDERS')).toBeInTheDocument();
      expect(screen.getByText('ACTIONS')).toBeInTheDocument();
    });
  });

  it('should show responsive design elements', async () => {
    useAuthStore.getState().setAuth(mockUser, {
      accessToken: 'test-token',
      refreshToken: 'test-refresh-token',
    });

    renderDashboard();
    vi.advanceTimersByTime(600);

    await waitFor(() => {
      // Check for sort dropdown
      const sortDropdown = screen.getByRole('combobox');
      expect(sortDropdown).toBeInTheDocument();
      
      // Check for search input
      const searchInput = screen.getByPlaceholderText('Search scans...');
      expect(searchInput).toBeInTheDocument();
    });
  });
});
