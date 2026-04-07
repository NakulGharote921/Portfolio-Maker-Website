import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PortfolioForm from '../components/PortfolioForm'
import { useToast } from '../context/ToastContext'
import { createPortfolio } from '../services/portfolioService'
import { getStoragePathFromUrl, removeImageByPath, uploadImage } from '../services/storageService'

export default function CreatePortfolio() {
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)

  return (
    <PortfolioForm
      eyebrow="Cloud portfolio builder"
      title="Create a new showcase"
      description="Publish a portfolio backed by Supabase, with uploaded images stored in your cloud bucket."
      submitLabel="Create portfolio"
      submittingLabel="Saving..."
      submitting={submitting}
      onSubmit={async (values) => {
        if (!values.imageFile) {
          showToast('Please choose an image for the portfolio card.', 'error')
          return
        }

        setSubmitting(true)

        try {
          const { imageUrl } = await uploadImage(values.imageFile)
          try {
            const portfolio = await createPortfolio({
              name: values.name,
              title: values.title,
              skills: values.skills,
              projects: values.projects,
              imageURL: imageUrl,
            })

            showToast('Portfolio created successfully.', 'success')
            navigate(`/portfolio/${portfolio.id}`)
          } catch (error) {
            const uploadedPath = getStoragePathFromUrl(imageUrl)

            if (uploadedPath) {
              try {
                await removeImageByPath(uploadedPath)
              } catch {
                // Ignore cleanup errors so the original create failure is preserved.
              }
            }

            throw error
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to create portfolio.'
          showToast(message, 'error')
        } finally {
          setSubmitting(false)
        }
      }}
    />
  )
}
