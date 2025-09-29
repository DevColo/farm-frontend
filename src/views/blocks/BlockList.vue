<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useBlockStore } from '@/stores/block.store'
import { useFarmStore } from '@/stores/farm.store'
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
  CNav,
  CNavItem,
  CNavLink,
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

const blockStore = useBlockStore()
const farmStore = useFarmStore()

const showModal = ref(false)
const isEditing = ref(false)
const validated = ref(false)
const loading = ref(false)
const showFilters = ref(false)
const editingId = ref(null)

const currentBlock = ref({
  name: '',
  farm: '',
  latitude: '',
  longitude: '',
  description: '',
  status: '1',
})

// Enhanced search and filter states
const searchQuery = ref('')
const filterFarm = ref('')
const itemsPerPage = ref(10)
const currentPage = ref(1)
const sortField = ref('name')
const sortOrder = ref('asc')
const farms = ref([])

// fetch data
onMounted(async () => {
  loading.value = true
  try {
    await Promise.all([
      blockStore.fetchBlocks(),
      farmStore.fetchFarms()
    ])
  } finally {
    loading.value = false
  }
})

// Watch the store in case farms are updated dynamically later
watch(
  () => farmStore.farms,
  (newFarms) => {
    farms.value = newFarms.map(c => ({
      value: c.id,
      label: c.name,
    }))
  },
  { deep: true }
)

// Generate filter options
const availableFarms = computed(() => {
  const farmNames = blockStore.blocks.map(block => block.farm).filter(Boolean)
  return Array.from(new Set(farmNames))
})

