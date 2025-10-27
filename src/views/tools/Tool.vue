<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useFarmStore } from '@/stores/farm.store'
import { useToolStore } from '@/stores/tool.store'
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

const farmStore = useFarmStore()
const toolStore = useToolStore()

const showModal = ref(false)
const isEditing = ref(false)
const validated = ref(false)
const loading = ref(false)
const showFilters = ref(false)
const editingId = ref(null)

const currentTool = ref({
  name: '',
  quantity: '',
  farm_id: '',
})

// Enhanced search and filter states
const searchQuery = ref('')
const filterItem = ref('')
const filterFarm = ref('')
const itemsPerPage = ref(10)
const currentPage = ref(1)
const sortField = ref('name')
const sortOrder = ref('desc')
const farms = ref([])

// fetch data
onMounted(async () => {
  loading.value = true
  try {
    await Promise.all([
      toolStore.fetchTools(),
      farmStore.fetchFarms(),
    ])
  } finally {
    loading.value = false
  }
})

watch(
  () => farmStore.farms,
  (newFarms) => {
    farms.value = newFarms.map(f => ({
      value: f.id,
      label: `${f?.farm_code} - ${f?.name}`,
    }))
  },
  { deep: true }
)

// Generate filter options
const availableItems = computed(() => {
  return itemTypes.map(item => item.value)
})

const availableFarms = computed(() => {
  const farmNames = toolStore.tools.map(tool => tool.farm?.name).filter(Boolean)
  return Array.from(new Set(farmNames))
})

