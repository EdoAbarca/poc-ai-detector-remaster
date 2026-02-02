import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Register from '../pages/Register';

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

// Mock fetch globally
global.fetch = vi.fn();

describe('Register Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderRegister = () => {
    return render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );
  };

  it('should render registration form', () => {
    renderRegister();
    
    expect(screen.getByText('Create Account')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('name@company.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('johndoe')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Minimum 8 characters/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });

  it('should show validation errors for empty form submission', async () => {
    renderRegister();
    
    const submitButton = screen.getByRole('button', { name: /sign up/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Username is required')).toBeInTheDocument();
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });
  });

  it('should show validation error for invalid email', async () => {
    renderRegister();
    
    const form = screen.getByRole('button', { name: /sign up/i }).closest('form');
    const emailInput = screen.getByPlaceholderText('name@company.com');
    const usernameInput = screen.getByPlaceholderText('johndoe');
    const passwordInput = screen.getByPlaceholderText(/Minimum 8 characters/i);
    
    // Remove HTML5 validation to test Yup validation
    form.setAttribute('noValidate', 'true');
    
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(screen.getByText('Please provide a valid email address')).toBeInTheDocument();
    });
  });

  it('should show validation error for short username', async () => {
    renderRegister();
    
    const emailInput = screen.getByPlaceholderText('name@company.com');
    const usernameInput = screen.getByPlaceholderText('johndoe');
    const passwordInput = screen.getByPlaceholderText(/Minimum 8 characters/i);
    const submitButton = screen.getByRole('button', { name: /sign up/i });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(usernameInput, { target: { value: 'ab' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Username must be at least 3 characters long')).toBeInTheDocument();
    });
  });

  it('should show validation error for invalid username characters', async () => {
    renderRegister();
    
    const emailInput = screen.getByPlaceholderText('name@company.com');
    const usernameInput = screen.getByPlaceholderText('johndoe');
    const passwordInput = screen.getByPlaceholderText(/Minimum 8 characters/i);
    const submitButton = screen.getByRole('button', { name: /sign up/i });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(usernameInput, { target: { value: 'test user!' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Username can only contain letters/i)).toBeInTheDocument();
    });
  });

  it('should show validation error for short password', async () => {
    renderRegister();
    
    const emailInput = screen.getByPlaceholderText('name@company.com');
    const usernameInput = screen.getByPlaceholderText('johndoe');
    const passwordInput = screen.getByPlaceholderText(/Minimum 8 characters/i);
    const submitButton = screen.getByRole('button', { name: /sign up/i });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'pass' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Password must be at least 8 characters long')).toBeInTheDocument();
    });
  });

  it('should clear field error when user starts typing', async () => {
    renderRegister();
    
    const emailInput = screen.getByPlaceholderText('name@company.com');
    const submitButton = screen.getByRole('button', { name: /sign up/i });
    
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

  it('should successfully submit valid form', async () => {
    // Mock successful API response
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        message: 'User registered successfully',
        user: { id: 1, email: 'test@example.com', username: 'testuser' },
      }),
    });

    renderRegister();
    
    const emailInput = screen.getByPlaceholderText('name@company.com');
    const usernameInput = screen.getByPlaceholderText('johndoe');
    const passwordInput = screen.getByPlaceholderText(/Minimum 8 characters/i);
    const submitButton = screen.getByRole('button', { name: /sign up/i });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3333/auth/signup',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: 'test@example.com',
            username: 'testuser',
            password: 'password123',
          }),
        })
      );
    });
  });

  it('should disable submit button while loading', async () => {
    // Mock delayed API response
    global.fetch.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              ok: true,
              json: async () => ({ message: 'User registered successfully' }),
            });
          }, 100);
        })
    );

    renderRegister();
    
    const emailInput = screen.getByPlaceholderText('name@company.com');
    const usernameInput = screen.getByPlaceholderText('johndoe');
    const passwordInput = screen.getByPlaceholderText(/Minimum 8 characters/i);
    const submitButton = screen.getByRole('button', { name: /sign up/i });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(submitButton).toBeDisabled();
      expect(screen.getByText('Creating account...')).toBeInTheDocument();
    });
  });
});
