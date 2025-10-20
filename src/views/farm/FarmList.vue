<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useFarmStore } from '@/stores/farm.store'
import { useCountryStore } from '@/stores/country.store'
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

const farmStore = useFarmStore()
const countryStore = useCountryStore()

const showModal = ref(false)
const isEditing = ref(false)
const validated = ref(false)
const loading = ref(false)
const showFilters = ref(false)
const editingId = ref(null)

const currentFarm = ref({
  name: '',
  country: '',
  description: '',
  status: '1',
})

// Enhanced search and filter states
const searchQuery = ref('')
const filterCountry = ref('')
const itemsPerPage = ref(10)
const currentPage = ref(1)
const sortField = ref('name')
const sortOrder = ref('asc')
const countries = ref([])

// fetch data
onMounted(async () => {
  loading.value = true
  try {
    await Promise.all([
      farmStore.fetchFarms(),
      countryStore.fetchCountries()
    ])
  } finally {
    loading.value = false
  }
})

// Watch the store in case countries are updated dynamically later
watch(
  () => countryStore.countries,
  (newCountries) => {
    countries.value = newCountries.map(c => ({
      value: c.id,
      label: c.country,
    }))
  },
  { deep: true }
)

// Generate filter options
const availableCountries = computed(() => {
  const countryNames = farmStore.farms.map(farm => farm.country).filter(Boolean)
  return Array.from(new Set(countryNames))
})

