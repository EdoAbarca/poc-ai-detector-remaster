import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
      const response = await fetch('http://localhost:3333/auth/signup', {
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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Join the AI detection platform
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Icon
                    icon="mdi:email"
                    className="h-5 w-5 text-gray-400"
                  />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`appearance-none rounded-md relative block w-full px-3 py-2 pl-10 border ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                  placeholder="Email address"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Username Field */}
            <div>
              <label htmlFor="username" className="sr-only">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Icon
                    icon="mdi:account"
                    className="h-5 w-5 text-gray-400"
                  />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`appearance-none rounded-md relative block w-full px-3 py-2 pl-10 border ${
                    errors.username ? 'border-red-500' : 'border-gray-300'
                  } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                  placeholder="Username"
                />
              </div>
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">{errors.username}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Icon
                    icon="mdi:lock"
                    className="h-5 w-5 text-gray-400"
                  />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`appearance-none rounded-md relative block w-full px-3 py-2 pl-10 border ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                  placeholder="Password (min. 8 characters)"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>
          </div>

          {errors.general && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{errors.general}</p>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <Icon
                    icon="mdi:loading"
                    className="animate-spin h-5 w-5 mr-2"
                  />
                  Creating account...
                </span>
              ) : (
                'Sign up'
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <a
                href="/login"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Sign in
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;
