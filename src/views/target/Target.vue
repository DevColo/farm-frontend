<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useTargetStore } from '@/stores/target.store'
import { useCountryStore } from '@/stores/country.store'
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
  CBadge,
} from '@coreui/vue'
import { cilPencil, cilTrash, cilPlus, cilSearch, cilFilter, cilChart, cilCloudDownload } from '@coreui/icons'
import Swal from 'sweetalert2'
import Multiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.css'

const targetStore = useTargetStore()
const countryStore = useCountryStore()
const farmStore = useFarmStore()

const showModal = ref(false)
const isEditing = ref(false)
const validated = ref(false)
const loading = ref(false)
const showFilters = ref(false)
const countries = ref([])
const farms = ref([])
const editingId = ref(null)

const currentTarget = ref({
  id: null,
  production_type: '',
  quantity: '',
  fruit_type: '',
  farm_id: '',
  country_id: '',
  year: new Date().getFullYear(),
})

// search & pagination
const searchQuery = ref('')
const itemsPerPage = ref(10)
const currentPage = ref(1)
const productionFilter = ref('')
const sortField = ref('year')
const sortOrder = ref('desc')

// Production types
const productionTypes = ref([
  { value: 'milk', label: 'Milk' },
  { value: 'fruit', label: 'Fruit' },
])

// Fruit types
const fruitTypes = ref([
  { value: 'orange', label: 'Orange' },
  { value: 'lemon', label: 'Lemon' },
  { value: 'mango', label: 'Mango' },
  { value: 'avocado', label: 'Avocado' },
])

// Watch production type to clear fruit type if not fruit
watch(() => currentTarget.value.production_type, (newVal) => {
  if (newVal !== 'fruit') {
    currentTarget.value.fruit_type = ''
  }
})

// Fetch data on mount
onMounted(async () => {
  loading.value = true
  try {
    await targetStore.fetchTargets()
    await countryStore.fetchCountries()
    await farmStore.fetchFarms()
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

// Watch the store in case farm are updated dynamically later
watch(
  () => farmStore.farms,
  (newFarms) => {
    farms.value = newFarms.map(c => ({
      value: c.id,
      label: `${c.name} (${c.farm_code})`,
    }))
  },
  { deep: true }
)

// Enhanced filtering and sorting
const filteredTargets = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  let filtered = (targetStore.targets || []).filter((target) => {
    const matchesQuery =
      !q ||
      [target.production_type, target.fruit_type, String(target.quantity), String(target.year)].some((f) =>
        f?.toLowerCase().includes(q),
      )
    const matchesProduction = !productionFilter.value || target.production_type === productionFilter.value
    return matchesQuery && matchesProduction
  })

  // Apply sorting
  filtered.sort((a, b) => {
    let aValue = a[sortField.value]
    let bValue = b[sortField.value]
    
    if (sortField.value === 'quantity' || sortField.value === 'year') {
      aValue = Number(aValue) || 0
      bValue = Number(bValue) || 0
    } else {
      aValue = String(aValue || '').toLowerCase()
      bValue = String(bValue || '').toLowerCase()
    }
    
    if (sortOrder.value === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  return filtered
})

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredTargets.value.length / itemsPerPage.value)),
)

const paginatedTargets = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredTargets.value.slice(start, start + itemsPerPage.value)
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
  productionFilter.value = ''
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
  editingId.value = null
  currentTarget.value = {
    id: null,
    production_type: '',
    quantity: '',
    fruit_type: '',
    farm_id: '',
    country_id: '',
    year: new Date().getFullYear(),
  }
  showModal.value = true
}

function openEdit(target) {
  isEditing.value = true
  validated.value = false
  editingId.value = target.id
  currentTarget.value = { ...target }

  // Find matching country object from options
  const countryObj = countries.value.find(c => 
    c.value == target.country_id
  )
  currentTarget.value.country_id = countryObj || null

  // Find matching farm object from options
  const farmObj = farms.value.find(c => 
    c.value == target.farm_id
  )
  currentTarget.value.farm_id = farmObj || null
  showModal.value = true
}

