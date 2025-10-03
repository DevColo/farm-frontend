<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useParcelStore } from '@/stores/parcel.store'
import { useBlockStore } from '@/stores/block.store'
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
  CFormFeedback,
  CTabContent,
  CTabPane,
  CInputGroup,
  CBadge,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
  CSpinner,
} from '@coreui/vue'
import CIcon from '@coreui/icons-vue'
import { cilPencil, cilTrash, cilPlus, cilCloudDownload, cilSearch, cilFilter } from '@coreui/icons'
import Multiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.css'

const parcelStore = useParcelStore()
const blockStore = useBlockStore()

const showModal = ref(false)
const isEditing = ref(false)
const validated = ref(false)
const loading = ref(false)
const showFilters = ref(false)
const editingId = ref(null)

const currentParcel = ref({
  name: '',
  block: '',
  description: '',
  status: '1',
})

// Enhanced search and filter states
const searchQuery = ref('')
const filterBlock = ref('')
const itemsPerPage = ref(10)
const currentPage = ref(1)
const sortField = ref('name')
const sortOrder = ref('asc')
const blocks = ref([])

// fetch data
onMounted(async () => {
  loading.value = true
  try {
    await Promise.all([
      parcelStore.fetchParcels(),
      blockStore.fetchBlocks()
    ])
  } finally {
    loading.value = false
  }
})

// Watch the store in case blocks are updated dynamically later
watch(
  () => blockStore.blocks,
  (newBlocks) => {
    blocks.value = newBlocks.map(c => ({
      value: c.id,
      label: c.block_code,
    }))
  },
  { deep: true }
)

// Generate filter options
const availableBlocks = computed(() => {
  const blockNames = parcelStore.parcels.map(parcel => parcel.block).filter(Boolean)
  return Array.from(new Set(blockNames))
})

// Enhanced filtering and sorting
const filteredParcels = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  
  // Always work with an array
  const parcels = Array.isArray(parcelStore.parcels) ? parcelStore.parcels : []
  
  let filtered = parcels.filter((parcel) => {
    const matchesQuery = !q || [parcel.name, parcel.block].some((field) => 
      field?.toLowerCase().includes(q)
    )
    const matchesParcel = !filterBlock.value || parcel.block === filterBlock.value
    
    return matchesQuery && matchesParcel
  })

  // Apply sorting
  filtered.sort((a, b) => {
    let aValue = a[sortField.value]
    let bValue = b[sortField.value]
    
    // Handle special cases
    if (sortField.value === 'block') {
      aValue = a.block || ''
      bValue = b.block || ''
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
  Math.max(1, Math.ceil(filteredParcels.value.length / itemsPerPage.value))
)

const paginatedParcels = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredParcels.value.slice(start, start + itemsPerPage.value)
})

function getStatusBadge(status) {
  return status === '1' ? { color: 'success', text: 'Active' } : { color: 'danger', text: 'Inactive' }
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
  filterBlock.value = ''
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
  currentParcel.value = {
    name: '',
    block: '',
    description: '',
    status: '1',
  }
  showModal.value = true
}

function openEdit(parcel) {
  isEditing.value = true
  validated.value = false
  editingId.value = parcel.id
  currentParcel.value = { ...parcel, status: parcel.status === '1' }

  // Find matching block object from options
  const blockObj = blocks.value.find(c => 
    c.value == parcel.block?.id
  )
  currentParcel.value.block = blockObj || null
  showModal.value = true
}

async function confirmDelete(id, name) {
  if (confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
    loading.value = true
    try {
      await parcelStore.deleteParcel(id)
    } finally {
      loading.value = false
    }
  }
}

// Form handling
const isActive = computed({
  get: () => currentParcel.value.status === '1' || currentParcel.value.status === true,
  set: (v) => {
    currentParcel.value.status = v ? '1' : '0'
  },
})

