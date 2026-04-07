import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Navigate, useNavigate } from 'react-router-dom'
import Loader from '../components/Loader'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { ADMIN_EMAIL } from '../services/profileService'

interface FormData {
  email: string
  password: string
}

export default function Login() {
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
    setLoading(true)

    try {
      await signIn(data.email, data.password)
      showToast('Signed in successfully.', 'success')
      navigate(
        data.email.trim().toLowerCase() === ADMIN_EMAIL ? '/dashboard' : '/'
      )
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Unable to sign in.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8 rounded-[2rem] border border-base-300/50 bg-base-100/80 p-8 shadow-xl backdrop-blur-xl">
          <div>
            <h2 className="mt-6 text-center text-3xl font-bold">
              Sign in to your account
            </h2>
            <p className="mt-2 text-center text-sm text-base-content/60">
              Use email/password or Google with Supabase authentication.
            </p>
            <p className="mt-2 text-center text-xs text-base-content/50">
              Dashboard access is reserved for `adminnakul@gmail.com`.
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="label">
                  <span className="label-text">Email</span>
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
              {loading ? <Loader /> : 'Sign in'}
            </button>

            <div className="divider">or continue with</div>

            <button
              type="button"
              onClick={async () => {
                try {
                  await googleSignIn()
                  showToast('Redirecting to Google sign in...', 'success')
                } catch {
                  showToast('Google sign in failed.', 'error')
                }
              }}
              className="btn btn-outline w-full rounded-full"
            >
              Continue with Google
            </button>

            <div className="text-center text-sm text-base-content/70">
              Need dashboard access?{' '}
              <button
                type="button"
                onClick={() => navigate('/admin/login')}
                className="link link-primary"
              >
                Go to admin login
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
