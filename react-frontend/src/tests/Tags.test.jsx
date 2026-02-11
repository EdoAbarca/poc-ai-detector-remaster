import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Tags from '../pages/Tags';
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

describe('Tags Component - US-007', () => {
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

  const renderTags = () => {
    return render(
      <BrowserRouter>
        <Tags />
      </BrowserRouter>
    );
  };

  it('should redirect to login when not authenticated', () => {
    renderTags();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('should render Tags page with heading when authenticated', async () => {
    // Mock fetch for tags API
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      })
    );

    useAuthStore.getState().setAuth(mockUser, {
      accessToken: 'test-token',
      refreshToken: 'test-refresh-token',
    });

    renderTags();

    await waitFor(() => {
      expect(screen.getByText('Manage Tags')).toBeInTheDocument();
      expect(screen.getByText(/Organize AI detection scans with custom labels/)).toBeInTheDocument();
    });

    global.fetch.mockRestore();
  });

  it('should show loading state initially', () => {
    // Mock fetch to delay response
    global.fetch = vi.fn(() => new Promise(() => {}));

    useAuthStore.getState().setAuth(mockUser, {
      accessToken: 'test-token',
      refreshToken: 'test-refresh-token',
    });

    renderTags();

    expect(screen.getByText('Loading tags...')).toBeInTheDocument();

    global.fetch.mockRestore();
  });

  it('should display tags after loading', async () => {
    const mockTags = [
      {
        id: 1,
        name: 'Finance',
        createdAt: new Date('2023-10-24').toISOString(),
        scanCount: 14,
      },
      {
        id: 2,
        name: 'Marketing',
        createdAt: new Date('2023-10-10').toISOString(),
        scanCount: 42,
      },
    ];

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockTags),
      })
    );

    useAuthStore.getState().setAuth(mockUser, {
      accessToken: 'test-token',
      refreshToken: 'test-refresh-token',
    });

    renderTags();

    await waitFor(() => {
      expect(screen.queryByText('Loading tags...')).not.toBeInTheDocument();
      expect(screen.getByText('Finance')).toBeInTheDocument();
      expect(screen.getByText('Marketing')).toBeInTheDocument();
    });

    global.fetch.mockRestore();
  });

  it('should display scan counts for each tag', async () => {
    const mockTags = [
      {
        id: 1,
        name: 'Finance',
        createdAt: new Date('2023-10-24').toISOString(),
        scanCount: 14,
      },
      {
        id: 2,
        name: 'Urgent Review',
        createdAt: new Date('2023-11-01').toISOString(),
        scanCount: 3,
      },
    ];

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockTags),
      })
    );

    useAuthStore.getState().setAuth(mockUser, {
      accessToken: 'test-token',
      refreshToken: 'test-refresh-token',
    });

    renderTags();

    await waitFor(() => {
      expect(screen.getByText('14 Scans')).toBeInTheDocument();
      expect(screen.getByText('3 Scans')).toBeInTheDocument();
    });

    global.fetch.mockRestore();
  });

  it('should allow searching for tags', async () => {
    const mockTags = [
      {
        id: 1,
        name: 'Finance',
        createdAt: new Date('2023-10-24').toISOString(),
        scanCount: 14,
      },
      {
        id: 2,
        name: 'Marketing',
        createdAt: new Date('2023-10-10').toISOString(),
        scanCount: 42,
      },
    ];

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockTags),
      })
    );

    useAuthStore.getState().setAuth(mockUser, {
      accessToken: 'test-token',
      refreshToken: 'test-refresh-token',
    });

    renderTags();

    await waitFor(() => {
      expect(screen.getByText('Finance')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search tags...');
    fireEvent.change(searchInput, { target: { value: 'Finance' } });

    // Should show only matching tag
    expect(screen.getByText('Finance')).toBeInTheDocument();
    expect(screen.queryByText('Marketing')).not.toBeInTheDocument();

    global.fetch.mockRestore();
  });

  it('should show empty state when no tags match search', async () => {
    const mockTags = [
      {
        id: 1,
        name: 'Finance',
        createdAt: new Date('2023-10-24').toISOString(),
        scanCount: 14,
      },
    ];

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockTags),
      })
    );

    useAuthStore.getState().setAuth(mockUser, {
      accessToken: 'test-token',
      refreshToken: 'test-refresh-token',
    });

    renderTags();

    await waitFor(() => {
      expect(screen.getByText('Finance')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search tags...');
    fireEvent.change(searchInput, { target: { value: 'NonExistentTag' } });

    expect(screen.getByText('No tags found')).toBeInTheDocument();
    expect(screen.getByText('Try adjusting your search query')).toBeInTheDocument();

    global.fetch.mockRestore();
  });

  it('should show empty state when user has no tags', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      })
    );

    useAuthStore.getState().setAuth(mockUser, {
      accessToken: 'test-token',
      refreshToken: 'test-refresh-token',
    });

    renderTags();

    await waitFor(() => {
      expect(screen.getByText('No tags found')).toBeInTheDocument();
      expect(screen.getByText('Get started by creating your first tag')).toBeInTheDocument();
    });

    global.fetch.mockRestore();
  });

  it('should display username in header', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      })
    );

    useAuthStore.getState().setAuth(mockUser, {
      accessToken: 'test-token',
      refreshToken: 'test-refresh-token',
    });

    renderTags();

    await waitFor(() => {
      expect(screen.getByText(mockUser.username)).toBeInTheDocument();
    });

    global.fetch.mockRestore();
  });

  it('should handle logout', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      })
    );

    useAuthStore.getState().setAuth(mockUser, {
      accessToken: 'test-token',
      refreshToken: 'test-refresh-token',
    });

    renderTags();

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

    global.fetch.mockRestore();
  });

  it('should navigate back to dashboard when dashboard icon is clicked', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      })
    );

    useAuthStore.getState().setAuth(mockUser, {
      accessToken: 'test-token',
      refreshToken: 'test-refresh-token',
    });

    renderTags();

    await waitFor(() => {
      expect(screen.getByText('Manage Tags')).toBeInTheDocument();
    });

    const dashboardButton = screen.getByTitle('Back to Dashboard');
    fireEvent.click(dashboardButton);

    expect(mockNavigate).toHaveBeenCalledWith('/logged-in');

    global.fetch.mockRestore();
  });

  it('should handle API error when fetching tags', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500,
      })
    );

    useAuthStore.getState().setAuth(mockUser, {
      accessToken: 'test-token',
      refreshToken: 'test-refresh-token',
    });

    renderTags();

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalled();
    });

    global.fetch.mockRestore();
  });

  it('should render table headers correctly', async () => {
    const mockTags = [
      {
        id: 1,
        name: 'Finance',
        createdAt: new Date('2023-10-24').toISOString(),
        scanCount: 14,
      },
    ];

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockTags),
      })
    );

    useAuthStore.getState().setAuth(mockUser, {
      accessToken: 'test-token',
      refreshToken: 'test-refresh-token',
    });

    renderTags();

    await waitFor(() => {
      expect(screen.queryByText('Loading tags...')).not.toBeInTheDocument();
    });

    expect(screen.getByRole('columnheader', { name: /tag name/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /scans linked/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /date created/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /last used/i })).toBeInTheDocument();

    global.fetch.mockRestore();
  });

  it('should call API with correct authorization header', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      })
    );

    useAuthStore.getState().setAuth(mockUser, {
      accessToken: 'test-token',
      refreshToken: 'test-refresh-token',
    });

    renderTags();

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:3000/api/v1/tags/user/${mockUser.id}`,
        expect.objectContaining({
          headers: {
            'Authorization': 'Bearer test-token',
          },
        })
      );
    });

    global.fetch.mockRestore();
  });
});
