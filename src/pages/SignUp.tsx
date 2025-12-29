import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function SignUp() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const navigate = useNavigate()

  const backendUrl = import.meta.env.VITE_BACKEND_URL
  if (!backendUrl) {
    console.error('VITE_BACKEND_URL is not set in .env')
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    // Validate password length
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (signUpError) {
        setError(signUpError.message)
        setLoading(false)
        return
      }

      if (data.user) {
        // Check if email confirmation is required
        if (data.session) {
          // Email confirmation disabled - user is signed in immediately
          // Create user profile in our system
          try {
            const accessToken = data.session.access_token
            const userId = data.user.id

            if (!backendUrl) {
              throw new Error('Backend URL is not configured')
            }

            const response = await fetch(`${backendUrl}/make-user`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
              },
              body: JSON.stringify({
                user_id: userId,
              }),
            })

            const makeUserData = await response.json()

            if (!response.ok) {
              // Handle different error cases
              const errorMessage = makeUserData.detail || `Failed to create user profile: ${response.statusText}`
              throw new Error(errorMessage)
            }

            // Successfully created or profile already exists - proceed to dashboard
            navigate('/dashboard/overview')
          } catch (makeUserError) {
            // Log the error
            console.error('Error creating user profile:', makeUserError)
            // Show error but still allow navigation since Supabase account is created
            setError(`Account created successfully, but profile setup encountered an issue: ${makeUserError instanceof Error ? makeUserError.message : 'Unknown error'}. You can try again from the dashboard.`)
            // Navigate anyway after a short delay
            setTimeout(() => {
              navigate('/dashboard/overview')
            }, 3000)
          }
        } else {
          // Email confirmation required - show success message
          setSuccess('Please check your email to confirm your account before signing in.')
          // Optionally navigate to sign in after a delay
          setTimeout(() => {
            navigate('/signin')
          }, 3000)
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#f5f5f5] p-5">
      <div className="bg-white p-10 rounded-lg shadow-[0_2px_10px_rgba(0,0,0,0.1)] w-full max-w-md">
        <button
          onClick={() => navigate('/')}
          className="mb-4 flex items-center gap-2 text-[#555] hover:text-[#333] transition-colors duration-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm font-medium">Back to Home</span>
        </button>
        <h1 className="mb-[30px] text-center text-[#333] text-[28px] font-semibold">
          Sign Up
        </h1>

        <form onSubmit={handleSignUp}>
          <div className="mb-5">
            <label htmlFor="email" className="block mb-2 text-[#555] text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="w-full p-3 border border-[#ddd] rounded focus:border-[#4CAF50] outline-none transition-colors duration-200"
            />
          </div>

          <div className="mb-5">
            <label htmlFor="password" className="block mb-2 text-[#555] text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="w-full p-3 border border-[#ddd] rounded focus:border-[#4CAF50] outline-none transition-colors duration-200"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="confirmPassword" className="block mb-2 text-[#555] text-sm font-medium">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
              className="w-full p-3 border border-[#ddd] rounded focus:border-[#4CAF50] outline-none transition-colors duration-200"
            />
          </div>

          {error && (
            <div className="mb-5 p-3 bg-[#fee] border border-[#fcc] rounded text-[#c33] text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-5 p-3 bg-[#efe] border border-[#cfc] rounded text-[#3c3] text-sm">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full p-3 rounded text-base font-semibold transition-colors duration-200 ${
              loading 
                ? 'bg-[#ccc] text-white cursor-not-allowed' 
                : 'bg-[#4CAF50] text-white cursor-pointer hover:bg-[#45a049]'
            }`}
          >
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>

          <div className="mt-5 text-center">
            <p className="text-[#555] text-sm">
              Already have an account?{' '}
              <Link to="/signin" className="text-[#4CAF50] hover:underline font-medium">
                Sign In
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
