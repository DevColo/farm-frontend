<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTreeStore } from '@/stores/tree.store'
import {
  CRow,
  CCol,
  CCard,
  CCardHeader,
  CCardBody,
  CButton,
  CBadge,
  CSpinner,
  CAlert,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CBreadcrumb,
  CBreadcrumbItem,
  CListGroup,
  CListGroupItem,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CInputGroup,
  CFormInput,
  CFormSelect,
} from '@coreui/vue'
import CIcon from '@coreui/icons-vue'
import { 
  cilArrowLeft, 
  cilPencil, 
  cilTrash,
  cilCalendar,
  cilDescription,
  cilCheckCircle,
  cilXCircle,
  cilPlus,
  cilSearch,
  cilList,
  cilLocationPin
} from '@coreui/icons'

const route = useRoute()
const router = useRouter()
const treeStore = useTreeStore()

const tree = ref(null)
const harvests = ref([])
const loading = ref(true)
const error = ref(null)
const showDeleteModal = ref(false)

// Harvest table controls
const searchQuery = ref('')
const itemsPerPage = ref(10)
const currentPage = ref(1)
const sortField = ref('harvest_date')
const sortOrder = ref('desc')

// Tree types with their properties
const types = {
  'Orange': { color: 'warning', icon: '🍊' },
  'Avocado': { color: 'success', icon: '🥑' },
  'Lemon': { color: 'warning', icon: '🍋' },
  'Apple': { color: 'danger', icon: '🍎' }
}

onMounted(async () => {
  try {
    const treeId = route.params.id
    // Fetch tree details and its harvest records
    await treeStore.fetchTreeById(treeId)
    tree.value = treeStore.tree
    harvests.value = tree.value.harvests || []
  } catch (err) {
    error.value = 'Failed to load tree details'
    console.error('Error fetching tree:', err)
  } finally {
    loading.value = false
  }
})

const statusBadge = computed(() => {
  if (!tree.value) return { color: 'secondary', text: 'Unknown' }
  return tree.value.status === '1' 
    ? { color: 'success', text: 'Active' }
    : { color: 'danger', text: 'Inactive' }
})

const typeInfo = computed(() => {
  if (!tree.value) return { color: 'secondary', icon: '🌳' }
  return types[tree.value.type] || { color: 'secondary', icon: '🌳' }
})

// Calculate harvest statistics
const harvestStats = computed(() => {
  if (!harvests.value || harvests.value.length === 0) {
    return {
      totalHarvests: 0,
      totalQuantity: 0,
      averageQuantity: 0,
      lastHarvestDate: null,
      highestYield: 0
    }
  }

  const total = harvests.value.reduce((sum, h) => sum + parseFloat(h.quantity || 0), 0)
  const sorted = [...harvests.value].sort((a, b) => 
    new Date(b.harvest_date) - new Date(a.harvest_date)
  )
  const quantities = harvests.value.map(h => parseFloat(h.quantity || 0))
  
  return {
    totalHarvests: harvests.value.length,
    totalQuantity: total.toFixed(2),
    averageQuantity: (total / harvests.value.length).toFixed(2),
    lastHarvestDate: sorted[0]?.harvest_date,
    highestYield: Math.max(...quantities).toFixed(2)
  }
})

