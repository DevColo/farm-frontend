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
  CFormCheck,
  CFormFeedback,
  CAvatar,
  CBadge,
  CInputGroup,
  CInputGroupText,
} from '@coreui/vue'
import { cilPencil, cilTrash, cilUser, cilSearch, cilUserPlus, cilFilter } from '@coreui/icons'
import Multiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.css'
import avatar from '@/assets/images/avatars/8.jpg'

const userStore = useUserStore()
const countryStore = useCountryStore()

const showModal = ref(false)
const isEditing = ref(false)
const validated = ref(false)
const showFilters = ref(false)
const editingId = ref(null)

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

// Fetch data on mount
onMounted(() => { 
  userStore.fetchUsers()
  countryStore.fetchCountries() 
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

// search & pagination
const searchQuery = ref('')
const itemsPerPage = ref(10)
const currentPage = ref(1)
const roleFilter = ref('')

const filteredUsers = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  return userStore.users.filter((c) => {
    const matchesQuery =
      !q ||
      [c.first_name, c.other_name, c.last_name, c.phone, c.email].some((f) =>
        f?.toLowerCase().includes(q),
      )
    const matchesRole = !roleFilter.value || c.roles[0] === roleFilter.value
    return matchesQuery && matchesRole
  })
})

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredUsers.value.length / itemsPerPage.value)),
)
const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredUsers.value.slice(start, start + itemsPerPage.value)
})

const userStats = computed(() => {
  const total = userStore.users.length
  const roles = userStore.users.reduce((acc, user) => {
    const role = user.roles[0] || 'Unknown'
    acc[role] = (acc[role] || 0) + 1
    return acc
  }, {})
  return { total, roles }
})

function nextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++
}
function prevPage() {
  if (currentPage.value > 1) currentPage.value--
}
function resetPage() {
  currentPage.value = 1
}

// modal handlers
function openCreate() {
  isEditing.value = false
  validated.value = false
  editingId.value = null
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
  editingId.value = user.id
  currentUser.value = { ...user }
  // Set country as the object from countries array for Multiselect
  const countryObj = countries.value.find(c => c.value === user.country || c.label === user.country)
  currentUser.value.country = countryObj || ''
  showModal.value = true
}

function confirmDelete(id) {
  if (confirm('Are you sure you want to delete this user?')) {
    userStore.deleteCow(id)
  }
}

