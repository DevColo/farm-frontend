<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCustomerStore } from '@/stores/customer.store'
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
import { cilPencil, cilTrash, cilPlus, cilSearch, cilFilter, cilPeople, cilCloudDownload } from '@coreui/icons'
import Swal from 'sweetalert2'

const customerStore = useCustomerStore()

const showModal = ref(false)
const isEditing = ref(false)
const validated = ref(false)
const loading = ref(false)
const showFilters = ref(false)

const currentCustomer = ref({
  id: null,
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
})

// search & pagination
const searchQuery = ref('')
const itemsPerPage = ref(10)
const currentPage = ref(1)
const sortField = ref('first_name')
const sortOrder = ref('asc')

// Fetch data on mount
onMounted(async () => {
  loading.value = true
  try {
    await customerStore.fetchCustomers()
  } finally {
    loading.value = false
  }
})

// Enhanced filtering and sorting
const filteredCustomers = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  let filtered = (customerStore.customers || []).filter((customer) => {
    const matchesQuery =
      !q ||
      [customer.first_name, customer.last_name, customer.email, customer.phone].some((f) =>
        f?.toLowerCase().includes(q),
      )
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
  Math.max(1, Math.ceil(filteredCustomers.value.length / itemsPerPage.value)),
)

const paginatedCustomers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredCustomers.value.slice(start, start + itemsPerPage.value)
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
  currentCustomer.value = {
    id: null,
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
  }
  showModal.value = true
}

function openEdit(customer) {
  isEditing.value = true
  validated.value = false
  currentCustomer.value = { ...customer }
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
        await customerStore.deleteCustomer(id)
      } finally {
        loading.value = false
      }
    }
  })
}

async function handleSubmit(e) {
  if (e) e.preventDefault()

  // Manual validation
  if (!currentCustomer.value.first_name || !currentCustomer.value.phone) {
    validated.value = true
    return
  }

  loading.value = true
  try {
    const payload = {
      first_name: currentCustomer.value.first_name,
      last_name: currentCustomer.value.last_name,
      email: currentCustomer.value.email,
      phone: currentCustomer.value.phone,
    }
    
    if (isEditing.value) {
      await customerStore.editCustomer(currentCustomer.value.id, payload)
    } else {
      await customerStore.createCustomer(payload)
    }
    
    showModal.value = false
    await customerStore.fetchCustomers()
  } finally {
    loading.value = false
  }
}

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
        <CBreadcrumbItem active>Customers</CBreadcrumbItem>
      </CBreadcrumb>

      <CCard class="shadow-sm border-0">
        <!-- Enhanced Header -->
        <CCardHeader class="bg-white border-bottom">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h5 class="mb-1">Customers</h5>
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
                Add Customer
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
                      placeholder="Search by name, email, or phone..."
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
                  <CTableHeaderCell class="sortable" @click="sortBy('first_name')">
                    Full Name {{ getSortIcon('first_name') }}
                  </CTableHeaderCell>
                  <CTableHeaderCell class="sortable" @click="sortBy('phone')">
                    Phone {{ getSortIcon('phone') }}
                  </CTableHeaderCell>
                  <CTableHeaderCell class="sortable" @click="sortBy('email')">
                    Email {{ getSortIcon('email') }}
                  </CTableHeaderCell>
                  <CTableHeaderCell class="sortable" @click="sortBy('createdAt')">
                    Created At {{ getSortIcon('createdAt') }}
                  </CTableHeaderCell>
                  <CTableHeaderCell width="120">Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                <CTableRow v-for="customer in paginatedCustomers" :key="customer.id" class="table-row">
                  <CTableDataCell>
                    {{ customer.id }}
                  </CTableDataCell>
                  <CTableDataCell>
                    <div class="d-flex align-items-center">
                      <router-link :to="`/customers/${customer.id}`" class="text-decoration-none">
                        <strong>{{ customer.first_name }} {{ customer.last_name }}</strong>
                      </router-link>
                    </div>
                  </CTableDataCell>
                  <CTableDataCell>
                    <small class="text-muted">{{ customer.phone }}</small>
                  </CTableDataCell>
                  <CTableDataCell>
                    <small class="text-muted">{{ customer.email }}</small>
                  </CTableDataCell>
                  <CTableDataCell>
                    <small class="text-muted">{{ new Date(customer.createdAt).toLocaleString() }}</small>
                  </CTableDataCell>
                  <CTableDataCell>
                    <div class="d-flex gap-1">
                      <CButton
                        size="sm"
                        color="info"
                        variant="outline"
                        title="Edit Customer"
                        @click="openEdit(customer)"
                      >
                        <CIcon :icon="cilPencil" />
                      </CButton>
                      <CButton
                        size="sm"
                        color="danger"
                        variant="outline"
                        title="Delete Customer"
                        @click="confirmDelete(customer.id, `${customer.first_name} ${customer.last_name}`)"
                      >
                        <CIcon :icon="cilTrash" />
                      </CButton>
                    </div>
                  </CTableDataCell>
                </CTableRow>
                <CTableRow v-if="paginatedCustomers.length === 0">
                  <CTableDataCell colspan="6" class="text-center py-5">
                    <div class="empty-state">
                      <CIcon :icon="cilPeople" style="font-size: 3rem;" class="text-muted mb-3" />
                      <h5 class="text-muted">No customers found</h5>
                      <p class="text-muted mb-3">Try adjusting your search criteria or add a new customer</p>
                      <CButton color="primary" @click="openCreate">
                        <CIcon :icon="cilPlus" class="me-1" />
                        Add Your First Customer
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
                  {{ Math.min(currentPage * itemsPerPage, filteredCustomers.length) }} 
                  of {{ filteredCustomers.length }} entries
                  <span v-if="filteredCustomers.length !== customerStore.customers.length">
                    (filtered from {{ customerStore.customers.length }} total)
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
        <CIcon :icon="cilPeople" class="me-2" />
        {{ isEditing ? 'Edit Customer' : 'Add New Customer' }}
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
            <CFormLabel for="first_name" class="fw-semibold">
              First Name <span style="color: red;">*</span>
            </CFormLabel>
            <CFormInput 
              id="first_name" 
              v-model="currentCustomer.first_name" 
              required 
              placeholder="Enter first name"
            />
            <CFormFeedback invalid>First name is required.</CFormFeedback>
          </CCol>

          <CCol md="6">
            <CFormLabel for="last_name" class="fw-semibold">Last Name</CFormLabel>
            <CFormInput 
              id="last_name" 
              v-model="currentCustomer.last_name" 
              placeholder="Enter last name"
            />
          </CCol>

          <CCol md="6">
            <CFormLabel for="phone" class="fw-semibold">
              Phone Number <span style="color: red;">*</span>
            </CFormLabel>
            <CFormInput 
              id="phone" 
              v-model="currentCustomer.phone" 
              required
              placeholder="Enter phone number"
            />
            <CFormFeedback invalid>Phone number is required.</CFormFeedback>
          </CCol>

          <CCol md="6">
            <CFormLabel for="email" class="fw-semibold">Email Address</CFormLabel>
            <CFormInput 
              id="email" 
              v-model="currentCustomer.email" 
              type="email"
              placeholder="Enter email address"
            />
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
        {{ isEditing ? 'Update Customer' : 'Create Customer' }}
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