import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        setError(signInError.message)
        setLoading(false)
        return
      }

      if (data.user) {
        // Successful sign in
        navigate('/dashboard/overview')
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
          Sign In
        </h1>

        <form onSubmit={handleSignIn}>
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

          <div className="mb-6">
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

          {error && (
            <div className="mb-5 p-3 bg-[#fee] border border-[#fcc] rounded text-[#c33] text-sm">
              {error}
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
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <div className="mt-5 text-center">
            <p className="text-[#555] text-sm">
              Don't have an account?{' '}
              <Link to="/signup" className="text-[#4CAF50] hover:underline font-medium">
                Sign Up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
