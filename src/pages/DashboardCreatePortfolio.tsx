import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PortfolioForm from '../components/PortfolioForm'
import { useToast } from '../context/ToastContext'
import { createPortfolioAsAdmin } from '../services/portfolioService'
import { getStoragePathFromUrl, removeImageByPath, uploadImage } from '../services/storageService'

export default function DashboardCreatePortfolio() {
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)

  return (
    <PortfolioForm
      eyebrow="Dashboard create"
      title="Create a portfolio"
      description="Admin-created portfolios are stored in Supabase and owned by your current admin account."
      submitLabel="Create portfolio"
      submittingLabel="Creating..."
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
            await createPortfolioAsAdmin({
              name: values.name,
              title: values.title,
              skills: values.skills,
              projects: values.projects,
              imageURL: imageUrl,
            })

            showToast('Portfolio created.', 'success')
            navigate('/dashboard')
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
