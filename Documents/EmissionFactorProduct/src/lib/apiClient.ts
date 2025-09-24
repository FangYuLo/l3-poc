import { API_BASE_URL } from './constants'
import {
  EmissionFactor,
  CompositeFactor,
  Project,
  Collection,
  CollectionItem,
  ProjectFactorLink,
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
  SearchFilters,
  SearchFacets,
  CreateCompositeFactorForm,
} from '@/types/types'

class ApiClient {
  private baseURL: string

  constructor() {
    this.baseURL = API_BASE_URL
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: data.message || `HTTP ${response.status}`,
        }
      }

      return {
        success: true,
        data,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      }
    }
  }

  // Emission Factors
  async getEmissionFactors(params: PaginationParams & { filters?: Partial<SearchFilters> }) {
    const query = new URLSearchParams({
      page: params.page.toString(),
      pageSize: params.pageSize.toString(),
    })

    if (params.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => query.append(key, v.toString()))
          } else {
            query.append(key, value.toString())
          }
        }
      })
    }

    return this.request<PaginatedResponse<EmissionFactor>>(`/api/emission-factors?${query}`)
  }

  async getEmissionFactor(id: number) {
    return this.request<EmissionFactor>(`/api/emission-factors/${id}`)
  }

  async searchEmissionFactors(params: SearchFilters & PaginationParams) {
    return this.request<PaginatedResponse<EmissionFactor>>('/api/emission-factors/search', {
      method: 'POST',
      body: JSON.stringify(params),
    })
  }

  async getSearchFacets() {
    return this.request<SearchFacets>('/api/emission-factors/facets')
  }

  // Composite Factors
  async getCompositeFactors(params: PaginationParams) {
    const query = new URLSearchParams({
      page: params.page.toString(),
      pageSize: params.pageSize.toString(),
    })

    return this.request<PaginatedResponse<CompositeFactor>>(`/api/composite-factors?${query}`)
  }

  async getCompositeFactor(id: number) {
    return this.request<CompositeFactor>(`/api/composite-factors/${id}`)
  }

  async createCompositeFactor(data: CreateCompositeFactorForm) {
    return this.request<CompositeFactor>('/api/composite-factors', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateCompositeFactor(id: number, data: Partial<CreateCompositeFactorForm>) {
    return this.request<CompositeFactor>(`/api/composite-factors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteCompositeFactor(id: number) {
    return this.request<void>(`/api/composite-factors/${id}`, {
      method: 'DELETE',
    })
  }

  // Projects
  async getProjects() {
    return this.request<Project[]>('/api/projects')
  }

  async getProject(id: number) {
    return this.request<Project>(`/api/projects/${id}`)
  }

  async createProject(data: { name: string; description?: string }) {
    return this.request<Project>('/api/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Collections
  async getCollections() {
    return this.request<Collection[]>('/api/collections')
  }

  async getCollection(id: number) {
    return this.request<Collection>(`/api/collections/${id}`)
  }

  async getCollectionItems(collectionId: number, params: PaginationParams) {
    const query = new URLSearchParams({
      page: params.page.toString(),
      pageSize: params.pageSize.toString(),
    })

    return this.request<PaginatedResponse<CollectionItem>>(
      `/api/collections/${collectionId}/items?${query}`
    )
  }

  async addToCollection(collectionId: number, data: { ef_id?: number; composite_id?: number }) {
    return this.request<CollectionItem>(`/api/collections/${collectionId}/items`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async removeFromCollection(collectionId: number, itemId: number) {
    return this.request<void>(`/api/collections/${collectionId}/items/${itemId}`, {
      method: 'DELETE',
    })
  }

  // Project Factor Links
  async getProjectFactors(projectId: number, emissionSourceId?: number) {
    const query = emissionSourceId ? `?emission_source_id=${emissionSourceId}` : ''
    return this.request<ProjectFactorLink[]>(`/api/projects/${projectId}/factors${query}`)
  }

  async linkFactorToProject(data: {
    project_id: number
    emission_source_id: number
    ef_id?: number
    composite_id?: number
    effective_version: string
  }) {
    return this.request<ProjectFactorLink>('/api/project-factor-links', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async unlinkFactorFromProject(linkId: number) {
    return this.request<void>(`/api/project-factor-links/${linkId}`, {
      method: 'DELETE',
    })
  }

  async updateFactorLink(linkId: number, data: { effective_version: string }) {
    return this.request<ProjectFactorLink>(`/api/project-factor-links/${linkId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }
}

// Create a singleton instance
export const apiClient = new ApiClient()

// Export individual methods for convenience
export const {
  getEmissionFactors,
  getEmissionFactor,
  searchEmissionFactors,
  getSearchFacets,
  getCompositeFactors,
  getCompositeFactor,
  createCompositeFactor,
  updateCompositeFactor,
  deleteCompositeFactor,
  getProjects,
  getProject,
  createProject,
  getCollections,
  getCollection,
  getCollectionItems,
  addToCollection,
  removeFromCollection,
  getProjectFactors,
  linkFactorToProject,
  unlinkFactorFromProject,
  updateFactorLink,
} = apiClient