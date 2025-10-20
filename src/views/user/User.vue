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
import { cilPencil, cilTrash, cilUser, cilSearch, cilUserPlus, cilFilter, cilCloudDownload } from '@coreui/icons'
import CIcon from '@coreui/icons-vue'
import Multiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.css'
import Swal from 'sweetalert2'
import avatar from '@/assets/images/avatars/8.jpg'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const countryStore = useCountryStore()
const router = useRouter()

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

// Filtered & sorted users
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

  filtered.sort((a, b) => {
    let aValue = a[sortField.value]
    let bValue = b[sortField.value]

    if (sortField.value === 'roles') {
      aValue = a.roles[0] || ''
      bValue = b.roles[0] || ''
    }

    aValue = String(aValue || '').toLowerCase()
    bValue = String(bValue || '').toLowerCase()

    if (sortOrder.value === 'asc') return aValue.localeCompare(bValue)
    else return bValue.localeCompare(aValue)
  })

  return filtered
})

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredUsers.value.length / itemsPerPage.value))
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
  const countryObj = countries.value.find(c => c.value === user.country || c.label === user.country)
  currentUser.value.country = countryObj || ''
  showModal.value = true
}

const confirmDelete = async (id, name) => {
  Swal.fire({
    html: `<h3>Are you sure to delete ${name}?</h3>`,
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

const removeImage = () => {
  currentUser.value.photo = null
}

function getUserImage(imageUrl) {
  return imageUrl ? `${import.meta.env.VITE_API_BASE_URL}/${imageUrl}` : avatar
}

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

const exportPDF = () => {
  console.log('Export PDF functionality to be implemented')
}
</script>

<template>
  <div class="position-relative">
    <div v-if="loading" class="loading-overlay">
      <CSpinner color="primary" variant="grow" />
    </div>

    <CCol cols="12">
      <CBreadcrumb class="mb-4">
        <CBreadcrumbItem>
          <router-link to="/dashboard">Dashboard</router-link>
        </CBreadcrumbItem>
        <CBreadcrumbItem>
          <router-link to="/admin">Administration</router-link>
        </CBreadcrumbItem>
        <CBreadcrumbItem active>Users</CBreadcrumbItem>
      </CBreadcrumb>

      <CCard class="shadow-sm border-0">
        <CCardHeader class="bg-white border-bottom d-flex justify-content-between align-items-center">
          <h5 class="mb-1">Users</h5>
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
        </CCardHeader>

        <CCardBody class="p-0">
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
                <CTableRow v-for="user in paginatedUsers" :key="user.id">
                  <CTableDataCell>
                    <CAvatar :src="getUserImage(user?.photo)" size="md" />
                  </CTableDataCell>
                  <CTableDataCell>
                    <router-link :to="'/users/' + user.id">
                      {{ user.first_name }} {{ user.other_name }} {{ user.last_name }}
                    </router-link>
                  </CTableDataCell>
                  <CTableDataCell>{{ user.email }}</CTableDataCell>
                  <CTableDataCell>{{ user.phone }}</CTableDataCell>
                  <CTableDataCell>{{ user.country }}</CTableDataCell>
                  <CTableDataCell>
                    <CBadge :color="getRoleColor(user.roles[0])">
                      {{ user.roles[0]?.replace('_', ' ').toUpperCase() }}
                    </CBadge>
                  </CTableDataCell>
                  <CTableDataCell>
                    <CButton size="sm" color="info" variant="outline" @click="openEdit(user)">
                      <CIcon :icon="cilPencil" />
                    </CButton>
                    <CButton size="sm" color="danger" variant="outline" @click="confirmDelete(user.id, user.first_name + ' ' + user.last_name)">
                      <CIcon :icon="cilTrash" />
                    </CButton>
                  </CTableDataCell>
                </CTableRow>
                <CTableRow v-if="paginatedUsers.length === 0">
                  <CTableDataCell colspan="7" class="text-center py-5">
                    <div class="empty-state">
                      <CIcon :icon="cilUser" style="font-size: 3rem;" class="text-muted mb-3" />
                      <h5 class="text-muted">No users found</h5>
                    </div>
                  </CTableDataCell>
                </CTableRow>
              </CTableBody>
            </CTable>
          </div>
        </CCardBody>
      </CCard>
    </CCol>
  </div>
</template>

<style scoped>
/* Keep all your previous styles for table, modal, avatar, etc. */
</style>
