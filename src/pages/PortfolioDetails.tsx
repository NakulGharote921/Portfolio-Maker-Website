import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Loader from '../components/Loader'
import PortfolioImage from '../components/PortfolioImage'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { deletePortfolio, getPortfolio } from '../services/portfolioService'
import type { Portfolio } from '../types/portfolio'

export default function PortfolioDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAdmin } = useAuth()
  const { showToast } = useToast()
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  const loadPortfolio = useCallback(async () => {
    if (!id) {
      setLoading(false)
      return
    }

    try {
      const data = await getPortfolio(id)
      setPortfolio(data)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Portfolio could not be loaded.'
      showToast(message, 'error')
    } finally {
      setLoading(false)
    }
  }, [id, showToast])

  const handleDelete = async () => {
    if (!id || deleting || !window.confirm('Delete this portfolio?')) {
      return
    }

    setDeleting(true)

    try {
      await deletePortfolio(id)
      showToast('Portfolio deleted.', 'success')
      navigate(isAdmin ? '/dashboard' : '/')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete portfolio.'
      showToast(message, 'error')
    } finally {
      setDeleting(false)
    }
  }

  useEffect(() => {
    void loadPortfolio()
  }, [loadPortfolio])

  if (loading) {
    return <Loader />
  }

  if (!portfolio) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-base-300/60 bg-base-100/70 p-10 shadow-xl">
          <h1 className="text-3xl font-black">Portfolio not found</h1>
          <p className="mt-3 text-base-content/70">
            This item may have been removed or is no longer available.
          </p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="btn btn-primary mt-6 rounded-full"
          >
            Back to home
          </button>
        </div>
      </section>
    )
  }

  const canManagePortfolio = isAdmin || portfolio.createdBy === user?.id

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={() => navigate('/')}
        className="btn btn-ghost mb-6 rounded-full"
      >
        Back to home
      </button>

      {canManagePortfolio && (
        <div className="mb-6 flex justify-end">
          <button
            type="button"
            className="btn btn-error rounded-full"
            onClick={() => void handleDelete()}
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete portfolio'}
          </button>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="overflow-hidden rounded-[2rem] border border-white/20 bg-base-100/70 shadow-2xl backdrop-blur-xl">
          <PortfolioImage
            src={portfolio.imageURL}
            alt={portfolio.title}
            className="h-full min-h-[360px] w-full object-cover"
            fallbackClassName="min-h-[360px]"
          />
        </div>

        <div className="rounded-[2rem] border border-white/20 bg-base-100/70 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
          <p className="text-sm uppercase tracking-[0.32em] text-primary/70">{portfolio.name}</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight">{portfolio.title}</h1>
          <p className="mt-4 text-sm text-base-content/60">
            Created {new Date(portfolio.createdAt).toLocaleDateString()}
          </p>
          <p className="mt-2 text-sm text-base-content/60">
            Updated {new Date(portfolio.updatedAt).toLocaleDateString()}
          </p>

          <div className="mt-8">
            <h2 className="text-sm font-semibold uppercase tracking-[0.28em] text-base-content/50">
              Skills
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {portfolio.skills.map((skill) => (
                <span key={skill} className="badge badge-primary badge-outline p-4">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-sm font-semibold uppercase tracking-[0.28em] text-base-content/50">
              Projects
            </h2>
            <div className="mt-4 space-y-3">
              {portfolio.projects.map((project) => (
                <div
                  key={project}
                  className="rounded-2xl border border-base-300/60 bg-base-200/50 px-4 py-3"
                >
                  {project}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