// Enhanced filtering and sorting
const filteredFarms = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  
  // Always work with an array
  const farms = Array.isArray(farmStore.farms) ? farmStore.farms : []
  
  let filtered = farms.filter((farm) => {
    const matchesQuery = !q || [farm.name, farm.country].some((field) => 
      field?.toLowerCase().includes(q)
    )
    const matchesCountry = !filterCountry.value || farm.country === filterCountry.value
    
    return matchesQuery && matchesCountry
  })

  // Apply sorting
  filtered.sort((a, b) => {
    let aValue = a[sortField.value]
    let bValue = b[sortField.value]
    
    // Handle special cases
    if (sortField.value === 'country') {
      aValue = a.country || ''
      bValue = b.country || ''
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
  Math.max(1, Math.ceil(filteredFarms.value.length / itemsPerPage.value))
)

const paginatedFarms = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredFarms.value.slice(start, start + itemsPerPage.value)
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
  if (sortField.value !== field) return '↕'
  return sortOrder.value === 'asc' ? '↑' : '↓'
}

// Filter management
function clearAllFilters() {
  searchQuery.value = ''
  filterCountry.value = ''
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
  currentFarm.value = {
    name: '',
    country: '',
    description: '',
    status: '1',
  }
  showModal.value = true
}

function openEdit(farm) {
  isEditing.value = true
  validated.value = false
  editingId.value = farm.id
  currentFarm.value = { ...farm, status: farm.status === '1' }

  // Find matching country object from options
  const countryObj = countries.value.find(c => 
    c.label.toLowerCase() === farm.country?.toLowerCase()
  )
  currentFarm.value.country = countryObj || null
  showModal.value = true
}

async function confirmDelete(id, name) {
  if (confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
    loading.value = true
    try {
      await farmStore.deleteFarm(id)
    } finally {
      loading.value = false
    }
  }
}

// Form handling
const isActive = computed({
  get: () => currentFarm.value.status === '1' || currentFarm.value.status === true,
  set: (v) => {
    currentFarm.value.status = v ? '1' : '0'
  },
})

async function handleSubmit(e) {
  e.preventDefault()
  e.stopPropagation()
  
  const form = e.currentTarget
  
  // Check if all required fields are filled
  if (!currentFarm.value.name || !currentFarm.value.country) {
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
      name: currentFarm.value.name,
      description: currentFarm.value.description,
      status: currentFarm.value.status,
      country: currentFarm.value.country.value,
    }
    
    if (isEditing.value) {
      payload.farm_id = editingId.value
      const res = await farmStore.editFarm(payload)
      if(res == 1){
        showModal.value = false
        validated.value = false
      }
    } else {
      const res = await farmStore.createFarm(payload)
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
watch([searchQuery, filterCountry], () => {
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
        <CBreadcrumbItem active>Farms</CBreadcrumbItem>
      </CBreadcrumb>
    <!-- Main Table Card -->
    <CCol cols="12">
      <CCard class="shadow-sm border-0">
        <!-- Enhanced Header -->
        <CCardHeader class="bg-white border-bottom">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h5 class="mb-1">
                <i class="fas fa-warehouse me-2 text-primary"></i>Farms
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
                <CIcon :icon="cilPlus" class="me-1" />Add New Farm
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
                      placeholder="Search by farm or country"
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
                  <CFormSelect v-model="filterCountry" @change="resetPage">
                    <option value="">All Countries</option>
                    <option v-for="country in availableCountries" :key="country" :value="country">
                      {{ country }}
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
                    Farm Name {{ getSortIcon('name') }}
                  </CTableHeaderCell>
                  <CTableHeaderCell>Farm Code</CTableHeaderCell>
                  <CTableHeaderCell class="sortable" @click="sortBy('country')">
                    Country {{ getSortIcon('country') }}
                  </CTableHeaderCell>
                  <CTableHeaderCell>Amount of Blocks</CTableHeaderCell>
                  <CTableHeaderCell>Description</CTableHeaderCell>
                  <CTableHeaderCell>Status</CTableHeaderCell>
                  <CTableHeaderCell>Created At</CTableHeaderCell>
                  <CTableHeaderCell width="120">Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                <CTableRow v-for="farm in paginatedFarms" :key="farm.id" class="table-row">
                  <CTableDataCell>
                    <router-link :to="`/farm/${farm.id}`" class="text-decoration-none">
                      {{ farm.name }}
                    </router-link>
                  </CTableDataCell>
                  <CTableDataCell>
                    {{ farm.farm_code ?? '' }}
                  </CTableDataCell>
                  <CTableDataCell>
                    {{ farm.country ?? '' }}
                  </CTableDataCell>
                  <CTableDataCell>
                      {{ farm.block_count || 0 }}
                  </CTableDataCell>
                  <CTableDataCell>
                    {{ farm.description ?? '' }}
                  </CTableDataCell>
                  <CTableDataCell>
                    <CBadge 
                      :color="getStatusBadge(farm.status).color" 
                      class="px-2 py-1"
                    >
                      {{ getStatusBadge(farm.status).text }}
                    </CBadge>
                  </CTableDataCell>
                  <CTableDataCell>
                    {{ new Date(farm.created_at).toLocaleDateString() ?? '' }}
                  </CTableDataCell>
                  <CTableDataCell>
                    <div class="d-flex gap-1">
                      <CButton
                        size="sm"
                        color="info"
                        variant="outline"
                        title="Edit Farm"
                        @click="openEdit(farm)"
                      >
                        <CIcon :icon="cilPencil" size="sm" />
                      </CButton>
                      <CButton
                        size="sm"
                        color="danger"
                        variant="outline"
                        title="Delete Farm"
                        @click="confirmDelete(farm.id, farm.name)"
                      >
                        <CIcon :icon="cilTrash" size="sm" />
                      </CButton>
                    </div>
                  </CTableDataCell>
                </CTableRow>
                <CTableRow v-if="paginatedFarms.length === 0">
                  <CTableDataCell colspan="7" class="text-center py-5">
                    <div class="empty-state">
                      <i class="fas fa-warehouse fa-3x text-muted mb-3"></i>
                      <h5 class="text-muted">No farms found</h5>
                      <p class="text-muted mb-3">Try adjusting your search criteria or add a new farm</p>
                      <CButton color="primary" @click="openCreate">
                        <CIcon :icon="cilPlus" class="me-1" />Add Your First Farm
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
                    {{ Math.min(currentPage * itemsPerPage, filteredFarms.length) }} 
                    of {{ filteredFarms.length }} entries
                    <span v-if="filteredFarms.length !== farmStore.farms.length">
                      (filtered from {{ farmStore.farms.length }} total)
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
        <i class="fas fa-warehouse me-2"></i>
        {{ isEditing ? 'Edit Farm' : 'Add New Farm' }}
      </CModalTitle>
    </CModalHeader>
    <CModalBody class="p-0">
      <!-- Tab Content -->
      <CForm
        id="farm-form"
        class="p-4"
        novalidate
        :validated="validated"
        @submit="handleSubmit"
      >
        <CRow class="g-3">
          <CCol md="6">
            <CFormLabel for="farm-name" class="fw-semibold">Farm Name <span style="color: red;">*</span></CFormLabel>
            <CFormInput id="farm-name" v-model="currentFarm.name" required />
            <CFormFeedback invalid>Farm name is required.</CFormFeedback>
          </CCol>

          <CCol md="6">
            <CFormLabel for="country" class="fw-semibold">Country <span style="color: red;">*</span></CFormLabel>
            <Multiselect
              v-model="currentFarm.country"
              placeholder="Select Country"
              track-by="value"
              label="label"
              :options="countries"
              :show-no-results="false"
              :close-on-select="true"
              :clear-on-select="false"
              :preserve-search="true"
              :preselect-first="false"
            />
            <div v-if="validated && !currentFarm.country" class="invalid-feedback d-block">
              Country is required.
            </div>
          </CCol>

          <CCol cols="12" md="12">
            <CFormLabel for="description" class="fw-semibold">Description</CFormLabel>
            <CFormTextarea 
              id="description" 
              rows="3" 
              v-model="currentFarm.description"
              placeholder="Add any additional notes about this farm..."
            />
          </CCol>

          <CCol cols="12" class="col-12">
            <div class="d-flex align-items-center">
              <CFormCheck id="status" v-model="isActive" />
              <CFormLabel for="status" class="ms-2">Active Farm (available for operations)</CFormLabel>
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
        form="farm-form"
        :disabled="loading"
      >
        <CSpinner v-if="loading" size="sm" class="me-2" />
        <i v-else :class="isEditing ? 'fas fa-save' : 'fas fa-plus'" class="me-2"></i>
        {{ isEditing ? 'Update Farm' : 'Create Farm' }}
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