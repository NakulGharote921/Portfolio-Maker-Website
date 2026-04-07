import { supabase } from '../lib/supabase'
import { samplePortfolios } from '../data/samplePortfolios'
import { ADMIN_EMAIL, ensureProfile, getProfile } from './profileService'
import type { AuthUser } from '../types/auth'
import type {
  Portfolio,
  PortfolioInput,
  PortfolioRecord,
  PortfolioUpdateInput,
} from '../types/portfolio'

function mapPortfolio(record: PortfolioRecord): Portfolio {
  return {
    id: record.id,
    name: record.name,
    title: record.title,
    skills: record.skills,
    projects: record.projects,
    imageURL: record.image_url,
    createdBy: record.created_by,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  }
}

function mapSamplePortfolio(input: PortfolioInput, index: number): Portfolio {
  const now = new Date().toISOString()

  return {
    id: `sample-${index + 1}`,
    name: input.name,
    title: input.title,
    skills: input.skills,
    projects: input.projects,
    imageURL: input.imageURL,
    createdBy: 'sample-data',
    createdAt: now,
    updatedAt: now,
  }
}

function getSamplePortfolios() {
  return samplePortfolios.map(mapSamplePortfolio)
}

function toError(error: { message?: string } | null) {
  return new Error(error?.message || 'Supabase request failed.')
}

function applySearch(portfolios: Portfolio[], search?: string) {
  if (!search?.trim()) {
    return portfolios
  }

  const normalizedSearch = search.trim().toLowerCase()

  return portfolios.filter((portfolio) => {
    const name = portfolio.name?.toLowerCase() || ''
    const title = portfolio.title?.toLowerCase() || ''
    const skills = portfolio.skills || []
    const projects = portfolio.projects || []

    return (
      name.includes(normalizedSearch) ||
      title.includes(normalizedSearch) ||
      skills.some((skill) => skill?.toLowerCase().includes(normalizedSearch)) ||
      projects.some((project) => project?.toLowerCase().includes(normalizedSearch))
    )
  })
}

async function getCurrentUser() {
  const { data: userData, error } = await supabase.auth.getUser()

  if (error) {
    throw toError(error)
  }

  if (!userData.user) {
    throw new Error('You must be signed in to manage portfolios.')
  }

  return userData.user
}

async function requireAdminUser() {
  const user = await getCurrentUser()
  const profile = await getProfile(user.id)
  const normalizedEmail = user.email?.trim().toLowerCase()

  if (profile?.role !== 'admin' || normalizedEmail !== ADMIN_EMAIL) {
    throw new Error('Admin access is required for this action.')
  }

  return user
}

export async function getPortfolios(search?: string) {
  try {
    const { data, error } = await supabase
      .from('portfolios')
      .select(
        'id, name, title, skills, projects, image_url, created_by, created_at, updated_at'
      )
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    const portfolios = (data as PortfolioRecord[]).map(mapPortfolio)

    if (portfolios.length === 0) {
      return applySearch(getSamplePortfolios(), search)
    }

    return applySearch(portfolios, search)
  } catch {
    return applySearch(getSamplePortfolios(), search)
  }
}

export async function getManagedPortfolios(search?: string) {
  const user = await getCurrentUser()
  const profile = await getProfile(user.id)
  const normalizedEmail = user.email?.trim().toLowerCase()
  const isAdmin = profile?.role === 'admin' && normalizedEmail === ADMIN_EMAIL

  let query = supabase
    .from('portfolios')
    .select(
      'id, name, title, skills, projects, image_url, created_by, created_at, updated_at'
    )
    .order('created_at', { ascending: false })

  if (!isAdmin) {
    query = query.eq('created_by', user.id)
  }

  const { data, error } = await query

  if (error) {
    throw toError(error)
  }

  return applySearch((data as PortfolioRecord[]).map(mapPortfolio), search)
}

export async function getPortfolio(id: string) {
  const samplePortfolio = getSamplePortfolios().find((portfolio) => portfolio.id === id)

  if (samplePortfolio) {
    return samplePortfolio
  }

  const { data, error } = await supabase
    .from('portfolios')
    .select(
      'id, name, title, skills, projects, image_url, created_by, created_at, updated_at'
    )
    .eq('id', id)
    .single()

  if (error) {
    throw toError(error)
  }

  return mapPortfolio(data as PortfolioRecord)
}

export async function createPortfolio(input: PortfolioInput) {
  const user = await getCurrentUser()
  await ensureProfile(user)

  return createPortfolioForUser(input, user.id)
}

export async function createPortfolioWithUser(input: PortfolioInput, user: AuthUser) {
  await ensureProfile(user)
  return createPortfolioForUser(input, user.id)
}

export async function createPortfolioAsAdmin(input: PortfolioInput) {
  const user = await requireAdminUser()
  return createPortfolioForUser(input, user.id)
}

async function createPortfolioForUser(input: PortfolioInput, userId: string) {
  console.log('DEBUG USER ID:', userId)

  const { data, error } = await supabase
    .from('portfolios')
    .insert({
      name: input.name,
      title: input.title,
      skills: input.skills,
      projects: input.projects,
      image_url: input.imageURL,
      created_by: userId,
    })
    .select(
      'id, name, title, skills, projects, image_url, created_by, created_at, updated_at'
    )
    .single()

  if (error) {
    throw toError(error)
  }

  return mapPortfolio(data as PortfolioRecord)
}

export async function updatePortfolio(id: string, updates: PortfolioUpdateInput) {
  const payload: Record<string, unknown> = {}

  if (updates.name !== undefined) payload.name = updates.name
  if (updates.title !== undefined) payload.title = updates.title
  if (updates.skills !== undefined) payload.skills = updates.skills
  if (updates.projects !== undefined) payload.projects = updates.projects
  if (updates.imageURL !== undefined) payload.image_url = updates.imageURL

  const { data, error } = await supabase
    .from('portfolios')
    .update(payload)
    .eq('id', id)
    .select(
      'id, name, title, skills, projects, image_url, created_by, created_at, updated_at'
    )
    .single()

  if (error) {
    throw toError(error)
  }

  return mapPortfolio(data as PortfolioRecord)
}

export async function updatePortfolioAsAdmin(id: string, updates: PortfolioUpdateInput) {
  await requireAdminUser()
  return updatePortfolio(id, updates)
}

export async function deletePortfolio(id: string) {
  const { error } = await supabase.from('portfolios').delete().eq('id', id)

  if (error) {
    throw toError(error)
  }
}

export async function deletePortfolioAsAdmin(id: string) {
  await requireAdminUser()
  await deletePortfolio(id)
}

export async function seedSamplePortfolios() {
  const userId = (await requireAdminUser()).id

  const { data, error } = await supabase
    .from('portfolios')
    .insert(
      samplePortfolios.map((portfolio) => ({
        name: portfolio.name,
        title: portfolio.title,
        skills: portfolio.skills,
        projects: portfolio.projects,
        image_url: portfolio.imageURL,
        created_by: userId,
      }))
    )
    .select(
      'id, name, title, skills, projects, image_url, created_by, created_at, updated_at'
    )

  if (error) {
    throw toError(error)
  }

  return (data as PortfolioRecord[]).map(mapPortfolio)
}
