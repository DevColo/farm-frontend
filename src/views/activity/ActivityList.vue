<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useParcelStore } from '@/stores/parcel.store'
import { useBlockStore } from '@/stores/block.store'
import { useFarmStore } from '@/stores/farm.store'
import { useActivityStore } from '@/stores/activity.store'
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
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
  CSpinner,
  CFormSelect,
  CBreadcrumb,
  CBreadcrumbItem,
} from '@coreui/vue'
import CIcon from '@coreui/icons-vue'
import { cilPencil, cilTrash, cilPlus, cilCloudDownload, cilSearch, cilFilter } from '@coreui/icons'
import Multiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.css'

const parcelStore = useParcelStore()
const blockStore = useBlockStore()
const farmStore = useFarmStore()
const activityStore = useActivityStore()

const showModal = ref(false)
const isEditing = ref(false)
const validated = ref(false)
const loading = ref(false)
const showFilters = ref(false)
const editingId = ref(null)

// activity types
const activityTypes = [
  { value: 'Weeding', label: 'Weeding'},
  { value: 'Slashing', label: 'Slashing'},
  { value: 'Pruning', label: 'Pruning'},
  { value: 'Fertilising', label: 'Fertilising'},
  { value: 'Cultivation', label: 'Cultivation'},
  { value: 'Mulching', label: 'Mulching'},
  { value: 'Irrigation', label: 'Irrigation'},
  { value: 'Applying of Pesticides', label: 'Applying of Pesticides'},
]


const currentActivity = ref({
  activity_by: '',
  farm_id: '',
  parcel_id: '',
  block_id: '',
  activity_date: '',
  activity: '',
  type: '',
})

// activity by options
const activityBy = [
  { value: 'Block', label: 'Block' },
  { value: 'Parcel', label: 'Parcel' },
  { value: 'All Blocks', label: 'All Blocks' },
]

// Check if Avocado is selected
const isAvocadoSelected = computed(() => {
  return currentActivity.value.activity?.value === 'Avocado'
})

// Enhanced search and filter states
const searchQuery = ref('')
const filterTree = ref('')
const itemsPerPage = ref(10)
const currentPage = ref(1)
const sortField = ref('activity_date')
const sortOrder = ref('desc')
const parcels = ref([])
const blocks = ref([])
const farms = ref([])

// fetch data
onMounted(async () => {
  loading.value = true
  try {
    await Promise.all([
      activityStore.fetchActivities(),
      farmStore.fetchFarms(),
    ])
  } finally {
    loading.value = false
  }
})

// Watch the store in case parcels are updated dynamically later
// watch(
//   () => parcelStore.parcels,
//   (newParcels) => {
//     parcels.value = newParcels.map(p => ({
//       value: p.id,
//       label: p?.parcel_code,
//     }))
//   },
//   { deep: true }
// )

watch(
  () => farmStore.farms,
  (newFarms) => {
    farms.value = newFarms.map(b => ({
      value: b.id,
      label: `${b?.farm_code} - ${b?.name}`,
    }))
  },
  { deep: true }
)

// Generate filter options
const availableParcels = computed(() => {
  const treeNames = activityStore.activities.map(activity => activity.tree).filter(Boolean)
  return Array.from(new Set(treeNames))
})

