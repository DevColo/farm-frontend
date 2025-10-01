<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useUserStore } from '@/stores/user.store'
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
  CFormFeedback,
  CAvatar,
  CBadge,
  CInputGroup,
  CSpinner,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
  CBreadcrumb,
  CBreadcrumbItem,
} from '@coreui/vue'
import { cilPencil, cilTrash, cilUser, cilSearch, cilUserPlus, cilFilter, cilCloudDownload, cilPlus } from '@coreui/icons'
import Multiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.css'
import Swal from 'sweetalert2'
import avatar from '@/assets/images/avatars/8.jpg'

const userStore = useUserStore()
const countryStore = useCountryStore()

const showModal = ref(false)
const isEditing = ref(false)
const validated = ref(false)
const loading = ref(false)
const showFilters = ref(false)

const currentUser = ref({
  id: null,
  first_name: '',
  other_name: '',
  last_name: '',
  phone: '',
  email: '',
  address: '',
  roles: '',
  country: '',
  image: null,
})
const countries = ref([])

// search & pagination
const searchQuery = ref('')
const itemsPerPage = ref(10)
const currentPage = ref(1)
const roleFilter = ref('')
const sortField = ref('first_name')
const sortOrder = ref('asc')

// Fetch data on mount
onMounted(async () => {
  loading.value = true
  try {
    await userStore.fetchUsers()
    await countryStore.fetchCountries()
  } finally {
    loading.value = false
  }
})

// Watch the store for countries
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

// Enhanced filtering and sorting
const filteredUsers = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  let filtered = (userStore.users || []).filter((user) => {
    const matchesQuery =
      !q ||
      [user.first_name, user.other_name, user.last_name, user.phone, user.email].some((f) =>
        f?.toLowerCase().includes(q),
      )
    const matchesRole = !roleFilter.value || user.roles[0] === roleFilter.value
    return matchesQuery && matchesRole
  })

  // Apply sorting
  filtered.sort((a, b) => {
    let aValue = a[sortField.value]
    let bValue = b[sortField.value]
    
    // Handle nested fields like roles
    if (sortField.value === 'roles') {
      aValue = a.roles[0] || ''
      bValue = b.roles[0] || ''
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
  Math.max(1, Math.ceil(filteredUsers.value.length / itemsPerPage.value)),
)

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredUsers.value.slice(start, start + itemsPerPage.value)
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
  if (sortField.value !== field) return '↕️'
  return sortOrder.value === 'asc' ? '↑' : '↓'
}

// Filter management
function clearAllFilters() {
  searchQuery.value = ''
  roleFilter.value = ''
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
  currentUser.value = {
    id: null,
    first_name: '',
    other_name: '',
    last_name: '',
    phone: '',
    email: '',
    address: '',
    roles: '',
    country: '',
    image: null,
  }
  showModal.value = true
}

function openEdit(user) {
  isEditing.value = true
  validated.value = false
  currentUser.value = { ...user }
  // Set country as the object from countries array for Multiselect
  const countryObj = countries.value.find(c => c.value === user.country || c.label === user.country)
  currentUser.value.country = countryObj || ''
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
        await userStore.deleteUser(id)
      } finally {
        loading.value = false
      }
    }
  })
}

async function handleSubmit(e) {
  if (e) e.preventDefault()

  // Manual validation
  if (!currentUser.value.first_name || !currentUser.value.last_name || !currentUser.value.email || !currentUser.value.roles) {
    validated.value = true
    return
  }

  if (!isEditing.value && !currentUser.value.password) {
    validated.value = true
    return
  }

  loading.value = true
  try {
    const payload = {
      first_name: currentUser.value.first_name,
      other_name: currentUser.value.other_name,
      last_name: currentUser.value.last_name,
      phone: currentUser.value.phone,
      email: currentUser.value.email,
      address: currentUser.value.address,
      roles: currentUser.value.roles,
      country: currentUser.value.country?.value || currentUser.value.country,
      image: currentUser.value.image,
      ...(currentUser.value.password ? { password: currentUser.value.password } : {}),
    }

    if (isEditing.value) {
      payload.id = currentUser.value.id
      await userStore.updateUser(payload)
    } else {
      await userStore.createUser(payload)
    }
    
    showModal.value = false
    await userStore.fetchUsers()
  } finally {
    loading.value = false
  }
}

// Remove image
const removeImage = () => {
  currentUser.value.photo = null
}

// Get User Image
function getUserImage(imageUrl) {
  return imageUrl ? `${import.meta.env.VITE_API_BASE_URL}/${imageUrl}` : avatar
}