const confirmDelete = async (id, type) => {
  Swal.fire({
    html: `
      <div class="custom-modal-header d-flex align-items-center justify-content-center flex-column">
        <h3 class="custom-modal-title d-flex align-items-center justify-content-center flex-row font-inter fw-semibold text-grey-v13 py-3">
          <i class="material-symbols-rounded text-red rounded-circle position-relative d-flex align-items-center justify-content-center me-3">delete</i>
          <span></span>
        </h3>
        <p class="custom-modal-description font-inter fw-normal text-grey-v6">
          Are you sure to delete this ${type} target?
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
        await targetStore.deleteTarget(id)
      } finally {
        loading.value = false
      }
    }
  })
}

async function handleSubmit(e) {
  if (e) e.preventDefault()

  // Manual validation
  if (!currentTarget.value.production_type || !currentTarget.value.quantity || !currentTarget.value.year) {
    validated.value = true
    return
  }

  // Validate fruit type if production is fruit
  if (currentTarget.value.production_type === 'fruit' && !currentTarget.value.fruit_type) {
    validated.value = true
    return
  }

  loading.value = true
  try {
    const payload = {
      production_type: currentTarget.value.production_type,
      quantity: currentTarget.value.quantity,
      fruit_type: currentTarget.value.production_type === 'fruit' ? currentTarget.value.fruit_type : '',
      year: currentTarget.value.year,
      country_id: currentTarget.value.country_id?.value ?? '',
      farm_id: currentTarget.value.farm_id.value ?? '',
    }
    
    if (isEditing.value) {
      payload.target_id = editingId.value
      await targetStore.editTarget(payload)
    } else {
      await targetStore.createTarget(payload)
    }
    
    showModal.value = false
    await targetStore.fetchTargets()
  } finally {
    loading.value = false
  }
}

// Get production badge color
function getProductionColor(type) {
  return type === 'milk' ? 'primary' : 'success'
}

// Format quantity
function formatQuantity(quantity, type) {
  const unit = type === 'milk' ? 'Liters' : 'Kg'
  return `${Number(quantity).toLocaleString()} ${unit}`
}

// Export functions (placeholder)
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
        <CBreadcrumbItem active>Production Targets</CBreadcrumbItem>
      </CBreadcrumb>

      <CCard class="shadow-sm border-0">
        <!-- Enhanced Header -->
        <CCardHeader class="bg-white border-bottom">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h5 class="mb-1">Production Targets</h5>
            </div>
            <div class="d-flex gap-2">
              <CButton color="info" variant="outline" size="sm" @click="$router.push('/targets/view')">
                <CIcon :icon="cilChart" class="me-1" />
                View Progress
              </CButton>
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
                Add Target
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
                      placeholder="Search targets..."
                      @input="resetPage"
                    />
                  </CInputGroup>
                </div>
                <div class="col-md-2">
                  <CFormSelect
                    v-model="productionFilter"
                    @change="resetPage"
                  >
                    <option value="">All Productions</option>
                    <option value="milk">Milk</option>
                    <option value="fruit">Fruit</option>
                  </CFormSelect>
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
                  <CTableHeaderCell class="sortable" @click="sortBy('year')">
                    Year {{ getSortIcon('year') }}
                  </CTableHeaderCell>
                  <CTableHeaderCell class="sortable" @click="sortBy('production_type')">
                    Production Type {{ getSortIcon('production_type') }}
                  </CTableHeaderCell>
                  <CTableHeaderCell class="sortable" @click="sortBy('fruit_type')">
                    Fruit Type {{ getSortIcon('fruit_type') }}
                  </CTableHeaderCell>
                  <CTableHeaderCell class="sortable" @click="sortBy('quantity')">
                    Annual Target {{ getSortIcon('quantity') }}
                  </CTableHeaderCell>
                  <CTableHeaderCell width="120">Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                <CTableRow v-for="target in paginatedTargets" :key="target.id" class="table-row">
                  <CTableDataCell>
                    {{ target.id }}
                  </CTableDataCell>
                  <CTableDataCell>
                    <strong>{{ target.year }}</strong>
                  </CTableDataCell>
                  <CTableDataCell>
                    <CBadge 
                      :color="getProductionColor(target.production_type)" 
                      class="production-badge"
                    >
                      {{ target.production_type.toUpperCase() }}
                    </CBadge>
                  </CTableDataCell>
                  <CTableDataCell>
                    <span v-if="target.fruit_type" class="text-capitalize">
                      {{ target.fruit_type }}
                    </span>
                    <span v-else class="text-muted">N/A</span>
                  </CTableDataCell>
                  <CTableDataCell>
                    <strong>{{ formatQuantity(target.quantity, target.production_type) }}</strong>
                  </CTableDataCell>
                  <CTableDataCell>
                    <div class="d-flex gap-1">
                      <CButton
                        size="sm"
                        color="info"
                        variant="outline"
                        title="Edit Target"
                        @click="openEdit(target)"
                      >
                        <CIcon :icon="cilPencil" />
                      </CButton>
                      <CButton
                        size="sm"
                        color="danger"
                        variant="outline"
                        title="Delete Target"
                        @click="confirmDelete(target.id, target.production_type)"
                      >
                        <CIcon :icon="cilTrash" />
                      </CButton>
                    </div>
                  </CTableDataCell>
                </CTableRow>
                <CTableRow v-if="paginatedTargets.length === 0">
                  <CTableDataCell colspan="6" class="text-center py-5">
                    <div class="empty-state">
                      <CIcon :icon="cilChart" style="font-size: 3rem;" class="text-muted mb-3" />
                      <h5 class="text-muted">No targets found</h5>
                      <p class="text-muted mb-3">Try adjusting your search criteria or add a new target</p>
                      <CButton color="primary" @click="openCreate">
                        <CIcon :icon="cilPlus" class="me-1" />
                        Add Your First Target
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
                  {{ Math.min(currentPage * itemsPerPage, filteredTargets.length) }} 
                  of {{ filteredTargets.length }} entries
                  <span v-if="filteredTargets.length !== targetStore.targets.length">
                    (filtered from {{ targetStore.targets.length }} total)
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
        {{ isEditing ? 'Edit Production Target' : 'Add New Production Target' }}
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
          <CCol md="6">
            <CFormLabel for="year" class="fw-semibold">
              Year <span style="color: red;">*</span>
            </CFormLabel>
            <CFormInput 
              id="year" 
              v-model="currentTarget.year" 
              type="number"
              required 
              placeholder="Enter year"
              min="2000"
              :max="new Date().getFullYear() + 10"
            />
            <CFormFeedback invalid>Year is required.</CFormFeedback>
          </CCol>

          <CCol md="6">
            <CFormLabel for="production_type" class="fw-semibold">
              Production Type <span style="color: red;">*</span>
            </CFormLabel>
            <CFormSelect
              id="production_type"
              v-model="currentTarget.production_type"
              required
            >
              <option value="">Select Production Type</option>
              <option value="milk">Milk</option>
              <option value="fruit">Fruit</option>
            </CFormSelect>
            <CFormFeedback invalid>Production type is required.</CFormFeedback>
          </CCol>

          <CCol md="6" v-if="currentTarget.production_type === 'fruit'">
            <CFormLabel for="fruit_type" class="fw-semibold">
              Type of Fruit <span style="color: red;">*</span>
            </CFormLabel>
            <CFormSelect
              id="fruit_type"
              v-model="currentTarget.fruit_type"
              :required="currentTarget.production_type === 'fruit'"
            >
              <option value="">Select Fruit Type</option>
              <option value="orange">Orange</option>
              <option value="lemon">Lemon</option>
              <option value="mango">Mango</option>
              <option value="avocado">Avocado</option>
            </CFormSelect>
            <CFormFeedback invalid>Fruit type is required.</CFormFeedback>
          </CCol>

          <CCol md="6" v-if="currentTarget.production_type === 'fruit'">
            <CFormLabel for="country" class="fw-semibold">
              Farm <span style="color: red;">*</span>
            </CFormLabel>
            <Multiselect
              v-model="currentTarget.farm_id"
              :required="currentTarget.production_type === 'fruit'"
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
            <div v-if="validated && !currentTarget.farm_id" class="invalid-feedback d-block">
              Farm is required.
            </div>
            <CFormFeedback invalid>Farm is required.</CFormFeedback>
          </CCol>

          <CCol md="12" v-if="currentTarget.production_type === 'milk'">
            <CFormLabel for="country" class="fw-semibold">
              Country <span style="color: red;">*</span>
            </CFormLabel>
            <Multiselect
              v-model="currentTarget.country_id"
              :required="currentTarget.production_type === 'milk'"
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
            <div v-if="validated && !currentTarget.country_id" class="invalid-feedback d-block">
              Country is required.
            </div>
            <CFormFeedback invalid>Country is required.</CFormFeedback>
          </CCol>

          <CCol :md="currentTarget.production_type === 'fruit' ? 6 : 12">
            <CFormLabel for="quantity" class="fw-semibold">
              Annual Quantity <span style="color: red;">*</span>
              <small class="text-muted">({{ currentTarget.production_type === 'milk' ? 'Liters' : 'Kg' }})</small>
            </CFormLabel>
            <CFormInput 
              id="quantity" 
              v-model="currentTarget.quantity" 
              type="number"
              required 
              placeholder="Enter annual quantity"
              min="0"
              step="0.01"
            />
            <CFormFeedback invalid>Annual quantity is required.</CFormFeedback>
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
        {{ isEditing ? 'Update Target' : 'Create Target' }}
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

/* Production Badge */
.production-badge {
  padding: 0.375rem 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.5px;
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
  
  .search-filter-section .col-md-3,
  .search-filter-section .col-md-2 {
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