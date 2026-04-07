import { PORTFOLIO_IMAGE_BUCKET, supabase } from '../lib/supabase'

const VALID_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024

function validateImage(file: File) {
  if (!VALID_IMAGE_TYPES.includes(file.type)) {
    throw new Error('Please upload a JPG, PNG, WEBP, or GIF image.')
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error('Image must be 5 MB or smaller.')
  }
}

function getFileExtension(file: File) {
  const extension = file.name.split('.').pop()?.toLowerCase()
  return extension || 'jpg'
}

function getStoragePath(file: File) {
  return `${crypto.randomUUID()}.${getFileExtension(file)}`
}

export function getStoragePathFromUrl(imageUrl: string) {
  const marker = `/storage/v1/object/public/${PORTFOLIO_IMAGE_BUCKET}/`

  if (!imageUrl.includes(marker)) {
    return null
  }

  return decodeURIComponent(imageUrl.split(marker)[1] ?? '')
}

export async function uploadImage(file: File) {
  if (!file) {
    throw new Error('No file selected.')
  }

  validateImage(file)
  const path = getStoragePath(file)
  const { error } = await supabase.storage
    .from(PORTFOLIO_IMAGE_BUCKET)
    .upload(path, file, { upsert: false })

  if (error) {
    throw new Error(`Image upload failed for bucket "${PORTFOLIO_IMAGE_BUCKET}": ${error.message}`)
  }

  const { data } = supabase.storage.from(PORTFOLIO_IMAGE_BUCKET).getPublicUrl(path)
  return { imageUrl: data.publicUrl, path }
}

export async function removeImageByPath(path: string) {
  const { error } = await supabase.storage.from(PORTFOLIO_IMAGE_BUCKET).remove([path])

  if (error) {
    throw new Error(error.message || 'Failed to remove image.')
  }
}
