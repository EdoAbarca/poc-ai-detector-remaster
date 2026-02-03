import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../pages/Login';
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
vi.mock('toastify-js', () => ({
  default: vi.fn(() => ({
    showToast: vi.fn(),
  })),
}));

// Mock @iconify/react to avoid async timer issues
vi.mock('@iconify/react', () => ({
  Icon: ({ icon }) => <span data-testid="icon" data-icon={icon}></span>,
}));

// Mock fetch globally
global.fetch = vi.fn();

describe('Login Component', () => {
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

  const renderLogin = () => {
    return render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
  };

  it('should render login form', () => {
    renderLogin();
    
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('name@company.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('should show validation errors for empty form submission', async () => {
    renderLogin();
    
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });
  });

  it('should show validation error for invalid email', async () => {
    renderLogin();
    
    const form = screen.getByRole('button', { name: /sign in/i }).closest('form');
    const emailInput = screen.getByPlaceholderText('name@company.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    
    // Remove HTML5 validation to test Yup validation
    form.setAttribute('noValidate', 'true');
    
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(screen.getByText('Please provide a valid email address')).toBeInTheDocument();
    });
  });

  it('should clear field error when user starts typing', async () => {
    renderLogin();
    
    const emailInput = screen.getByPlaceholderText('name@company.com');
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    // Trigger validation error
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument();
    });
    
    // Start typing to clear error
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    
    await waitFor(() => {
      expect(screen.queryByText('Email is required')).not.toBeInTheDocument();
    });
  });

  it('should toggle password visibility', () => {
    renderLogin();
    
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const toggleButton = passwordInput.parentElement.querySelector('button');
    
    // Initially password type
    expect(passwordInput).toHaveAttribute('type', 'password');
    
    // Click to show password
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');
    
    // Click to hide password
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('should render link to registration page', () => {
    renderLogin();
    
    const signUpLink = screen.getByText('Sign up');
    expect(signUpLink).toBeInTheDocument();
    expect(signUpLink).toHaveAttribute('href', '/register');
  });

  it('should display brand information', () => {
    renderLogin();
    
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Enter your credentials to access your account.')).toBeInTheDocument();
  });

  it('should handle login error response', async () => {
    // Ensure store is completely clear
    useAuthStore.getState().clearAuth();
    // Extra verification
    expect(useAuthStore.getState().accessToken).toBeNull();
    
    // Mock error API response
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        message: 'Invalid credentials',
      }),
    });

    renderLogin();
    
    const emailInput = screen.getByPlaceholderText('name@company.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
      expect(submitButton).not.toBeDisabled();
    });

    // Wait for all async state updates
    await waitFor(() => {}, { timeout: 100 });

    // Verify no tokens are stored
    const state = useAuthStore.getState();
    expect(state.accessToken).toBeNull();
    expect(state.refreshToken).toBeNull();
  });

  it('should handle network errors gracefully', async () => {
    // Ensure store is completely clear
    useAuthStore.getState().clearAuth();
    // Extra verification
    expect(useAuthStore.getState().accessToken).toBeNull();
    
    // Mock network error
    global.fetch.mockRejectedValueOnce(new Error('Network error'));

    renderLogin();
    
    const emailInput = screen.getByPlaceholderText('name@company.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
      expect(submitButton).not.toBeDisabled();
    });

    // Wait for all async state updates
    await waitFor(() => {}, { timeout: 100 });

    // Verify no tokens are stored on error
    expect(useAuthStore.getState().accessToken).toBeNull();
  });

  it('should successfully submit valid form and store tokens', async () => {
    // Ensure clean state
    useAuthStore.getState().clearAuth();
    
    // Mock successful API response
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        message: 'Login successful',
        tokens: {
          accessToken: 'test-access-token',
          refreshToken: 'test-refresh-token',
        },
        user: {
          id: 1,
          email: 'test@example.com',
          username: 'testuser',
        },
      }),
    });

    renderLogin();
    
    const emailInput = screen.getByPlaceholderText('name@company.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3333/auth/signin',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'password123',
          }),
        })
      );
    });

    // Verify tokens and user are stored in Zustand store
    await waitFor(() => {
      const state = useAuthStore.getState();
      expect(state.accessToken).toBe('test-access-token');
      expect(state.refreshToken).toBe('test-refresh-token');
      expect(state.user).toEqual({
        id: 1,
        email: 'test@example.com',
        username: 'testuser',
      });
    });
    
    // Clean up for next test
    useAuthStore.getState().clearAuth();
  });

  it('should disable submit button while loading', async () => {
    // Ensure clean state
    useAuthStore.getState().clearAuth();
    
    // Mock delayed API response
    global.fetch.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              ok: true,
              json: async () => ({ 
                message: 'Login successful',
                tokens: {
                  accessToken: 'test-access-token',
                  refreshToken: 'test-refresh-token',
                },
              }),
            });
          }, 100);
        })
    );

    renderLogin();
    
    const emailInput = screen.getByPlaceholderText('name@company.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(submitButton).toBeDisabled();
      expect(screen.getByText('Signing in...')).toBeInTheDocument();
    });
    
    // Wait for async operations to complete and clean up
    await waitFor(() => {}, { timeout: 200 });
    useAuthStore.getState().clearAuth();
  });
});
