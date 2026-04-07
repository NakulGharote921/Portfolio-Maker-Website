import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import Loader from '../components/Loader'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

interface FormData {
  email: string
  password: string
  confirmPassword: string
}

export default function Signup() {
  const { user, isAdmin, loading: authLoading, signUp, googleSignIn } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>()

  const password = watch('password')

  if (authLoading) {
    return <Loader />
  }

  if (user) {
    return <Navigate to={isAdmin ? '/dashboard' : '/'} replace />
  }

  const onSubmit = async (data: FormData) => {
    setLoading(true)

    try {
      await signUp(data.email, data.password)
      showToast('Account created. Check your email if confirmation is required.', 'success')
      navigate('/')
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Signup failed.'
      showToast(message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)

    try {
      await googleSignIn()
      showToast('Redirecting to Google sign in...', 'success')
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Google sign in failed.'
      showToast(message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
      <div className="w-full max-w-2xl rounded-[2rem] border border-white/20 bg-base-100/80 p-6 shadow-2xl backdrop-blur-xl sm:p-10">
        <div className="mb-8 text-center">
          <Link to="/" className="text-sm font-semibold uppercase tracking-[0.28em] text-primary">
            MultiPortfolio
          </Link>
          <h1 className="mt-4 text-4xl font-black tracking-tight">
            Create your account
          </h1>
          <p className="mt-3 text-base-content/65">
            Supabase handles secure authentication and cloud-backed sessions.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <label className="form-control">
            <span className="label-text mb-2 font-medium">Email</span>
            <input
              type="email"
              className="input input-bordered w-full"
              placeholder="you@example.com"
              {...register('email', { required: 'Email is required' })}
            />
            {errors.email && (
              <span className="mt-2 text-sm text-error">{errors.email.message}</span>
            )}
          </label>

          <label className="form-control">
            <span className="label-text mb-2 font-medium">Password</span>
            <input
              type="password"
              className="input input-bordered w-full"
              placeholder="At least 6 characters"
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
              })}
            />
            {errors.password && (
              <span className="mt-2 text-sm text-error">
                {errors.password.message}
              </span>
            )}
          </label>

          <label className="form-control">
            <span className="label-text mb-2 font-medium">Confirm password</span>
            <input
              type="password"
              className="input input-bordered w-full"
              placeholder="Repeat your password"
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) =>
                  value === password || 'Passwords do not match',
              })}
            />
            {errors.confirmPassword && (
              <span className="mt-2 text-sm text-error">
                {errors.confirmPassword.message}
              </span>
            )}
          </label>

          <button
            type="submit"
            className="btn btn-primary w-full rounded-full"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <div className="divider my-8">OR</div>

        <button
          type="button"
          className="btn btn-outline w-full rounded-full"
          onClick={() => void handleGoogleSignIn()}
          disabled={loading}
        >
          Continue with Google
        </button>

        <p className="mt-8 text-center text-sm text-base-content/65">
          Already have an account?{' '}
          <Link to="/login" className="link link-primary">
            Sign in
          </Link>
        </p>
      </div>
    </section>
  )
}