// Enhanced filtering and sorting
const filteredBlocks = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  
  // Always work with an array
  const blocks = Array.isArray(blockStore.blocks) ? blockStore.blocks : []
  
  let filtered = blocks.filter((block) => {
    const matchesQuery = !q || [block.name, block.farm].some((field) => 
      field?.toLowerCase().includes(q)
    )
    const matchesFarm = !filterFarm.value || block.farm === filterFarm.value
    
    return matchesQuery && matchesFarm
  })

  // Apply sorting
  filtered.sort((a, b) => {
    let aValue = a[sortField.value]
    let bValue = b[sortField.value]
    
    // Handle special cases
    if (sortField.value === 'farm') {
      aValue = a.farm || ''
      bValue = b.farm || ''
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
  Math.max(1, Math.ceil(filteredBlocks.value.length / itemsPerPage.value))
)

const paginatedBlocks = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredBlocks.value.slice(start, start + itemsPerPage.value)
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
  filterFarm.value = ''
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
  currentBlock.value = {
    name: '',
    farm: '',
    latitude: '',
    longitude: '',
    description: '',
    status: '1',
  }
  showModal.value = true
}

function openEdit(block) {
  isEditing.value = true
  validated.value = false
  editingId.value = block.id
  currentBlock.value = { ...block, status: block.status === '1' }

  // Find matching farm object from options
  const farmObj = farms.value.find(c => 
    c.label.toLowerCase() === block.farm?.toLowerCase()
  )
  currentBlock.value.farm = farmObj || null
  showModal.value = true
}

async function confirmDelete(id, name) {
  if (confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
    loading.value = true
    try {
      await blockStore.deleteBlock(id)
    } finally {
      loading.value = false
    }
  }
}

// Form handling
const isActive = computed({
  get: () => currentBlock.value.status === '1' || currentBlock.value.status === true,
  set: (v) => {
    currentBlock.value.status = v ? '1' : '0'
  },
})

async function handleSubmit(e) {
  e.preventDefault()
  e.stopPropagation()
  
  const form = e.currentTarget
  
  // Check if all required fields are filled
  if (!currentBlock.value.name || !currentBlock.value.farm) {
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
      name: currentBlock.value.name,
      latitude: currentBlock.value.latitude,
      longitude: currentBlock.value.longitude,
      description: currentBlock.value.description,
      status: currentBlock.value.status,
      farm: currentBlock.value.farm.value,
    }
    
    if (isEditing.value) {
      payload.block_id = editingId.value
      const res = await blockStore.editBlock(payload)
      if(res == 1){
        showModal.value = false
        validated.value = false
      }
    } else {
      const res = await blockStore.createBlock(payload)
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
watch([searchQuery, filterFarm], () => {
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
    <!-- Main Table Card -->
    <CCol cols="12">
      <CCard class="shadow-sm border-0">
        <!-- Enhanced Header -->
        <CCardHeader class="bg-white border-bottom">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h5 class="mb-1">
                <i class="fas fa-th-large me-2 text-primary"></i>Blocks
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
                <CIcon :icon="cilPlus" class="me-1" />Add New Block
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
                      placeholder="Search by block or farm"
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
                  <CFormSelect v-model="filterFarm" @change="resetPage">
                    <option value="">All Farms</option>
                    <option v-for="farm in availableFarms" :key="farm" :value="farm">
                      {{ farm }}
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
                    Block Name {{ getSortIcon('name') }}
                  </CTableHeaderCell>
                  <CTableHeaderCell>Block Code</CTableHeaderCell>
                  <CTableHeaderCell class="sortable" @click="sortBy('farm')">
                    Farm {{ getSortIcon('farm') }}
                  </CTableHeaderCell>
                  <CTableHeaderCell>Country</CTableHeaderCell>
                  <CTableHeaderCell>Number of Trees</CTableHeaderCell>
                  <CTableHeaderCell>Status</CTableHeaderCell>
                  <CTableHeaderCell>Created At</CTableHeaderCell>
                  <CTableHeaderCell width="120">Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                <CTableRow v-for="block in paginatedBlocks" :key="block.id" class="table-row">
                  <CTableDataCell>
                    <router-link :to="`/blocks/${block.id}`" class="text-decoration-none cow-link">
                      {{ block.name }}
                    </router-link>
                  </CTableDataCell>
                  <CTableDataCell>
                    {{ block?.block_code }}
                  </CTableDataCell>
                  <CTableDataCell>
                    {{ block.farm ?? '' }}
                  </CTableDataCell>
                  <CTableDataCell>
                    {{ block.country ?? '' }}
                  </CTableDataCell>
                  <CTableDataCell>
                    {{ block.trees_count ?? '' }}
                  </CTableDataCell>
                  <CTableDataCell>
                    <CBadge 
                      :color="getStatusBadge(block.status).color" 
                      class="px-2 py-1"
                    >
                      {{ getStatusBadge(block.status).text }}
                    </CBadge>
                  </CTableDataCell>
                  <CTableDataCell>
                    {{ new Date(block.created_at).toLocaleDateString() ?? '' }}
                  </CTableDataCell>
                  <CTableDataCell>
                    <div class="d-flex gap-1">
                      <CButton
                        size="sm"
                        color="info"
                        variant="outline"
                        title="Edit Block"
                        @click="openEdit(block)"
                      >
                        <CIcon :icon="cilPencil" size="sm" />
                      </CButton>
                      <CButton
                        size="sm"
                        color="danger"
                        variant="outline"
                        title="Delete Block"
                        @click="confirmDelete(block.id, block.name)"
                      >
                        <CIcon :icon="cilTrash" size="sm" />
                      </CButton>
                    </div>
                  </CTableDataCell>
                </CTableRow>
                <CTableRow v-if="paginatedBlocks.length === 0">
                  <CTableDataCell colspan="7" class="text-center py-5">
                    <div class="empty-state">
                      <i class="fas fa-th-large fa-3x text-muted mb-3"></i>
                      <h5 class="text-muted">No blocks found</h5>
                      <p class="text-muted mb-3">Try adjusting your search criteria or add a new block</p>
                      <CButton color="primary" @click="openCreate">
                        <CIcon :icon="cilPlus" class="me-1" />Add Your First Block
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
                  {{ Math.min(currentPage * itemsPerPage, filteredBlocks.length) }} 
                  of {{ filteredBlocks.length }} entries
                  <span v-if="filteredBlocks.length !== blockStore.blocks.length">
                    (filtered from {{ blockStore.blocks.length }} total)
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
                  <i class="fas fa-chevron-left"></i>
                </CButton>
                
                <CButton 
                  size="sm" 
                  v-for="page in Math.min(totalPages)" 
                  :key="page"
                  :color="page === currentPage ? 'primary' : 'outline-secondary'"
                  @click="goToPage(page)"
                >
                  {{ page }}
                </CButton>
                
                <CButton 
                  size="sm" 
                  variant="outline" 
                  :disabled="currentPage === totalPages"
                  @click="nextPage"
                >
                  <i class="fas fa-chevron-right"></i>
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
        {{ isEditing ? 'Edit Block' : 'Add New Block' }}
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
          <!-- Block Details Tab -->
          <CTabPane visible>
            <CRow class="g-3">
              <CCol md="6">
                <CFormLabel for="block-name" class="fw-semibold">Block Name <span style="color: red;">*</span></CFormLabel>
                <CFormInput id="block-name" v-model="currentBlock.name" required />
                <CFormFeedback invalid>Block name is required.</CFormFeedback>
              </CCol>

              <CCol md="6">
                <CFormLabel for="farm" class="fw-semibold">Farm <span style="color: red;">*</span></CFormLabel>
                <Multiselect
                  v-model="currentBlock.farm"
                  placeholder="Select Farm"
                  track-by="value"
                  label="label"
                  :options="farms"
                  :show-no-results="false"
                  :close-on-select="true"
                  :clear-on-select="false"
                  :preserve-search="true"
                  :preselect-first="false"
                />
                <div v-if="validated && !currentBlock.farm" class="invalid-feedback d-block">
                  Farm is required.
                </div>
              </CCol>

              <CCol md="6">
                <CFormLabel for="latitude" class="fw-semibold">Latitude</CFormLabel>
                <CFormInput 
                  id="latitude" 
                  v-model="currentBlock.latitude" 
                  type="number"
                  step="any"
                  placeholder="e.g., -1.2345678"
                />
                <small class="form-text text-muted">GPS coordinate (decimal degrees)</small>
              </CCol>

              <CCol md="6">
                <CFormLabel for="longitude" class="fw-semibold">Longitude</CFormLabel>
                <CFormInput 
                  id="longitude" 
                  v-model="currentBlock.longitude" 
                  type="number"
                  step="any"
                  placeholder="e.g., 30.1234567"
                />
                <small class="form-text text-muted">GPS coordinate (decimal degrees)</small>
              </CCol>

              <CCol cols="12" md="12">
                <CFormLabel for="description" class="fw-semibold">Description</CFormLabel>
                <CFormTextarea 
                  id="description" 
                  rows="3" 
                  v-model="currentBlock.description"
                  placeholder="Add any additional notes about this block..."
                />
              </CCol>

              <CCol cols="12" class="col-12">
                <div class="d-flex align-items-center">
                  <CFormCheck id="status" v-model="isActive" />
                  <CFormLabel for="status" class="ms-2">Active Block (available for operations)</CFormLabel>
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

.cow-link {
  font-weight: 500;
  color: #0d6efd;
}

.cow-link:hover {
  color: #0b5ed7;
  text-decoration: underline !important;
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