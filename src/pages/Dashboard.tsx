import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Loader from '../components/Loader'
import PortfolioCard from '../components/PortfolioCard'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import {
  deletePortfolio,
  getManagedPortfolios,
  seedSamplePortfolios,
} from '../services/portfolioService'
import type { Portfolio } from '../types/portfolio'

export default function Dashboard() {
  const { isAdmin } = useAuth()
  const { showToast } = useToast()
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [seeding, setSeeding] = useState(false)

  const loadPortfolios = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getManagedPortfolios(search)
      setPortfolios(data)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load portfolios.'
      showToast(message, 'error')
    } finally {
      setLoading(false)
    }
  }, [search, showToast])

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this portfolio?')) return

    try {
      await deletePortfolio(id)
      showToast('Portfolio deleted.', 'success')
      await loadPortfolios()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete portfolio.'
      showToast(message, 'error')
    }
  }

  const handleSeedSamples = async () => {
    setSeeding(true)

    try {
      const created = await seedSamplePortfolios()
      showToast(`${created.length} fake portfolios added.`, 'success')
      await loadPortfolios()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to add fake portfolios.'
      showToast(message, 'error')
    } finally {
      setSeeding(false)
    }
  }

  useEffect(() => {
    void loadPortfolios()
  }, [loadPortfolios])

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-primary/80">Dashboard</p>
          <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
            {isAdmin ? 'Manage portfolios' : 'My portfolios'}
          </h1>
          <p className="mt-3 max-w-2xl text-base-content/70">
            {isAdmin
              ? 'Search every portfolio, create new entries, edit any record, and remove outdated work.'
              : 'Create, update, and delete the portfolios that belong to your account.'}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          {isAdmin && (
            <button
              type="button"
              className="btn btn-outline rounded-full px-8"
              onClick={() => void handleSeedSamples()}
              disabled={seeding}
            >
              {seeding ? 'Adding fake portfolios...' : 'Add fake portfolios'}
            </button>
          )}
          <Link to="/dashboard/create" className="btn btn-primary rounded-full px-8">
            Create portfolio
          </Link>
          <Link to="/" className="btn btn-ghost rounded-full">
            Back to home
          </Link>
        </div>
      </div>

      <div className="mb-8">
        <label className="input input-bordered flex items-center gap-3 rounded-full bg-base-100">
          <input
            type="text"
            className="grow bg-transparent"
            placeholder="Search by name, title, skill, or project"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
      </div>

      {!loading && portfolios.length > 0 && (
        <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[1.5rem] border border-base-300/60 bg-base-100 p-5 shadow-lg">
            <p className="text-sm uppercase tracking-[0.28em] text-base-content/50">Total</p>
            <p className="mt-3 text-3xl font-black">{portfolios.length}</p>
          </div>
          <div className="rounded-[1.5rem] border border-base-300/60 bg-base-100 p-5 shadow-lg">
            <p className="text-sm uppercase tracking-[0.28em] text-base-100/50">Visible</p>
            <p className="mt-3 text-3xl font-black">{portfolios.length}</p>
          </div>
          <div className="rounded-[1.5rem] border border-base-300/60 bg-base-100 p-5 shadow-lg">
            <p className="text-sm uppercase tracking-[0.28em] text-base-content/50">Search</p>
            <p className="mt-3 text-lg font-bold">{search.trim() ? 'Filtered' : 'All records'}</p>
          </div>
          <div className="rounded-[1.5rem] border border-base-300/60 bg-base-100 p-5 shadow-lg">
            <p className="text-sm uppercase tracking-[0.28em] text-base-content/50">
              {isAdmin ? 'Quick fill' : 'Ownership'}
            </p>
            <p className="mt-3 text-lg font-bold">
              {isAdmin ? '10 demo portfolios ready' : 'Only your records'}
            </p>
          </div>
        </div>
      )}

      {loading ? (
        <Loader />
      ) : portfolios.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {portfolios.map((portfolio) => (
            <div key={portfolio.id} className="card bg-base-100 shadow-xl">
              <PortfolioCard portfolio={portfolio} />
              <div className="card-actions justify-between p-4">
                <Link to={`/dashboard/edit/${portfolio.id}`} className="btn btn-outline btn-sm">
                  Edit
                </Link>
                <button className="btn btn-error btn-sm" onClick={() => void handleDelete(portfolio.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-[2rem] border border-dashed border-base-300/70 bg-base-100/60 p-12 text-center shadow-lg">
          <h2 className="text-2xl font-bold">No portfolios found</h2>
          <p className="mt-3 text-base-content/70">
            Start with a manual record or instantly load a fake portfolio set for testing.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            {isAdmin && (
              <button
                type="button"
                className="btn btn-outline rounded-full px-8"
                onClick={() => void handleSeedSamples()}
                disabled={seeding}
              >
                {seeding ? 'Adding fake portfolios...' : 'Add fake portfolios'}
              </button>
            )}
            <Link to="/dashboard/create" className="btn btn-primary rounded-full px-8">
              Create manually
            </Link>
          </div>
        </div>
      )}
    </section>
  )
}
