<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useParcelStore } from '@/stores/parcel.store'
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
  CFormInput,
  CBreadcrumb,
  CBreadcrumbItem,
  CListGroup,
  CListGroupItem,
} from '@coreui/vue'
import CIcon from '@coreui/icons-vue'
import { 
  cilDescription,
} from '@coreui/icons'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const route = useRoute()
const router = useRouter()
const parcelStore = useParcelStore()

const parcel = ref(null)
const loading = ref(true)
const error = ref(null)
const trees = ref([])
const harvests = ref([])
let map = null
let fullMap = null

onMounted(async () => {
  try {
    const parcelId = route.params.id
    // Assuming there's a fetchParcel method in the store
    await parcelStore.fetchParcelById(parcelId)
    parcel.value = parcelStore.parcel
    trees.value = parcel.value.trees || []
    harvests.value = parcel.value.harvests || []
    // Initialize map if coordinates are available
    if (parcel.value?.latitude && parcel.value?.longitude) {
      await nextTick()
      initializeMap()
    }
  } catch (err) {
    error.value = 'Failed to load parcel details'
    console.error('Error fetching parcel:', err)
  } finally {
    loading.value = false
  }
})

onUnmounted(() => {
  if (map) {
    map.remove()
    map = null
  }
  if (fullMap) {
    fullMap.remove()
    fullMap = null
  }
})

const statusBadge = computed(() => {
  if (!parcel.value) return { color: 'secondary', text: 'Unknown' }
  return parcel.value.status === '1' 
    ? { color: 'success', text: 'Active' }
    : { color: 'danger', text: 'Inactive' }
})

function goBack() {
  router.push('/parcels')
}

// Compute tree counts by type
const treeTypeCounts = computed(() => {
  const counts = {}
  if (parcel.value?.trees) {
    parcel.value?.trees.forEach(tree => {
      counts[tree.type] = (counts[tree.type] || 0) + 1
    })
  }
  return counts
})

// Trees table controls
const searchQuery = ref('')
const itemsPerPage = ref(10)
const currentPage = ref(1)
const sortField = ref('created_at')
const sortOrder = ref('desc')

function getSortIcon(field) {
  if (sortField.value !== field) return '↕'
  return sortOrder.value === 'asc' ? '↑' : '↓'
}

// tree filtering and sorting
const filteredTrees = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  
  let filtered = trees.value.filter((tree) => {
    if (!q) return true
    return [tree.tree_code, tree.type].some((field) => 
      String(field).toLowerCase().includes(q)
    )
  })

  // Apply sorting
  filtered.sort((a, b) => {
    let aValue = a[sortField.value]
    let bValue = b[sortField.value]
    

      aValue = parseFloat(aValue) || 0
      bValue = parseFloat(bValue) || 0
    
    if (sortOrder.value === 'asc') {
      return aValue > bValue ? 1 : aValue < bValue ? -1 : 0
    } else {
      return bValue > aValue ? 1 : bValue < aValue ? -1 : 0
    }
  })

  return filtered
})

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredTrees.value.length / itemsPerPage.value))
)

const paginatedTrees = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredTrees.value.slice(start, start + itemsPerPage.value)
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

const paginatedHarvests = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredHarvests.value.slice(start, start + itemsPerPage.value)
})
</script>