async function handleSubmit(e) {
  const form = e.currentTarget
  if (!form.checkValidity()) {
    e.preventDefault()
    e.stopPropagation()
    validated.value = true
    return
  }
  e.preventDefault()
  const payload = {
    first_name: currentUser.value.first_name,
    other_name: currentUser.value.other_name,
    last_name: currentUser.value.last_name,
    phone: currentUser.value.phone,
    email: currentUser.value.email,
    address: currentUser.value.address,
    roles: currentUser.value.roles,
    country: currentUser.value.country.value,
    image: currentUser.value.image,
    password: currentUser.value.password,
    ...(currentUser.value.password ? { password: currentUser.value.password } : {}),
  }

  if (isEditing.value) {
    payload.id = editingId.value
    await userStore.updateUser(payload)
  } else {
    await userStore.createUser(payload)
  }
  showModal.value = false
  userStore.fetchUsers()
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

// Clear filters
function clearFilters() {
  searchQuery.value = ''
  roleFilter.value = ''
  resetPage()
}
</script>

<template>
  <div class="user-management-container">
    <!-- Header Section with Stats -->
    <CRow class="mb-4">
      <CCol :xs="12">
        <div class="page-header">
          <div class="header-content">
            <h1 class="page-title">
              User Management
            </h1>
            <p class="page-subtitle">Manage your system users and their roles</p>
          </div>
          <div class="header-actions">
            <CButton 
              color="primary" 
              class="create-btn"
              @click="openCreate"
            >
              <CIcon :icon="cilUserPlus" class="me-2" />
              Add New User
            </CButton>
          </div>
        </div>
      </CCol>
    </CRow>

    <!-- Stats Cards -->
    <!-- <CRow class="mb-4">
      <CCol :md="3" :sm="6" class="mb-3">
        <CCard class="stats-card stats-card-primary">
          <CCardBody class="stats-card-body">
            <div class="stats-icon">
              <CIcon :icon="cilUser" />
            </div>
            <div class="stats-content">
              <h3 class="stats-number">{{ userStats.total }}</h3>
              <p class="stats-label">Total Users</p>
            </div>
          </CCardBody>
        </CCard>
      </CCol>
      <CCol :md="3" :sm="6" class="mb-3" v-for="(count, role) in userStats.roles" :key="role">
        <CCard class="stats-card">
          <CCardBody class="stats-card-body">
            <div class="stats-icon secondary">
              <CIcon :icon="cilUser" />
            </div>
            <div class="stats-content">
              <h3 class="stats-number">{{ count }}</h3>
              <p class="stats-label">{{ role.charAt(0).toUpperCase() + role.slice(1) }}</p>
            </div>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow> -->

    <!-- Main Content Card -->
    <CRow>
      <CCol :xs="12">
        <CCard class="main-content-card">
          <CCardHeader class="modern-card-header">
            <div class="header-left">
              <h5 class="card-title">
                <CIcon :icon="cilUser" class="me-2" />
                Users List
              </h5>
              <span class="record-count">{{ filteredUsers.length }} users found</span>
            </div>
            <div class="header-right">
              <CButton 
                color="light" 
                variant="outline"
                size="sm"
                @click="showFilters = !showFilters"
                class="filter-toggle-btn me-2"
              >
                <CIcon :icon="cilFilter" class="me-1" />
                {{ showFilters ? 'Hide' : 'Show' }} Filters
              </CButton>
            </div>
          </CCardHeader>

          <CCardBody>
            <!-- Filters Section -->
            <div v-show="showFilters" class="filters-section">
              <CRow class="g-3 mb-4">
                <CCol :md="4">
                  <CFormLabel class="filter-label">Search Users</CFormLabel>
                  <CInputGroup>
                    <CInputGroupText>
                      <CIcon :icon="cilSearch" />
                    </CInputGroupText>
                    <CFormInput
                      v-model="searchQuery"
                      placeholder="Search by name, phone, or email..."
                      @input="resetPage"
                      class="search-input"
                    />
                  </CInputGroup>
                </CCol>
                <CCol :md="3">
                  <CFormLabel class="filter-label">Filter by Role</CFormLabel>
                  <CFormSelect
                    v-model="roleFilter"
                    @change="resetPage"
                    class="role-filter"
                  >
                    <option value="">All Roles</option>
                    <option value="superadmin">Superadmin</option>
                    <option value="managing_director">Manager</option>
                    <option value="accountant">Accountant</option>
                    <option value="agronomist">Agronomist</option>
                    <option value="veterinarian">Veterinarian</option>
                  </CFormSelect>
                </CCol>
                <CCol :md="2">
                  <CFormLabel class="filter-label">Show</CFormLabel>
                  <CFormSelect v-model="itemsPerPage" @change="resetPage">
                    <option :value="10">10</option>
                    <option :value="25">25</option>
                    <option :value="50">50</option>
                    <option :value="100">100</option>
                  </CFormSelect>
                </CCol>
                <CCol :md="3" class="d-flex align-items-end">
                  <CButton 
                    color="light" 
                    variant="outline"
                    @click="clearFilters"
                    class="clear-filters-btn"
                  >
                    Clear Filters
                  </CButton>
                </CCol>
              </CRow>
            </div>

            <!-- Users Table -->
            <div class="table-container">
              <CTable hover responsive class="modern-table">
                <CTableHead class="table-header">
                  <CTableRow>
                    <CTableHeaderCell class="avatar-col">User</CTableHeaderCell>
                    <CTableHeaderCell>Full Name</CTableHeaderCell>
                    <CTableHeaderCell>Country</CTableHeaderCell>
                    <CTableHeaderCell>Phone</CTableHeaderCell>
                    <CTableHeaderCell>Role</CTableHeaderCell>
                    <CTableHeaderCell>Status</CTableHeaderCell>
                    <CTableHeaderCell class="action-col">Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  <CTableRow v-for="user in paginatedUsers" :key="user.id" class="table-row">
                    <CTableDataCell class="avatar-cell">
                      <CAvatar 
                        :src="getUserImage(user?.photo)" 
                        size="md"
                        class="user-avatar"
                      />
                    </CTableDataCell>
                    <CTableDataCell class="name-cell">
                      <div class="user-name">
                        {{ user.first_name }} {{ user.other_name }} {{ user.last_name }}
                      </div>
                    </CTableDataCell>
                    <CTableDataCell class="name-cell">
                      <div class="user-email">{{ user.country }}</div>
                    </CTableDataCell>
                    <CTableDataCell class="name-cell">
                      <div class="user-email">{{ user.phone }}</div>
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
                      <CBadge color="success" class="status-badge">
                        Active
                      </CBadge>
                    </CTableDataCell>
                    <CTableDataCell class="action-cell">
                      <div class="action-buttons">
                        <CButton
                          size="sm"
                          color="primary"
                          variant="outline"
                          class="action-btn edit-btn"
                          title="Edit User"
                          @click="openEdit(user)"
                        >
                          <CIcon :icon="cilPencil" />
                        </CButton>
                        <CButton
                          size="sm"
                          color="danger"
                          variant="outline"
                          class="action-btn delete-btn"
                          title="Delete User"
                          @click="confirmDelete(user.id)"
                        >
                          <CIcon :icon="cilTrash" />
                        </CButton>
                      </div>
                    </CTableDataCell>
                  </CTableRow>
                  <CTableRow v-if="paginatedUsers.length === 0">
                    <CTableDataCell colspan="6" class="empty-state">
                      <div class="empty-content">
                        <CIcon :icon="cilUser" class="empty-icon" />
                        <h4>No Users Found</h4>
                        <p>{{ searchQuery || roleFilter ? 'Try adjusting your filters' : 'Start by creating your first user' }}</p>
                        <CButton v-if="!searchQuery && !roleFilter" color="primary" @click="openCreate">
                          <CIcon :icon="cilUserPlus" class="me-2" />
                          Add First User
                        </CButton>
                      </div>
                    </CTableDataCell>
                  </CTableRow>
                </CTableBody>
              </CTable>
            </div>

            <!-- Pagination -->
            <div class="pagination-section" v-if="totalPages > 1">
              <div class="pagination-info">
                <span>
                  Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to 
                  {{ Math.min(currentPage * itemsPerPage, filteredUsers.length) }} 
                  of {{ filteredUsers.length }} entries
                </span>
              </div>
              <div class="pagination-controls">
                <CButton 
                  variant="outline" 
                  color="primary"
                  :disabled="currentPage === 1" 
                  @click="prevPage"
                  class="pagination-btn"
                >
                  Previous
                </CButton>
                <div class="page-numbers">
                  <span class="current-page">{{ currentPage }}</span>
                  <span class="page-separator">of</span>
                  <span class="total-pages">{{ totalPages }}</span>
                </div>
                <CButton 
                  variant="outline" 
                  color="primary"
                  :disabled="currentPage === totalPages" 
                  @click="nextPage"
                  class="pagination-btn"
                >
                  Next
                </CButton>
              </div>
            </div>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  </div>

  <!-- Enhanced Create/Edit Modal -->
  <CModal :visible="showModal" @close="showModal = false" backdrop="static" size="xl" class="user-modal">
    <CModalHeader class="modal-header-custom">
      <CModalTitle class="modal-title-custom">
        <CIcon :icon="isEditing ? cilPencil : cilUserPlus" class="me-2" />
        {{ isEditing ? 'Edit User' : 'Create New User' }}
      </CModalTitle>
    </CModalHeader>
    <CModalBody class="modal-body-custom">
      <CForm
        class="user-form needs-validation"
        enctype="multipart/form-data"
        novalidate
        :validated="validated"
        @submit="handleSubmit"
      >
        <!-- Photo Upload Section -->
        <div class="photo-upload-section mb-4">
          <div class="current-photo">
            <img
              v-if="isEditing && currentUser.photo && typeof currentUser.photo === 'string'"
              :src="getUserImage(currentUser.photo)"
              class="preview-image"
              alt="User Photo"
            />
            <div v-else class="no-photo-placeholder">
              <CIcon :icon="cilUser"/>
            </div>
          </div>
          <div class="photo-controls">
            <CFormLabel for="image" class="form-label-custom">Profile Photo</CFormLabel>
            <CFormInput
              type="file"
              id="image"
              @change="(e) => (currentUser.image = e.target.files[0])"
              accept="image/*"
              class="file-input-custom"
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

        <!-- Form Fields -->
        <CRow class="g-3">
          <CCol :md="4">
            <CFormLabel for="first_name" class="form-label-custom">First Name *</CFormLabel>
            <CFormInput 
              id="first_name" 
              v-model="currentUser.first_name" 
              required 
              class="form-input-custom"
              placeholder="Enter first name"
            />
            <CFormFeedback invalid>First Name is required.</CFormFeedback>
          </CCol>

          <CCol :md="4">
            <CFormLabel for="other_name" class="form-label-custom">Other Name</CFormLabel>
            <CFormInput 
              id="other_name" 
              v-model="currentUser.other_name" 
              class="form-input-custom"
              placeholder="Enter other name (optional)"
            />
          </CCol>

          <CCol :md="4">
            <CFormLabel for="last_name" class="form-label-custom">Last Name *</CFormLabel>
            <CFormInput 
              id="last_name" 
              v-model="currentUser.last_name" 
              required 
              class="form-input-custom"
              placeholder="Enter last name"
            />
            <CFormFeedback invalid>Last name is required.</CFormFeedback>
          </CCol>

          <CCol :md="6">
            <CFormLabel for="email" class="form-label-custom">Email Address *</CFormLabel>
            <CFormInput 
              id="email" 
              v-model="currentUser.email" 
              type="email"
              required 
              class="form-input-custom"
              placeholder="Enter email address"
            />
            <CFormFeedback invalid>Please provide a valid email address.</CFormFeedback>
          </CCol>

          <CCol :md="6">
            <CFormLabel for="phone" class="form-label-custom">Phone Number</CFormLabel>
            <CFormInput 
              id="phone" 
              v-model="currentUser.phone" 
              class="form-input-custom"
              placeholder="Enter phone number"
            />
          </CCol>

          <CCol :md="6">
            <CFormLabel for="roles" class="form-label-custom">User Role *</CFormLabel>
            <CFormSelect
              id="roles"
              v-model="currentUser.roles"
              required
              class="form-input-custom"
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

          <CCol :md="6">
            <CFormLabel for="country" class="form-label-custom">Country</CFormLabel>
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
              class="country-select"
            />
          </CCol>

          <CCol :md="12">
            <CFormLabel for="address" class="form-label-custom">Address</CFormLabel>
            <CFormTextarea 
              id="address" 
              v-model="currentUser.address" 
              rows="3"
              class="form-input-custom"
              placeholder="Enter address"
            />
          </CCol>

          <CCol :md="12">
            <CFormLabel for="password" class="form-label-custom">
              {{ isEditing ? 'New Password' : 'Password *' }}
            </CFormLabel>
            <CFormInput 
              id="password" 
              v-model="currentUser.password" 
              type="password"
              :required="!isEditing"
              class="form-input-custom"
              :placeholder="isEditing ? '' : 'Enter password'"
            />
            <CFormFeedback invalid>Password is required.</CFormFeedback>
            <small v-if="isEditing" class="text-muted">Leave blank if you don't want to change the password</small>
          </CCol>
        </CRow>

        <!-- Modal Footer -->
        <div class="modal-footer-custom mt-3">
          <CButton 
            color="primary" 
            type="submit"
            class="modal-btn-submit"
          >
            {{ isEditing ? 'Update User' : 'Create User' }}
          </CButton>
        </div>
      </CForm>
    </CModalBody>
  </CModal>
</template>

<style scoped>

</style>