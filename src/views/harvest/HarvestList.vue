<script setup>
import { ref, computed, onMounted, watch, h } from 'vue'
import { useParcelStore } from '@/stores/parcel.store'
import { useBlockStore } from '@/stores/block.store'
import { useFarmStore } from '@/stores/farm.store'
import { useHarvestStore } from '@/stores/harvest.store'
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
const harvestStore = useHarvestStore()

const showModal = ref(false)
const isEditing = ref(false)
const validated = ref(false)
const loading = ref(false)
const showFilters = ref(false)
const editingId = ref(null)

// Fruit types
const fruitTypes = [
  { value: 'Orange', label: 'Orange', color: 'warning', icon: '🍊' },
  { value: 'Avocado', label: 'Avocado', color: 'success', icon: '🥑' },
  { value: 'Lime', label: 'Lime', color: 'warning', icon: '🍋' },
  { value: 'Mango', label: 'Mango', color: 'warning', icon: '🥭' }
]

// Avocado varieties
const avocadoVarieties = [
  { value: 'All', label: 'All Type' },
  { value: 'Hass', label: 'Hass' },
  { value: 'Fuerte', label: 'Fuerte' },
  { value: 'Etinga', label: 'Etinga' },
]

// Harvest by options
const harvestBy = [
  { value: 'Block', label: 'Block' },
  { value: 'Parcel', label: 'Parcel' },
  { value: 'All Blocks', label: 'All Blocks' },
]

const currentHarvest = ref({
  harvest_by: '',
  farm_id: '',
  parcel_id: '',
  block_id: '',
  harvest_date: '',
  quantity: '',
  fruit: '',
  type: '',
  quality: 'Average'
})

// Check if Avocado is selected
const isAvocadoSelected = computed(() => {
  return currentHarvest.value.fruit?.value === 'Avocado'
})

// Enhanced search and filter states
const searchQuery = ref('')
const filterByParcel = ref('')
const filterByBlock = ref('')
const itemsPerPage = ref(10)
const currentPage = ref(1)
const sortField = ref('harvest_date')
const sortOrder = ref('desc')
const parcels = ref([])
const blocks = ref([])
const farms = ref([])

