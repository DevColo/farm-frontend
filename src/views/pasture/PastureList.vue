<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { usePastureStore } from '@/stores/pasture.store'
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
import { cilPencil, cilTrash, cilPlus, cilCloudDownload, cilSearch, cilFilter } from '@coreui/icons'
import Multiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.css'

const pastureStore = usePastureStore()
const countryStore = useCountryStore()

const showModal = ref(false)
const isEditing = ref(false)
const validated = ref(false)
const loading = ref(false)
const showFilters = ref(false)

const currentPasture = ref({
  pasture: '',
  country: 'Rwanda',
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
const editingId = ref(null)

// fetch data
onMounted(async () => {
  loading.value = true
  try {
    await Promise.all([
      pastureStore.fetchPastures(),
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
  const countries = pastureStore.pastures.map(pasture => pasture.country).filter(Boolean)
  return Array.from(new Set(countries))
})

// Enhanced filtering and sorting
const filteredPastures = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  let filtered = pastureStore.pastures.filter((pasture) => {
    const matchesQuery = !q || [pasture.pasture, pasture.country].some((field) => 
      field?.toLowerCase().includes(q)
    )
    const matchesCountry = !filterCountry.value || pasture.country === filterCountry.value
    
    return matchesQuery && matchesCountry
  })

  // Apply sorting
  filtered.sort((a, b) => {
    let aValue = a[sortField.value]
    let bValue = b[sortField.value]
    
    // Handle special cases
    if (sortField.value === 'age') {
      aValue = calculateAge(a.date_of_birth)
      bValue = calculateAge(b.date_of_birth)
    } else if (sortField.value === 'pasture') {
      aValue = a.pasture?.pasture || ''
      bValue = b.pasture?.pasture || ''
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
  Math.max(1, Math.ceil(filteredPastures.value.length / itemsPerPage.value))
)

const paginatedPastures = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredPastures.value.slice(start, start + itemsPerPage.value)
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

// Modal handlers
function openCreate() {
  isEditing.value = false
  validated.value = false
  editingId.value = null
  currentPasture.value = {
    pasture: '',
    country: '',
    description: '',
    status: '1',
  }
  showModal.value = true
}

function openEdit(pasture) {
  isEditing.value = true
  validated.value = false
  editingId.value = pasture.id
  currentPasture.value = { ...pasture, status: pasture.status === '1' }

  // Find matching country object from options
  const countryObj = countries.value.find(c => 
    c.label.toLowerCase() === pasture.country?.toLowerCase()
  )
  currentPasture.value.country = countryObj || null
  showModal.value = true
}

async function confirmDelete(id, name) {
  if (confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
    loading.value = true
    try {
      await pastureStore.deleteCow(id)
    } finally {
      loading.value = false
    }
  }
}

// Form handling
const isActive = computed({
  get: () => currentPasture.value.status === '1' || currentPasture.value.status === true,
  set: (v) => {
    currentPasture.value.status = v ? '1' : '0'
  },
})

async function handleSubmit(e) {
  const form = e.currentTarget
  if (!form.checkValidity()) {
    e.preventDefault()
    e.stopPropagation()
    validated.value = true
    return
  }
  e.preventDefault()
  
  loading.value = true
  try {
    const payload = {
    pasture: currentPasture.value.pasture,
    description: currentPasture.value.description,
    status: currentPasture.value.status,
    country: currentPasture.value.country.value,
  }
    
    if (isEditing.value) {
      payload.pasture_id = editingId.value
      const res = await pastureStore.editPasture(payload)
      if(res == 1){
        showModal.value = false
        console.log(res)
      }
      
    } else {
      const res = await pastureStore.createPasture(payload)
      if(res == 1){
        showModal.value = false
      }
    }
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
      <!-- Main Table Card -->
      <CCol cols="12">
        <CCard class="shadow-sm border-0">
          <!-- Enhanced Header -->
          <CCardHeader class="bg-white border-bottom">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h5 class="mb-1">
                  <i class="fas fa-list-ul me-2 text-primary"></i>Pastures
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
                  <CIcon :icon="cilPlus" class="me-1" />Add New Pasture
                </CButton>
              </div>
            </div>
          </CCardHeader>

          <CCardBody class="p-0">
            <!-- Enhanced Search and Filter Controls -->
            <div class="search-filter-section p-4 bg-light border-bottom">
              <!-- Main Search -->
              <div class="row g-3 mb-3">
                <div  class="col-md-11" style="display: flex; gap: 10px;">
                  <div class="col-md-3">
                    <CInputGroup>
                      <span class="input-group-text">
                        <CIcon :icon="cilSearch" />
                      </span>
                      <CFormInput
                        v-model="searchQuery"
                        placeholder="Search by pasture or country"
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
                    <CTableHeaderCell class="sortable" @click="sortBy('pasture')">
                      Name {{ getSortIcon('pasture') }}
                    </CTableHeaderCell>
                    <CTableHeaderCell class="sortable" @click="sortBy('country')">
                      Country {{ getSortIcon('country') }}
                    </CTableHeaderCell>
                    <CTableHeaderCell>Number of Cows</CTableHeaderCell>
                    <CTableHeaderCell>Status</CTableHeaderCell>
                    <CTableHeaderCell>Created At</CTableHeaderCell>
                    <CTableHeaderCell width="120">Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  <CTableRow v-for="pasture in paginatedPastures" :key="pasture.id" class="table-row">
                    <CTableDataCell>
                      <router-link :to="`/pastures/${pasture.id}`" class="text-decoration-none cow-link">
                        {{ pasture?.pasture }}
                      </router-link>
                    </CTableDataCell>
                    <CTableDataCell>
                      {{ pasture?.country }}
                    </CTableDataCell>
                    <CTableDataCell>
                        {{ pasture?.cows_count }}
                    </CTableDataCell>
                    <CTableDataCell>
                      <CBadge 
                        :color="getStatusBadge(pasture.status).color" 
                        class="px-2 py-1"
                      >
                        {{ getStatusBadge(pasture.status).text }}
                      </CBadge>
                    </CTableDataCell>
                    <CTableDataCell>
                      {{ new Date(pasture.created_at).toLocaleDateString() ?? '' }}
                    </CTableDataCell>
                    <CTableDataCell>
                      <div class="d-flex gap-1">
                        <CButton
                          size="sm"
                          color="info"
                          variant="outline"
                          title="Edit Pasture"
                          @click="openEdit(pasture)"
                        >
                          <CIcon :icon="cilPencil" size="sm" />
                        </CButton>
                        <CButton
                          size="sm"
                          color="danger"
                          variant="outline"
                          title="Delete Pasture"
                          @click="confirmDelete(pasture.id, pasture.name)"
                        >
                          <CIcon :icon="cilTrash" size="sm" />
                        </CButton>
                      </div>
                    </CTableDataCell>
                  </CTableRow>
                  <CTableRow v-if="paginatedPastures.length === 0">
                    <CTableDataCell colspan="10" class="text-center py-5">
                      <div class="empty-state">
                        <i class="fas fa-cow fa-3x text-muted mb-3"></i>
                        <h5 class="text-muted">No pastures found</h5>
                        <p class="text-muted mb-3">Try adjusting your search criteria or add a new pasture</p>
                        <CButton color="primary" @click="openCreate">
                          <CIcon :icon="cilPlus" class="me-1" />Add Your First Pasture
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
                    {{ Math.min(currentPage * itemsPerPage, filteredPastures.length) }} 
                    of {{ filteredPastures.length }} entries
                    <span v-if="filteredPastures.length !== pastureStore.pastures.length">
                      (filtered from {{ pastureStore.pastures.length }} total)
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
        <i class="fas fa-cow me-2"></i>
        {{ isEditing ? 'Edit Pasture' : 'Add New Pasture' }}
      </CModalTitle>
    </CModalHeader>
    <CModalBody class="p-0">

      <!-- Tab Content -->
      <CForm
        class="p-4"
        novalidate
        :validated="validated"
        @submit="handleSubmit"
      >
        <CTabContent>
          <!-- Cow Details Tab -->
          <CTabPane visible>
            <CRow class="g-3">
              <CCol md="6">
                <CFormLabel for="pasture" class="fw-semibold">Pasture <span style="color: red;">*</span></CFormLabel>
                <CFormInput id="pasture" v-model="currentPasture.pasture" required />
                <CFormFeedback invalid>Pasture is required.</CFormFeedback>
              </CCol>

              <CCol md="6">
                <CFormLabel for="from_farm" class="fw-semibold">Country <span style="color: red;">*</span></CFormLabel>
                <Multiselect
                  v-model="currentPasture.country"
                  placeholder="Select Country"
                  track-by="value"
                  label="label"
                  :options="countries"
                  :show-no-results="false"
                  :close-on-select="true"
                  :clear-on-select="false"
                  :preserve-search="true"
                  :preselect-first="false"
                  required
                />
                <CFormFeedback invalid>Country is required.</CFormFeedback>
              </CCol>

              <CCol cols="12" md="12">
                <CFormLabel for="description" class="fw-semibold">Description</CFormLabel>
                <CFormTextarea 
                  id="description" 
                  rows="3" 
                  v-model="currentPasture.description"
                  placeholder="Add any additional notes about this pasture..."
                />
              </CCol>

              <CCol cols="12" class="col-12">
                <div class="d-flex align-items-center">
                  <CFormCheck id="status" v-model="isActive" />
                  <CFormLabel for="status" class="ms-2">Active Pasture (available for operations)</CFormLabel>
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
        @click="handleSubmit"
        :disabled="loading"
        type="submit"
      >
        <CSpinner v-if="loading" size="sm" class="me-2" />
        <i v-else :class="isEditing ? 'fas fa-save' : 'fas fa-plus'" class="me-2"></i>
        {{ isEditing ? 'Update Pasture' : 'Create Pasture' }}
      </CButton>
    </CModalFooter>
  </CModal>
</template>