import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Loader from '../components/Loader'
import PortfolioCard from '../components/PortfolioCard'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { getPortfolios } from '../services/portfolioService'
import type { Portfolio } from '../types/portfolio'

export default function Home() {
  const { isAdmin } = useAuth()
  const { showToast } = useToast()
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const loadPortfolios = useCallback(async () => {
    setLoading(true)

    try {
      const data = await getPortfolios(search)
      setPortfolios(data)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to load portfolios.'
      showToast(message, 'error')
    } finally {
      setLoading(false)
    }
  }, [search, showToast])

  useEffect(() => {
    void loadPortfolios()
  }, [loadPortfolios])

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-[2rem] border border-white/20 bg-hero-grid p-8 shadow-2xl backdrop-blur-xl dark:bg-none dark:bg-base-100/60">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-[0.35em] text-primary/80">
              Multi Portfolio Website
            </p>
            <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
              Build, publish, and browse portfolios with real cloud auth.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-base-content/70">
              Create portfolio cards backed by Supabase, sign in with email or Google,
              and serve uploaded images from cloud storage in one responsive app.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
            <Link
              to="/create"
              className="btn btn-primary w-full rounded-full px-8 sm:w-auto sm:min-w-[170px]"
            >
              Create portfolio
            </Link>
            {isAdmin && (
              <Link
                to="/dashboard"
                className="btn btn-outline w-full rounded-full px-8 sm:w-auto sm:min-w-[170px]"
              >
                Admin panel
              </Link>
            )}
            <button
              type="button"
              className="btn btn-ghost w-full rounded-full sm:w-auto sm:min-w-[170px]"
              onClick={() => void loadPortfolios()}
            >
              Refresh list
            </button>
          </div>
        </div>

        <div className="mt-8 max-w-xl">
          <label className="input input-bordered flex items-center gap-3 rounded-full bg-base-100/80">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-5 w-5 opacity-60"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-4.35-4.35m1.85-5.15a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
              />
            </svg>
            <input
              type="text"
              className="grow bg-transparent"
              placeholder="Search by name, title, skill, or project"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
        </div>
      </div>

      {loading ? (
        <Loader />
      ) : portfolios.length > 0 ? (
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {portfolios.map((portfolio) => (
            <PortfolioCard key={portfolio.id} portfolio={portfolio} />
          ))}
        </div>
      ) : (
        <div className="mt-10 rounded-[2rem] border border-dashed border-base-300/70 bg-base-100/60 p-12 text-center shadow-lg">
          <h2 className="text-2xl font-bold">No portfolios yet</h2>
          <p className="mt-3 text-base-content/70">
            Start by creating the first portfolio and it will appear for every visitor.
          </p>
          <Link to="/create" className="btn btn-primary mt-6 rounded-full px-8">
            Create the first one
          </Link>
        </div>
      )}
    </section>
  )
}