// fetch data
onMounted(async () => {
  loading.value = true
  try {
    await Promise.all([
      harvestStore.fetchHarvests(),
      farmStore.fetchFarms(),
      parcelStore.fetchParcels(),
      blockStore.fetchBlocks()
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

// watch(
//   () => blockStore.blocks,
//   (newBlocks) => {
//     blocks.value = newBlocks.map(b => ({
//       value: b.id,
//       label: b?.block_code,
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
  const parcels = parcelStore.parcels.map(parcel => parcel).filter(Boolean)
  return Array.from(new Set(parcels))
})

const availableBlocks = computed(() => {
  const AllBlocks = blockStore.blocks.map(block => block).filter(Boolean)
  return Array.from(new Set(AllBlocks))
})

const availableFarms = computed(() => {
  const farms = farmStore.farms.map(farm => farm).filter(Boolean)
  return Array.from(new Set(farms))
})

// Enhanced filtering and sorting
const filteredHarvests = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  
  // Always work with an array
  const harvests = Array.isArray(harvestStore.harvests) ? harvestStore.harvests : []
  
  let filtered = harvests.filter((harvest) => {
    const matchesQuery = !q || [harvest.parcel?.parcel_code, harvest.harvest_date, harvest.fruit, harvest.type].some((field) => 
      field?.toLowerCase().includes(q)
    )
    const matchesParcel = !filterByParcel.value || harvest.parcel_id == filterByParcel.value
    const matchesBlock = !filterByBlock.value || harvest.block_id == filterByBlock.value
    
    return matchesQuery && matchesParcel && matchesBlock
  })

  // Apply sorting
  filtered.sort((a, b) => {
    let aValue = a[sortField.value]
    let bValue = b[sortField.value]
    
    // Handle special cases
    if (sortField.value === 'harvest_by') {
      aValue = a.harvest_by || ''
      bValue = b.harvest_by || ''
    }
    
    if (sortField.value === 'harvest_date') {
      aValue = new Date(a.harvest_date || 0).getTime()
      bValue = new Date(b.harvest_date || 0).getTime()
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
  Math.max(1, Math.ceil(filteredHarvests.value.length / itemsPerPage.value))
)

const paginatedHarvests = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredHarvests.value.slice(start, start + itemsPerPage.value)
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
  filterByParcel.value = ''
  filterByBlock.value = ''
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
  currentHarvest.value = {
    harvest_by: '',
    farm_id: '',
    parcel_id: '',
    block_id: '',
    harvest_date: '',
    quantity: '',
    fruit: '',
    type: '',
    quality: 'No'
  }
  showModal.value = true
}

function openEdit(harvest) {
  isEditing.value = true
  validated.value = false
  editingId.value = harvest.id
  
  // Find matching tree object from options
  const treeObj = parcels.value.find(t => 
    t.value == harvest.parcel_id
  )
  
  // Find matching fruit object
  const fruitObj = fruitTypes.find(f => f.value === harvest.fruit)
  
  // Find matching type/variety if it's an avocado
  let typeObj = null
  if (harvest.fruit === 'Avocado' && harvest.type) {
    typeObj = avocadoVarieties.find(v => v.value === harvest.type)
  }
  
  currentHarvest.value = {
    harvest_by: harvest.harvest_by ? { value: harvest.harvest_by, label: harvest.harvest_by } : '',
    farm_id: harvest.farm_id ? { value: harvest.farm_id, label: `${harvest.farm?.farm_code} - ${harvest.farm?.name}` } : '',
    block_id: harvest.block_id ? { value: harvest.block_id, label: harvest.block?.block_code } : null,
    parcel_id: harvest.parcel_id ? { value: harvest.parcel_id, label: harvest.parcel?.parcel_code } : null,
    harvest_date: harvest.harvest_date,
    quantity: harvest.quantity,
    fruit: fruitObj || null,
    type: typeObj || '',
    quality: harvest.quality ? { value: harvest.quality, label: harvest.quality } : 'No',
  }
  
  showModal.value = true
}

async function confirmDelete(id, name) {
  if (confirm(`Are you sure you want to delete harvest record for ${name}? This action cannot be undone.`)) {
    loading.value = true
    try {
      await harvestStore.deleteHarvest(id)
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

  if (!currentHarvest.value.harvest_by) {
    validated.value = true
    return
  }
  if (currentHarvest.value.harvest_by.value == 'Parcel' && !currentHarvest.value.parcel_id) {
    validated.value = true
    return
  }
  if (currentHarvest.value.harvest_by.value == 'Block' && !currentHarvest.value.block_id) {
    validated.value = true
    return
  }
  if (!currentHarvest.value.harvest_date || !currentHarvest.value.quantity || 
      !currentHarvest.value.fruit) {
    validated.value = true
    return
  }
  
  // Only validate type if Avocado is selected
  if (isAvocadoSelected.value && !currentHarvest.value.type) {
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
      harvest_by: currentHarvest.value.harvest_by.value,
      farm_id: currentHarvest.value.farm_id?.value || currentHarvest.value.farm_id || '',
      block_id: currentHarvest.value.block_id?.value || currentHarvest.value.block_id || '',
      parcel_id: currentHarvest.value.parcel_id?.value || currentHarvest.value.parcel_id || '',
      harvest_date: currentHarvest.value.harvest_date,
      quantity: currentHarvest.value.quantity,
      fruit: currentHarvest.value.fruit.value,
      type: currentHarvest.value.type?.value || currentHarvest.value.type || '',
      quality: currentHarvest.value.quality,
    }
    
    if (isEditing.value) {
      payload.harvest_id = editingId.value
      const res = await harvestStore.editHarvest(payload)
      if(res == 1){
        showModal.value = false
        validated.value = false
      }
    } else {
      const res = await harvestStore.createHarvest(payload)
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
watch([searchQuery, filterByParcel, filterByBlock], () => {
  resetPage()
})

async function handleHarvestByInput(harvestBy, farmId) {
  const selected = harvestBy?.value ?? harvestBy
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

// Ensure function runs whenever harvest_by is selected (or farm changes)
watch(
  () => currentHarvest.value.harvest_by,
  (newVal) => {
    handleHarvestByInput(newVal, currentHarvest.value.farm_id)
  }
)

watch(
  () => currentHarvest.value.farm_id,
  (newFarmId) => {
    if (currentHarvest.value.harvest_by) {
      handleHarvestByInput(currentHarvest.value.harvest_by, newFarmId)
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
        <CBreadcrumbItem active>Harvests</CBreadcrumbItem>
      </CBreadcrumb>
      <!-- Stats Row -->
      <CRow class="mb-4">
        <CCol cols="12">
            <CCardBody class="py-3">
              <div class="d-flex flex-wrap justify-content-between align-items-center">
                <div class="d-flex gap-3 flex-wrap">
                  <div class="stat-card p-3 bg-white rounded shadow-sm">
                    <div class="small text-muted">Total Harvests</div>
                    <div class="h5 mb-0">{{ filteredHarvests.length }}</div>
                  </div>

                  <div class="stat-card p-3 bg-white rounded shadow-sm">
                    <div class="small text-muted">Total Quantity (kg)</div>
                    <div class="h5 mb-0">
                      {{
                        (filteredHarvests.reduce((sum, h) => sum + (Number(h.quantity) || 0), 0)).toFixed(2)
                      }}
                    </div>
                  </div>

                  <div class="stat-card p-3 bg-white rounded shadow-sm">
                    <div class="small text-muted">Average per Harvest (kg)</div>
                    <div class="h5 mb-0">
                      {{
                        filteredHarvests.length
                          ? (filteredHarvests.reduce((sum, h) => sum + (Number(h.quantity) || 0), 0) / filteredHarvests.length).toFixed(2)
                          : '0.00'
                      }}
                    </div>
                  </div>

                  <div class="stat-card p-3 bg-white rounded shadow-sm">
                    <div class="small text-muted">Distinct Farms</div>
                    <div class="h5 mb-0">
                      {{
                        new Set(filteredHarvests.map(h => h.farm_id)).size
                      }}
                    </div>
                  </div>

                  <div class="stat-card p-3 bg-white rounded shadow-sm">
                    <div class="small text-muted">Latest Harvest</div>
                    <div class="h6 mb-0">
                      {{
                        filteredHarvests.length
                          ? new Date(Math.max.apply(null, filteredHarvests.map(h => new Date(h.harvest_date).getTime()))).toLocaleDateString()
                          : '—'
                      }}
                    </div>
                  </div>
                </div>

                <!-- Breakdown by Fruit -->
                <div class="d-flex flex-column gap-2 mt-3">
                  <!-- Main Fruit Breakdown -->
                  <div class="d-flex gap-2 align-items-center flex-wrap">
                    <div v-for="fruit in fruitTypes" :key="fruit.value" class="d-flex align-items-center gap-2">
                      <span :title="fruit.label" class="badge bg-light text-dark border">
                        <span class="me-1">{{ fruit.icon }}</span>
                        {{ fruit.label }}:
                        {{
                          (filteredHarvests
                            .filter(h => (h.fruit || '').toLowerCase() === fruit.value.toLowerCase())
                            .reduce((s, h) => s + (Number(h.quantity) || 0), 0)
                          ).toFixed(2)
                        }} kg
                      </span>
                    </div>
                  </div>
                  
                  <!-- Avocado Type Breakdown -->
<div class="d-flex flex-column gap-3">
  <!-- Premium Avocado -->
  <template v-if="filteredHarvests.some(h => h.fruit === 'Avocado' && h.quality === 'Premium')">
    <div class="d-flex gap-2 align-items-center flex-wrap">
      <small class="text-muted me-2">Premium Avocado:</small>
      <div v-for="variety in avocadoVarieties.slice(1)" :key="'premium-' + variety.value" class="d-flex align-items-center gap-2">
        <span :title="variety.label" class="badge bg-success bg-opacity-10 text-success border border-success-subtle">
          {{ variety.label }}:
          {{
            (filteredHarvests
              .filter(h => h.fruit === 'Avocado' && h.quality === 'Premium' && h.type === variety.value)
              .reduce((s, h) => s + (Number(h.quantity) || 0), 0)
            ).toFixed(2)
          }} kg
        </span>
      </div>
    </div>
  </template>

  <!-- Average Avocado -->
  <template v-if="filteredHarvests.some(h => h.fruit === 'Avocado' && h.quality === 'Average')">
    <div class="d-flex gap-2 align-items-center flex-wrap">
      <small class="text-muted me-2">Average Avocado:</small>
      <div v-for="variety in avocadoVarieties.slice(1)" :key="'average-' + variety.value" class="d-flex align-items-center gap-2">
        <span :title="variety.label" class="badge bg-warning bg-opacity-10 text-warning border border-warning-subtle">
          {{ variety.label }}:
          {{
            (filteredHarvests
              .filter(h => h.fruit === 'Avocado' && h.quality === 'Average' && h.type === variety.value)
              .reduce((s, h) => s + (Number(h.quantity) || 0), 0)
            ).toFixed(2)
          }} kg
        </span>
      </div>
    </div>
  </template>

  <!-- Rejected Avocado -->
  <template v-if="filteredHarvests.some(h => h.fruit === 'Avocado' && h.quality === 'Rejected')">
    <div class="d-flex gap-2 align-items-center flex-wrap">
      <small class="text-muted me-2">Rejected Avocado:</small>
      <div v-for="variety in avocadoVarieties.slice(1)" :key="'rejected-' + variety.value" class="d-flex align-items-center gap-2">
        <span :title="variety.label" class="badge bg-danger bg-opacity-10 text-danger border border-danger-subtle">
          {{ variety.label }}:
          {{
            (filteredHarvests
              .filter(h => h.fruit === 'Avocado' && h.quality === 'Rejected' && h.type === variety.value)
              .reduce((s, h) => s + (Number(h.quantity) || 0), 0)
            ).toFixed(2)
          }} kg
        </span>
      </div>
    </div>
  </template>
</div>
                </div>
              </div>
            </CCardBody>
        </CCol>
      </CRow>

    <!-- Main Table Card -->
    <CCol cols="12">
      <CCard class="shadow-sm border-0">
        <!-- Enhanced Header -->
        <CCardHeader class="bg-white border-bottom">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h5 class="mb-1">
                <i class="fas fa-apple-alt me-2 text-success"></i>Harvests
              </h5>
            </div>
            <div class="d-flex gap-2">
              <CDropdown>
                <CDropdownToggle>
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
                <CIcon :icon="cilPlus" class="me-1" />Add New Harvest
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
                      placeholder="Search by Fruit, Type, Date, Parcel Code..."
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
                  <CFormSelect v-model="filterByParcel" @change="resetPage">
                    <option value="">All Parcels</option>
                    <option v-for="parcel in availableParcels" :key="parcel?.id" :value="parcel?.id">
                      {{ parcel?.parcel_code }}
                    </option>
                  </CFormSelect>
                </div>
                <div class="col-md-2">
                  <CFormSelect v-model="filterByParcel" @change="resetPage">
                    <option value="">All Blocks</option>
                    <option v-for="block in availableBlocks" :key="block?.id" :value="block?.id">
                      {{ block?.block_code }}
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
                  <CTableHeaderCell class="sortable" @click="sortBy('harvest_by')">
                    Harvest By {{ getSortIcon('harvest_by') }}
                  </CTableHeaderCell>
                  <CTableHeaderCell class="sortable" @click="sortBy('fruit')">
                    Fruit {{ getSortIcon('fruit') }}
                  </CTableHeaderCell>
                  <CTableHeaderCell class="sortable" @click="sortBy('type')">
                    Type {{ getSortIcon('type') }}
                  </CTableHeaderCell>
                  <CTableHeaderCell>Quality</CTableHeaderCell>
                  <CTableHeaderCell class="sortable" @click="sortBy('quantity')">
                    Quantity (kg) {{ getSortIcon('quantity') }}
                  </CTableHeaderCell>
                  <CTableHeaderCell class="sortable" @click="sortBy('harvest_date')">
                    Harvest Date {{ getSortIcon('harvest_date') }}
                  </CTableHeaderCell>
                  <!-- <CTableHeaderCell>Created At</CTableHeaderCell> -->
                  <CTableHeaderCell width="120">Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                <CTableRow v-for="harvest in paginatedHarvests" :key="harvest.id" class="table-row">
                  <CTableDataCell>
                    <router-link
                      :to="`/farm/${harvest.farm_id}`"
                      class="text-decoration-none"
                    >
                      {{ harvest.farm?.name ?? '' }}
                    </router-link>
                  </CTableDataCell>
                  <CTableDataCell>
                    <router-link
                      :to="harvest.harvest_by === 'Parcel'
                        ? `/parcels/${harvest.parcel_id}`
                        : harvest.harvest_by === 'Block'
                          ? `/blocks/${harvest.block_id}`
                          : '#'"
                      class="text-decoration-none"
                    >
                      {{ harvest.harvest_by === 'Parcel' ? 
                      `Parcel - ${harvest.parcel?.parcel_code}` 
                      : harvest.harvest_by === 'Block' 
                      ? `Block - ${harvest.block?.block_code }` 
                      : 'All Blocks' }}
                    </router-link>
                  </CTableDataCell>
                  <CTableDataCell>
                    {{ harvest.fruit || '—' }}
                  </CTableDataCell>
                  <CTableDataCell>
                    {{ harvest.type || '—' }}
                  </CTableDataCell>
                  <CTableDataCell>
                    {{ harvest.quality|| '' }}
                  </CTableDataCell>
                  <CTableDataCell>
                      {{ harvest.quantity }}
                  </CTableDataCell>
                  <CTableDataCell>
                      {{ new Date(harvest.harvest_date).toLocaleDateString() }}
                  </CTableDataCell>
                  <!-- <CTableDataCell>
                    {{ new Date(harvest.created_at).toLocaleDateString() ?? '' }}
                  </CTableDataCell> -->
                  <CTableDataCell>
                    <div class="d-flex gap-1">
                      <CButton
                        size="sm"
                        color="info"
                        variant="outline"
                        title="Edit Harvest"
                        @click="openEdit(harvest)"
                      >
                        <CIcon :icon="cilPencil" size="sm" />
                      </CButton>
                      <CButton
                        size="sm"
                        color="danger"
                        variant="outline"
                        title="Delete Harvest"
                        @click="confirmDelete(harvest.id, harvest.fruit)"
                      >
                        <CIcon :icon="cilTrash" size="sm" />
                      </CButton>
                    </div>
                  </CTableDataCell>
                </CTableRow>
                <CTableRow v-if="paginatedHarvests.length === 0">
                  <CTableDataCell colspan="7" class="text-center py-5">
                    <div class="empty-state">
                      <i class="fas fa-apple-alt fa-3x text-muted mb-3"></i>
                      <h5 class="text-muted">No harvest records found</h5>
                      <p class="text-muted mb-3">Try adjusting your search criteria or add a new harvest record</p>
                      <CButton color="primary" @click="openCreate">
                        <CIcon :icon="cilPlus" class="me-1" />Add Your First Harvest
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
                    {{ Math.min(currentPage * itemsPerPage, filteredHarvests.length) }} 
                    of {{ filteredHarvests.length }} entries
                    <span v-if="filteredHarvests.length !== harvestStore.harvests.length">
                      (filtered from {{ harvestStore.harvests.length }} total)
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

                  <!-- First 3 pages -->
                  <CButton
                    v-for="page in Math.min(3, totalPages)"
                    :key="page"
                    size="sm"
                    :color="currentPage === page ? 'primary' : 'light'"
                    @click="goToPage(page)"
                  >
                    {{ page }}
                  </CButton>

                  <!-- Ellipsis if needed -->
                  <span v-if="totalPages > 4" class="px-2">...</span>

                  <!-- Last page -->
                  <CButton
                    v-if="totalPages > 3"
                    size="sm"
                    :color="currentPage === totalPages ? 'primary' : 'light'"
                    @click="goToPage(totalPages)"
                  >
                    {{ totalPages }}
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
        {{ isEditing ? 'Edit Harvest' : 'Add New Harvest' }}
      </CModalTitle>
    </CModalHeader>
    <CModalBody class="p-0">
      <!-- Tab Content -->
      <CForm
        id="harvest-form"
        class="p-4"
        novalidate
        :validated="validated"
        @submit="handleSubmit"
      >
        <CRow class="g-3" >
          <CCol md="12">
            <CFormLabel for="farm_id" class="fw-semibold">Farm <span style="color: red;">*</span></CFormLabel>
            <Multiselect
              v-model="currentHarvest.farm_id"
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
            <div v-if="validated && !currentHarvest.farm_id" class="invalid-feedback d-block">
              Farm is required.
            </div>
          </CCol>

          <CCol md="12">
            <CFormLabel for="harvest_by" class="fw-semibold">Harvest By <span style="color: red;">*</span></CFormLabel>
            <Multiselect
              v-model="currentHarvest.harvest_by"
              placeholder="Select Harvest By"
              track-by="value"
              label="label"
              :options="harvestBy"
              :show-no-results="false"
              :close-on-select="true"
              :clear-on-select="false"
              :preserve-search="true"
              :preselect-first="false"
              :disabled="!currentHarvest.farm_id"
              @input="handleHarvestByInput(currentHarvest.harvest_by, currentHarvest.farm_id.value)"
            />
            <div v-if="!currentHarvest.farm_id" class="form-text text-muted small">
              Please select a Farm first.
            </div>
            <div v-if="validated && !currentHarvest.harvest_by" class="invalid-feedback d-block">
              Harvest By field is required.
            </div>
          </CCol>

          <CCol md="12" v-if="currentHarvest.harvest_by && currentHarvest.harvest_by.value == 'Parcel'">
            <CFormLabel for="tree" class="fw-semibold">Parcel <span style="color: red;">*</span></CFormLabel>
            <Multiselect
              v-model="currentHarvest.parcel_id"
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
            <div v-if="validated && !currentHarvest.parcel_id && currentHarvest.harvest_by.value == 'Parcel'" class="invalid-feedback d-block">
              Parcel is required.
            </div>
          </CCol>

          <CCol md="12" v-if="currentHarvest.harvest_by && currentHarvest.harvest_by.value == 'Block'">
            <CFormLabel for="tree" class="fw-semibold">Block <span style="color: red;">*</span></CFormLabel>
            <Multiselect
              v-model="currentHarvest.block_id"
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
            <div v-if="validated && !currentHarvest.block_id && currentHarvest.harvest_by.value == 'Block'" class="invalid-feedback d-block">
              Block is required.
            </div>
          </CCol>

          <CCol md="6">
            <CFormLabel for="fruit" class="fw-semibold">Fruit <span style="color: red;">*</span></CFormLabel>
            <Multiselect
              v-model="currentHarvest.fruit"
              placeholder="Select fruit"
              track-by="value"
              label="label"
              :options="fruitTypes"
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
            <div v-if="validated && !currentHarvest.fruit" class="invalid-feedback d-block">
              Fruit is required.
            </div>
          </CCol>

          <CCol md="6" v-if="isAvocadoSelected">
            <CFormLabel for="type" class="fw-semibold">Avocado Variety <span style="color: red;">*</span></CFormLabel>
            <Multiselect
              v-model="currentHarvest.type"
              placeholder="Select avocado variety"
              track-by="value"
              label="label"
              :options="avocadoVarieties"
              :show-no-results="false"
              :close-on-select="true"
              :clear-on-select="false"
              :preserve-search="true"
              :preselect-first="false"
            />
            <div v-if="validated && isAvocadoSelected && !currentHarvest.type" class="invalid-feedback d-block">
              Avocado variety is required.
            </div>
          </CCol>

          <CCol :md="12">
  <CFormLabel for="quality">Quality</CFormLabel>
  <select
    id="quality"
    v-model="currentHarvest.quality"
    class="form-select"
  >
    <option value="Average">Average</option>
    <option value="Premium">Premium</option>
    <option value="Rejected">Rejected</option>
  </select>
  <CFormFeedback invalid v-if="!currentHarvest.quality">
    Rejection status is required.
  </CFormFeedback>
</CCol>

          <CCol md="12">
            <CFormLabel for="harvest-date" class="fw-semibold">Harvest Date <span style="color: red;">*</span></CFormLabel>
            <CFormInput 
              id="harvest-date" 
              type="date" 
              v-model="currentHarvest.harvest_date" 
              required 
            />
            <CFormFeedback invalid>Harvest date is required.</CFormFeedback>
          </CCol>

          <CCol md="12">
            <CFormLabel for="quantity" class="fw-semibold">Quantity (kg) <span style="color: red;">*</span></CFormLabel>
            <CFormInput 
              id="quantity" 
              type="number" 
              step="0.01"
              min="0"
              v-model="currentHarvest.quantity" 
              placeholder="Enter quantity in kilograms"
              required 
            />
            <CFormFeedback invalid>Quantity is required.</CFormFeedback>
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
        form="harvest-form"
        :disabled="loading"
      >
        <CSpinner v-if="loading" size="sm" class="me-2" />
        <i v-else :class="isEditing ? 'fas fa-save' : 'fas fa-plus'" class="me-2"></i>
        {{ isEditing ? 'Update Harvest' : 'Create Harvest' }}
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
.stat-card { min-width: 160px; }
      .badge { font-size: 0.85rem; padding: 0.35rem 0.6rem; }
</style>