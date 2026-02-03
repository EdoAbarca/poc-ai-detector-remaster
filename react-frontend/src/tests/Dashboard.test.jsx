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
    
    // Clear Zustand store
    useAuthStore.getState().clearAuth();
  });

  afterEach(() => {
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

    await waitFor(() => {
      expect(screen.getByText('Scan Management')).toBeInTheDocument();
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

    await waitFor(() => {
      // Check scan title and document count
      expect(screen.getByText('Q3 Marketing Blog Post')).toBeInTheDocument();
      expect(screen.getByText('1 Document')).toBeInTheDocument();
      
      // Check tags - use getAllByText since there are multiple
      expect(screen.getAllByText('Verified Human').length).toBeGreaterThan(0);
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

  it('should render action buttons', async () => {
    useAuthStore.getState().setAuth(mockUser, {
      accessToken: 'test-token',
      refreshToken: 'test-refresh-token',
    });

    renderDashboard();

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

    await waitFor(() => {
      expect(screen.getByText(mockUser.username)).toBeInTheDocument();
    });
  });

  it('should handle logout', async () => {
    useAuthStore.getState().setAuth(mockUser, {
      accessToken: 'test-token',
      refreshToken: 'test-refresh-token',
    });

    renderDashboard();

    const logoutButton = screen.getByRole('button', { name: /logout/i });
    fireEvent.click(logoutButton);

    // Wait for async logout to complete
    await waitFor(() => {
      // Should clear auth state
      const state = useAuthStore.getState();
      expect(state.accessToken).toBeNull();
      expect(state.refreshToken).toBeNull();
      expect(state.user).toBeNull();

      // Should show toast
      expect(mockShowToast).toHaveBeenCalled();

      // Should redirect
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('should render table headers correctly', async () => {
    useAuthStore.getState().setAuth(mockUser, {
      accessToken: 'test-token',
      refreshToken: 'test-refresh-token',
    });

    renderDashboard();

    // Wait for scans to load first
    await waitFor(() => {
      expect(screen.queryByText('Loading scans...')).not.toBeInTheDocument();
    });

    // Check for table headers using role queries to be more specific
    expect(screen.getByRole('columnheader', { name: /scan title/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /date/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /tags/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /ai providers/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /actions/i })).toBeInTheDocument();
  });

  it('should show responsive design elements', async () => {
    useAuthStore.getState().setAuth(mockUser, {
      accessToken: 'test-token',
      refreshToken: 'test-refresh-token',
    });

    renderDashboard();

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