// Harvest filtering and sorting
const filteredHarvests = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  
  let filtered = harvests.value.filter((harvest) => {
    if (!q) return true
    return [harvest.harvest_date, harvest.quantity].some((field) => 
      String(field).toLowerCase().includes(q)
    )
  })

  // Apply sorting
  filtered.sort((a, b) => {
    let aValue = a[sortField.value]
    let bValue = b[sortField.value]
    
    if (sortField.value === 'harvest_date') {
      aValue = new Date(a.harvest_date || 0).getTime()
      bValue = new Date(b.harvest_date || 0).getTime()
    } else {
      aValue = parseFloat(aValue) || 0
      bValue = parseFloat(bValue) || 0
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

function resetPage() {
  currentPage.value = 1
}

function nextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++
}

function prevPage() {
  if (currentPage.value > 1) currentPage.value--
}

function goToPage(page) {
  currentPage.value = page
}

function sortBy(field) {
  if (sortField.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortOrder.value = field === 'harvest_date' ? 'desc' : 'asc'
  }
}

function getSortIcon(field) {
  if (sortField.value !== field) return '↕️'
  return sortOrder.value === 'asc' ? '↑' : '↓'
}

function goBack() {
  router.push('/trees')
}

function editTree() {
  router.push(`/trees/${tree.value.id}/edit`)
}

function addNewHarvest() {
  router.push(`/harvests/create?treeId=${tree.value.id}`)
}

function viewBlockDetails() {
  if (tree.value.block_id) {
    router.push(`/blocks/${tree.value.block_id}`)
  }
}

function confirmDelete() {
  showDeleteModal.value = true
}

async function deleteTree() {
  try {
    loading.value = true
    await treeStore.deleteTree(tree.value.id)
    showDeleteModal.value = false
    router.push('/trees')
  } catch (err) {
    error.value = 'Failed to delete tree'
  } finally {
    loading.value = false
  }
}

</script>

<template>
  <div class="tree-view">
    <!-- Loading State -->
    <div v-if="loading" class="d-flex justify-content-center align-items-center" style="min-height: 400px;">
      <CSpinner color="primary" variant="grow" />
    </div>

    <!-- Error State -->
    <CAlert v-else-if="error" color="danger" class="mb-4">
      <strong>Error:</strong> {{ error }}
      <CButton color="danger" variant="outline" size="sm" class="ms-3" @click="goBack">
        Go Back
      </CButton>
    </CAlert>

    <!-- Main Content -->
    <div v-else-if="tree">
      <!-- Breadcrumb -->
      <CBreadcrumb class="mb-4">
        <CBreadcrumbItem>
          <router-link to="/dashboard" class="text-decoration-none">Dashboard</router-link>
        </CBreadcrumbItem>
        <CBreadcrumbItem>
          <router-link to="/farm-list" class="text-decoration-none">Farms</router-link>
        </CBreadcrumbItem>
        <CBreadcrumbItem>
          <router-link to="/block-list" class="text-decoration-none">Blocks</router-link>
        </CBreadcrumbItem>
        <CBreadcrumbItem>
          <router-link to="/tree-list" class="text-decoration-none">Trees</router-link>
        </CBreadcrumbItem>
        <CBreadcrumbItem active>{{ tree.tree_code }}</CBreadcrumbItem>
      </CBreadcrumb>

      <!-- Header -->
      <div class="d-flex justify-content-between align-items-start mb-4">
        <div>
          <h2 class="mb-2">
            <span class="me-2">{{ typeInfo.icon }}</span>
            {{ tree.tree_code }}
          </h2>
        </div>
      </div>

      <CRow class="g-4">
        <!-- Tree Information -->
        <CCol lg="4">
          <CCard class="h-100 shadow-sm">
            <CCardHeader class="bg-white border-bottom">
              <h5 class="mb-0">
                <CIcon :icon="cilDescription" class="me-2 text-success" />
                Tree Information
              </h5>
            </CCardHeader>
            <CCardBody>
              <CListGroup flush>
                <CListGroupItem class="border-0 ps-0">
                  <div class="d-flex justify-content-between">
                    <strong>Tree Name:</strong>
                    <span>{{ tree.name }}</span>
                  </div>
                </CListGroupItem>
                <CListGroupItem class="border-0 ps-0">
                  <div class="d-flex justify-content-between">
                    <strong>Tree Name:</strong>
                    <span>{{ tree.tree_code }}</span>
                  </div>
                </CListGroupItem>
                <CListGroupItem class="border-0 ps-0">
                  <div class="d-flex justify-content-between">
                    <strong>type:</strong>
                    <CBadge :color="typeInfo.color">
                      <span class="me-1">{{ typeInfo.icon }}</span>
                      {{ tree.type }}
                    </CBadge>
                  </div>
                </CListGroupItem>
                <CListGroupItem class="border-0 ps-0">
                  <div class="d-flex justify-content-between">
                    <strong>Block:</strong>
                    <a href="#" @click.prevent="viewBlockDetails" class="text-decoration-none">
                      {{ tree.block?.block_code || 'Not assigned' }}
                    </a>
                  </div>
                </CListGroupItem>
                <CListGroupItem class="border-0 ps-0" v-if="tree.farm_name">
                  <div class="d-flex justify-content-between">
                    <strong>Farm:</strong>
                    <span>{{ tree.farm_name }}</span>
                  </div>
                </CListGroupItem>
                <CListGroupItem class="border-0 ps-0">
                  <div class="d-flex justify-content-between">
                    <strong>Status:</strong>
                    <CBadge :color="statusBadge.color">{{ statusBadge.text }}</CBadge>
                  </div>
                </CListGroupItem>
                <CListGroupItem class="border-0 ps-0" v-if="tree.planted_date">
                  <div class="d-flex justify-content-between">
                    <strong>Planted Date:</strong>
                    <span>{{ new Date(tree.planted_date).toLocaleDateString() }}</span>
                  </div>
                </CListGroupItem>
                <CListGroupItem class="border-0 ps-0" v-if="tree.age_years">
                  <div class="d-flex justify-content-between">
                    <strong>Age:</strong>
                    <span>{{ tree.age_years }} years</span>
                  </div>
                </CListGroupItem>
                <CListGroupItem class="border-0 ps-0">
                  <div class="d-flex justify-content-between">
                    <strong>Created:</strong>
                    <span>{{ new Date(tree.created_at).toLocaleDateString() }}</span>
                  </div>
                </CListGroupItem>
                <CListGroupItem class="border-0 ps-0">
                  <div class="d-flex justify-content-between">
                    <strong>Last Updated:</strong>
                    <span>{{ new Date(tree.updated_at).toLocaleDateString() }}</span>
                  </div>
                </CListGroupItem>
              </CListGroup>

              <!-- Description -->
              <div class="mt-4" v-if="tree.description">
                <h6 class="mb-2">Description</h6>
                <div class="bg-light p-3 rounded">
                  <p class="mb-0 text-muted">{{ tree.description }}</p>
                </div>
              </div>
            </CCardBody>
          </CCard>
        </CCol>

        <!-- Harvest Statistics -->
        <CCol lg="8">
          <CRow class="g-4 mb-4">
            <CCol md="6" lg="4">
              <CCard class="text-center shadow-sm stats-card">
                <CCardBody>
                  <div class="stat-icon bg-primary bg-opacity-10 rounded-circle mx-auto mb-3">
                    <i class="fas fa-list fa-2x text-primary"></i>
                  </div>
                  <h3 class="mb-1">{{ harvestStats.totalHarvests }}</h3>
                  <p class="text-muted mb-0">Total Harvests</p>
                </CCardBody>
              </CCard>
            </CCol>
            <CCol md="6" lg="4">
              <CCard class="text-center shadow-sm stats-card">
                <CCardBody>
                  <div class="stat-icon bg-success bg-opacity-10 rounded-circle mx-auto mb-3">
                    <i class="fas fa-weight-hanging fa-2x text-success"></i>
                  </div>
                  <h3 class="mb-1">{{ harvestStats.totalQuantity }}</h3>
                  <p class="text-muted mb-0">Total Yield (kg)</p>
                </CCardBody>
              </CCard>
            </CCol>
            <CCol md="6" lg="4">
              <CCard class="text-center shadow-sm stats-card">
                <CCardBody>
                  <div class="stat-icon bg-info bg-opacity-10 rounded-circle mx-auto mb-3">
                    <i class="fas fa-chart-line fa-2x text-info"></i>
                  </div>
                  <h3 class="mb-1">{{ harvestStats.averageQuantity }}</h3>
                  <p class="text-muted mb-0">Average Yield (kg)</p>
                </CCardBody>
              </CCard>
            </CCol>
            <CCol md="6" lg="6">
              <CCard class="text-center shadow-sm stats-card">
                <CCardBody>
                  <div class="stat-icon bg-warning bg-opacity-10 rounded-circle mx-auto mb-3">
                    <i class="fas fa-trophy fa-2x text-warning"></i>
                  </div>
                  <h3 class="mb-1">{{ harvestStats.highestYield }}</h3>
                  <p class="text-muted mb-0">Highest Yield (kg)</p>
                </CCardBody>
              </CCard>
            </CCol>
            <CCol md="6" lg="6">
              <CCard class="text-center shadow-sm stats-card">
                <CCardBody>
                  <div class="stat-icon bg-danger bg-opacity-10 rounded-circle mx-auto mb-3">
                    <i class="fas fa-calendar-check fa-2x text-danger"></i>
                  </div>
                  <h3 class="mb-1" v-if="harvestStats.lastHarvestDate">
                    {{ new Date(harvestStats.lastHarvestDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }}
                  </h3>
                  <h3 class="mb-1" v-else>—</h3>
                  <p class="text-muted mb-0">Last Harvest</p>
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>

          <!-- Recent Activity -->
          <CCard class="shadow-sm">
            <CCardHeader class="bg-white border-bottom">
              <h6 class="mb-0">
                <i class="fas fa-history me-2 text-warning"></i>
                Recent Activity
              </h6>
            </CCardHeader>
            <CCardBody>
              <div class="timeline">
                <div class="timeline-item">
                  <div class="timeline-marker bg-success"></div>
                  <div class="timeline-content">
                    <h6 class="mb-1">Tree Registered</h6>
                    <p class="text-muted small mb-0">{{ new Date(tree.created_at).toLocaleString() }}</p>
                  </div>
                </div>
                <div class="timeline-item" v-if="harvestStats.lastHarvestDate">
                  <div class="timeline-marker bg-info"></div>
                  <div class="timeline-content">
                    <h6 class="mb-1">Last Harvest</h6>
                    <p class="text-muted small mb-0">{{ new Date(harvestStats.lastHarvestDate).toLocaleString() }}</p>
                  </div>
                </div>
                <div class="timeline-item">
                  <div class="timeline-marker bg-warning"></div>
                  <div class="timeline-content">
                    <h6 class="mb-1">Last Updated</h6>
                    <p class="text-muted small mb-0">{{ new Date(tree.updated_at).toLocaleString() }}</p>
                  </div>
                </div>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <!-- Harvest Records Table -->
      <CRow class="mt-4">
        <CCol cols="12">
          <CCard class="shadow-sm">
            <CCardHeader class="bg-white border-bottom">
              <div class="d-flex justify-content-between align-items-center">
                <h5 class="mb-0">
                  <CIcon :icon="cilList" class="me-2 text-success" />
                  Harvest Records ({{ harvests.length }})
                </h5>
              </div>
            </CCardHeader>
            <CCardBody class="p-0">
              <!-- Search and Controls -->
              <div class="p-3 bg-light border-bottom">
                <div class="row g-3">
                  <div class="col-md-6">
                    <CInputGroup>
                      <span class="input-group-text">
                        <CIcon :icon="cilSearch" />
                      </span>
                      <CFormInput
                        v-model="searchQuery"
                        placeholder="Search harvest records..."
                        @input="resetPage"
                      />
                    </CInputGroup>
                  </div>
                  <div class="col-md-6 text-end">
                    <CFormSelect v-model="itemsPerPage" @change="resetPage" class="w-auto d-inline-block">
                      <option value="5">5</option>
                      <option value="10">10</option>
                      <option value="25">25</option>
                      <option value="50">50</option>
                    </CFormSelect>
                  </div>
                </div>
              </div>

              <!-- Harvest Table -->
              <div class="table-responsive">
                <CTable hover class="mb-0">
                  <CTableHead class="table-light">
                    <CTableRow>
                      <CTableHeaderCell class="sortable" @click="sortBy('harvest_date')">
                        Harvest Date {{ getSortIcon('harvest_date') }}
                      </CTableHeaderCell>
                      <CTableHeaderCell class="sortable" @click="sortBy('quantity')">
                        Quantity (kg) {{ getSortIcon('quantity') }}
                      </CTableHeaderCell>
                      <CTableHeaderCell>Recorded At</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    <CTableRow 
                      v-for="harvest in paginatedHarvests" 
                      :key="harvest.id"
                      class="table-row"
                    >
                      <CTableDataCell>
                        <i class="fas fa-calendar-alt me-2 text-primary"></i>
                        <strong>{{ new Date(harvest.harvest_date).toLocaleDateString() }}</strong>
                      </CTableDataCell>
                      <CTableDataCell>
                        <CBadge color="success" class="px-2 py-1">
                          {{ parseFloat(harvest.quantity).toFixed(2) }} kg
                        </CBadge>
                      </CTableDataCell>
                      <CTableDataCell>
                        {{ new Date(harvest.created_at).toLocaleDateString() }}
                      </CTableDataCell>
                    </CTableRow>
                    <CTableRow v-if="paginatedHarvests.length === 0">
                      <CTableDataCell colspan="4" class="text-center py-5">
                        <div class="empty-state">
                          <i class="fas fa-apple-alt fa-3x text-muted mb-3"></i>
                          <h5 class="text-muted">No harvest records found</h5>
                          <p class="text-muted mb-3">
                            {{ searchQuery ? 'Try adjusting your search' : 'This tree has no harvest records yet' }}
                          </p>
                        </div>
                      </CTableDataCell>
                    </CTableRow>
                  </CTableBody>
                </CTable>
              </div>

              <!-- Pagination -->
              <div class="p-3 bg-light border-top" v-if="totalPages > 1">
                <div class="d-flex justify-content-between align-items-center">
                  <div class="pagination-info">
                    <span class="text-muted small">
                      Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to 
                      {{ Math.min(currentPage * itemsPerPage, filteredHarvests.length) }} 
                      of {{ filteredHarvests.length }} records
                    </span>
                  </div>
                  <div class="pagination-controls d-flex align-items-center gap-2">
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
                      v-for="page in Math.min(totalPages, 5)" 
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
      </CRow>
    </div>

    <!-- Delete Confirmation Modal -->
    <CModal :visible="showDeleteModal" @close="showDeleteModal = false" backdrop="static">
      <CModalHeader>
        <CModalTitle>
          <CIcon :icon="cilTrash" class="me-2 text-danger" />
          Confirm Delete
        </CModalTitle>
      </CModalHeader>
      <CModalBody>
        <p>Are you sure you want to delete <strong>"{{ tree?.name }}"</strong>?</p>
        <CAlert color="warning" class="mb-3">
          <strong>Warning:</strong> This action cannot be undone. All data associated with this tree will be permanently deleted.
        </CAlert>
        <CAlert color="danger" v-if="harvests.length > 0">
          <strong>Note:</strong> This tree has {{ harvests.length }} harvest record(s). Deleting the tree will also delete all associated harvest records.
        </CAlert>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" @click="showDeleteModal = false">
          Cancel
        </CButton>
        <CButton color="danger" @click="deleteTree" :disabled="loading">
          <CSpinner v-if="loading" size="sm" class="me-2" />
          <CIcon v-else :icon="cilTrash" class="me-1" />
          Delete Tree
        </CButton>
      </CModalFooter>
    </CModal>
  </div>
</template>

<style scoped>
.tree-view {
  padding: 0;
}

.stats-card {
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.stats-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 25px rgba(0, 0, 0, 0.15) !important;
}

.stat-icon {
  width: 70px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.timeline {
  position: relative;
  padding-left: 30px;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 15px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #dee2e6;
}

.timeline-item {
  position: relative;
  padding-bottom: 20px;
}

.timeline-item:last-child {
  padding-bottom: 0;
}

.timeline-marker {
  position: absolute;
  left: -23px;
  top: 0;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 3px solid white;
  box-shadow: 0 0 0 1px #dee2e6;
}

.timeline-content h6 {
  font-size: 0.9rem;
  margin-bottom: 4px;
}

.timeline-content p {
  font-size: 0.8rem;
  line-height: 1.2;
}

.sortable {
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s;
}

.sortable:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.empty-state {
  padding: 2rem;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .d-flex.justify-content-between.align-items-start {
    flex-direction: column;
    gap: 1rem;
  }
  
  .d-flex.gap-2 {
    flex-wrap: wrap;
  }
}

/* Card hover effects */
.card {
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 25px rgba(0, 0, 0, 0.1) !important;
}

.pagination-controls .btn {
  min-width: 40px;
}

.table-row:hover {
  background-color: rgba(0, 123, 255, 0.05);
}
</style>