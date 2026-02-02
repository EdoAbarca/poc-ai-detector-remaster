import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import * as yup from 'yup';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import useAuthStore from '../store/authStore';

// Validation schema
const loginSchema = yup.object().shape({
  email: yup
    .string()
    .email('Please provide a valid email address')
    .required('Email is required'),
  password: yup
    .string()
    .min(1, 'Password is required')
    .required('Password is required'),
});

function Login() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleCheckboxChange = (e) => {
    setRememberMe(e.target.checked);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    try {
      // Validate form data
      await loginSchema.validate(formData, { abortEarly: false });

      setIsLoading(true);

      // Make API request
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3333';
      const response = await fetch(`${apiUrl}/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle error response
        if (data.message) {
          Toastify({
            text: data.message,
            duration: 3000,
            gravity: 'top',
            position: 'right',
            style: {
              background: 'linear-gradient(to right, #ff5f6d, #ffc371)',
            },
          }).showToast();
        }
        return;
      }

      // Success - store tokens
      if (data.tokens) {
        setAuth(data.user, data.tokens);
      }

      Toastify({
        text: 'Login successful! Redirecting...',
        duration: 3000,
        gravity: 'top',
        position: 'right',
        style: {
          background: 'linear-gradient(to right, #00b09b, #96c93d)',
        },
      }).showToast();

      // Redirect to dashboard after short delay
      setTimeout(() => {
        navigate('/logged-in');
      }, 1500);
    } catch (err) {
      if (err.name === 'ValidationError') {
        // Yup validation errors
        const validationErrors = {};
        err.inner.forEach((error) => {
          validationErrors[error.path] = error.message;
        });
        setErrors(validationErrors);
      } else {
        // Network or other errors
        Toastify({
          text: 'An error occurred. Please try again.',
          duration: 3000,
          gravity: 'top',
          position: 'right',
          style: {
            background: 'linear-gradient(to right, #ff5f6d, #ffc371)',
          },
        }).showToast();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Panel: Brand & Welcome (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-[40%] flex-col justify-between p-12 bg-gradient-to-br from-blue-600 via-indigo-700 to-indigo-900 text-white">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
            <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM4.5 12a7.5 7.5 0 0115 0v1.5a4.5 4.5 0 01-4.5 4.5h-6a4.5 4.5 0 01-4.5-4.5V12z" clipRule="evenodd" />
            <path fillRule="evenodd" d="M16.28 10.28a.75.75 0 010 1.06l-3 3a.75.75 0 01-1.06 0l-1.5-1.5a.75.75 0 111.06-1.06l.75.75 2.22-2.22a.75.75 0 011.06 0z" clipRule="evenodd" />
          </svg>
          <span className="text-2xl font-bold tracking-tight">DetectAI</span>
        </div>
        
        {/* Welcome Content */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold leading-tight tracking-tight mb-6">
            Welcome Back
          </h1>
          <p className="text-lg font-light max-w-md leading-relaxed opacity-90">
            Securely access your AI detection tools and scan history to maintain integrity in your content.
          </p>
        </div>
        
        {/* Footer */}
        <div className="text-sm font-medium opacity-75">
          © 2023 DetectAI Inc.
        </div>
      </div>

      {/* Right Panel: Login Form */}
      <div className="flex flex-1 w-full lg:w-[60%] flex-col justify-center items-center bg-white p-6 sm:p-8">
        {/* Mobile Logo (Visible only on small screens) */}
        <div className="lg:hidden flex items-center gap-3 mb-10 w-full max-w-md">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-blue-600">
            <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM4.5 12a7.5 7.5 0 0115 0v1.5a4.5 4.5 0 01-4.5 4.5h-6a4.5 4.5 0 01-4.5-4.5V12z" clipRule="evenodd" />
            <path fillRule="evenodd" d="M16.28 10.28a.75.75 0 010 1.06l-3 3a.75.75 0 01-1.06 0l-1.5-1.5a.75.75 0 111.06-1.06l.75.75 2.22-2.22a.75.75 0 011.06 0z" clipRule="evenodd" />
          </svg>
          <span className="text-xl font-bold text-gray-800">DetectAI</span>
        </div>
        
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-gray-900 text-3xl md:text-4xl font-black leading-tight tracking-tight mb-2">
              Login
            </h2>
            <p className="text-gray-600 text-base">
              Enter your credentials to access your account.
            </p>
          </div>
          
          {/* Form */}
          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            {/* Email Address Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-1.5">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full rounded-lg border ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                } bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-colors`}
                placeholder="name@company.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-900 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full rounded-lg border ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  } bg-white px-4 py-3 pr-12 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-colors`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path fillRule="evenodd" d="M3.75 4.5a.75.75 0 01.75.75v.75c0 1.148.417 2.187 1.086 3.008a7.5 7.5 0 011.826 5.927c-.693.84-1.086 1.88-1.086 3.008v.75a.75.75 0 01-1.5 0V4.5zm16.5 0a.75.75 0 01-.75.75v.75c0 1.148-.417 2.187-1.086 3.008a7.5 7.5 0 01-1.826 5.927c.693.84 1.086 1.88 1.086 3.008v.75a.75.75 0 01-1.5 0v-.75c0-1.128-.393-2.168-1.086-3.008a7.5 7.5 0 01-1.826-5.927c.67-1.148 1.086-2.187 1.086-3.008V5.25a.75.75 0 01.75-.75h1.5zm-10.5 3a3.75 3.75 0 110 7.5 3.75 3.75 0 010-7.5zm-3.75 3.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                      <path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.49 4.467-5.706 7.69-10.676 7.69-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM12 13.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="remember" className="ml-2 text-sm text-gray-700">
                  Remember Me
                </label>
              </div>
              <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                Forgot Password?
              </a>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 flex w-full items-center justify-center rounded-lg bg-blue-600 px-6 py-3.5 text-base font-bold text-white shadow-sm hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center justify-center py-6">
            <div className="absolute inset-x-0 top-1/2 h-px bg-gray-200"></div>
            <span className="relative bg-white px-4 text-sm text-gray-500">Or continue with</span>
          </div>

          {/* Google Sign In */}
          <button className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA14_wqDLEGK6VkkuDTJWBKYLzZwYJ5aMMZpb_iDIw64oD34_6neAI1py8qs4fexonhl6ZOaxcKSX0gPRGyDj6-fETSRXqkDT6YnT2QDM89gEjfIbtoMjla0ONtDaliAh0GhHuxTiVaUOEGUHejgiVZRE7nVNBV11RbtWE7842JRFelGjHxxIvZutcNZiCvL9mQirbhBO2hfwAKrxKOnwDKrfY7sPaF9nMK4JDwMfGZ6pELro_GwkN3W421A7Tpdy4pTDQpG3Z-V6fs"
              alt="Google logo"
              className="h-5 w-5"
            />
            Sign in with Google
          </button>

          {/* Footer Link */}
          <p className="mt-8 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-bold text-blue-600 hover:text-blue-700 hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
