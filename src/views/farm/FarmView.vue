<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useFarmStore } from '@/stores/farm.store'
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
  cilLocationPin,
  cilList
} from '@coreui/icons'

const route = useRoute()
const router = useRouter()
const farmStore = useFarmStore()

const farm = ref(null)
const blocks = ref([])
const loading = ref(true)
const error = ref(null)
const showDeleteModal = ref(false)

// Block table controls
const searchQuery = ref('')
const itemsPerPage = ref(10)
const currentPage = ref(1)
const sortField = ref('name')
const sortOrder = ref('asc')

onMounted(async () => {
  try {
    const farmId = route.params.id
    // Fetch farm details and its blocks
    await farmStore.fetchFarmById(farmId)
    farm.value = farmStore.farm
    blocks.value = farm.value.blocks || []
  } catch (err) {
    error.value = 'Failed to load farm details'
    console.error('Error fetching farm:', err)
  } finally {
    loading.value = false
  }
})

const statusBadge = computed(() => {
  if (!farm.value) return { color: 'secondary', text: 'Unknown' }
  return farm.value.status === '1' 
    ? { color: 'success', text: 'Active' }
    : { color: 'danger', text: 'Inactive' }
})

// Block filtering and sorting
const filteredBlocks = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  
  let filtered = blocks.value.filter((block) => {
    if (!q) return true
    return [block.name, block.description].some((field) => 
      field?.toLowerCase().includes(q)
    )
  })

  // Apply sorting
  filtered.sort((a, b) => {
    let aValue = a[sortField.value] || ''
    let bValue = b[sortField.value] || ''
    
    aValue = String(aValue).toLowerCase()
    bValue = String(bValue).toLowerCase()
    
    if (sortOrder.value === 'asc') {
      return aValue.localeCompare(bValue)
    } else {
      return bValue.localeCompare(aValue)
    }
  })

  return filtered
})

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredBlocks.value.length / itemsPerPage.value))
)

const paginatedBlocks = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredBlocks.value.slice(start, start + itemsPerPage.value)
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
    sortOrder.value = 'asc'
  }
}

function getSortIcon(field) {
  if (sortField.value !== field) return '↕'
  return sortOrder.value === 'asc' ? '↑' : '↓'
}

function getBlockStatusBadge(status) {
  return status === '1' ? { color: 'success', text: 'Active' } : { color: 'danger', text: 'Inactive' }
}

function viewBlockDetails(blockId) {
  router.push(`/blocks/${blockId}`)
}

function goBack() {
  router.push('/farms')
}

function editFarm() {
  router.push(`/farms/${farm.value.id}/edit`)
}

function addNewBlock() {
  router.push(`/blocks/create?farmId=${farm.value.id}`)
}

async function deleteFarm() {
  try {
    loading.value = true
    await farmStore.deleteFarm(farm.value.id)
    showDeleteModal.value = false
    router.push('/farms')
  } catch (err) {
    error.value = 'Failed to delete farm'
  } finally {
    loading.value = false
  }
}

// Sample data for development - remove when connecting to real store
if (!farm.value && !loading.value) {
  farm.value = {
    id: 1,
    name: 'Green Valley Farm',
    country: 'Rwanda',
    description: 'A premium agricultural facility specializing in sustainable farming practices with modern infrastructure.',
    status: '1',
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-20T14:45:00Z',
    block_count: 5,
    total_area: '150 hectares',
    established: '2020',
    owner: 'John Smith'
  }
  blocks.value = [
    {
      id: 1,
      name: 'North Block A',
      description: 'Main northern section with natural water sources',
      latitude: -1.2345678,
      longitude: 30.1234567,
      status: '1',
      created_at: '2024-01-15T10:30:00Z'
    },
    {
      id: 2,
      name: 'South Block B',
      description: 'Southern grazing area',
      latitude: -1.2445678,
      longitude: 30.1334567,
      status: '1',
      created_at: '2024-01-16T11:30:00Z'
    },
    {
      id: 3,
      name: 'East Block C',
      description: 'Eastern cultivation zone',
      latitude: -1.2245678,
      longitude: 30.1434567,
      status: '0',
      created_at: '2024-01-17T09:30:00Z'
    }
  ]
  loading.value = false
}
</script>

