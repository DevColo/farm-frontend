<script setup>
import { ref, computed, onMounted } from 'vue'
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
  CFormFeedback,
  CInputGroup,
  CFormSelect,
  CSpinner,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
  CBreadcrumb,
  CBreadcrumbItem,
} from '@coreui/vue'
import { cilPencil, cilTrash, cilPlus, cilSearch, cilFilter, cilGlobeAlt, cilCloudDownload } from '@coreui/icons'
import Multiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.css'
import Swal from 'sweetalert2'

const countryStore = useCountryStore()

const showModal = ref(false)
const isEditing = ref(false)
const validated = ref(false)
const loading = ref(false)
const showFilters = ref(false)

const currentCountry = ref({
  id: null,
  country: null,
})

// search & pagination
const searchQuery = ref('')
const itemsPerPage = ref(10)
const currentPage = ref(1)
const sortField = ref('country')
const sortOrder = ref('asc')

// Fetch data on mount
onMounted(async () => {
  loading.value = true
  try {
    await countryStore.fetchCountries()
  } finally {
    loading.value = false
  }
})

// Enhanced filtering and sorting
const filteredCountries = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  let filtered = (countryStore.countries || []).filter((country) => {
    const matchesQuery = !q || [country.country].some((f) => f?.toLowerCase().includes(q))
    return matchesQuery
  })

  // Apply sorting
  filtered.sort((a, b) => {
    let aValue = a[sortField.value]
    let bValue = b[sortField.value]
    
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
  Math.max(1, Math.ceil(filteredCountries.value.length / itemsPerPage.value)),
)

const paginatedCountries = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredCountries.value.slice(start, start + itemsPerPage.value)
})

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

// modal handlers
function openCreate() {
  isEditing.value = false
  validated.value = false
  currentCountry.value = {
    id: null,
    country: null,
  }
  showModal.value = true
}

function openEdit(country) {
  isEditing.value = true
  validated.value = false
  currentCountry.value = {
    id: country.id,
    country: countries.value.find(c => c.value === country.country) || null
  }
  showModal.value = true
}

const confirmDelete = async (id, name) => {
  Swal.fire({
    html: `
      <div class="custom-modal-header d-flex align-items-center justify-content-center flex-column">
        <h3 class="custom-modal-title d-flex align-items-center justify-content-center flex-row font-inter fw-semibold text-grey-v13 py-3">
          <i class="material-symbols-rounded text-red rounded-circle position-relative d-flex align-items-center justify-content-center me-3">delete</i>
          <span></span>
        </h3>
        <p class="custom-modal-description font-inter fw-normal text-grey-v6">
          Are you sure to delete ${name}?
        </p>
      </div>
    `,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!',
  }).then(async (result) => {
    if (result.isConfirmed) {
      loading.value = true
      try {
        await countryStore.deleteCountry(id)
      } finally {
        loading.value = false
      }
    }
  })
}

async function handleSubmit(e) {
  if (e) e.preventDefault()

  // Manual validation
  if (!currentCountry.value.country) {
    validated.value = true
    return
  }

  loading.value = true
  try {
    const payload = {
      country: currentCountry.value.country?.value || currentCountry.value.country,
    }
    
    if (isEditing.value) {
      payload.country_id = currentCountry.value.id
      await countryStore.updateCountry(payload)
    } else {
      await countryStore.createCountry(payload)
    }
    
    showModal.value = false
    await countryStore.fetchCountries()
  } finally {
    loading.value = false
  }
}

// Countries list
const countries = ref([
  { value: 'Rwanda', label: 'Rwanda' },
  { value: 'DR Congo', label: 'DR Congo' },
  { value: 'Uganda', label: 'Uganda' },
  { value: 'Burundi', label: 'Burundi' },
  { value: 'Kenya', label: 'Kenya' },
  { value: 'Tanzania', label: 'Tanzania' },
  { value: 'South Sudan', label: 'South Sudan' },
  { value: 'Ethiopia', label: 'Ethiopia' },
])

// Export functions (placeholder for future implementation)
const exportPDF = () => {
  console.log('Export PDF functionality to be implemented')
}
</script>

