import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import * as yup from 'yup';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';

// Validation schema
const registerSchema = yup.object().shape({
  email: yup
    .string()
    .email('Please provide a valid email address')
    .required('Email is required'),
  username: yup
    .string()
    .min(3, 'Username must be at least 3 characters long')
    .max(30, 'Username must not exceed 30 characters')
    .matches(
      /^[a-zA-Z0-9_-]+$/,
      'Username can only contain letters, numbers, underscores, and hyphens'
    )
    .required('Username is required'),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .required('Password is required'),
});

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
  });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    try {
      // Validate form data
      await registerSchema.validate(formData, { abortEarly: false });

      setIsLoading(true);

      // Make API request
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3333';
      const response = await fetch(`${apiUrl}/auth/signup`, {
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
          if (Array.isArray(data.message)) {
            // Validation errors
            const validationErrors = {};
            data.message.forEach((msg) => {
              // Try to extract field name from message
              const field = msg.toLowerCase().includes('email')
                ? 'email'
                : msg.toLowerCase().includes('username')
                ? 'username'
                : msg.toLowerCase().includes('password')
                ? 'password'
                : 'general';
              validationErrors[field] = msg;
            });
            setErrors(validationErrors);
          } else {
            // Single error message (like ConflictException)
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
        }
        return;
      }

      // Success
      Toastify({
        text: 'Registration successful! Redirecting to login...',
        duration: 3000,
        gravity: 'top',
        position: 'right',
        style: {
          background: 'linear-gradient(to right, #00b09b, #96c93d)',
        },
      }).showToast();

      // Redirect to login page after short delay
      setTimeout(() => {
        navigate('/login');
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
    <div className="flex min-h-screen w-full flex-row overflow-hidden bg-white">
      {/* Left Panel: Brand & Visuals (40%) - Hidden on mobile */}
      <div className="hidden lg:flex w-[40%] flex-col relative bg-[#1E40AF] text-white p-12 justify-between">
        {/* Background with gradient overlay */}
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-blue-700 via-blue-800 to-blue-900 opacity-90"></div>
        
        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-8">
            <Icon icon="mdi:shield-check" className="text-4xl" />
            <span className="text-2xl font-bold tracking-tight">PoC AI Detector</span>
          </div>
        </div>
        
        <div className="relative z-10 mb-12">
          <h1 className="text-5xl font-bold leading-tight tracking-tight mb-6">
            Detect with Confidence.
          </h1>
          <p className="text-lg font-light text-blue-100 max-w-md leading-relaxed">
            Join thousands of users in verifying content authenticity. Ensure originality and trust in every word you publish.
          </p>
        </div>
        
        <div className="relative z-10 flex gap-4 text-sm font-medium text-blue-200">
          <span>© 2026 PoC AI Detector</span>
        </div>
      </div>

      {/* Right Panel: Registration Form (60%) */}
      <div className="flex flex-1 w-full lg:w-[60%] flex-col justify-center items-center bg-white overflow-y-auto">
        <div className="w-full max-w-[520px] px-6 py-12 lg:px-12">
          {/* Mobile Logo (Visible only on small screens) */}
          <div className="lg:hidden flex items-center gap-2 mb-8 text-[#2463eb]">
            <Icon icon="mdi:shield-check" className="text-3xl" />
            <span className="text-xl font-bold">PoC AI Detector</span>
          </div>
          
          {/* Header */}
          <div className="mb-10">
            <h2 className="text-[#0F172A] text-4xl font-black leading-tight tracking-tight mb-2">
              Create Account
            </h2>
            <p className="text-[#64748B] text-base font-normal">
              Start verifying your content today.
            </p>
          </div>
          
          {/* Form */}
          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            {/* Username Field */}
            <label className="flex flex-col gap-1.5">
              <span className="text-[#0F172A] text-sm font-semibold">Username</span>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                value={formData.username}
                onChange={handleChange}
                className={`w-full rounded-lg border ${
                  errors.username ? 'border-red-500' : 'border-slate-200'
                } bg-white px-4 py-3 text-[#0F172A] placeholder:text-slate-400 focus:border-[#2563EB] focus:ring-0 text-base transition-colors`}
                placeholder="johndoe"
              />
              {errors.username && (
                <p className="text-sm text-red-600">{errors.username}</p>
              )}
            </label>

            {/* Email Address Field */}
            <label className="flex flex-col gap-1.5">
              <span className="text-[#0F172A] text-sm font-semibold">Email Address</span>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full rounded-lg border ${
                  errors.email ? 'border-red-500' : 'border-slate-200'
                } bg-white px-4 py-3 text-[#0F172A] placeholder:text-slate-400 focus:border-[#2563EB] focus:ring-0 text-base transition-colors`}
                placeholder="name@company.com"
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email}</p>
              )}
            </label>

            {/* Password Field */}
            <label className="flex flex-col gap-1.5">
              <span className="text-[#0F172A] text-sm font-semibold">Password</span>
              <div className="relative flex items-center">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full rounded-lg border ${
                    errors.password ? 'border-red-500' : 'border-slate-200'
                  } bg-white px-4 py-3 pr-12 text-[#0F172A] placeholder:text-slate-400 focus:border-[#2563EB] focus:ring-0 text-base transition-colors`}
                  placeholder="Minimum 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 text-slate-400 hover:text-slate-600 flex items-center justify-center"
                >
                  <Icon icon={showPassword ? 'mdi:eye-off' : 'mdi:eye'} className="text-xl" />
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-600">{errors.password}</p>
              )}
            </label>

            {/* General Error */}
            {errors.general && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                <p className="text-sm text-red-800">{errors.general}</p>
              </div>
            )}

            {/* Sign Up Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 flex w-full items-center justify-center rounded-lg bg-[#2563EB] px-6 py-3.5 text-base font-bold text-white shadow-sm hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <Icon icon="mdi:loading" className="animate-spin h-5 w-5 mr-2" />
                  Creating account...
                </span>
              ) : (
                'Sign Up'
              )}
            </button>
          </form>

          {/* Footer Link */}
          <p className="mt-8 text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-bold text-[#2563EB] hover:text-blue-700 hover:underline"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
