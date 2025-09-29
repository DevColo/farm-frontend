<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useTreeStore } from '@/stores/tree.store'
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
  CBadge,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
  CSpinner,
} from '@coreui/vue'
import CIcon from '@coreui/icons-vue'
import { cilPencil, cilTrash, cilPlus, cilCloudDownload, cilSearch, cilFilter } from '@coreui/icons'
import Multiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.css'

const treeStore = useTreeStore()
const harvestStore = useHarvestStore()

const showModal = ref(false)
const isEditing = ref(false)
const validated = ref(false)
const loading = ref(false)
const showFilters = ref(false)
const editingId = ref(null)

const currentHarvest = ref({
  tree_id: '',
  harvest_date: '',
  quantity: '',
})

// Enhanced search and filter states
const searchQuery = ref('')
const filterTree = ref('')
const itemsPerPage = ref(10)
const currentPage = ref(1)
const sortField = ref('harvest_date')
const sortOrder = ref('desc')
const trees = ref([])

// fetch data
onMounted(async () => {
  loading.value = true
  try {
    await Promise.all([
      harvestStore.fetchHarvests(),
      treeStore.fetchTrees()
    ])
  } finally {
    loading.value = false
  }
})

// Watch the store in case trees are updated dynamically later
watch(
  () => treeStore.trees,
  (newTrees) => {
    trees.value = newTrees.map(t => ({
      value: t.id,
      label: `${t?.block?.farm?.name} - ${t.tree_code}`,
      type: t.type,
    }))
  },
  { deep: true }
)

// Generate filter options
const availableTrees = computed(() => {
  const treeNames = harvestStore.harvests.map(harvest => harvest.tree).filter(Boolean)
  return Array.from(new Set(treeNames))
})

// Enhanced filtering and sorting
const filteredHarvests = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  
  // Always work with an array
  const harvests = Array.isArray(harvestStore.harvests) ? harvestStore.harvests : []
  
  let filtered = harvests.filter((harvest) => {
    const matchesQuery = !q || [harvest.tree_id, harvest.harvest_date].some((field) => 
      field?.toLowerCase().includes(q)
    )
    const matchesTree = !filterTree.value || harvest.tree_id == filterTree.value
    
    return matchesQuery && matchesTree
  })

  // Apply sorting
  filtered.sort((a, b) => {
    let aValue = a[sortField.value]
    let bValue = b[sortField.value]
    
    // Handle special cases
    if (sortField.value === 'tree_name') {
      aValue = a.tree_name || ''
      bValue = b.tree_name || ''
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
  if (sortField.value !== field) return '↕️'
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
  currentHarvest.value = {
    tree_id: '',
    harvest_date: '',
    quantity: '',
  }
  showModal.value = true
}

function openEdit(harvest) {
  isEditing.value = true
  validated.value = false
  editingId.value = harvest.id
  
  // Find matching tree object from options
  const treeObj = trees.value.find(t => 
    t.value == harvest.tree_id
  )
  
  currentHarvest.value = {
    tree_id: treeObj || null,
    harvest_date: harvest.harvest_date,
    quantity: harvest.quantity,
  }
  
  showModal.value = true
}

async function confirmDelete(id, treeName) {
  if (confirm(`Are you sure you want to delete harvest record for ${treeName}? This action cannot be undone.`)) {
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
  
  // Check if all required fields are filled
  if (!currentHarvest.value.tree_id || !currentHarvest.value.harvest_date || !currentHarvest.value.quantity) {
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
      tree_id: currentHarvest.value.tree_id.value,
      harvest_date: currentHarvest.value.harvest_date,
      quantity: currentHarvest.value.quantity,
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
watch([searchQuery, filterTree], () => {
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
                <i class="fas fa-apple-alt me-2 text-success"></i>Tree Harvests
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
                    <option value="">All Trees</option>
                    <option v-for="tree in availableTrees" :key="tree?.id" :value="tree?.id">
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
                  <CTableHeaderCell class="sortable" @click="sortBy('tree_name')">
                    Tree {{ getSortIcon('tree_name') }}
                  </CTableHeaderCell>
                  <CTableHeaderCell class="sortable" @click="sortBy('quantity')">
                    Quantity (kg) {{ getSortIcon('quantity') }}
                  </CTableHeaderCell>
                  <CTableHeaderCell class="sortable" @click="sortBy('harvest_date')">
                    Harvest Date {{ getSortIcon('harvest_date') }}
                  </CTableHeaderCell>
                  <CTableHeaderCell>Created At</CTableHeaderCell>
                  <CTableHeaderCell width="120">Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                <CTableRow v-for="harvest in paginatedHarvests" :key="harvest.id" class="table-row">
                  <CTableDataCell>
                    <router-link :to="`/trees/${harvest.tree?.id}`" class="text-decoration-none tree-link">
                      <i class="fas fa-tree me-1 text-success"></i>
                      {{ harvest.tree?.tree_code }}
                    </router-link>
                  </CTableDataCell>
                  <CTableDataCell>
                      {{ harvest.quantity }}
                  </CTableDataCell>
                  <CTableDataCell>
                      {{ new Date(harvest.harvest_date).toLocaleDateString() }}
                  </CTableDataCell>
                  <CTableDataCell>
                    {{ new Date(harvest.created_at).toLocaleDateString() ?? '' }}
                  </CTableDataCell>
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
                        @click="confirmDelete(harvest.id, harvest.tree_name)"
                      >
                        <CIcon :icon="cilTrash" size="sm" />
                      </CButton>
                    </div>
                  </CTableDataCell>
                </CTableRow>
                <CTableRow v-if="paginatedHarvests.length === 0">
                  <CTableDataCell colspan="5" class="text-center py-5">
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
        <CRow class="g-3">
          <CCol md="12">
            <CFormLabel for="tree" class="fw-semibold">Tree <span style="color: red;">*</span></CFormLabel>
            <Multiselect
              v-model="currentHarvest.tree_id"
              placeholder="Select Tree"
              track-by="value"
              label="label"
              :options="trees"
              :show-no-results="false"
              :close-on-select="true"
              :clear-on-select="false"
              :preserve-search="true"
              :preselect-first="false"
            >
              <template #option="{ option }">
                <i class="fas fa-tree me-2 text-success"></i>{{ option.label }}
                <small class="text-muted ms-2">({{ option.type }})</small>
              </template>
              <template #singleLabel="{ option }">
                <i class="fas fa-tree me-2 text-success"></i>{{ option.label }}
              </template>
            </Multiselect>
            <div v-if="validated && !currentHarvest.tree_id" class="invalid-feedback d-block">
              Tree is required.
            </div>
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
</style>