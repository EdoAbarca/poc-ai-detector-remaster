import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Register from './pages/Register'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ProtectedRoute from './components/ProtectedRoute'
import PublicRoute from './components/PublicRoute'

function App () {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } />
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="/logged-in" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/" element={
          <PublicRoute>
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  AI Detector Platform
                </h1>
                <p className="text-lg text-gray-600 mb-8">
                  Welcome to the AI Detection Platform
                </p>
                <div className="space-x-4">
                  <a
                    href="/register"
                    className="inline-block px-6 py-3 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700"
                  >
                    Get Started
                  </a>
                  <a
                    href="/login"
                    className="inline-block px-6 py-3 bg-gray-200 text-gray-900 font-medium rounded-md hover:bg-gray-300"
                  >
                    Sign In
                  </a>
                </div>
              </div>
            </div>
          </PublicRoute>
        } />
      </Routes>
    </Router>
  )
}

export default App