// Enhanced filtering and sorting
const filteredActivities = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  
  // Always work with an array
  const activities = Array.isArray(activityStore.activities) ? activityStore.activities : []
  
  let filtered = activities.filter((activity) => {
    const matchesQuery = !q || [activity.parcel_id, activity.activity_date, activity.activity, activity.type].some((field) => 
      field?.toLowerCase().includes(q)
    )
    const matchesTree = !filterTree.value || activity.parcel_id == filterTree.value
    
    return matchesQuery && matchesTree
  })

  // Apply sorting
  filtered.sort((a, b) => {
    let aValue = a[sortField.value]
    let bValue = b[sortField.value]
    
    // Handle special cases
    if (sortField.value === 'activity') {
      aValue = a.activity || ''
      bValue = b.activity || ''
    }
    
    if (sortField.value === 'activity_date') {
      aValue = new Date(a.activity_date || 0).getTime()
      bValue = new Date(b.activity_date || 0).getTime()
    } else {
      // Convert to strings for comparison
      aValue = String(aValue || '').toLowerCase()
      bValue = String(bValue || '').toLowerCase()
    }
    
    if (sortOrder.value === 'asc') {
      return aValue > bValue ? 1 : aValue < bValue ? -1 : 0
    } else {
      return bValue > aValue ? 1 : bValue < aValue ? -1 : 0
    }
  })

  return filtered
})

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredActivities.value.length / itemsPerPage.value))
)

const paginatedActivities = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredActivities.value.slice(start, start + itemsPerPage.value)
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
  filterTree.value = ''
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
  currentActivity.value = {
     activity_by: '',
    farm_id: '',
    parcel_id: '',
    block_id: '',
    activity_date: '',
    activity: '',
  }
  showModal.value = true
}

function openEdit(activity) {
  isEditing.value = true
  validated.value = false
  editingId.value = activity.id
  
  // Find matching tree object from options
  const treeObj = parcels.value.find(t => 
    t.value == activity.parcel_id
  )
  
  // Find matching activity object
  const activityObj = activityTypes.find(f => f.value === activity.activity)
  

  
  currentActivity.value = {
    activity_by: activity.activity_by ? { value: activity.activity_by, label: activity.activity_by } : '',
    farm_id: activity.farm_id ? { value: activity.farm_id, label: `${activity.farm?.farm_code} - ${activity.farm?.name}` } : '',
    block_id: activity.block_id ? { value: activity.block_id, label: activity.block?.block_code } : null,
    parcel_id: activity.parcel_id ? { value: activity.parcel_id, label: activity.parcel?.parcel_code } : null,
    activity_date: activity.activity_date,
    activity: activityObj || null,
  }
  
  showModal.value = true
}

async function confirmDelete(id, activity) {
  if (confirm(`Are you sure you want to delete activity record for ${activity}? This action cannot be undone.`)) {
    loading.value = true
    try {
      await activityStore.deleteActivity(id)
    } finally {
      loading.value = false
    }
  }
}

