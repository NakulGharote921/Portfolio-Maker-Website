export interface PortfolioRecord {
  id: string
  name: string
  title: string
  skills: string[]
  projects: string[]
  image_url: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface Portfolio {
  id: string
  name: string
  title: string
  skills: string[]
  projects: string[]
  imageURL: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface PortfolioInput {
  name: string
  title: string
  skills: string[]
  projects: string[]
  imageURL: string
}

export interface PortfolioUpdateInput {
  name?: string
  title?: string
  skills?: string[]
  projects?: string[]
  imageURL?: string
}
