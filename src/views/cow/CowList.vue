<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useCowStore } from '@/stores/cow.store'
import { usePastureStore } from '@/stores/pasture.store'
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
import { cilPencil, cilTrash, cilPlus, cilCloudDownload, cilFile, cilSearch, cilFilter } from '@coreui/icons'
import defaultCowImage from '@/assets/images/default-cow.jpg'
import Multiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.css'

const cowStore = useCowStore()
const pastureStore = usePastureStore()

const showModal = ref(false)
const isEditing = ref(false)
const validated = ref(false)
const activeTab = ref('details')
const loading = ref(false)
const showFilters = ref(false)

const currentCow = ref({
  id: null,
  name: '',
  ear_tag: '',
  date_of_birth: '',
  class: '',
  gender: '',
  breed: '',
  from_farm: '',
  source_location: '',
  description: '',
  pasture_id: '',
  status: true,
  image: null,
})

const currentCowParent = ref({
  mother_id: '',
  father_id: '',
})

const isFromFarm = computed(() => currentCow.value.from_farm === 'yes')

// Enhanced search and filter states
const searchQuery = ref('')
const filterYear = ref('')
const filterGender = ref('')
const filterBreed = ref('')
const filterPasture = ref('')
const filterStatus = ref('')
const itemsPerPage = ref(10)
const currentPage = ref(1)
const sortField = ref('name')
const sortOrder = ref('asc')

// fetch data
onMounted(async () => {
  loading.value = true
  try {
    await Promise.all([
      cowStore.fetchCows(),
      pastureStore.fetchPastures(),
      cowStore.loadParentOptions()
    ])
  } finally {
    loading.value = false
  }
})

// Generate filter options
const availableYears = computed(() => {
  const years = cowStore.cows.map((cow) => new Date(cow.date_of_birth).getFullYear())
  return Array.from(new Set(years)).sort((a, b) => b - a)
})

const availableGenders = computed(() => {
  const genders = cowStore.cows.map(cow => cow.gender).filter(Boolean)
  return Array.from(new Set(genders))
})

const availableBreeds = computed(() => {
  const breeds = cowStore.cows.map(cow => cow.breed).filter(Boolean)
  return Array.from(new Set(breeds))
})

const availablePastures = computed(() => {
  return pastureStore.pastures.map(p => ({ id: p.id, name: p.pasture }))
})

// Enhanced filtering and sorting
const filteredCows = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  let filtered = cowStore.cows.filter((cow) => {
    const matchesQuery = !q || [cow.name, cow.ear_tag, cow.breed].some((field) => 
      field?.toLowerCase().includes(q)
    )
    const matchesYear = !filterYear.value || 
      new Date(cow.date_of_birth).getFullYear() === parseInt(filterYear.value)
    const matchesGender = !filterGender.value || cow.gender === filterGender.value
    const matchesBreed = !filterBreed.value || cow.breed === filterBreed.value
    const matchesPasture = !filterPasture.value || cow.pasture?.id === parseInt(filterPasture.value)
    const matchesStatus = !filterStatus.value || 
      (filterStatus.value === 'active' && cow.status === '1') ||
      (filterStatus.value === 'inactive' && cow.status === '0')
    
    return matchesQuery && matchesYear && matchesGender && matchesBreed && matchesPasture && matchesStatus
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
  Math.max(1, Math.ceil(filteredCows.value.length / itemsPerPage.value))
)

const paginatedCows = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredCows.value.slice(start, start + itemsPerPage.value)
})

// Statistics
const stats = computed(() => {
  const total = cowStore.cows.length
  const active = cowStore.cows.filter(c => c.status === '1').length
  const male = cowStore.cows.filter(c => c.gender === 'Male').length
  const female = cowStore.cows.filter(c => c.gender === 'Female').length
  
  return { total, active, inactive: total - active, male, female }
})

// Helper functions
function calculateAge(dateStr) {
  if (!dateStr) return 0
  const dob = new Date(dateStr)
  const now = new Date()
  return Math.floor((now - dob) / (365.25 * 24 * 60 * 60 * 1000))
}