// Form handling
async function handleSubmit(e) {
  e.preventDefault()
  e.stopPropagation()
  
  const form = e.currentTarget
  
  // Check if all required fields are filled
  if (!currentActivity.value.activity_by) {
    validated.value = true
    return
  }
  if (currentActivity.value.activity_by.value == 'Parcel' && !currentActivity.value.parcel_id) {
    validated.value = true
    return
  }
  if (currentActivity.value.activity_by.value == 'Block' && !currentActivity.value.block_id) {
    validated.value = true
    return
  }
  
  // Only validate type if Avocado is selected
  if (isAvocadoSelected.value && !currentActivity.value.type) {
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
      activity_by: currentActivity.value.activity_by.value,
      farm_id: currentActivity.value.farm_id?.value || currentActivity.value.farm_id || '',
      block_id: currentActivity.value.block_id?.value || currentActivity.value.block_id || '',
      parcel_id: currentActivity.value.parcel_id?.value || currentActivity.value.parcel_id || '',
      activity_date: currentActivity.value.activity_date,
      activity: currentActivity.value.activity.value,
    }
    
    if (isEditing.value) {
      payload.activity_id = editingId.value
      const res = await activityStore.editActivity(payload)
      if(res == 1){
        showModal.value = false
        validated.value = false
      }
    } else {
      const res = await activityStore.createActivity(payload)
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
watch([searchQuery, filterTree], () => {
  resetPage()
})

// Calculate activity statistics
const activityStats = computed(() => {
  if (!activities.value || activities.value.length === 0) {
    return {
      totalActivities: 0,
      lastActivityDate: null,
      highestYield: 0
    }
  }

  const sorted = [...activities.value].sort((a, b) => 
    new Date(b.activity_date) - new Date(a.activity_date)
  )
  
  return {
    totalActivities: activities.value.length,
    lastActivityDate: sorted[0]?.activity_date,
    highestYield: Math.max(...quantities).toFixed(2)
  }
})

async function handleActivityByInput(activityBy, farmId) {
  const selected = activityBy?.value ?? activityBy
  // normalize farmId to accept either an object with .value or a primitive id
  const farmIdValue = farmId?.value ?? farmId

  // Reset if no farm selected
  if (!farmIdValue) {
    parcels.value = []
    blocks.value = []
    currentHarvest.value.parcel_id = null
    currentHarvest.value.block_id = null
    return
  }

  if (selected === 'Block') {
    // clear previous options while loading
    blocks.value = []
    await blockStore.fetchBlocksByFarmId(farmIdValue)
    const res = blockStore.blocks;
    blocks.value = Array.isArray(res) ? res.map(b => ({ value: b.id, label: b?.block_code })) : []
    console.log('Fetched blocks:', blocks.value)
    currentHarvest.value.parcel_id = null
  } else if (selected === 'Parcel') {
    parcels.value = []
    await parcelStore.fetchParcelsByFarmId(farmIdValue)
    const res = parcelStore.parcels;
    parcels.value = Array.isArray(res) ? res.map(p => ({ value: p.id, label: p?.parcel_code })) : []
    currentHarvest.value.block_id = null
  } else {
    parcels.value = []
    blocks.value = []
    currentHarvest.value.block_id = null
    currentHarvest.value.parcel_id = null
  }
}

// Ensure function runs whenever activity_by is selected (or farm changes)
watch(
  () => currentActivity.value.activity_by,
  (newVal) => {
    handleActivityByInput(newVal, currentActivity.value.farm_id)
  }
)

watch(
  () => currentActivity.value.farm_id,
  (newFarmId) => {
    if (currentActivity.value.activity_by) {
      handleActivityByInput(currentActivity.value.activity_by, newFarmId)
    }
  }
)
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
        <CBreadcrumbItem>
          <router-link to="#" class="text-decoration-none">Activities</router-link>
        </CBreadcrumbItem>
        <CBreadcrumbItem active>Crop Care</CBreadcrumbItem>
      </CBreadcrumb>
    <!-- Main Table Card -->
    <CCol cols="12">
      <CCard class="shadow-sm border-0">
        <!-- Enhanced Header -->
        <CCardHeader class="bg-white border-bottom">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h5 class="mb-1">
                <i class="fas fa-apple-alt me-2 text-success"></i>Crop Care
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
                <CIcon :icon="cilPlus" class="me-1" />Add New Activity
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
                      placeholder="Search by tree name or date"
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
                  <CFormSelect v-model="filterTree" @change="resetPage">
                    <option value="">All parcels</option>
                    <option v-for="tree in availableParcels" :key="tree?.id" :value="tree?.id">
                      {{ tree?.tree_code }}
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
                   <CTableHeaderCell class="sortable" @click="sortBy('farm_id')">
                    Farm {{ getSortIcon('farm_id') }}
                  </CTableHeaderCell>
                  <CTableHeaderCell class="sortable" @click="sortBy('activity_by')">
                    Activity By {{ getSortIcon('activity_by') }}
                  </CTableHeaderCell>
                  <CTableHeaderCell class="sortable" @click="sortBy('activity')">
                    Activity {{ getSortIcon('activity') }}
                  </CTableHeaderCell>
                  <CTableHeaderCell class="sortable" @click="sortBy('activity_date')">
                    Activity Date {{ getSortIcon('activity_date') }}
                  </CTableHeaderCell>
                  <CTableHeaderCell>Created At</CTableHeaderCell>
                  <CTableHeaderCell width="120">Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                <CTableRow v-for="activity in paginatedActivities" :key="activity.id" class="table-row">
                  <CTableDataCell>
                    <router-link
                      :to="`/farm/${activity.farm_id}`"
                      class="text-decoration-none"
                    >
                      {{ activity.farm?.name ?? '' }}
                    </router-link>
                  </CTableDataCell>
                  <CTableDataCell>
                    <router-link
                      :to="activity.activity_by === 'Parcel'
                        ? `/parcels/${activity.parcel_id}`
                        : activity.activity_by === 'Block'
                          ? `/blocks/${activity.block_id}`
                          : '#'"
                      class="text-decoration-none"
                    >
                      {{ activity.activity_by === 'Parcel' ? 
                      `Parcel - ${activity.parcel?.parcel_code}` 
                      : activity.activity_by === 'Block' 
                      ? `Block - ${activity.block?.block_code }` 
                      : 'All Blocks' }}
                    </router-link>
                  </CTableDataCell>
                  <CTableDataCell>
                    {{ activity.activity || '—' }}
                  </CTableDataCell>
                  <CTableDataCell>
                      {{ new Date(activity.activity_date).toLocaleDateString() }}
                  </CTableDataCell>
                  <CTableDataCell>
                    {{ new Date(activity.created_at).toLocaleDateString() ?? '' }}
                  </CTableDataCell>
                  <CTableDataCell>
                    <div class="d-flex gap-1">
                      <CButton
                        size="sm"
                        color="info"
                        variant="outline"
                        title="Edit Activity"
                        @click="openEdit(activity)"
                      >
                        <CIcon :icon="cilPencil" size="sm" />
                      </CButton>
                      <CButton
                        size="sm"
                        color="danger"
                        variant="outline"
                        title="Delete Activity"
                        @click="confirmDelete(activity.id, activity.activity)"
                      >
                        <CIcon :icon="cilTrash" size="sm" />
                      </CButton>
                    </div>
                  </CTableDataCell>
                </CTableRow>
                <CTableRow v-if="paginatedActivities.length === 0">
                  <CTableDataCell colspan="7" class="text-center py-5">
                    <div class="empty-state">
                      <i class="fas fa-apple-alt fa-3x text-muted mb-3"></i>
                      <h5 class="text-muted">No Activity records found</h5>
                      <p class="text-muted mb-3">Try adjusting your search criteria or add a new Activity record</p>
                      <CButton color="primary" @click="openCreate">
                        <CIcon :icon="cilPlus" class="me-1" />Add Your First Activity
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
                    {{ Math.min(currentPage * itemsPerPage, filteredActivities.length) }} 
                    of {{ filteredActivities.length }} entries
                    <span v-if="filteredActivities.length !== activityStore.activities.length">
                      (filtered from {{ activityStore.activities.length }} total)
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
        <i class="fas fa-apple-alt me-2 text-success"></i>
        {{ isEditing ? 'Edit Activity' : 'Add New Activity' }}
      </CModalTitle>
    </CModalHeader>
    <CModalBody class="p-0">
      <!-- Tab Content -->
      <CForm
        id="activity-form"
        class="p-4"
        novalidate
        :validated="validated"
        @submit="handleSubmit"
      >
        <CRow class="g-3">
          <CCol md="12">
            <CFormLabel for="farm_id" class="fw-semibold">Farm <span style="color: red;">*</span></CFormLabel>
            <Multiselect
              v-model="currentActivity.farm_id"
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
            <div v-if="validated && !currentActivity.farm_id" class="invalid-feedback d-block">
              Farm is required.
            </div>
          </CCol>

          <CCol md="12">
            <CFormLabel for="activity_by" class="fw-semibold">Activity By <span style="color: red;">*</span></CFormLabel>
            <Multiselect
              v-model="currentActivity.activity_by"
              placeholder="Select Activity By"
              track-by="value"
              label="label"
              :options="activityBy"
              :show-no-results="false"
              :close-on-select="true"
              :clear-on-select="false"
              :preserve-search="true"
              :preselect-first="false"
              :disabled="!currentActivity.farm_id"
              @input="handleActivityByInput(currentActivity.activity_by, currentActivity.farm_id.value)"
            />
            <div v-if="!currentActivity.farm_id" class="form-text text-muted small">
              Please select a Farm first.
            </div>
            <div v-if="validated && !currentActivity.activity_by" class="invalid-feedback d-block">
              Harvest By field is required.
            </div>
          </CCol>

          <CCol md="12" v-if="currentActivity.activity_by && currentActivity.activity_by.value == 'Parcel'">
            <CFormLabel for="tree" class="fw-semibold">Parcel <span style="color: red;">*</span></CFormLabel>
            <Multiselect
              v-model="currentActivity.parcel_id"
              placeholder="Select Parcel"
              track-by="value"
              label="label"
              :options="parcels"
              :show-no-results="false"
              :close-on-select="true"
              :clear-on-select="false"
              :preserve-search="true"
              :preselect-first="false"
            >
              <template #option="{ option }">
                {{ option.label }}
              </template>
              <template #singleLabel="{ option }">
                {{ option.label }}
              </template>
            </Multiselect>
            <div v-if="validated && !currentActivity.parcel_id && currentActivity.activity_by.value == 'Parcel'" class="invalid-feedback d-block">
              Parcel is required.
            </div>
          </CCol>

          <CCol md="12" v-if="currentActivity.activity_by && currentActivity.activity_by.value == 'Block'">
            <CFormLabel for="tree" class="fw-semibold">Block <span style="color: red;">*</span></CFormLabel>
            <Multiselect
              v-model="currentActivity.block_id"
              placeholder="Select Block"
              track-by="value"
              label="label"
              :options="blocks"
              :show-no-results="false"
              :close-on-select="true"
              :clear-on-select="false"
              :preserve-search="true"
              :preselect-first="false"
            >
              <template #option="{ option }">
                {{ option.label }}
              </template>
              <template #singleLabel="{ option }">
                {{ option.label }}
              </template>
            </Multiselect>
            <div v-if="validated && !currentActivity.block_id && currentActivity.activity_by.value == 'Block'" class="invalid-feedback d-block">
              Block is required.
            </div>
          </CCol>

          <CCol md="12">
            <CFormLabel for="activity" class="fw-semibold">Activity <span style="color: red;">*</span></CFormLabel>
            <Multiselect
              v-model="currentActivity.activity"
              placeholder="Select activity"
              track-by="value"
              label="label"
              :options="activityTypes"
              :show-no-results="false"
              :close-on-select="true"
              :clear-on-select="false"
              :preserve-search="true"
              :preselect-first="false"
            >
              <template #option="{ option }">
                <span class="me-2">{{ option.icon }}</span>{{ option.label }}
              </template>
              <template #singleLabel="{ option }">
                <span class="me-2">{{ option.icon }}</span>{{ option.label }}
              </template>
            </Multiselect>
            <div v-if="validated && !currentActivity.activity" class="invalid-feedback d-block">
              activity is required.
            </div>
          </CCol>

          <CCol md="12">
            <CFormLabel for="activity-date" class="fw-semibold">Activity Date <span style="color: red;">*</span></CFormLabel>
            <CFormInput 
              id="activity-date" 
              type="date" 
              v-model="currentActivity.activity_date" 
              required 
            />
            <CFormFeedback invalid>Activity date is required.</CFormFeedback>
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
        form="activity-form"
        :disabled="loading"
      >
        <CSpinner v-if="loading" size="sm" class="me-2" />
        <i v-else :class="isEditing ? 'fas fa-save' : 'fas fa-plus'" class="me-2"></i>
        {{ isEditing ? 'Update Activity' : 'Create Activity' }}
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