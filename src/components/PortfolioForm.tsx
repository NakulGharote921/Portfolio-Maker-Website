import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import PortfolioImage from './PortfolioImage'

interface FormValues {
  name: string
  title: string
  skills: string
  projects: string
  image: FileList
}

interface PortfolioFormValues {
  name: string
  title: string
  skills: string[]
  projects: string[]
  imageFile?: File
}

interface PortfolioFormProps {
  title: string
  eyebrow: string
  description: string
  submitLabel: string
  submittingLabel: string
  initialValues?: {
    name: string
    title: string
    skills: string[]
    projects: string[]
    imageURL?: string
  }
  requireImage?: boolean
  submitting?: boolean
  onSubmit: (values: PortfolioFormValues) => Promise<void>
}

function splitCommaSeparated(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function joinCommaSeparated(values?: string[]) {
  return values?.join(', ') ?? ''
}

export default function PortfolioForm({
  title,
  eyebrow,
  description,
  submitLabel,
  submittingLabel,
  initialValues,
  requireImage = true,
  submitting = false,
  onSubmit,
}: PortfolioFormProps) {
  const [imagePreview, setImagePreview] = useState(initialValues?.imageURL ?? '')
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      name: initialValues?.name ?? '',
      title: initialValues?.title ?? '',
      skills: joinCommaSeparated(initialValues?.skills),
      projects: joinCommaSeparated(initialValues?.projects),
    },
  })

  useEffect(() => {
    reset({
      name: initialValues?.name ?? '',
      title: initialValues?.title ?? '',
      skills: joinCommaSeparated(initialValues?.skills),
      projects: joinCommaSeparated(initialValues?.projects),
    })
    setImagePreview(initialValues?.imageURL ?? '')
  }, [initialValues, reset])

  const registeredImage = register('image', {
    validate: (files) => {
      if (!requireImage) {
        return true
      }

      return files?.length > 0 || 'An image is required'
    },
    onChange: (event) => {
      const file = event.target.files?.[0]

      if (!file) {
        setImagePreview(initialValues?.imageURL ?? '')
        return
      }

      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setImagePreview(reader.result)
        }
      }
      reader.readAsDataURL(file)
    },
  })

  return (
    <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] border border-white/20 bg-base-100/70 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.32em] text-primary/70">{eyebrow}</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight">{title}</h1>
          <p className="mt-3 max-w-2xl text-base-content/70">{description}</p>
        </div>

        <form
          className="space-y-6"
          onSubmit={handleSubmit(async (data) => {
            await onSubmit({
              name: data.name.trim(),
              title: data.title.trim(),
              skills: splitCommaSeparated(data.skills),
              projects: splitCommaSeparated(data.projects),
              imageFile: data.image?.[0],
            })
          })}
        >
          <div className="grid gap-6 md:grid-cols-2">
            <label className="form-control">
              <span className="label-text mb-2 font-medium">Your name</span>
              <input
                type="text"
                className="input input-bordered w-full"
                placeholder="Alex Johnson"
                {...register('name', { required: 'Name is required' })}
              />
              {errors.name && <span className="mt-2 text-sm text-error">{errors.name.message}</span>}
            </label>

            <label className="form-control">
              <span className="label-text mb-2 font-medium">Professional title</span>
              <input
                type="text"
                className="input input-bordered w-full"
                placeholder="Frontend Developer"
                {...register('title', { required: 'Title is required' })}
              />
              {errors.title && (
                <span className="mt-2 text-sm text-error">{errors.title.message}</span>
              )}
            </label>
          </div>

          <label className="form-control">
            <span className="label-text mb-2 font-medium">Skills</span>
            <input
              type="text"
              className="input input-bordered w-full"
              placeholder="React, TypeScript, Tailwind CSS"
              {...register('skills', { required: 'Add at least one skill' })}
            />
            <span className="mt-2 text-sm text-base-content/60">
              Separate each skill with a comma.
            </span>
            {errors.skills && (
              <span className="mt-2 text-sm text-error">{errors.skills.message}</span>
            )}
          </label>

          <label className="form-control">
            <span className="label-text mb-2 font-medium">Projects</span>
            <textarea
              rows={4}
              className="textarea textarea-bordered w-full"
              placeholder="Portfolio website, Client dashboard, Design system"
              {...register('projects', { required: 'Add at least one project' })}
            />
            <span className="mt-2 text-sm text-base-content/60">
              Use commas to create separate project highlights.
            </span>
            {errors.projects && (
              <span className="mt-2 text-sm text-error">{errors.projects.message}</span>
            )}
          </label>

          <label className="form-control">
            <span className="label-text mb-2 font-medium">Profile image</span>
            <input
              type="file"
              accept="image/*"
              className="file-input file-input-bordered w-full"
              {...registeredImage}
            />
            <span className="mt-2 text-sm text-base-content/60">
              Images are uploaded to Supabase Storage. JPG, PNG, WEBP, or GIF up to 5 MB.
            </span>
            {errors.image && (
              <span className="mt-2 text-sm text-error">{errors.image.message as string}</span>
            )}
          </label>

          {imagePreview && (
            <div className="rounded-[1.5rem] border border-base-300/70 bg-base-200/40 p-4">
              <p className="mb-3 text-sm font-medium text-base-content/70">Image preview</p>
              <PortfolioImage
                src={imagePreview}
                alt="Portfolio preview"
                className="h-64 w-full rounded-[1.25rem] object-cover"
                fallbackClassName="h-64 rounded-[1.25rem]"
              />
            </div>
          )}

          <div className="flex justify-end">
            <button type="submit" className="btn btn-primary rounded-full px-8" disabled={submitting}>
              {submitting ? submittingLabel : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}
