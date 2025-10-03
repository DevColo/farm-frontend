<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useTreeStore } from '@/stores/tree.store'
import { useParcelStore } from '@/stores/parcel.store'
import {
  CRow,
  CCol,
  CCard,
  CCardHeader,
  CCardBody,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CFormLabel,
  CFormInput,
  CFormTextarea,
  CFormSelect,
  CFormCheck,
  CInputGroup,
  CBadge,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
  CSpinner,
  CBreadcrumb,
  CBreadcrumbItem,
} from '@coreui/vue'
import CIcon from '@coreui/icons-vue'
import { cilPencil, cilTrash, cilPlus, cilCloudDownload, cilSearch, cilFilter } from '@coreui/icons'
import Multiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.css'

const treeStore = useTreeStore()
const parcelStore = useParcelStore()

const showModal = ref(false)
const isEditing = ref(false)
const validated = ref(false)
const loading = ref(false)
const showFilters = ref(false)
const editingId = ref(null)

// Tree types
const types = [
  { value: 'Orange', label: 'Orange', color: 'warning', icon: '🍊' },
  { value: 'Avocado', label: 'Avocado', color: 'success', icon: '🥑' },
  { value: 'Lemon', label: 'Lemon', color: 'warning', icon: '🍋' },
  { value: 'Mango', label: 'Mango', color: 'warning', icon: '🥭' }
]

// Avocado name options
const avocadoNames = [
  { value: 'Hass', label: 'Hass' },
  { value: 'Fuerte', label: 'Fuerte' },
  { value: 'Reed', label: 'Reed' },
  { value: 'Pinkerton', label: 'Pinkerton' },
  { value: 'Gwen', label: 'Gwen' },
  { value: 'Bacon', label: 'Bacon' },
  { value: 'Zutano', label: 'Zutano' },
]

const currentTree = ref({
  name: '',
  type: '',
  parcel_id: '',
  description: '',
  status: '1',
})

// Check if Avocado is selected
const isAvocadoSelected = computed(() => {
  return currentTree.value.type?.value === 'Avocado'
})

// Enhanced search and filter states
const searchQuery = ref('')
const filterType = ref('')
const filterParcel = ref('')
const itemsPerPage = ref(10)
const currentPage = ref(1)
const sortField = ref('name')
const sortOrder = ref('asc')
const parcels = ref([])

// fetch data
onMounted(async () => {
  loading.value = true
  try {
    await Promise.all([
      treeStore.fetchTrees(),
      parcelStore.fetchParcels()
    ])
  } finally {
    loading.value = false
  }
})

// Watch the store in case Parcels are updated dynamically later
watch(
  () => parcelStore.parcels,
  (newParcels) => {
    parcels.value = newParcels.map(p => ({
      value: p.id,
      label: p.parcel_code,
    }))
  },
  { deep: true }
)

// Generate filter options
const availabletypes = computed(() => {
  return types.map(c => c.value)
})

const availableParcels = computed(() => {
  const parcelNames = treeStore.trees.map(tree => tree.parcel).filter(Boolean)
  return Array.from(new Set(parcelNames))
})

// Enhanced filtering and sorting
const filteredTrees = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  
  // Always work with an array
  const trees = Array.isArray(treeStore.trees) ? treeStore.trees : []
  
  let filtered = trees.filter((tree) => {
    const matchesQuery = !q || [tree.name, tree.type, tree.parcel_id].some((field) => 
      field?.toLowerCase().includes(q)
    )
    const matchesType = !filterType.value || tree.type === filterType.value
    const matchesParcel = !filterParcel.value || tree.parcel_id === filterParcel.value
    
    return matchesQuery && matchesType && matchesParcel
  })

  // Apply sorting
  filtered.sort((a, b) => {
    let aValue = a[sortField.value]
    let bValue = b[sortField.value]
    
    // Handle special cases
    if (sortField.value === 'parcel_code') {
      aValue = a.parcel_code || ''
      bValue = b.parcel_code || ''
    }
    
    // Convert to strings for comparison
    aValue = String(aValue || '').toLowerCase()
    bValue = String(bValue || '').toLowerCase()
    
    if (sortOrder.value === 'asc') {
      return aValue.localeCompare(bValue)
    } else {
      return bValue.localeCompare(aValue)
    }
  })

  return filtered
})

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredTrees.value.length / itemsPerPage.value))
)

