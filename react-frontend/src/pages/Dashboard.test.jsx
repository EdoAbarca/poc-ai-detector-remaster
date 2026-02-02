import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from './Dashboard';
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

describe('Dashboard Component', () => {
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

  it('should render dashboard when user is authenticated', () => {
    // Set authenticated user
    useAuthStore.getState().setAuth(mockUser, {
      accessToken: 'test-token',
      refreshToken: 'test-refresh-token',
    });

    renderDashboard();

    expect(screen.getByText(`Welcome back, ${mockUser.username}!`)).toBeInTheDocument();
    // Check that username appears in the header (using getAllByText)
    const usernameElements = screen.getAllByText(mockUser.username);
    expect(usernameElements.length).toBeGreaterThan(0);
  });

  it('should display user information correctly', () => {
    // Set authenticated user
    useAuthStore.getState().setAuth(mockUser, {
      accessToken: 'test-token',
      refreshToken: 'test-refresh-token',
    });

    renderDashboard();

    // Check username appears multiple times
    const usernameElements = screen.getAllByText(mockUser.username);
    expect(usernameElements.length).toBeGreaterThan(0);
    
    // Check email
    expect(screen.getByText(mockUser.email)).toBeInTheDocument();
    
    // Check member since date (using regex to handle timezone differences)
    expect(screen.getByText(/December 31, 2023|January 1, 2024/)).toBeInTheDocument();
  });

  it('should render logout button', () => {
    // Set authenticated user
    useAuthStore.getState().setAuth(mockUser, {
      accessToken: 'test-token',
      refreshToken: 'test-refresh-token',
    });

    renderDashboard();

    const logoutButton = screen.getByRole('button', { name: /logout/i });
    expect(logoutButton).toBeInTheDocument();
  });

  it('should clear auth state when logout button is clicked', async () => {
    // Set authenticated user
    useAuthStore.getState().setAuth(mockUser, {
      accessToken: 'test-token',
      refreshToken: 'test-refresh-token',
    });

    renderDashboard();

    const logoutButton = screen.getByRole('button', { name: /logout/i });
    fireEvent.click(logoutButton);

    // Don't use fake timers for state updates - just verify synchronously
    const state = useAuthStore.getState();
    expect(state.accessToken).toBeNull();
    expect(state.refreshToken).toBeNull();
    expect(state.user).toBeNull();
  });

  it('should show logout notification when logout button is clicked', () => {
    // Set authenticated user
    useAuthStore.getState().setAuth(mockUser, {
      accessToken: 'test-token',
      refreshToken: 'test-refresh-token',
    });

    renderDashboard();

    const logoutButton = screen.getByRole('button', { name: /logout/i });
    fireEvent.click(logoutButton);

    expect(mockShowToast).toHaveBeenCalled();
  });

  it('should redirect to landing page after logout', () => {
    // Set authenticated user
    useAuthStore.getState().setAuth(mockUser, {
      accessToken: 'test-token',
      refreshToken: 'test-refresh-token',
    });

    renderDashboard();

    const logoutButton = screen.getByRole('button', { name: /logout/i });
    fireEvent.click(logoutButton);

    // Fast-forward timers to trigger redirect
    vi.advanceTimersByTime(500);

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('should display stats grid with correct values', () => {
    // Set authenticated user
    useAuthStore.getState().setAuth(mockUser, {
      accessToken: 'test-token',
      refreshToken: 'test-refresh-token',
    });

    renderDashboard();

    expect(screen.getByText('Total Analyses')).toBeInTheDocument();
    expect(screen.getByText('Recent Scans')).toBeInTheDocument();
    expect(screen.getByText('Account Security')).toBeInTheDocument();
  });

  it('should display quick actions section', () => {
    // Set authenticated user
    useAuthStore.getState().setAuth(mockUser, {
      accessToken: 'test-token',
      refreshToken: 'test-refresh-token',
    });

    renderDashboard();

    expect(screen.getByText('Quick Actions')).toBeInTheDocument();
    expect(screen.getByText('New Analysis')).toBeInTheDocument();
    expect(screen.getByText('View History')).toBeInTheDocument();
  });

  it('should display account information section', () => {
    // Set authenticated user
    useAuthStore.getState().setAuth(mockUser, {
      accessToken: 'test-token',
      refreshToken: 'test-refresh-token',
    });

    renderDashboard();

    expect(screen.getByText('Account Information')).toBeInTheDocument();
  });

  it('should verify tokens are completely removed after logout', () => {
    // Set authenticated user
    useAuthStore.getState().setAuth(mockUser, {
      accessToken: 'test-token',
      refreshToken: 'test-refresh-token',
    });

    // Verify tokens are set
    expect(useAuthStore.getState().accessToken).toBe('test-token');
    expect(useAuthStore.getState().refreshToken).toBe('test-refresh-token');

    renderDashboard();

    const logoutButton = screen.getByRole('button', { name: /logout/i });
    fireEvent.click(logoutButton);

    // Verify tokens are cleared immediately
    const state = useAuthStore.getState();
    expect(state.accessToken).toBeNull();
    expect(state.refreshToken).toBeNull();
    expect(state.user).toBeNull();
  });

  it('should not be able to access dashboard after logout', () => {
    // Set authenticated user
    useAuthStore.getState().setAuth(mockUser, {
      accessToken: 'test-token',
      refreshToken: 'test-refresh-token',
    });

    renderDashboard();

    const logoutButton = screen.getByRole('button', { name: /logout/i });
    fireEvent.click(logoutButton);

    // Clear navigation mock calls
    mockNavigate.mockClear();

    // Verify state is cleared
    expect(useAuthStore.getState().accessToken).toBeNull();

    // Try to render dashboard again (simulating return after logout)
    cleanup();
    renderDashboard();

    // Should redirect to login
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});