// Get role color
function getRoleColor(role) {
  const roleColors = {
    'superadmin': 'danger',
    'managing_director': 'primary',
    'accountant': 'success',
    'agronomist': 'info',
    'veterinarian': 'warning'
  }
  return roleColors[role] || 'secondary'
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
        <CBreadcrumbItem active>Users</CBreadcrumbItem>
      </CBreadcrumb>

      <CCard class="shadow-sm border-0">
        <!-- Enhanced Header -->
        <CCardHeader class="bg-white border-bottom">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h5 class="mb-1">Users</h5>
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
                <CIcon :icon="cilUserPlus" class="me-1" />
                Add User
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
                      placeholder="Search by name, phone, or email..."
                      @input="resetPage"
                    />
                  </CInputGroup>
                </div>
                <div class="col-md-3">
                  <CFormSelect
                    v-model="roleFilter"
                    @change="resetPage"
                  >
                    <option value="">All Roles</option>
                    <option value="superadmin">Superadmin</option>
                    <option value="managing_director">Manager</option>
                    <option value="accountant">Accountant</option>
                    <option value="agronomist">Agronomist</option>
                    <option value="veterinarian">Veterinarian</option>
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
                  <CTableHeaderCell width="80">Photo</CTableHeaderCell>
                  <CTableHeaderCell class="sortable" @click="sortBy('first_name')">
                    Name {{ getSortIcon('first_name') }}
                  </CTableHeaderCell>
                  <CTableHeaderCell class="sortable" @click="sortBy('email')">
                    Email {{ getSortIcon('email') }}
                  </CTableHeaderCell>
                  <CTableHeaderCell class="sortable" @click="sortBy('phone')">
                    Phone {{ getSortIcon('phone') }}
                  </CTableHeaderCell>
                  <CTableHeaderCell class="sortable" @click="sortBy('country')">
                    Country {{ getSortIcon('country') }}
                  </CTableHeaderCell>
                  <CTableHeaderCell class="sortable" @click="sortBy('roles')">
                    Role {{ getSortIcon('roles') }}
                  </CTableHeaderCell>
                  <CTableHeaderCell width="120">Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                <CTableRow v-for="user in paginatedUsers" :key="user.id" class="table-row">
                  <CTableDataCell>
                    <CAvatar 
                      :src="getUserImage(user?.photo)" 
                      size="md"
                      class="user-avatar"
                    />
                  </CTableDataCell>
                  <CTableDataCell>
                    <div class="d-flex align-items-center">
                      {{ user.first_name }} {{ user.other_name }} {{ user.last_name }}
                    </div>
                  </CTableDataCell>
                  <CTableDataCell>
                    <small class="text-muted">{{ user.email }}</small>
                  </CTableDataCell>
                  <CTableDataCell>
                    <small class="text-muted">{{ user.phone }}</small>
                  </CTableDataCell>
                  <CTableDataCell>
                    <small class="text-muted">{{ user.country }}</small>
                  </CTableDataCell>
                  <CTableDataCell>
                    <CBadge 
                      :color="getRoleColor(user.roles[0])" 
                      class="role-badge"
                    >
                      {{ user.roles[0]?.replace('_', ' ').toUpperCase() }}
                    </CBadge>
                  </CTableDataCell>
                  <CTableDataCell>
                    <div class="d-flex gap-1">
                      <CButton
                        size="sm"
                        color="info"
                        variant="outline"
                        title="Edit User"
                        @click="openEdit(user)"
                      >
                        <CIcon :icon="cilPencil" />
                      </CButton>
                      <CButton
                        size="sm"
                        color="danger"
                        variant="outline"
                        title="Delete User"
                        @click="confirmDelete(user.id, `${user.first_name} ${user.last_name}`)"
                      >
                        <CIcon :icon="cilTrash" />
                      </CButton>
                    </div>
                  </CTableDataCell>
                </CTableRow>
                <CTableRow v-if="paginatedUsers.length === 0">
                  <CTableDataCell colspan="7" class="text-center py-5">
                    <div class="empty-state">
                      <CIcon :icon="cilUser" style="font-size: 3rem;" class="text-muted mb-3" />
                      <h5 class="text-muted">No users found</h5>
                      <p class="text-muted mb-3">Try adjusting your search criteria or add a new user</p>
                      <CButton color="primary" @click="openCreate">
                        <CIcon :icon="cilUserPlus" class="me-1" />
                        Add Your First User
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
                  {{ Math.min(currentPage * itemsPerPage, filteredUsers.length) }} 
                  of {{ filteredUsers.length }} entries
                  <span v-if="filteredUsers.length !== userStore.users.length">
                    (filtered from {{ userStore.users.length }} total)
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
  <CModal :visible="showModal" @close="showModal = false" backdrop="static" size="xl">
    <CModalHeader class="border-bottom">
      <CModalTitle>
        <CIcon :icon="cilUser" class="me-2" />
        {{ isEditing ? 'Edit User' : 'Add New User' }}
      </CModalTitle>
    </CModalHeader>
    <CModalBody class="p-0">
      <CForm
        class="p-4"
        enctype="multipart/form-data"
        novalidate
        :validated="validated"
        @submit="handleSubmit"
      >
        <!-- Photo Upload Section -->
        <div class="row mb-4">
          <div class="col-md-12">
            <div class="d-flex align-items-center gap-3">
              <div class="current-photo">
                <CAvatar
                  v-if="isEditing && currentUser.photo && typeof currentUser.photo === 'string'"
                  :src="getUserImage(currentUser.photo)"
                  size="xl"
                />
                <CAvatar v-else size="xl">
                  <CIcon :icon="cilUser" size="xl" />
                </CAvatar>
              </div>
              <div class="flex-grow-1">
                <CFormLabel for="image" class="fw-semibold">Profile Photo</CFormLabel>
                <CFormInput
                  type="file"
                  id="image"
                  @change="(e) => (currentUser.image = e.target.files[0])"
                  accept="image/*"
                />
                <CButton 
                  v-if="isEditing && currentUser.photo && typeof currentUser.photo === 'string'" 
                  color="danger" 
                  variant="outline"
                  size="sm" 
                  @click="removeImage"
                  class="mt-2"
                >
                  <CIcon :icon="cilTrash" class="me-1" />
                  Remove Photo
                </CButton>
              </div>
            </div>
          </div>
        </div>

        <!-- Form Fields -->
        <CRow class="g-3">
          <CCol md="4">
            <CFormLabel for="first_name" class="fw-semibold">
              First Name <span style="color: red;">*</span>
            </CFormLabel>
            <CFormInput 
              id="first_name" 
              v-model="currentUser.first_name" 
              required 
              placeholder="Enter first name"
            />
            <CFormFeedback invalid>First name is required.</CFormFeedback>
          </CCol>

          <CCol md="4">
            <CFormLabel for="other_name" class="fw-semibold">Other Name</CFormLabel>
            <CFormInput 
              id="other_name" 
              v-model="currentUser.other_name" 
              placeholder="Enter other name (optional)"
            />
          </CCol>

          <CCol md="4">
            <CFormLabel for="last_name" class="fw-semibold">
              Last Name <span style="color: red;">*</span>
            </CFormLabel>
            <CFormInput 
              id="last_name" 
              v-model="currentUser.last_name" 
              required 
              placeholder="Enter last name"
            />
            <CFormFeedback invalid>Last name is required.</CFormFeedback>
          </CCol>

          <CCol md="6">
            <CFormLabel for="email" class="fw-semibold">
              Email Address <span style="color: red;">*</span>
            </CFormLabel>
            <CFormInput 
              id="email" 
              v-model="currentUser.email" 
              type="email"
              required 
              placeholder="Enter email address"
            />
            <CFormFeedback invalid>Please provide a valid email address.</CFormFeedback>
          </CCol>

          <CCol md="6">
            <CFormLabel for="phone" class="fw-semibold">Phone Number</CFormLabel>
            <CFormInput 
              id="phone" 
              v-model="currentUser.phone" 
              placeholder="Enter phone number"
            />
          </CCol>

          <CCol md="6">
            <CFormLabel for="roles" class="fw-semibold">
              User Role <span style="color: red;">*</span>
            </CFormLabel>
            <CFormSelect
              id="roles"
              v-model="currentUser.roles"
              required
            >
              <option value="">Select Role</option>
              <option value="superadmin">Superadmin</option>
              <option value="managing_director">Manager</option>
              <option value="accountant">Accountant</option>
              <option value="agronomist">Agronomist</option>
              <option value="veterinarian">Veterinarian</option>
            </CFormSelect>
            <CFormFeedback invalid>Please select a user role.</CFormFeedback>
          </CCol>

          <CCol md="6">
            <CFormLabel for="country" class="fw-semibold">Country</CFormLabel>
            <Multiselect
              v-model="currentUser.country"
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
          </CCol>

          <CCol md="12">
            <CFormLabel for="address" class="fw-semibold">Address</CFormLabel>
            <CFormTextarea 
              id="address" 
              v-model="currentUser.address" 
              rows="3"
              placeholder="Enter address"
            />
          </CCol>

          <CCol md="12">
            <CFormLabel for="password" class="fw-semibold">
              {{ isEditing ? 'New Password' : 'Password' }}
              <span v-if="!isEditing" style="color: red;">*</span>
            </CFormLabel>
            <CFormInput 
              id="password" 
              v-model="currentUser.password" 
              type="password"
              :required="!isEditing"
              :placeholder="isEditing ? 'Leave blank to keep current password' : 'Enter password'"
            />
            <CFormFeedback invalid>Password is required.</CFormFeedback>
            <small v-if="isEditing" class="text-muted">Leave blank if you don't want to change the password</small>
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
        <CIcon v-else :icon="isEditing ? cilPencil : cilUserPlus" class="me-2" />
        {{ isEditing ? 'Update User' : 'Create User' }}
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

/* User Avatar */
.user-avatar {
  border: 2px solid #e9ecef;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Role Badge */
.role-badge {
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

.current-photo {
  position: relative;
}

/* Photo Upload */
.current-photo .c-avatar {
  border: 3px solid #e9ecef;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
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