function calculateAgeAndClass(dateStr, cow) {
  if (!dateStr) return { age: '—', ageClass: '—' }

  const dob = new Date(dateStr)
  const now = new Date()
  let months = (now.getFullYear() - dob.getFullYear()) * 12 + (now.getMonth() - dob.getMonth())

  if (now.getDate() < dob.getDate()) months--

  const years = Math.floor(months / 12)
  const remainingMonths = months % 12

  let ageString = ''
  if (years > 0) ageString += `${years}y`
  if (remainingMonths > 0) {
    if (ageString) ageString += ' '
    ageString += `${remainingMonths} months`
  }
  if (!ageString) ageString = 'less than 1 month'

  const ageClass =
    months >= 1 && months <= 11
      ? 'Calf'
      : months >= 12 && months < 23
      ? 'Yearling'
      : cow.gender === 'Female' && !cow.has_given_birth
      ? 'Heifer'
      : 'Adult'

  return { age: ageString, ageClass }
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

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
  filterYear.value = ''
  filterGender.value = ''
  filterBreed.value = ''
  filterPasture.value = ''
  filterStatus.value = ''
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
  activeTab.value = 'details'
  currentCow.value = {
    id: null,
    name: '',
    ear_tag: '',
    date_of_birth: '',
    class: '',
    gender: '',
    breed: '',
    from_farm: '',
    source_location: '',
    description: '',
    pasture_id: '',
    status: true,
    image: null,
  }
  currentCowParent.value = {
    mother_id: '',
    father_id: '',
  }
  showModal.value = true
}

function openEdit(cow) {
  isEditing.value = true
  validated.value = false
  activeTab.value = 'details'
  currentCow.value = { ...cow, status: cow.status === '1' }
  currentCowParent.value = {
    mother_id: cow.parent?.mother_id || '',
    father_id: cow.parent?.father_id || '',
  }
  currentCow.value.date_of_birth = cow.date_of_birth ? cow.date_of_birth.split('T')[0] : ''
  showModal.value = true
}

async function confirmDelete(id, name) {
  if (confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
    loading.value = true
    try {
      await cowStore.deleteCow(id)
    } finally {
      loading.value = false
    }
  }
}

// Form handling
const isActive = computed({
  get: () => currentCow.value.status === '1' || currentCow.value.status === true,
  set: (v) => {
    currentCow.value.status = v ? '1' : '0'
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
      name: currentCow.value.name,
      ear_tag: currentCow.value.ear_tag,
      date_of_birth: currentCow.value.date_of_birth,
      class: currentCow.value.class,
      gender: currentCow.value.gender,
      breed: currentCow.value.breed,
      from_farm: currentCow.value.from_farm,
      source_location: currentCow.value.from_farm === 'no' ? currentCow.value.source_location : '',
      description: currentCow.value.description,
      pasture_id: currentCow.value.pasture_id,
      status: currentCow.value.status ? '1' : '0',
      image: currentCow.value.image,
      mother_id: currentCowParent.value.mother_id,
      father_id: currentCowParent.value.father_id,
    }
    
    if (isEditing.value) {
      const res = await cowStore.editCow(currentCow.value.id, payload)
      if(res == 1){
        showModal.value = false
      }
    } else {
      const res = await cowStore.createCow(payload)
      if(res == 1){
        showModal.value = false
      }
    }
  } finally {
    loading.value = false
  }
}