async function handleSubmit(e) {
  e.preventDefault()
  e.stopPropagation()
  
  const form = e.currentTarget
  
  // Check if all required fields are filled
  if (!currentParcel.value.name || !currentParcel.value.block) {
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
      name: currentParcel.value.name,
      description: currentParcel.value.description,
      status: currentParcel.value.status,
      block: currentParcel.value.block.value,
    }
    
    if (isEditing.value) {
      payload.parcel_id = editingId.value
      const res = await parcelStore.editParcel(payload)
      if(res == 1){
        showModal.value = false
        validated.value = false
      }
    } else {
      const res = await parcelStore.createParcel(payload)
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
watch([searchQuery, filterBlock], () => {
  resetPage()
})
</script>

<template>
  <div class="position-relative">
    <!-- Loading Overlay -->
    <div v-if="loading" class="loading-overlay">
      <CSpinner color="primary" variant="grow" />
    </div>

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
        <CBreadcrumbItem active>Parcels</CBreadcrumbItem>
      </CBreadcrumb>

    <!-- Main Content -->
    <!-- Main Table Card -->
    <CCol cols="12">
      <CCard class="shadow-sm border-0">
        <!-- Enhanced Header -->
        <CCardHeader class="bg-white border-bottom">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h5 class="mb-1">
                <i class="fas fa-th-large me-2 text-primary"></i>Parcels
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
                <CIcon :icon="cilPlus" class="me-1" />Add New Parcel
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
                      placeholder="Search by parcel or block"
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
                  <CFormSelect v-model="filterBlock" @change="resetPage">
                    <option value="">All Blocks</option>
                    <option v-for="block in availableBlocks" :key="block" :value="block">
                      {{ block }}
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
                  <CTableHeaderCell class="sortable" @click="sortBy('name')">
                    Parcel Name {{ getSortIcon('name') }}
                  </CTableHeaderCell>
                  <CTableHeaderCell>Parcel Code</CTableHeaderCell>
                  <CTableHeaderCell class="sortable" @click="sortBy('block')">
                    Block {{ getSortIcon('block') }}
                  </CTableHeaderCell>
                  <CTableHeaderCell>Country</CTableHeaderCell>
                  <CTableHeaderCell>Number of Trees</CTableHeaderCell>
                  <CTableHeaderCell>Status</CTableHeaderCell>
                  <CTableHeaderCell>Created At</CTableHeaderCell>
                  <CTableHeaderCell width="120">Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                <CTableRow v-for="parcel in paginatedParcels" :key="parcel.id" class="table-row">
                  <CTableDataCell>
                    <router-link :to="`/parcels/${parcel.id}`" class="text-decoration-none">
                      {{ parcel.name }}
                    </router-link>
                  </CTableDataCell>
                  <CTableDataCell>
                    {{ parcel?.parcel_code }}
                  </CTableDataCell>
                  <CTableDataCell>
                    <router-link :to="`/blocks/${parcel.block?.id}`" class="text-decoration-none">
                      {{ parcel.block?.block_code }}
                    </router-link>
                  </CTableDataCell>
                  <CTableDataCell>
                    {{ parcel.country ?? '' }}
                  </CTableDataCell>
                  <CTableDataCell>
                    {{ parcel.trees_count ?? '' }}
                  </CTableDataCell>
                  <CTableDataCell>
                    <CBadge 
                      :color="getStatusBadge(parcel.status).color" 
                      class="px-2 py-1"
                    >
                      {{ getStatusBadge(parcel.status).text }}
                    </CBadge>
                  </CTableDataCell>
                  <CTableDataCell>
                    {{ new Date(parcel.created_at).toLocaleDateString() ?? '' }}
                  </CTableDataCell>
                  <CTableDataCell>
                    <div class="d-flex gap-1">
                      <CButton
                        size="sm"
                        color="info"
                        variant="outline"
                        title="Edit Parcel"
                        @click="openEdit(parcel)"
                      >
                        <CIcon :icon="cilPencil" size="sm" />
                      </CButton>
                      <CButton
                        size="sm"
                        color="danger"
                        variant="outline"
                        title="Delete Parcel"
                        @click="confirmDelete(parcel.id, parcel.name)"
                      >
                        <CIcon :icon="cilTrash" size="sm" />
                      </CButton>
                    </div>
                  </CTableDataCell>
                </CTableRow>
                <CTableRow v-if="paginatedParcels.length === 0">
                  <CTableDataCell colspan="7" class="text-center py-5">
                    <div class="empty-state">
                      <i class="fas fa-th-large fa-3x text-muted mb-3"></i>
                      <h5 class="text-muted">No parcels found</h5>
                      <p class="text-muted mb-3">Try adjusting your search criteria or add a new parcel</p>
                      <CButton color="primary" @click="openCreate">
                        <CIcon :icon="cilPlus" class="me-1" />Add Your First Parcel
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
                    {{ Math.min(currentPage * itemsPerPage, filteredParcels.length) }} 
                    of {{ filteredParcels.length }} entries
                    <span v-if="filteredParcels.length !== parcelStore.parcels.length">
                      (filtered from {{ parcelStore.parcels.length }} total)
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
        <i class="fas fa-th-large me-2"></i>
        {{ isEditing ? 'Edit Parcel' : 'Add New Parcel' }}
      </CModalTitle>
    </CModalHeader>
    <CModalBody class="p-0">
      <!-- Tab Content -->
      <CForm
        id="block-form"
        class="p-4"
        novalidate
        :validated="validated"
        @submit="handleSubmit"
      >
        <CTabContent>
          <!-- parcel Details Tab -->
          <CTabPane visible>
            <CRow class="g-3">
              <CCol md="6">
                <CFormLabel for="parcel-name" class="fw-semibold">Parcel Name <span style="color: red;">*</span></CFormLabel>
                <CFormInput id="parcel-name" v-model="currentParcel.name" required />
                <CFormFeedback invalid>Parcel name is required.</CFormFeedback>
              </CCol>

              <CCol md="6">
                <CFormLabel for="block" class="fw-semibold">Block <span style="color: red;">*</span></CFormLabel>
                <Multiselect
                  v-model="currentParcel.block"
                  placeholder="Select Block"
                  track-by="value"
                  label="label"
                  :options="blocks"
                  :show-no-results="false"
                  :close-on-select="true"
                  :clear-on-select="false"
                  :preserve-search="true"
                  :preselect-first="false"
                />
                <div v-if="validated && !currentParcel.block" class="invalid-feedback d-block">
                  Block is required.
                </div>
              </CCol>

              <CCol cols="12" md="12">
                <CFormLabel for="description" class="fw-semibold">Description</CFormLabel>
                <CFormTextarea 
                  id="description" 
                  rows="3" 
                  v-model="currentParcel.description"
                  placeholder="Add any additional notes about this parcel..."
                />
              </CCol>

              <CCol cols="12" class="col-12">
                <div class="d-flex align-items-center">
                  <CFormCheck id="status" v-model="isActive" />
                  <CFormLabel for="status" class="ms-2">Active parcel (available for operations)</CFormLabel>
                </div>
              </CCol>
            </CRow>
          </CTabPane>
        </CTabContent>
      </CForm>
    </CModalBody>
    <CModalFooter class="border-top">
      <CButton color="secondary" @click="showModal = false">
        Cancel
      </CButton>
      <CButton 
        color="dark" 
        type="submit"
        form="block-form"
        :disabled="loading"
      >
        <CSpinner v-if="loading" size="sm" class="me-2" />
        <i v-else :class="isEditing ? 'fas fa-save' : 'fas fa-plus'" class="me-2"></i>
        {{ isEditing ? 'Update Block' : 'Create Block' }}
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
</style>