<template>
  <div class="position-relative">
    <!-- Loading Overlay -->
    <div v-if="loading" class="loading-overlay">
      <CSpinner color="primary" variant="grow" />
    </div>

    <!-- Main Content -->
    <CCol cols="12">
      <!-- Breadcrumb -->
      <CBreadcrumb class="mb-4">
        <CBreadcrumbItem>
          <router-link to="/dashboard" class="text-decoration-none">Dashboard</router-link>
        </CBreadcrumbItem>
        <CBreadcrumbItem>
          <router-link to="/admin" class="text-decoration-none">Administration</router-link>
        </CBreadcrumbItem>
        <CBreadcrumbItem active>Countries</CBreadcrumbItem>
      </CBreadcrumb>

      <CCard class="shadow-sm border-0">
        <!-- Enhanced Header -->
        <CCardHeader class="bg-white border-bottom">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h5 class="mb-1">Countries</h5>
            </div>
            <div class="d-flex gap-2">
              <CDropdown>
                <CDropdownToggle color="secondary" size="sm">
                  <CIcon :icon="cilCloudDownload" class="me-1" />
                  Export
                </CDropdownToggle>
                <CDropdownMenu>
                  <CDropdownItem @click="exportPDF">
                    <i class="fas fa-file-pdf me-2 text-danger"></i>Export PDF
                  </CDropdownItem>
                </CDropdownMenu>
              </CDropdown>
              <CButton color="dark" @click="openCreate">
                <CIcon :icon="cilPlus" class="me-1" />
                Add Country
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
                      placeholder="Search by country name..."
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
                    <CIcon :icon="cilFilter" />
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
                  <CTableHeaderCell class="sortable" @click="sortBy('id')">
                    ID {{ getSortIcon('id') }}
                  </CTableHeaderCell>
                  <CTableHeaderCell class="sortable" @click="sortBy('country')">
                    Country Name {{ getSortIcon('country') }}
                  </CTableHeaderCell>
                  <CTableHeaderCell class="sortable" @click="sortBy('created_at')">
                    Created At {{ getSortIcon('created_at') }}
                  </CTableHeaderCell>
                  <CTableHeaderCell width="120">Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                <CTableRow v-for="country in paginatedCountries" :key="country.id" class="table-row">
                  <CTableDataCell>
                    {{ country.id }}
                  </CTableDataCell>
                  <CTableDataCell>
                    <div class="d-flex align-items-center">
                      <strong>{{ country.country }}</strong>
                    </div>
                  </CTableDataCell>
                  <CTableDataCell>
                    <small class="text-muted">{{ new Date(country.created_at).toLocaleString() }}</small>
                  </CTableDataCell>
                  <CTableDataCell>
                    <div class="d-flex gap-1">
                      <CButton
                        size="sm"
                        color="info"
                        variant="outline"
                        title="Edit Country"
                        @click="openEdit(country)"
                      >
                        <CIcon :icon="cilPencil" />
                      </CButton>
                      <CButton
                        size="sm"
                        color="danger"
                        variant="outline"
                        title="Delete Country"
                        @click="confirmDelete(country.id, country.country)"
                      >
                        <CIcon :icon="cilTrash" />
                      </CButton>
                    </div>
                  </CTableDataCell>
                </CTableRow>
                <CTableRow v-if="paginatedCountries.length === 0">
                  <CTableDataCell colspan="4" class="text-center py-5">
                    <div class="empty-state">
                      <CIcon :icon="cilGlobeAlt" style="font-size: 3rem;" class="text-muted mb-3" />
                      <h5 class="text-muted">No countries found</h5>
                      <p class="text-muted mb-3">Try adjusting your search criteria or add a new country</p>
                      <CButton color="primary" @click="openCreate">
                        <CIcon :icon="cilPlus" class="me-1" />
                        Add Your First Country
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
                  {{ Math.min(currentPage * itemsPerPage, filteredCountries.length) }} 
                  of {{ filteredCountries.length }} entries
                  <span v-if="filteredCountries.length !== countryStore.countries.length">
                    (filtered from {{ countryStore.countries.length }} total)
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
        <CIcon :icon="cilGlobeAlt" class="me-2" />
        {{ isEditing ? 'Edit Country' : 'Add New Country' }}
      </CModalTitle>
    </CModalHeader>
    <CModalBody class="p-0">
      <CForm
        class="p-4"
        novalidate
        :validated="validated"
        @submit="handleSubmit"
      >
        <CRow class="g-3">
          <CCol md="12">
            <CFormLabel for="country" class="fw-semibold">
              Country <span style="color: red;">*</span>
            </CFormLabel>
            <Multiselect
              v-model="currentCountry.country"
              placeholder="Select Country"
              track-by="value"
              label="label"
              :options="countries"
              :show-no-results="false"
              :close-on-select="true"
              :clear-on-select="false"
              :preserve-search="true"
              :preselect-first="false"
              :required="true"
            />
            <CFormFeedback invalid>Country is required.</CFormFeedback>
          </CCol>
        </CRow>
      </CForm>
    </CModalBody>
    <CModalFooter class="border-top">
      <CButton color="secondary" @click="showModal = false">
        Cancel
      </CButton>
      <CButton 
        type="submit"
        color="dark" 
        @click="handleSubmit"
        :disabled="loading"
      >
        <CSpinner v-if="loading" size="sm" class="me-2" />
        <CIcon v-else :icon="isEditing ? cilPencil : cilPlus" class="me-2" />
        {{ isEditing ? 'Update Country' : 'Create Country' }}
      </CButton>
    </CModalFooter>
  </CModal>