// Export functions
async function exportPDF() {
  loading.value = true
  try {
    const { default: jsPDF } = await import('jspdf')
    const autoTable = (await import('jspdf-autotable')).default

    const doc = new jsPDF()

    // Header
    doc.setFontSize(18)
    doc.setFont(undefined, 'bold')
    doc.text('Cattle Management System', 105, 15, { align: 'center' })
    doc.setFontSize(14)
    doc.setFont(undefined, 'normal')
    doc.text('Cow Inventory Report', 105, 23, { align: 'center' })
    
    // Summary stats
    doc.setFontSize(10)
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 35)
    doc.text(`Total Records: ${filteredCows.value.length}`, 14, 42)

    autoTable(doc, {
      startY: 50,
      head: [['Name', 'Ear Tag', 'DOB', 'Age', 'Gender', 'Class', 'Breed', 'Pasture', 'Status']],
      body: filteredCows.value.map((cow) => {
        const { age, ageClass } = calculateAgeAndClass(cow.date_of_birth, cow)
        return [
          cow.name,
          cow.ear_tag,
          formatDate(cow.date_of_birth),
          age,
          cow.gender,
          cow.class || ageClass,
          cow.breed,
          cow.pasture?.pasture || '—',
          cow.status === '1' ? 'Active' : 'Inactive'
        ]
      }),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [52, 152, 219] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    })
    
    doc.save(`cow-inventory-${new Date().toISOString().split('T')[0]}.pdf`)
  } finally {
    loading.value = false
  }
}