<template>
  <div class="parcel-view">
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
    <div v-else-if="parcel">
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
          <router-link to="/parcel-list" class="text-decoration-none">Parcels</router-link>
        </CBreadcrumbItem>
        <CBreadcrumbItem active>{{ parcel.parcel_code }}</CBreadcrumbItem>
      </CBreadcrumb>

      <CRow class="g-4">
        <!-- parcel Information -->
        <CCol lg="6">
          <CCard class="h-100 shadow-sm">
            <CCardHeader class="bg-white border-bottom">
              <h5 class="mb-0">
                <CIcon :icon="cilDescription" class="me-2 text-primary" />
                parcel Information
              </h5>
            </CCardHeader>
            <CCardBody>
              <CRow class="g-4">
                <CCol md="2">
                    <CListGroup flush>
                    <CListGroupItem class="border-0 ps-0">
                        <div class="d-flex justify-content-between">
                        <span class="text-muted small">parcel Name: <br><span class="fw-bold">{{ parcel.name }}</span></span>
                        
                        </div>
                    </CListGroupItem>
                    </CListGroup>
                </CCol>

                <CCol md="2">
                    <CListGroup flush>
                    <CListGroupItem class="border-0 ps-0">
                        <div class="d-flex justify-content-between">
                        <span class="text-muted small">parcel Code: <br><span class="fw-bold">{{ parcel.parcel_code }}</span></span>
                        
                        </div>
                    </CListGroupItem>
                    </CListGroup>
                </CCol>

                <CCol md="2">
                    <CListGroup flush>
                    <CListGroupItem class="border-0 ps-0">
                        <div class="d-flex justify-content-between">
                        <span class="text-muted small">Farm: <br><span class="fw-bold">{{ parcel.block?.farm?.name }}</span></span>
                        </div>
                    </CListGroupItem>
                    </CListGroup>
                </CCol>

                <CCol md="2">
                    <CListGroup flush>
                    <CListGroupItem class="border-0 ps-0">
                        <div class="d-flex justify-content-between">
                        <span class="text-muted small">Country:<br> <span class="fw-bold">{{ parcel.block?.farm?.country?.country }}</span></span>
                        
                        </div>
                    </CListGroupItem>
                    </CListGroup>
                </CCol>

                <CCol md="2">
                    <CListGroup flush>
                    <CListGroupItem class="border-0 ps-0">
                        <div class="d-flex justify-content-between">
                        <span class="text-muted small">Status: <br><CBadge :color="statusBadge.color">{{ statusBadge.text }}</CBadge></span>
                        
                        </div>
                    </CListGroupItem>
                    </CListGroup>
                </CCol>

                <CCol md="2">
                    <CListGroup flush>
                    <CListGroupItem class="border-0 ps-0">
                        <div class="d-flex justify-content-between">
                        <span class="text-muted small">Total Tree:<br> <span class="fw-bold">{{ parcel.trees.length }}</span></span>
                        
                        </div>
                    </CListGroupItem>
                    </CListGroup>
                </CCol>
                </CRow>

                


              <!-- Description -->
              <div class="mt-4">
                <h6 class="mb-2">Description</h6>
                <div class="bg-light p-3 rounded">
                  <p class="mb-0 text-muted">{{ parcel?.description }}</p>
                </div>
              </div>
            </CCardBody>
          </CCard>
        </CCol>

        <!-- Harvest Statistics -->
        <CCol lg="6">
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
        
        </CCol>
      </CRow>

      <!-- Additional Information Cards -->
      <CRow class="g-4 mt-2">
        <!-- Statistics Card -->
        <CCol lg="4">
    <CCard class="shadow-sm">
      <CCardHeader class="bg-white border-bottom">
        <h6 class="mb-0">
          <i class="fas fa-chart-bar me-2 text-success"></i>
          Tree Statistics
        </h6>
      </CCardHeader>
      <CCardBody>
        <!-- Tree type counts -->
        <div v-for="(count, type) in treeTypeCounts" :key="type" class="d-flex justify-content-between align-items-center mb-1">
          <span class="text-muted">{{ type }} Trees</span>
          <span class="badge bg-success">{{ count }}</span>
        </div>
      </CCardBody>
    </CCard>
  </CCol>

        <!-- Recent Activity -->
        <CCol lg="8">
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
                    <h6 class="mb-1">Parcel Created</h6>
                    <p class="text-muted small mb-0">{{ new Date(parcel.created_at).toLocaleString() }}</p>
                  </div>
                </div>
                <div class="timeline-item" v-if="parcel.last_inspection">
                  <div class="timeline-marker bg-info"></div>
                  <div class="timeline-content">
                    <h6 class="mb-1">Last Inspection</h6>
                    <p class="text-muted small mb-0">{{ new Date(parcel.last_inspection).toLocaleString() }}</p>
                  </div>
                </div>
                <div class="timeline-item">
                  <div class="timeline-marker bg-warning"></div>
                  <div class="timeline-content">
                    <h6 class="mb-1">Last Updated</h6>
                    <p class="text-muted small mb-0">{{ new Date(parcel.updated_at).toLocaleString() }}</p>
                  </div>
                </div>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <!-- Trees Records Table -->
      <CRow class="mt-4">
        <CCol cols="12">
          <CCard class="shadow-sm">
            <CCardHeader class="bg-white border-bottom">
              <div class="d-flex justify-content-between align-items-center">
                <h5 class="mb-0">
                  <CIcon :icon="cilList" class="me-2 text-success" />
                  Trees Records ({{ trees.length }})
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
                        placeholder="Search tree records..."
                        @input="resetPage"
                      />
                    </CInputGroup>
                  </div>
                  <div class="col-md-6 text-end">
                    <CFormSelect v-model="itemsPerPage" @change="resetPage" class="w-auto d-inline-parcel">
                      <option value="5">5</option>
                      <option value="10">10</option>
                      <option value="25">25</option>
                      <option value="50">50</option>
                    </CFormSelect>
                  </div>
                </div>
              </div>

              <!-- Tree Table -->
              <div class="table-responsive">
                <CTable hover class="mb-0">
                  <CTableHead class="table-light">
                    <CTableRow>
                      <CTableHeaderCell class="sortable" @click="sortBy('tree_code')">
                        Tree Code
                      </CTableHeaderCell>
                      <CTableHeaderCell class="sortable" @click="sortBy('type')">
                        Type {{ getSortIcon('type') }}
                      </CTableHeaderCell>
                      <CTableHeaderCell>Created At</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    <CTableRow 
                      v-for="tree in paginatedTrees" 
                      :key="tree.id"
                      class="table-row"
                    >
                      <CTableDataCell>
                        <router-link :to="`/trees/${tree.id}`" class="text-decoration-none tree-link">
                      <i class="fas fa-tree me-1 text-success"></i>
                      {{ tree.tree_code }}
                    </router-link>
                      </CTableDataCell>
                      <CTableDataCell>
                          {{ tree?.type }}
                      </CTableDataCell>
                      <CTableDataCell>
                        {{ new Date(tree.created_at).toLocaleDateString() }}
                      </CTableDataCell>
                    </CTableRow>
                    <CTableRow v-if="paginatedTrees.length === 0">
                      <CTableDataCell colspan="4" class="text-center py-5">
                        <div class="empty-state">
                          <i class="fas fa-apple-alt fa-3x text-muted mb-3"></i>
                          <h5 class="text-muted">No tree records found</h5>
                          <p class="text-muted mb-3">
                            {{ searchQuery ? 'Try adjusting your search' : 'This tree has no tree records yet' }}
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
                      {{ Math.min(currentPage * itemsPerPage, filteredTrees.length) }} 
                      of {{ filteredTrees.length }} records
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
  </div>