</template>

<style scoped>
/* Loading Overlay */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

/* Table Enhancements */
.modern-table {
  font-size: 0.95rem;
}

.modern-table thead th {
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.85rem;
  letter-spacing: 0.5px;
  padding: 1rem;
  background: #f8f9fa;
  border-bottom: 2px solid #dee2e6;
}

.modern-table tbody tr {
  transition: all 0.2s ease;
}

.modern-table tbody tr:hover {
  background-color: #f8f9fa;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.table-row td {
  vertical-align: middle;
  padding: 1rem;
}

.sortable {
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s;
}

.sortable:hover {
  background-color: #e9ecef !important;
}

/* Search and Filter Section */
.search-filter-section {
  background: linear-gradient(to bottom, #f8f9fa, #ffffff);
}

.advanced-filters {
  padding-top: 1rem;
  border-top: 1px dashed #dee2e6;
  margin-top: 1rem;
}

/* Empty State */
.empty-state {
  padding: 2rem;
}

/* Action Buttons */
.d-flex.gap-1 button {
  transition: all 0.2s ease;
}

.d-flex.gap-1 button:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Pagination */
.pagination-section {
  background: linear-gradient(to top, #f8f9fa, #ffffff);
}

.pagination-info {
  font-size: 0.9rem;
}

.pagination-controls button {
  min-width: 80px;
  font-weight: 500;
}

/* Modal Enhancements */
.modal-content {
  border: none;
  border-radius: 0.5rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
}

/* Multiselect Styling */
:deep(.multiselect) {
  min-height: 38px;
}

:deep(.multiselect__tags) {
  min-height: 38px;
  padding: 6px 40px 0 8px;
  border: 1px solid #d8dbe0;
  border-radius: 0.375rem;
}

:deep(.multiselect__tag) {
  background: #321fdb;
  margin-bottom: 0;
}

:deep(.multiselect__tag-icon:hover) {
  background: #2819b0;
}

:deep(.multiselect__option--highlight) {
  background: #321fdb;
}

/* Form Labels */
.fw-semibold {
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #4f5d73;
}

/* Responsive */
@media (max-width: 768px) {
  .search-filter-section .col-md-11 {
    flex-direction: column;
  }
  
  .search-filter-section .col-md-3 {
    width: 100%;
  }
  
  .d-flex.gap-2 {
    flex-direction: column;
    width: 100%;
  }
  
  .d-flex.gap-2 button {
    width: 100%;
  }
}
</style>