function exportCSV() {
  const headers = ['Name', 'Ear Tag', 'DOB', 'Age', 'Gender', 'Class', 'Breed', 'Pasture', 'Status']
  const rows = filteredCows.value.map((cow) => {
    const { age, ageClass } = calculateAgeAndClass(cow.date_of_birth, cow)
    return [
      cow.name,
      cow.ear_tag,
      cow.date_of_birth,
      age,
      cow.gender,
      cow.class || ageClass,
      cow.breed,
      cow.pasture?.pasture || '',
      cow.status === '1' ? 'Active' : 'Inactive'
    ]
  })

  const csvContent = [headers, ...rows]
    .map((row) => row.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(','))
    .join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `cow-inventory-${new Date().toISOString().split('T')[0]}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Image handling
function getCowImage(imageUrl) {
  return `${import.meta.env.VITE_API_BASE_URL}/${imageUrl.replace(/\\/g, '/')}` || defaultCowImage
}

function removeImage() {
  currentCow.value.image = null
}

// Watch for changes
watch([searchQuery, filterYear, filterGender, filterBreed, filterPasture, filterStatus], () => {
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
      <!-- Statistics Cards -->
      <CCol cols="12">
        <CRow class="g-3 mb-4">
          <CCol md="2" sm="4" cols="6">
            <CCard class="stat-card border-0 shadow-sm">
              <CCardBody class="text-center py-3">
                <div class="stat-number h4 mb-0 text-primary">{{ stats.total }}</div>
                <div class="stat-label text-muted small">Total Cows</div>
              </CCardBody>
            </CCard>
          </CCol>
          <CCol md="2" sm="4" cols="6">
            <CCard class="stat-card border-0 shadow-sm">
              <CCardBody class="text-center py-3">
                <div class="stat-number h4 mb-0 text-success">{{ stats.active }}</div>
                <div class="stat-label text-muted small">Active</div>
              </CCardBody>
            </CCard>
          </CCol>
          <CCol md="2" sm="4" cols="6">
            <CCard class="stat-card border-0 shadow-sm">
              <CCardBody class="text-center py-3">
                <div class="stat-number h4 mb-0 text-danger">{{ stats.inactive }}</div>
                <div class="stat-label text-muted small">Inactive</div>
              </CCardBody>
            </CCard>
          </CCol>
          <CCol md="2" sm="4" cols="6">
            <CCard class="stat-card border-0 shadow-sm">
              <CCardBody class="text-center py-3">
                <div class="stat-number h4 mb-0 text-info">{{ stats.female }}</div>
                <div class="stat-label text-muted small">Female</div>
              </CCardBody>
            </CCard>
          </CCol>
          <CCol md="2" sm="4" cols="6">
            <CCard class="stat-card border-0 shadow-sm">
              <CCardBody class="text-center py-3">
                <div class="stat-number h4 mb-0 text-warning">{{ stats.male }}</div>
                <div class="stat-label text-muted small">Male</div>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CCol>

      <!-- Main Table Card -->
      <CCol cols="12">
        <CCard class="shadow-sm border-0">
          <!-- Enhanced Header -->
          <CCardHeader class="bg-white border-bottom">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h5 class="mb-1">
                  <i class="fas fa-list-ul me-2 text-primary"></i>Cows
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
                  <CIcon :icon="cilPlus" class="me-1" />Add New Cow
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
                        placeholder="Search by name, ear tag, or breed..."
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
                    <CFormSelect v-model="filterYear" @change="resetPage">
                      <option value="">All Years</option>
                      <option v-for="year in availableYears" :key="year" :value="year">
                        {{ year }}
                      </option>
                    </CFormSelect>
                  </div>
                  <div class="col-md-2">
                    <CFormSelect v-model="filterGender" @change="resetPage">
                      <option value="">All Genders</option>
                      <option v-for="gender in availableGenders" :key="gender" :value="gender">
                        {{ gender }}
                      </option>
                    </CFormSelect>
                  </div>
                  <div class="col-md-2">
                    <CFormSelect v-model="filterBreed" @change="resetPage">
                      <option value="">All Breeds</option>
                      <option v-for="breed in availableBreeds" :key="breed" :value="breed">
                        {{ breed }}
                      </option>
                    </CFormSelect>
                  </div>
                  <div class="col-md-2">
                    <CFormSelect v-model="filterPasture" @change="resetPage">
                      <option value="">All Pastures</option>
                      <option v-for="pasture in availablePastures" :key="pasture.id" :value="pasture.id">
                        {{ pasture.name }}
                      </option>
                    </CFormSelect>
                  </div>
                  <div class="col-md-2">
                    <CFormSelect v-model="filterStatus" @change="resetPage">
                      <option value="">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
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
                      Name {{ getSortIcon('name') }}
                    </CTableHeaderCell>
                    <CTableHeaderCell class="sortable" @click="sortBy('ear_tag')">
                      Ear Tag {{ getSortIcon('ear_tag') }}
                    </CTableHeaderCell>
                    <CTableHeaderCell class="sortable" @click="sortBy('age')">
                      Age {{ getSortIcon('age') }}
                    </CTableHeaderCell>
                    <CTableHeaderCell class="sortable" @click="sortBy('gender')">
                      Gender {{ getSortIcon('gender') }}
                    </CTableHeaderCell>
                    <CTableHeaderCell class="sortable" @click="sortBy('class')">
                      Class {{ getSortIcon('class') }}
                    </CTableHeaderCell>
                    <CTableHeaderCell class="sortable" @click="sortBy('breed')">
                      Breed {{ getSortIcon('breed') }}
                    </CTableHeaderCell>
                    <CTableHeaderCell class="sortable" @click="sortBy('pasture')">
                      Pasture {{ getSortIcon('pasture') }}
                    </CTableHeaderCell>
                    <CTableHeaderCell>Status</CTableHeaderCell>
                    <CTableHeaderCell width="120">Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  <CTableRow v-for="cow in paginatedCows" :key="cow.id" class="table-row">
                    <CTableDataCell>
                      <router-link :to="`/cows/${cow.id}`" class="text-decoration-none cow-link">
                        {{ cow.name }}
                      </router-link>
                    </CTableDataCell>
                    <CTableDataCell>
                      {{ cow.ear_tag }}
                    </CTableDataCell>
                    <CTableDataCell>
                      {{ calculateAgeAndClass(cow.date_of_birth, cow).age }}
                    </CTableDataCell>
                    <CTableDataCell>
                        {{ cow.gender }}
                    </CTableDataCell>
                    <CTableDataCell>
                      <router-link 
                        :to="`/class/cow/${cow.class || calculateAgeAndClass(cow.date_of_birth, cow).ageClass}`"
                        class="text-decoration-none text-dark"
                      >{{ cow.class || calculateAgeAndClass(cow.date_of_birth, cow).ageClass }}
                      </router-link>
                    </CTableDataCell>
                    <CTableDataCell>
                      <router-link 
                        :to="`/breed/cow/${cow.breed}`" 
                        class="text-decoration-none text-dark"
                      >
                        {{ cow.breed || '—' }}
                      </router-link>
                    </CTableDataCell>
                    <CTableDataCell>
                      <router-link 
                        :to="`/pasture/cow/${cow.pasture?.id}`" 
                        class="text-decoration-none text-dark"
                      >
                        {{ cow.pasture?.pasture || '' }}
                      </router-link>
                    </CTableDataCell>
                    <CTableDataCell>
                      <CBadge 
                        :color="getStatusBadge(cow.status).color" 
                        class="px-2 py-1"
                      >
                        {{ getStatusBadge(cow.status).text }}
                      </CBadge>
                    </CTableDataCell>
                    <CTableDataCell>
                      <div class="d-flex gap-1">
                        <CButton
                          size="sm"
                          color="info"
                          variant="outline"
                          title="Edit Cow"
                          @click="openEdit(cow)"
                        >
                          <CIcon :icon="cilPencil" size="sm" />
                        </CButton>
                        <CButton
                          size="sm"
                          color="danger"
                          variant="outline"
                          title="Delete Cow"
                          @click="confirmDelete(cow.id, cow.name)"
                        >
                          <CIcon :icon="cilTrash" size="sm" />
                        </CButton>
                      </div>
                    </CTableDataCell>
                  </CTableRow>
                  <CTableRow v-if="paginatedCows.length === 0">
                    <CTableDataCell colspan="10" class="text-center py-5">
                      <div class="empty-state">
                        <i class="fas fa-cow fa-3x text-muted mb-3"></i>
                        <h5 class="text-muted">No cows found</h5>
                        <p class="text-muted mb-3">Try adjusting your search criteria or add a new cow</p>
                        <CButton color="primary" @click="openCreate">
                          <CIcon :icon="cilPlus" class="me-1" />Add Your First Cow
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
                    {{ Math.min(currentPage * itemsPerPage, filteredCows.length) }} 
                    of {{ filteredCows.length }} entries
                    <span v-if="filteredCows.length !== cowStore.cows.length">
                      (filtered from {{ cowStore.cows.length }} total)
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
        {{ isEditing ? 'Edit Cow' : 'Add New Cow' }}
      </CModalTitle>
    </CModalHeader>
    <CModalBody class="p-0">
      <!-- Navigation Tabs -->
      <CNav variant="tabs" class="px-3 pt-3 bg-light">
        <CNavItem>
          <CNavLink 
            :active="activeTab === 'details'" 
            @click="activeTab = 'details'"
            class="tab-link"
          >
            <i class="fas fa-info-circle me-2"></i>Basic Details
          </CNavLink>
        </CNavItem>
        <CNavItem>
          <CNavLink 
            :active="activeTab === 'parent'" 
            @click="activeTab = 'parent'"
            class="tab-link"
          >
            <i class="fas fa-users me-2"></i>Parent Information
          </CNavLink>
        </CNavItem>
      </CNav>

      <!-- Tab Content -->
      <CForm
        class="p-4"
        enctype="multipart/form-data"
        novalidate
        :validated="validated"
        @submit="handleSubmit"
      >
        <CTabContent>
          <!-- Cow Details Tab -->
          <CTabPane :visible="activeTab === 'details'">
            <CRow class="g-3">
              <CCol md="6">
                <CFormLabel for="name" class="fw-semibold">Cow Name <span style="color: red;">*</span></CFormLabel>
                <CFormInput id="name" v-model="currentCow.name" required />
                <CFormFeedback invalid>Name is required.</CFormFeedback>
              </CCol>

              <CCol md="6">
                <CFormLabel for="earTag" class="fw-semibold">Ear Tag <span style="color: red;">*</span></CFormLabel>
                <CFormInput id="earTag" v-model="currentCow.ear_tag" required />
                <CFormFeedback invalid>Ear tag is required.</CFormFeedback>
              </CCol>

              <CCol md="6">
                <!-- Show formatted date only if not editing, otherwise let input handle value -->
                <!-- This placeholder is not needed; the input below binds to currentCow.date_of_birth -->
                <CFormLabel for="dateOfBirth" class="fw-semibold">Date of Birth <span style="color: red;">*</span></CFormLabel>
                <CFormInput id="dateOfBirth" type="date" v-model="currentCow.date_of_birth" required />
                <CFormFeedback invalid>Date of birth is required.</CFormFeedback>
              </CCol>

              <CCol md="6">
                <CFormLabel for="gender" class="fw-semibold">Gender <span style="color: red;">*</span></CFormLabel>
                <CFormSelect
                  id="gender"
                  v-model="currentCow.gender"
                  :options="[
                    { label: 'Select Gender', value: '' },
                    { label: 'Female', value: 'Female' },
                    { label: 'Male', value: 'Male' },
                  ]"
                  required
                />
                <CFormFeedback invalid>Gender is required.</CFormFeedback>
              </CCol>

              <CCol md="6">
                <CFormLabel for="class" class="fw-semibold">Class</CFormLabel>
                <CFormSelect
                  id="class"
                  v-model="currentCow.class"
                  :options="[
                    { label: 'Auto-calculate from age', value: '' },
                    { label: 'Calf', value: 'Calf' },
                    { label: 'Yearling', value: 'Yearling' },
                    { label: 'Heifer', value: 'Heifer' },
                    { label: 'Adult', value: 'Adult' },
                    { label: 'Bull', value: 'Bull' },
                    { label: 'Steer', value: 'Steer' },
                  ]"
                />
              </CCol>

              <CCol md="6">
                <CFormLabel for="breed" class="fw-semibold">Breed <span style="color: red;">*</span></CFormLabel>
                <CFormSelect
                  id="breed"
                  v-model="currentCow.breed"
                  :options="[
                    { label: 'Select Breed', value: '' },
                    { label: 'Holstein', value: 'Holstein' },
                    { label: 'Jersey', value: 'Jersey' },
                    { label: 'Guernsey', value: 'Guernsey' },
                    { label: 'Angus', value: 'Angus' },
                    { label: 'Hereford', value: 'Hereford' },
                    { label: 'Simmental', value: 'Simmental' },
                    { label: 'Brahman', value: 'Brahman' },
                    { label: 'Limousin', value: 'Limousin' },
                    { label: 'Charolais', value: 'Charolais' },
                    { label: 'Red Poll', value: 'Red Poll' },
                  ]"
                  required
                />
                <CFormFeedback invalid>Breed is required.</CFormFeedback>
              </CCol>

              <CCol md="6">
                <CFormLabel for="from_farm" class="fw-semibold">Origin <span style="color: red;">*</span></CFormLabel>
                <CFormSelect
                  id="from_farm"
                  v-model="currentCow.from_farm"
                  :options="[
                    { label: 'Select Origin', value: '' },
                    { label: 'Born on Farm', value: 'yes' },
                    { label: 'Purchased/External', value: 'no' },
                  ]"
                  required
                />
                <CFormFeedback invalid>Origin is required.</CFormFeedback>
              </CCol>

              <CCol md="6" v-if="currentCow.from_farm === 'no'">
                <CFormLabel for="source_location" class="fw-semibold">Source Location <span style="color: red;">*</span></CFormLabel>
                <CFormInput id="source_location" v-model="currentCow.source_location" required />
                <CFormFeedback invalid>Source location required for external cattle.</CFormFeedback>
              </CCol>

              <CCol md="6">
                <CFormLabel for="pasture" class="fw-semibold">Pasture <span style="color: red;">*</span></CFormLabel>
                <CFormSelect
                  id="pasture"
                  v-model="currentCow.pasture_id"
                  :options="[
                    { label: 'Select pasture', value: '' },
                    ...pastureStore.pastures.map((p) => ({ label: p.pasture, value: p.id })),
                  ]"
                  required
                />
                <CFormFeedback invalid>Pasture assignment is required.</CFormFeedback>
              </CCol>

              <CCol cols="12" md="12">
                <CFormLabel for="description" class="fw-semibold">Description</CFormLabel>
                <CFormTextarea 
                  id="description" 
                  rows="3" 
                  v-model="currentCow.description"
                  placeholder="Add any additional notes about this cow..."
                />
              </CCol>

              <CCol cols="12" class="col-12" v-if="isEditing && currentCow.image && typeof currentCow.image === 'string'">
                <CFormLabel class="fw-semibold">Current Image</CFormLabel>
                <div class="d-flex align-items-center gap-3">
                  <img
                    :src="getCowImage(currentCow.image)"
                    class="img-thumbnail"
                    style="max-height: 120px; max-width: 120px;"
                    alt="Current cow image"
                  />
                  <CButton color="danger" size="sm" variant="outline" title="Remove Image" @click="removeImage">
                    <CIcon :icon="cilTrash" class="me-1" />Remove Image
                  </CButton>
                </div>
              </CCol>

              <CCol cols="12">
                <CFormLabel for="image" class="fw-semibold">{{ isEditing && currentCow.image ? 'Replace' : 'Upload' }} Image</CFormLabel>
                <CFormInput
                  type="file"
                  id="image"
                  @change="(e) => (currentCow.image = e.target.files[0])"
                  accept="image/*"
                />
                <div class="form-text">Accepted formats: JPG, PNG, GIF (max 5MB)</div>
              </CCol>

              <CCol cols="12" class="col-12">
                <div class="d-flex align-items-center">
                  <CFormCheck id="status" v-model="isActive" />
                  <CFormLabel for="status" class="ms-2">Active cow (available for operations)</CFormLabel>
                </div>
              </CCol>
            </CRow>
          </CTabPane>

          <!-- Cow Parent Tab -->
          <CTabPane :visible="activeTab === 'parent'">
            <div class="parent-info-section">
              <div class="alert alert-info border-0">
                <h6 class="alert-heading">
                  <i class="fas fa-info-circle me-2"></i>Parent Information
                </h6>
                <p class="mb-0">
                  This information helps track lineage and breeding records. 
                  It's especially important for cows born on the farm.
                </p>
              </div>

              <CRow class="g-4">
                <CCol md="6">
                  <CFormLabel for="mother_id" class="fw-semibold">
                    <i class="fas fa-venus me-2 text-pink"></i>Mother (Dam)
                  </CFormLabel>
                  <Multiselect
                    id="mother_id"
                    v-model="currentCowParent.mother_id"
                    :options="cowStore.femaleParentOptions"
                    label="label"
                    track-by="value"
                    placeholder="Select mother..."
                    :searchable="true"
                    :allowEmpty="true"
                    :showLabels="false"
                  />
                </CCol>

                <CCol md="6">
                  <CFormLabel for="father_id" class="fw-semibold">
                    <i class="fas fa-mars me-2 text-blue"></i>Father (Sire)
                  </CFormLabel>
                  <Multiselect
                    id="father_id"
                    v-model="currentCowParent.father_id"
                    :options="cowStore.maleParentOptions"
                    label="label"
                    track-by="value"
                    placeholder="Select father..."
                    :searchable="true"
                    :allowEmpty="true"
                    :showLabels="false"
                  />
                </CCol>

                <CCol cols="12" v-if="currentCow.from_farm === 'no'">
                  <div class="alert alert-warning border-0">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    <strong>External Source:</strong> Parent information may not be available for cattle from outside sources.
                  </div>
                </CCol>
              </CRow>
            </div>
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
      >
        <CSpinner v-if="loading" size="sm" class="me-2" />
        <i v-else :class="isEditing ? 'fas fa-save' : 'fas fa-plus'" class="me-2"></i>
        {{ isEditing ? 'Update Cow' : 'Create Cow' }}
      </CButton>
    </CModalFooter>
  </CModal>
</template>