</template>

<style scoped>
.parcel-view {
  padding: 0;
}

.map-container {
  height: 250px;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid #e9ecef;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.fullscreen-map-container {
  height: 70vh;
  min-height: 500px;
  width: 100%;
}

/* Leaflet custom styles */
:deep(.leaflet-container) {
  font-family: inherit;
}

:deep(.leaflet-popup-content-wrapper) {
  border-radius: 8px;
  box-shadow: 0 3px 14px rgba(0, 0, 0, 0.2);
}

:deep(.leaflet-popup-content) {
  margin: 10px;
  font-size: 14px;
}

:deep(.custom-marker) {
  background: transparent;
  border: none;
}

/* Fix for Leaflet marker icons */
:deep(.leaflet-default-icon-path) {
  background-image: url('https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png');
}

.map-placeholder {
  height: 100%;
  min-height: 200px;
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

/* Responsive adjustments */
@media (max-width: 768px) {
  .d-flex.justify-content-between.align-items-start {
    flex-direction: column;
    gap: 1rem;
  }
  
  .d-flex.gap-2 {
    flex-wrap: wrap;
  }
  
  .map-container {
    height: 200px;
  }
  
  .fullscreen-map-container {
    height: 60vh;
    min-height: 400px;
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

/* Loading animation */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.loading-placeholder {
  animation: pulse 1.5s ease-in-out infinite;
}
</style>