// Enhanced filtering and sorting
const filteredTools = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  
  const tools = Array.isArray(toolStore.tools) ? toolStore.tools : []
  
  let filtered = tools.filter((tool) => {
    const matchesQuery = !q || [
      tool.name, 
      tool.item, 
      tool.purchased_by,
      tool.farm?.name
    ].some((field) => 
      field?.toLowerCase().includes(q)
    )
    const matchesItem = !filterItem.value || tool.item == filterItem.value
    const matchesFarm = !filterFarm.value || tool.farm?.name == filterFarm.value
    
    return matchesQuery && matchesItem && matchesFarm
  })

  // Apply sorting
  filtered.sort((a, b) => {
    let aValue = a[sortField.value]
    let bValue = b[sortField.value]
    
    if (sortField.value === 'name') {
      aValue = new Date(a.name || 0).getTime()
      bValue = new Date(b.name || 0).getTime()
    } else if (sortField.value === 'farm') {
      aValue = a.farm?.name || ''
      bValue = b.farm?.name || ''
    } else {
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
  Math.max(1, Math.ceil(filteredTools.value.length / itemsPerPage.value))
)

const paginatedTools = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredTools.value.slice(start, start + itemsPerPage.value)
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
  filterItem.value = ''
  filterFarm.value = ''
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

// Export functions
function exportPDF() {
  console.log('Exporting to PDF...')
}

function exportCSV() {
  console.log('Exporting to CSV...')
}

// Modal handlers
function openCreate() {
  isEditing.value = false
  validated.value = false
  editingId.value = null
  currentTool.value = {
    name: '',
    quantity: '',
    farm_id: '',
  }
  showModal.value = true
}

function openEdit(tool) {
  isEditing.value = true
  validated.value = false
  editingId.value = tool.id
  
  currentTool.value = {
    name: tool.name,
    quantity: tool.quantity,
    farm_id: tool.farm_id ? { 
      value: tool.farm_id, 
      label: `${tool.farm?.farm_code} - ${tool.farm?.name}` 
    } : '',
  }
  
  showModal.value = true
}

async function confirmDelete(id, name) {
  if (confirm(`Are you sure you want to delete tool record for ${name}? This action cannot be undone.`)) {
    loading.value = true
    try {
      await toolStore.deletetool(id)
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
  
  if (!form.checkValidity()) {
    validated.value = true
    return
  }
  
  loading.value = true
  try {
    const payload = {
      name: currentTool.value.name,
      quantity: currentTool.value.quantity,
      farm_id: currentTool.value.farm_id?.value || currentTool.value.farm_id,
    }
    
    if (isEditing.value) {
      payload.tool_id = editingId.value
      const res = await toolStore.editTool(payload)
      if(res == 1){
        showModal.value = false
        validated.value = false
      }
    } else {
      const res = await toolStore.createTool(payload)
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
watch([searchQuery, filterItem, filterFarm], () => {
  resetPage()
})

// Calculate tool statistics
const toolStats = computed(() => {
  if (!toolStore.tools || toolStore.tools.length === 0) {
    return {
      totalTools: 0,
    }
  }
  
  return {
    totalTools: toolStore.tools.length,
  }
})
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
        <router-link to="#" class="text-decoration-none">Farm</router-link>
      </CBreadcrumbItem>
      <CBreadcrumbItem active>Tools</CBreadcrumbItem>
    </CBreadcrumb>

    <!-- Main Table Card -->
    <CCol cols="12">
      <CCard class="shadow-sm border-0">
        <!-- Enhanced Header -->
        <CCardHeader class="bg-white border-bottom">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h5 class="mb-1">
                <i class="fas fa-dollar-sign me-2 text-danger"></i>tools
              </h5>
              <p class="text-muted small mb-0">
                Total tools: {{ toolStats.totalTools }}
              </p>
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
                <CIcon :icon="cilPlus" class="me-1" />Add New Tool
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
                      placeholder="Search by name, item, or purchased by"
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
                  <CFormSelect v-model="filterItem" @change="resetPage">
                    <option value="">All Items</option>
                    <option v-for="item in availableItems" :key="item" :value="item">
                      {{ item }}
                    </option>
                  </CFormSelect>
                </div>
                <div class="col-md-2">
                  <CFormSelect v-model="filterFarm" @change="resetPage">
                    <option value="">All Farms</option>
                    <option v-for="farm in availableFarms" :key="farm" :value="farm">
                      {{ farm }}
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
                  <CTableHeaderCell class="sortable" @click="sortBy('name')">
                    Name {{ getSortIcon('name') }}
                  </CTableHeaderCell>
                  <CTableHeaderCell class="sortable" @click="sortBy('quantity')">
                    Quantity {{ getSortIcon('quantity') }}
                  </CTableHeaderCell>
                  <CTableHeaderCell class="sortable" @click="sortBy('farm')">
                    Farm {{ getSortIcon('farm') }}
                  </CTableHeaderCell>
                  <CTableHeaderCell width="120">Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                <CTableRow v-for="tool in paginatedTools" :key="tool.id" class="table-row">
                  <CTableDataCell>
                    {{ tool.name || '—' }}
                  </CTableDataCell>
                  <CTableDataCell>
                    {{ tool.quantity || '' }}
                  </CTableDataCell>
                  <CTableDataCell>
                    <router-link
                      :to="`/farm/${tool.farm_id}`"
                      class="text-decoration-none"
                    >
                      {{ tool.farm?.name ?? '—' }}
                    </router-link>
                  </CTableDataCell>
                  <CTableDataCell>
                    <div class="d-flex gap-1">
                      <CButton
                        size="sm"
                        color="info"
                        variant="outline"
                        title="Edit tool"
                        @click="openEdit(tool)"
                      >
                        <CIcon :icon="cilPencil" size="sm" />
                      </CButton>
                      <CButton
                        size="sm"
                        color="danger"
                        variant="outline"
                        title="Delete tool"
                        @click="confirmDelete(tool.id, tool.name)"
                      >
                        <CIcon :icon="cilTrash" size="sm" />
                      </CButton>
                    </div>
                  </CTableDataCell>
                </CTableRow>
                <CTableRow v-if="paginatedTools.length === 0">
                  <CTableDataCell colspan="9" class="text-center py-5">
                    <div class="empty-state">
                      <i class="fas fa-dollar-sign fa-3x text-muted mb-3"></i>
                      <h5 class="text-muted">No tool records found</h5>
                      <p class="text-muted mb-3">Try adjusting your search criteria or add a new tool record</p>
                      <CButton color="primary" @click="openCreate">
                        <CIcon :icon="cilPlus" class="me-1" />Add Your First tool
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
                  {{ Math.min(currentPage * itemsPerPage, filteredTools.length) }} 
                  of {{ filteredTools.length }} entries
                  <span v-if="filteredTools.length !== toolStore.tools.length">
                    (filtered from {{ toolStore.tools.length }} total)
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
        <i class="fas fa-dollar-sign me-2 text-danger"></i>
        {{ isEditing ? 'Edit Tool' : 'Add New Tool' }}
      </CModalTitle>
    </CModalHeader>
    <CModalBody class="p-0">
      <CForm
        id="tool-form"
        class="p-4"
        novalidate
        :validated="validated"
        @submit="handleSubmit"
      >
        <CRow class="g-3">
          <CCol md="12">
            <CFormLabel for="name" class="fw-semibold">Name <span style="color: red;">*</span></CFormLabel>
            <CFormInput 
              id="name" 
              type="text" 
              v-model="currentTool.name" 
              placeholder="Enter name"
              required 
            />
            <CFormFeedback invalid>Name is required.</CFormFeedback>
          </CCol>

          <CCol md="6">
            <CFormLabel for="quantity" class="fw-semibold">Quantity <span style="color: red;">*</span></CFormLabel>
            <CFormInput 
              id="quantity" 
              type="number" 
              step="0.01"
              v-model="currentTool.quantity" 
              placeholder="Enter quantity"
              required 
            />
            <CFormFeedback invalid>Quantity is required.</CFormFeedback>
          </CCol>

          <CCol md="12">
            <CFormLabel for="farm_id" class="fw-semibold">Farm <span style="color: red;">*</span></CFormLabel>
            <Multiselect
              v-model="currentTool.farm_id"
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
            <div v-if="validated && !currentTool.farm_id" class="invalid-feedback d-block">
              Farm is required.
            </div>
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
        form="tool-form"
        :disabled="loading"
      >
        <CSpinner v-if="loading" size="sm" class="me-2" />
        <i v-else :class="isEditing ? 'fas fa-save' : 'fas fa-plus'" class="me-2"></i>
        {{ isEditing ? 'Update tool' : 'Create tool' }}
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

.badge {
  font-size: 0.85rem;
  padding: 0.35em 0.65em;
}
</style>
