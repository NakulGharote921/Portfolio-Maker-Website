import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

function getInitialTheme() {
  const storedTheme = localStorage.getItem('theme')

  if (storedTheme === 'dark' || storedTheme === 'light') {
    return storedTheme
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

export default function Navbar() {
  const { user, signOut, isAdmin } = useAuth()
  const { showToast } = useToast()
  const location = useLocation()
  const navigate = useNavigate()
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const initialTheme = getInitialTheme()
    setTheme(initialTheme)
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const handleSignOut = async () => {
    await signOut()
    showToast('Signed out successfully.', 'success')
    navigate('/')
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-base-300/40 bg-base-100/65 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <Link to="/" className="text-2xl font-black tracking-tight text-base-content">
            MultiPortfolio
          </Link>
          <div className="hidden rounded-full border border-base-300/60 bg-base-100/60 px-3 py-1 text-xs uppercase tracking-[0.28em] text-base-content/55 sm:block">
            Supabase cloud
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/"
            className={`btn btn-sm rounded-full ${
              location.pathname === '/' ? 'btn-primary' : 'btn-ghost'
            }`}
          >
            Home
          </Link>

          {user && (
            <Link
              to="/create"
              className={`btn btn-sm rounded-full ${
                location.pathname === '/create' ? 'btn-primary' : 'btn-ghost'
              }`}
            >
              Create
            </Link>
          )}

          {isAdmin && (
            <Link
              to="/dashboard"
              className={`btn btn-sm rounded-full ${
                location.pathname.startsWith('/dashboard') ? 'btn-primary' : 'btn-ghost'
              }`}
            >
              Admin
            </Link>
          )}

          <button
            type="button"
            onClick={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
            className="btn btn-ghost btn-sm rounded-full"
          >
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>

          {user ? (
            <>
              <span className="hidden text-sm text-base-content/60 md:inline">
                {user.email}
              </span>
              <button
                type="button"
                onClick={() => void handleSignOut()}
                className="btn btn-outline btn-sm rounded-full"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={`btn btn-sm rounded-full ${
                  location.pathname === '/login' ? 'btn-primary' : 'btn-ghost'
                }`}
              >
                Login
              </Link>
              <Link
                to="/admin/login"
                className={`btn btn-sm rounded-full ${
                  location.pathname === '/admin/login' ? 'btn-primary' : 'btn-ghost'
                }`}
              >
                Admin Login
              </Link>
              <Link to="/signup" className="btn btn-outline btn-sm rounded-full">
                Signup
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
