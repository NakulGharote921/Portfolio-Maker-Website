import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, Link, Navigate } from 'react-router-dom'
import Loader from '../components/Loader'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { ADMIN_EMAIL } from '../services/profileService'

interface FormData {
  email: string
  password: string
}

export default function AdminLogin() {
  const { user, isAdmin, loading: authLoading, signIn, googleSignIn } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>()

  if (authLoading) {
    return <Loader />
  }

  if (user) {
    return <Navigate to={isAdmin ? '/dashboard' : '/'} replace />
  }

  const onSubmit = async (data: FormData) => {
    if (data.email.trim().toLowerCase() !== ADMIN_EMAIL) {
      showToast(`Admin access requires ${ADMIN_EMAIL}`, 'error')
      return
    }

    setLoading(true)

    try {
      await signIn(data.email, data.password)
      showToast('Admin signed in successfully.', 'success')
      navigate('/dashboard')
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Unable to sign in.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      await googleSignIn()
      showToast('Redirecting to Google sign in...', 'success')
    } catch {
      showToast('Google sign in failed.', 'error')
    }
  }

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8 rounded-[2rem] border border-base-300/50 bg-base-100/80 p-8 shadow-xl backdrop-blur-xl">
          <div>
            <h2 className="mt-6 text-center text-3xl font-bold">
              Admin Login
            </h2>
            <p className="mt-2 text-center text-sm text-base-content/60">
              Sign in with admin credentials to access dashboard.
            </p>
            <p className="mt-2 text-center text-xs font-mono text-base-content/70 bg-base-200/50 rounded px-2 py-1">
              Required: {ADMIN_EMAIL}
            </p>
            <div className="text-center">
              <Link to="/login" className="text-sm link link-primary">
                Use regular login instead
              </Link>
            </div>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="label">
                  <span className="label-text">Admin Email</span>
                </label>
                <input
                  id="email"
                  type="email"
                  {...register('email', { required: 'Email is required' })}
                  className="input input-bordered w-full"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-error">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="label">
                  <span className="label-text">Password</span>
                </label>
                <input
                  id="password"
                  type="password"
                  {...register('password', { required: 'Password is required' })}
                  className="input input-bordered w-full"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-error">{errors.password.message}</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full rounded-full"
            >
              {loading ? <Loader /> : 'Admin Sign In'}
            </button>

            <div className="divider">or</div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="btn btn-outline w-full rounded-full"
              disabled={loading}
            >
              Continue with Google
            </button>
          </form>
        </div>
      </div>
    </>
  )
}