const paginatedTrees = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredTrees.value.slice(start, start + itemsPerPage.value)
})

function getStatusBadge(status) {
  return status === '1' ? { color: 'success', text: 'Active' } : { color: 'danger', text: 'Inactive' }
}

function getTypeBadge(type) {
  const cat = types.find(c => c.value === type)
  return cat || { color: 'secondary', icon: '🌳', label: type }
}

// Sorting
function sortBy(field) {
  if (sortField.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortOrder.value = 'asc'
  }
}

function getSortIcon(field) {
  if (sortField.value !== field) return '↕️'
  return sortOrder.value === 'asc' ? '↑' : '↓'
}

// Filter management
function clearAllFilters() {
  searchQuery.value = ''
  filterType.value = ''
  filterParcel.value = ''
  resetPage()
}

function resetPage() {
  currentPage.value = 1
}

// Pagination
function nextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++
}
function prevPage() {
  if (currentPage.value > 1) currentPage.value--
}
function goToPage(page) {
  currentPage.value = page
}

// Export functions
function exportPDF() {
  // TODO: Implement PDF export
  console.log('Exporting to PDF...')
}

function exportCSV() {
  // TODO: Implement CSV export
  console.log('Exporting to CSV...')
}

// Modal handlers
function openCreate() {
  isEditing.value = false
  validated.value = false
  editingId.value = null
  currentTree.value = {
    name: '',
    type: '',
    parcel_id: '',
    description: '',
    status: '1',
  }
  showModal.value = true
}

function openEdit(tree) {
  isEditing.value = true
  validated.value = false
  editingId.value = tree.id
  currentTree.value = { ...tree, status: tree.status === '1' }

  // Find matching parcel object from options
  const parcelObj = parcels.value.find(b => 
    b.value == tree.parcel_id
  )
  currentTree.value.parcel_id = parcelObj || null

  // Find matching type object
  const typeObj = types.find(c => c.value === tree.type)
  currentTree.value.type = typeObj || null
  
  // If type is Avocado, find matching name from avocadoNames
  if (tree.type === 'Avocado' && tree.name) {
    const nameObj = avocadoNames.find(n => n.value === tree.name)
    currentTree.value.name = nameObj || null
  }
  
  showModal.value = true
}

async function confirmDelete(id, name) {
  if (confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
    loading.value = true
    try {
      await treeStore.deleteTree(id)
    } finally {
      loading.value = false
    }
  }
}

// Form handling
const isActive = computed({
  get: () => currentTree.value.status === '1' || currentTree.value.status === true,
  set: (v) => {
    currentTree.value.status = v ? '1' : '0'
  },
})

async function handleSubmit(e) {
  e.preventDefault()
  e.stopPropagation()
  
  const form = e.currentTarget
  
  // Check if all required fields are filled
  if (!currentTree.value.type || !currentTree.value.parcel_id) {
    validated.value = true
    return
  }
  
  // Only validate name if Avocado is selected
  if (isAvocadoSelected.value && !currentTree.value.name) {
    validated.value = true
    return
  }
  
  if (!form.checkValidity()) {
    validated.value = true
    return
  }
  
  loading.value = true
  try {
    const payload = {
      name: currentTree.value.name?.value || currentTree.value.name || '',
      type: currentTree.value.type.value,
      parcel_id: currentTree.value.parcel_id.value,
      description: currentTree.value.description,
      status: currentTree.value.status,
    }
    
    if (isEditing.value) {
      payload.tree_id = editingId.value
      const res = await treeStore.editTree(payload)
      if(res == 1){
        showModal.value = false
        validated.value = false
      }
    } else {
      const res = await treeStore.createTree(payload)
      if(res == 1){
        showModal.value = false
        validated.value = false
      }
    }
  } catch (error) {
    console.error('Error submitting form:', error)
  } finally {
    loading.value = false
  }
}

// Watch for changes
watch([searchQuery, filterType, filterParcel], () => {
  resetPage()
})
</script>

