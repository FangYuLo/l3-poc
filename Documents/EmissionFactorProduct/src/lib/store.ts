'use client'

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { TreeNode, FactorTableItem, SearchFilters, SearchFacets, CompositeFactorComponent, FormulaType } from '@/types/types'

interface AppState {
  // Navigation
  selectedNode: TreeNode | null
  expandedNodes: Set<string>
  
  // Current data
  currentFactors: FactorTableItem[]
  selectedFactor: FactorTableItem | null
  
  // UI states
  isGlobalSearchOpen: boolean
  isCompositeEditorOpen: boolean
  isLoading: boolean
  
  // Search
  searchResults: FactorTableItem[]
  searchFilters: SearchFilters
  searchFacets: SearchFacets
  
  // Composite editor
  compositeComponents: CompositeFactorComponent[]
  compositeFormula: FormulaType
  
  // Actions
  setSelectedNode: (node: TreeNode | null) => void
  setExpandedNode: (nodeId: string, expanded: boolean) => void
  setCurrentFactors: (factors: FactorTableItem[]) => void
  setSelectedFactor: (factor: FactorTableItem | null) => void
  setGlobalSearchOpen: (open: boolean) => void
  setCompositeEditorOpen: (open: boolean) => void
  setLoading: (loading: boolean) => void
  setSearchResults: (results: FactorTableItem[]) => void
  setSearchFilters: (filters: SearchFilters) => void
  setSearchFacets: (facets: SearchFacets) => void
  addCompositeComponent: (component: CompositeFactorComponent) => void
  removeCompositeComponent: (componentId: number) => void
  updateCompositeComponent: (componentId: number, updates: Partial<CompositeFactorComponent>) => void
  setCompositeFormula: (formula: FormulaType) => void
  clearCompositeComponents: () => void
}

const useAppStore = create<AppState>()(
  devtools(
    (set, get) => ({
      // Initial state
      selectedNode: null,
      expandedNodes: new Set(['projects']),
      currentFactors: [],
      selectedFactor: null,
      isGlobalSearchOpen: false,
      isCompositeEditorOpen: false,
      isLoading: false,
      searchResults: [],
      searchFilters: {
        keyword: '',
        regions: [],
        years: [],
        units: [],
        methods: [],
        sourceTypes: [],
      },
      searchFacets: {
        regions: [],
        years: [],
        units: [],
        methods: [],
        sourceTypes: [],
      },
      compositeComponents: [],
      compositeFormula: 'weighted',
      
      // Actions
      setSelectedNode: (node) => {
        set({ selectedNode: node }, false, 'setSelectedNode')
      },
      
      setExpandedNode: (nodeId, expanded) => {
        set((state) => {
          const newExpanded = new Set(state.expandedNodes)
          if (expanded) {
            newExpanded.add(nodeId)
          } else {
            newExpanded.delete(nodeId)
          }
          return { expandedNodes: newExpanded }
        }, false, 'setExpandedNode')
      },
      
      setCurrentFactors: (factors) => {
        set({ currentFactors: factors }, false, 'setCurrentFactors')
      },
      
      setSelectedFactor: (factor) => {
        set({ selectedFactor: factor }, false, 'setSelectedFactor')
      },
      
      setGlobalSearchOpen: (open) => {
        set({ isGlobalSearchOpen: open }, false, 'setGlobalSearchOpen')
      },
      
      setCompositeEditorOpen: (open) => {
        set({ isCompositeEditorOpen: open }, false, 'setCompositeEditorOpen')
      },
      
      setLoading: (loading) => {
        set({ isLoading: loading }, false, 'setLoading')
      },
      
      setSearchResults: (results) => {
        set({ searchResults: results }, false, 'setSearchResults')
      },
      
      setSearchFilters: (filters) => {
        set({ searchFilters: filters }, false, 'setSearchFilters')
      },
      
      setSearchFacets: (facets) => {
        set({ searchFacets: facets }, false, 'setSearchFacets')
      },
      
      addCompositeComponent: (component) => {
        set((state) => ({
          compositeComponents: [...state.compositeComponents, component]
        }), false, 'addCompositeComponent')
      },
      
      removeCompositeComponent: (componentId) => {
        set((state) => ({
          compositeComponents: state.compositeComponents.filter(comp => comp.id !== componentId)
        }), false, 'removeCompositeComponent')
      },
      
      updateCompositeComponent: (componentId, updates) => {
        set((state) => ({
          compositeComponents: state.compositeComponents.map(comp =>
            comp.id === componentId ? { ...comp, ...updates } : comp
          )
        }), false, 'updateCompositeComponent')
      },
      
      setCompositeFormula: (formula) => {
        set({ compositeFormula: formula }, false, 'setCompositeFormula')
      },
      
      clearCompositeComponents: () => {
        set({ compositeComponents: [] }, false, 'clearCompositeComponents')
      },
    }),
    {
      name: 'emission-factor-store',
    }
  )
)

export default useAppStore

// Selectors for better performance
export const useSelectedNode = () => useAppStore(state => state.selectedNode)
export const useCurrentFactors = () => useAppStore(state => state.currentFactors)
export const useSelectedFactor = () => useAppStore(state => state.selectedFactor)
export const useGlobalSearchState = () => useAppStore(state => ({
  isOpen: state.isGlobalSearchOpen,
  results: state.searchResults,
  filters: state.searchFilters,
  facets: state.searchFacets,
}))
export const useCompositeEditorState = () => useAppStore(state => ({
  isOpen: state.isCompositeEditorOpen,
  components: state.compositeComponents,
  formula: state.compositeFormula,
}))
export const useExpandedNodes = () => useAppStore(state => state.expandedNodes)
export const useIsLoading = () => useAppStore(state => state.isLoading)