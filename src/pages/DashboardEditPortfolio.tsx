import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Loader from '../components/Loader'
import PortfolioForm from '../components/PortfolioForm'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { getPortfolio, updatePortfolio } from '../services/portfolioService'
import { getStoragePathFromUrl, removeImageByPath, uploadImage } from '../services/storageService'
import type { Portfolio } from '../types/portfolio'

export default function DashboardEditPortfolio() {
  const { id } = useParams()
  const { user, isAdmin } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const loadPortfolio = useCallback(async () => {
    if (!id) {
      setLoading(false)
      return
    }

    try {
      const data = await getPortfolio(id)

      if (!isAdmin && data.createdBy !== user?.id) {
        throw new Error('You can only edit your own portfolios.')
      }

      setPortfolio(data)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load portfolio.'
      showToast(message, 'error')
    } finally {
      setLoading(false)
    }
  }, [id, showToast])

  useEffect(() => {
    void loadPortfolio()
  }, [loadPortfolio])

  if (loading) {
    return <Loader />
  }

  if (!portfolio || !id) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-base-300/60 bg-base-100/70 p-10 shadow-xl">
          <h1 className="text-3xl font-black">Portfolio not found</h1>
          <p className="mt-3 text-base-content/70">This record could not be loaded from Supabase.</p>
        </div>
      </section>
    )
  }

  return (
    <PortfolioForm
      eyebrow="Dashboard edit"
      title="Edit portfolio"
      description="Update any portfolio record. Keeping the image field empty will preserve the current uploaded image."
      submitLabel="Save changes"
      submittingLabel="Saving..."
      submitting={submitting}
      requireImage={false}
      initialValues={portfolio}
      onSubmit={async (values) => {
        setSubmitting(true)

        try {
          let nextImageURL = portfolio.imageURL

          if (values.imageFile) {
            const oldPath = getStoragePathFromUrl(portfolio.imageURL)
            const { imageUrl } = await uploadImage(values.imageFile)
            nextImageURL = imageUrl

            if (oldPath) {
              await removeImageByPath(oldPath)
            }
          }

          await updatePortfolio(id, {
            name: values.name,
            title: values.title,
            skills: values.skills,
            projects: values.projects,
            imageURL: nextImageURL,
          })

          showToast('Portfolio updated.', 'success')
          navigate('/dashboard')
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to update portfolio.'
          showToast(message, 'error')
        } finally {
          setSubmitting(false)
        }
      }}
    />
  )
}