<template>
  <div class="farm-view">
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
    <div v-else-if="farm">
      <!-- Breadcrumb -->
      <CBreadcrumb class="mb-4">
        <CBreadcrumbItem>
          <router-link to="/dashboard" class="text-decoration-none">Dashboard</router-link>
        </CBreadcrumbItem>
        <CBreadcrumbItem>
          <router-link to="/farm-list" class="text-decoration-none">Farms</router-link>
        </CBreadcrumbItem>
        <CBreadcrumbItem active>{{ farm.name }}</CBreadcrumbItem>
      </CBreadcrumb>

      <CRow class="g-4">
        <!-- Farm Information -->
        <CCol lg="4">
          <CCard class="h-100 shadow-sm">
            <CCardHeader class="bg-white border-bottom">
              <h5 class="mb-0">
                <CIcon :icon="cilDescription" class="me-2 text-primary" />
                Farm Information
              </h5>
            </CCardHeader>
            <CCardBody>
              <CListGroup flush>
                <CListGroupItem class="border-0 ps-0">
                  <div class="d-flex justify-content-between">
                    <strong>Farm Name:</strong>
                    <span>{{ farm.name }}</span>
                  </div>
                </CListGroupItem>
                <CListGroupItem class="border-0 ps-0">
                  <div class="d-flex justify-content-between">
                    <strong>Country:</strong>
                    <span>{{ farm.country?.country }}</span>
                  </div>
                </CListGroupItem>
                <CListGroupItem class="border-0 ps-0">
                  <div class="d-flex justify-content-between">
                    <strong>Status:</strong>
                    <CBadge :color="statusBadge.color">{{ statusBadge.text }}</CBadge>
                  </div>
                </CListGroupItem>
                <CListGroupItem class="border-0 ps-0" v-if="farm.user">
                  <div class="d-flex justify-content-between">
                    <strong>Created By:</strong>
                    <span>{{ farm.user?.first_name }}</span>
                  </div>
                </CListGroupItem>
                <CListGroupItem class="border-0 ps-0">
                  <div class="d-flex justify-content-between">
                    <strong>Created:</strong>
                    <span>{{ new Date(farm.created_at).toLocaleDateString() }}</span>
                  </div>
                </CListGroupItem>
                <CListGroupItem class="border-0 ps-0">
                  <div class="d-flex justify-content-between">
                    <strong>Last Updated:</strong>
                    <span>{{ new Date(farm.updated_at).toLocaleDateString() }}</span>
                  </div>
                </CListGroupItem>
              </CListGroup>

              <!-- Description -->
              <div class="mt-4" v-if="farm.description">
                <h6 class="mb-2">Description</h6>
                <div class="bg-light p-3 rounded">
                  <p class="mb-0 text-muted">{{ farm.description }}</p>
                </div>
              </div>
            </CCardBody>
          </CCard>
        </CCol>

        <!-- Statistics Cards -->
        <CCol lg="8">
          <CRow class="g-4 mb-4">
            <CCol md="4">
              <CCard class="text-center shadow-sm stats-card">
                <CCardBody>
                  <div class="stat-icon bg-primary bg-opacity-10 rounded-circle mx-auto mb-3">
                    <i class="fas fa-th-large fa-2x text-primary"></i>
                  </div>
                  <h3 class="mb-1">{{ blocks.length }}</h3>
                  <p class="text-muted mb-0">Total Blocks</p>
                </CCardBody>
              </CCard>
            </CCol>
            <CCol md="4">
              <CCard class="text-center shadow-sm stats-card">
                <CCardBody>
                  <div class="stat-icon bg-success bg-opacity-10 rounded-circle mx-auto mb-3">
                    <i class="fas fa-check-circle fa-2x text-success"></i>
                  </div>
                  <h3 class="mb-1">{{ blocks.filter(b => b.status === '1').length }}</h3>
                  <p class="text-muted mb-0">Active Blocks</p>
                </CCardBody>
              </CCard>
            </CCol>
            <CCol md="4">
              <CCard class="text-center shadow-sm stats-card">
                <CCardBody>
                  <div class="stat-icon bg-warning bg-opacity-10 rounded-circle mx-auto mb-3">
                    <i class="fas fa-map-marker-alt fa-2x text-warning"></i>
                  </div>
                  <h3 class="mb-1">{{ blocks.filter(b => b.latitude && b.longitude).length }}</h3>
                  <p class="text-muted mb-0">Mapped Blocks</p>
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
                    <h6 class="mb-1">Farm Created</h6>
                    <p class="text-muted small mb-0">{{ new Date(farm.created_at).toLocaleString() }}</p>
                  </div>
                </div>
                <div class="timeline-item" v-if="blocks.length > 0">
                  <div class="timeline-marker bg-info"></div>
                  <div class="timeline-content">
                    <h6 class="mb-1">Last Block Added</h6>
                    <p class="text-muted small mb-0">{{ new Date(blocks[blocks.length - 1].created_at).toLocaleString() }}</p>
                  </div>
                </div>
                <div class="timeline-item">
                  <div class="timeline-marker bg-warning"></div>
                  <div class="timeline-content">
                    <h6 class="mb-1">Last Updated</h6>
                    <p class="text-muted small mb-0">{{ new Date(farm.updated_at).toLocaleString() }}</p>
                  </div>
                </div>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <!-- Blocks Table -->
      <CRow class="mt-4">
        <CCol cols="12">
          <CCard class="shadow-sm">
            <CCardHeader class="bg-white border-bottom">
              <div class="d-flex justify-content-between align-items-center">
                <h5 class="mb-0">
                  <CIcon :icon="cilList" class="me-2 text-primary" />
                  Blocks ({{ blocks.length }})
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
                        placeholder="Search blocks..."
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

              <!-- Blocks Table -->
              <div class="table-responsive">
                <CTable hover class="mb-0">
                  <CTableHead class="table-light">
                    <CTableRow>
                      <CTableHeaderCell class="sortable" @click="sortBy('name')">
                        Block Name {{ getSortIcon('name') }}
                      </CTableHeaderCell>
                      <CTableHeaderCell>Block Code</CTableHeaderCell>
                      <CTableHeaderCell>Status</CTableHeaderCell>
                      <CTableHeaderCell>Created At</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    <CTableRow 
                      v-for="block in paginatedBlocks" 
                      :key="block.id"
                      class="table-row clickable-row"
                      @click="viewBlockDetails(block.id)"
                      style="cursor: pointer;"
                    >
                      <CTableDataCell>
                        <router-link :to="`/block/${block.id}`" class="text-decoration-none">
                        {{ block.name }}
                      </router-link>
                      </CTableDataCell>
                      <CTableDataCell>
                        <span class="text-truncate d-inline-block" style="max-width: 200px;">
                          {{ block.block_code }}
                        </span>
                      </CTableDataCell>
                      <CTableDataCell>
                        <CBadge 
                          :color="getBlockStatusBadge(block.status).color"
                          class="px-2 py-1"
                        >
                          {{ getBlockStatusBadge(block.status).text }}
                        </CBadge>
                      </CTableDataCell>
                      <CTableDataCell>
                        {{ new Date(block.created_at).toLocaleDateString() }}
                      </CTableDataCell>
                    </CTableRow>
                    <CTableRow v-if="paginatedBlocks.length === 0">
                      <CTableDataCell colspan="6" class="text-center py-5">
                        <div class="empty-state">
                          <i class="fas fa-th-large fa-3x text-muted mb-3"></i>
                          <h5 class="text-muted">No blocks found</h5>
                          <p class="text-muted mb-3">
                            {{ searchQuery ? 'Try adjusting your search' : 'This farm has no blocks yet' }}
                          </p>
                          <CButton color="primary" @click="addNewBlock" v-if="!searchQuery">
                            <CIcon :icon="cilPlus" class="me-1" />
                            Add First Block
                          </CButton>
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
                      {{ Math.min(currentPage * itemsPerPage, filteredBlocks.length) }} 
                      of {{ filteredBlocks.length }} blocks
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
        <p>Are you sure you want to delete <strong>"{{ farm?.name }}"</strong>?</p>
        <CAlert color="warning" class="mb-3">
          <strong>Warning:</strong> This action cannot be undone. All data associated with this farm will be permanently deleted.
        </CAlert>
        <CAlert color="danger" v-if="blocks.length > 0">
          <strong>Note:</strong> This farm has {{ blocks.length }} block(s). Deleting the farm will also delete all associated blocks.
        </CAlert>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" @click="showDeleteModal = false">
          Cancel
        </CButton>
        <CButton color="danger" @click="deleteFarm" :disabled="loading">
          <CSpinner v-if="loading" size="sm" class="me-2" />
          <CIcon v-else :icon="cilTrash" class="me-1" />
          Delete Farm
        </CButton>
      </CModalFooter>
    </CModal>
  </div>
</template>

<style scoped>
.farm-view {
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

.clickable-row {
  transition: background-color 0.2s ease;
}

.clickable-row:hover {
  background-color: rgba(0, 123, 255, 0.05) !important;
}

.table-row:hover .text-primary {
  color: #0b5ed7 !important;
  text-decoration: underline;
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

.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pagination-controls .btn {
  min-width: 40px;
}
</style>