<template>
  <div class="position-relative">
    <!-- Loading Overlay -->
    <div v-if="loading" class="loading-overlay">
      <CSpinner color="primary" variant="grow" />
    </div>

    <!-- Main Content -->
     <!-- Breadcrumb -->
      <CBreadcrumb class="mb-4">
        <CBreadcrumbItem>
          <router-link to="/dashboard" class="text-decoration-none">Dashboard</router-link>
        </CBreadcrumbItem>
        <CBreadcrumbItem>
          <router-link to="/farm-list" class="text-decoration-none">Farms</router-link>
        </CBreadcrumbItem>
        <CBreadcrumbItem>
          <router-link to="/block-list" class="text-decoration-none">Blocks</router-link>
        </CBreadcrumbItem>
        <CBreadcrumbItem>
          <router-link to="/parcel-list" class="text-decoration-none">Parcels</router-link>
        </CBreadcrumbItem>
        <CBreadcrumbItem active>Trees</CBreadcrumbItem>
      </CBreadcrumb>
    <!-- Main Table Card -->
    <CCol cols="12">
      <CCard class="shadow-sm border-0">
        <!-- Enhanced Header -->
        <CCardHeader class="bg-white border-bottom">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h5 class="mb-1">
                <i class="fas fa-tree me-2 text-success"></i>Trees
              </h5>
            </div>
            <div class="d-flex gap-2">
              <CDropdown>
                <CDropdownToggle color="outline-secondary" size="sm">
                  <CIcon :icon="cilCloudDownload" class="me-1" />Export
                </CDropdownToggle>
                <CDropdownMenu>
                  <CDropdownItem @click="exportPDF">
                    <i class="fas fa-file-pdf me-2 text-danger"></i>Export PDF
                  </CDropdownItem>
                  <CDropdownItem @click="exportCSV">
                    <i class="fas fa-file-csv me-2 text-success"></i>Export CSV
                  </CDropdownItem>
                </CDropdownMenu>
              </CDropdown>
              <CButton color="dark" @click="openCreate">
                <CIcon :icon="cilPlus" class="me-1" />Add New Tree
              </CButton>
            </div>
          </div>
        </CCardHeader>

        <CCardBody class="p-0">
          <!-- Enhanced Search and Filter Controls -->
          <div class="search-filter-section p-4 bg-light border-bottom">
            <!-- Main Search -->
            <div class="row g-3 mb-3">
              <div class="col-md-11" style="display: flex; gap: 10px;">
                <div class="col-md-3">
                  <CInputGroup>
                    <span class="input-group-text">
                      <CIcon :icon="cilSearch" />
                    </span>
                    <CFormInput
                      v-model="searchQuery"
                      placeholder="Search by name, type or parcel"
                      @input="resetPage"
                    />
                  </CInputGroup>
                </div>
                <div>
                  <CButton 
                    :color="showFilters ? 'primary' : 'outline-primary'" 
                    @click="showFilters = !showFilters"
                    class="w-100"
                  >
                    <CIcon :icon="cilFilter"/>
                  </CButton>
                </div>
              </div>

              <div class="col-md-1">
                <CFormSelect v-model="itemsPerPage" @change="resetPage">
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                </CFormSelect>
              </div>
            </div>

            <!-- Advanced Filters -->
            <div v-if="showFilters" class="advanced-filters">
              <div class="row g-3">
                <div class="col-md-2">
                  <CFormSelect v-model="filterType" @change="resetPage">
                    <option value="">All types</option>
                    <option v-for="type in availabletypes" :key="type" :value="type">
                      {{ type }}
                    </option>
                  </CFormSelect>
                </div>
                <div class="col-md-2">
                  <CFormSelect v-model="filterParcel" @change="resetPage">
                    <option value="">All Parcels</option>
                    <option v-for="parcel in availableParcels" :key="parcel.id" :value="parcel.id">
                      {{ parcel.parcel_code }}
                    </option>
                  </CFormSelect>
                </div>
                <div class="col-md-2">
                  <CButton color="outline-secondary" @click="clearAllFilters" class="w-100">
                    Clear All
                  </CButton>
                </div>
              </div>
            </div>
          </div>

          <!-- Enhanced Table -->
          <div class="table-responsive">
            <CTable hover class="mb-0 modern-table">
              <CTableHead class="table-light">
                <CTableRow>
                  <CTableHeaderCell class="sortable" @click="sortBy('tree_code')">
                    Tree Code {{ getSortIcon('tree_code') }}
                  </CTableHeaderCell>
                  <CTableHeaderCell class="sortable" @click="sortBy('type')">
                    Type {{ getSortIcon('type') }}
                  </CTableHeaderCell>
                  <CTableHeaderCell>Category</CTableHeaderCell>
                  <CTableHeaderCell class="sortable" @click="sortBy('parcel_code')">
                    Parcel {{ getSortIcon('parcel_code') }}
                  </CTableHeaderCell>
                  <CTableHeaderCell>Status</CTableHeaderCell>
                  <CTableHeaderCell>Created At</CTableHeaderCell>
                  <CTableHeaderCell width="120">Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                <CTableRow v-for="tree in paginatedTrees" :key="tree.id" class="table-row">
                  <CTableDataCell>
                    <router-link :to="`/trees/${tree.id}`" class="text-decoration-none">
                      <i class="fas fa-tree me-1 text-success"></i>
                      {{ tree.tree_code }}
                    </router-link>
                  </CTableDataCell>
                  <CTableDataCell>
                      {{ tree?.type }}
                  </CTableDataCell>
                  <CTableDataCell>
                      {{ tree?.name }}
                  </CTableDataCell>
                  <CTableDataCell>
                    <router-link :to="`/parcels/${tree.parcel?.id}`" class="text-decoration-none">
                      <i class="fas fa-tree me-1 text-success"></i>
                      {{ tree.parcel?.parcel_code }}
                    </router-link>
                  </CTableDataCell>
                  <CTableDataCell>
                    <CBadge 
                      :color="getStatusBadge(tree.status).color" 
                      class="px-2 py-1"
                    >
                      {{ getStatusBadge(tree.status).text }}
                    </CBadge>
                  </CTableDataCell>
                  <CTableDataCell>
                    {{ new Date(tree.created_at).toLocaleDateString() ?? '' }}
                  </CTableDataCell>
                  <CTableDataCell>
                    <div class="d-flex gap-1">
                      <CButton
                        size="sm"
                        color="info"
                        variant="outline"
                        title="Edit Tree"
                        @click="openEdit(tree)"
                      >
                        <CIcon :icon="cilPencil" size="sm" />
                      </CButton>
                      <CButton
                        size="sm"
                        color="danger"
                        variant="outline"
                        title="Delete Tree"
                        @click="confirmDelete(tree.id, tree.name)"
                      >
                        <CIcon :icon="cilTrash" size="sm" />
                      </CButton>
                    </div>
                  </CTableDataCell>
                </CTableRow>
                <CTableRow v-if="paginatedTrees.length === 0">
                  <CTableDataCell colspan="8" class="text-center py-5">
                    <div class="empty-state">
                      <i class="fas fa-tree fa-3x text-muted mb-3"></i>
                      <h5 class="text-muted">No trees found</h5>
                      <p class="text-muted mb-3">Try adjusting your search criteria or add a new tree</p>
                      <CButton color="primary" @click="openCreate">
                        <CIcon :icon="cilPlus" class="me-1" />Add Your First Tree
                      </CButton>
                    </div>
                  </CTableDataCell>
                </CTableRow>
              </CTableBody>
            </CTable>
          </div>

           <!-- Enhanced Pagination -->
            <div class="pagination-section p-3 bg-light border-top">
              <div class="d-flex justify-content-between align-items-center">
                <div class="pagination-info">
                  <span class="text-muted small">
                    Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to 
                    {{ Math.min(currentPage * itemsPerPage, filteredTrees.length) }} 
                    of {{ filteredTrees.length }} entries
                    <span v-if="filteredTrees.length !== treeStore.trees.length">
                      (filtered from {{ treeStore.trees.length }} total)
                    </span>
                  </span>
                </div>
                <div class="pagination-controls d-flex align-items-center gap-2" v-if="totalPages > 1">
                  <CButton 
                    size="sm" 
                    variant="outline" 
                    :disabled="currentPage === 1"
                    @click="prevPage"
                  >
                    Previous
                  </CButton>

                  <CButton 
                    size="sm" 
                    variant="outline" 
                    :disabled="currentPage === totalPages"
                    @click="nextPage"
                  >
                    Next
                  </CButton>
                </div>

              </div>
            </div>
        </CCardBody>
      </CCard>
    </CCol>
  </div>

  <!-- Enhanced Create/Edit Modal -->
  <CModal :visible="showModal" @close="showModal = false" backdrop="static" size="lg">
    <CModalHeader class="border-bottom">
      <CModalTitle>
        <i class="fas fa-tree me-2 text-success"></i>
        {{ isEditing ? 'Edit Tree' : 'Add New Tree' }}
      </CModalTitle>
    </CModalHeader>
    <CModalBody class="p-0">
      <!-- Tab Content -->
      <CForm
        id="tree-form"
        class="p-4"
        novalidate
        :validated="validated"
        @submit="handleSubmit"
      >
        <CRow class="g-3">
          <CCol md="6">
            <CFormLabel for="type" class="fw-semibold">Tree Type <span style="color: red;">*</span></CFormLabel>
            <Multiselect
              v-model="currentTree.type"
              placeholder="Select type"
              track-by="value"
              label="label"
              :options="types"
              :show-no-results="false"
              :close-on-select="true"
              :clear-on-select="false"
              :preserve-search="true"
              :preselect-first="false"
            >
              <template #option="{ option }">
                <span class="me-2">{{ option.icon }}</span>{{ option.label }}
              </template>
              <template #singleLabel="{ option }">
                <span class="me-2">{{ option.icon }}</span>{{ option.label }}
              </template>
            </Multiselect>
            <div v-if="validated && !currentTree.type" class="invalid-feedback d-block">
              Type is required.
            </div>
          </CCol>

          <CCol md="6" v-if="isAvocadoSelected">
            <CFormLabel for="tree-name" class="fw-semibold">Avocado Variety <span style="color: red;">*</span></CFormLabel>
            <Multiselect
              v-model="currentTree.name"
              placeholder="Select avocado variety"
              track-by="value"
              label="label"
              :options="avocadoNames"
              :show-no-results="false"
              :close-on-select="true"
              :clear-on-select="false"
              :preserve-search="true"
              :preselect-first="false"
            />
            <div v-if="validated && isAvocadoSelected && !currentTree.name" class="invalid-feedback d-block">
              Avocado variety is required.
            </div>
          </CCol>

          <CCol md="12">
            <CFormLabel for="parcel" class="fw-semibold">Parcel <span style="color: red;">*</span></CFormLabel>
            <Multiselect
              v-model="currentTree.parcel_id"
              placeholder="Select Parcel"
              track-by="value"
              label="label"
              :options="parcels"
              :show-no-results="false"
              :close-on-select="true"
              :clear-on-select="false"
              :preserve-search="true"
              :preselect-first="false"
            />
            <div v-if="validated && !currentTree.parcel_id" class="invalid-feedback d-block">
              Parcel is required.
            </div>
          </CCol>

          <CCol cols="12" md="12">
            <CFormLabel for="description" class="fw-semibold">Description</CFormLabel>
            <CFormTextarea 
              id="description" 
              rows="3" 
              v-model="currentTree.description"
              placeholder="Add any additional notes about this tree..."
            />
          </CCol>

          <CCol cols="12" class="col-12">
            <div class="d-flex align-items-center">
              <CFormCheck id="status" v-model="isActive" />
              <CFormLabel for="status" class="ms-2">Active Tree (healthy and growing)</CFormLabel>
            </div>
          </CCol>
        </CRow>
      </CForm>
    </CModalBody>
    <CModalFooter class="border-top">
      <CButton color="secondary" @click="showModal = false">
        Cancel
      </CButton>
      <CButton 
        color="dark" 
        type="submit"
        form="tree-form"
        :disabled="loading"
      >
        <CSpinner v-if="loading" size="sm" class="me-2" />
        <i v-else :class="isEditing ? 'fas fa-save' : 'fas fa-plus'" class="me-2"></i>
        {{ isEditing ? 'Update Tree' : 'Create Tree' }}
      </CButton>
    </CModalFooter>
  </CModal>
</template>

<style scoped>
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.search-filter-section {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.sortable {
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s;
}

.sortable:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.modern-table {
  font-size: 0.9rem;
}

.table-row:hover {
  background-color: rgba(0, 123, 255, 0.05);
}

.empty-state {
  padding: 2rem;
}

.pagination-section {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.pagination-controls .btn {
  min-width: 40px;
}

.advanced-filters {
  padding-top: 1rem;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  margin-top: 1rem;
}

.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>