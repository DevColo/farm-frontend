<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBlockStore } from '@/stores/block.store'
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
  CFormInput,
  CBreadcrumb,
  CBreadcrumbItem,
  CListGroup,
  CListGroupItem,
} from '@coreui/vue'
import CIcon from '@coreui/icons-vue'
import { 
  cilLocationPin,
  cilMap,
  cilDescription,
  cilFullscreen
} from '@coreui/icons'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const route = useRoute()
const router = useRouter()
const blockStore = useBlockStore()

const block = ref(null)
const loading = ref(true)
const error = ref(null)
const showMapModal = ref(false)
const mapContainer = ref(null)
const fullMapContainer = ref(null)
const parcels = ref([])
let map = null
let fullMap = null

onMounted(async () => {
  try {
    const blockId = route.params.id
    // Assuming there's a fetchBlock method in the store
    await blockStore.fetchBlockById(blockId)
    block.value = blockStore.block
    parcels.value = block.value.parcels || []
    // Initialize map if coordinates are available
    if (block.value?.latitude && block.value?.longitude) {
      await nextTick()
      initializeMap()
    }
  } catch (err) {
    error.value = 'Failed to load block details'
    console.error('Error fetching block:', err)
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
  if (!block.value) return { color: 'secondary', text: 'Unknown' }
  return block.value.status === '1' 
    ? { color: 'success', text: 'Active' }
    : { color: 'danger', text: 'Inactive' }
})

const hasCoordinates = computed(() => {
  return block.value?.latitude && block.value?.longitude
})

function initializeMap() {
  if (!hasCoordinates.value || !mapContainer.value) return
  
  try {
    // Create the map
    map = L.map(mapContainer.value, {
      zoomControl: true,
      scrollWheelZoom: false
    }).setView([parseFloat(block.value.latitude), parseFloat(block.value.longitude)], 15)
    
    // Add OpenStreetMap tiles
    // L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    //   attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    //   maxZoom: 19
    // }).addTo(map)
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
  maxZoom: 19
}).addTo(fullMap)
    
    // Create custom icon
    const customIcon = L.divIcon({
      className: 'custom-marker',
      html: '<div style="background-color: #0d6efd; width: 30px; height: 30px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"><div style="transform: rotate(45deg); margin-top: 5px; margin-left: 8px; color: white; font-size: 14px;">📍</div></div>',
      iconSize: [30, 30],
      iconAnchor: [15, 30]
    })
    
    // Add marker
    const marker = L.marker([parseFloat(block.value.latitude), parseFloat(block.value.longitude)], {
      icon: customIcon
    }).addTo(map)
    
    // Add popup
    marker.bindPopup(`
      <div style="text-align: center;">
        <strong>${block.value.name}</strong><br>
        <small>${block.value.farm.name || ''}</small><br>
        <small class="text-muted">${parseFloat(block.value.latitude).toFixed(6)}, ${parseFloat(block.value.longitude).toFixed(6)}</small>
      </div>
    `).openPopup()
    
    // Fix map size issues
    setTimeout(() => {
      map.invalidateSize()
    }, 100)
  } catch (err) {
    console.error('Error initializing map:', err)
  }
}

function openFullscreenMap() {
  showMapModal.value = true
  setTimeout(() => {
    initializeFullscreenMap()
  }, 100)
}

function initializeFullscreenMap() {
  if (!hasCoordinates.value || !fullMapContainer.value) return
  
  try {
    // Remove existing fullMap if any
    if (fullMap) {
      fullMap.remove()
    }
    
    // Create the fullscreen map
    fullMap = L.map(fullMapContainer.value, {
      zoomControl: true,
      scrollWheelZoom: true
    }).setView([parseFloat(block.value.latitude), parseFloat(block.value.longitude)], 15)
    
    // Add OpenStreetMap tiles
    // L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    //   attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    //   maxZoom: 19
    // }).addTo(fullMap)
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  attribution: '',
  maxZoom: 19
}).addTo(fullMap)
    
    // Create custom icon
    const customIcon = L.divIcon({
      className: 'custom-marker',
      html: '<div style="background-color: #0d6efd; width: 40px; height: 40px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 4px solid white; box-shadow: 0 3px 8px rgba(0,0,0,0.4);"><div style="transform: rotate(45deg); margin-top: 8px; margin-left: 10px; color: white; font-size: 18px;">📍</div></div>',
      iconSize: [40, 40],
      iconAnchor: [20, 40]
    })
    
    // Add marker
    const marker = L.marker([parseFloat(block.value.latitude), parseFloat(block.value.longitude)], {
      icon: customIcon
    }).addTo(fullMap)
    
    // Add popup
    marker.bindPopup(`
      <div style="text-align: center; padding: 5px;">
        <h6 style="margin-bottom: 5px;">${block.value.name}</h6>
        <p style="margin-bottom: 3px;">${block.value.farm || ''}</p>
        <small class="text-muted">${parseFloat(block.value.latitude).toFixed(6)}, ${parseFloat(block.value.longitude).toFixed(6)}</small>
      </div>
    `).openPopup()
    
    // Fix map size issues
    setTimeout(() => {
      fullMap.invalidateSize()
    }, 100)
  } catch (err) {
    console.error('Error initializing fullscreen map:', err)
  }
}

function closeMapModal() {
  showMapModal.value = false
  if (fullMap) {
    fullMap.remove()
    fullMap = null
  }
}

function goBack() {
  router.push('/blocks')
}

function openInMaps() {
  if (hasCoordinates.value) {
    const url = `https://www.google.com/maps?q=${block.value.latitude},${block.value.longitude}`
    window.open(url, '_blank')
  }
}

function copyCoordinates() {
  if (hasCoordinates.value) {
    const coords = `${block.value.latitude}, ${block.value.longitude}`
    navigator.clipboard.writeText(coords)
    // You might want to show a toast notification here
  }
}

// Compute tree counts by type
const treeTypeCounts = computed(() => {
  const counts = {}
  if (block.value?.parcels) {
    block.value?.parcels.forEach(tree => {
      counts[tree.type] = (counts[tree.type] || 0) + 1
    })
  }
  return counts
})

// parcels table controls
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
const filteredParcels = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  
  let filtered = parcels.value.filter((tree) => {
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
  Math.max(1, Math.ceil(filteredParcels.value.length / itemsPerPage.value))
)

const paginatedParcels = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredParcels.value.slice(start, start + itemsPerPage.value)
})
</script>

<template>
  <div class="block-view">
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
    <div v-else-if="block">
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
        <CBreadcrumbItem active>{{ block.name }}</CBreadcrumbItem>
      </CBreadcrumb>

      <CRow class="g-4">
        <!-- Block Information -->
        <CCol lg="8">
          <CCard class="h-100 shadow-sm">
            <CCardHeader class="bg-white border-bottom">
              <h5 class="mb-0">
                <CIcon :icon="cilDescription" class="me-2 text-primary" />
                Block Information
              </h5>
            </CCardHeader>
            <CCardBody>
              <CRow class="g-4">
                <CCol md="2">
                    <CListGroup flush>
                    <CListGroupItem class="border-0 ps-0">
                        <div class="d-flex justify-content-between">
                        <span class="text-muted small">Block Name: <br><span class="fw-bold">{{ block.name }}</span></span>
                        
                        </div>
                    </CListGroupItem>
                    </CListGroup>
                </CCol>

                <CCol md="2">
                    <CListGroup flush>
                    <CListGroupItem class="border-0 ps-0">
                        <div class="d-flex justify-content-between">
                        <span class="text-muted small">Block Code: <br><span class="fw-bold">{{ block.block_code }}</span></span>
                        
                        </div>
                    </CListGroupItem>
                    </CListGroup>
                </CCol>

                <CCol md="2">
                    <CListGroup flush>
                    <CListGroupItem class="border-0 ps-0">
                        <div class="d-flex justify-content-between">
                        <span class="text-muted small">Farm: <br><span class="fw-bold">{{ block.farm?.name }}</span></span>
                        </div>
                    </CListGroupItem>
                    </CListGroup>
                </CCol>

                <CCol md="2">
                    <CListGroup flush>
                    <CListGroupItem class="border-0 ps-0">
                        <div class="d-flex justify-content-between">
                        <span class="text-muted small">Country:<br> <span class="fw-bold">{{ block.farm?.country?.country }}</span></span>
                        
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
                        <span class="text-muted small">Total Parcel:<br> <span class="fw-bold">{{ block.parcels.length }}</span></span>
                        
                        </div>
                    </CListGroupItem>
                    </CListGroup>
                </CCol>
                </CRow>

                


              <!-- Description -->
              <div class="mt-4">
                <h6 class="mb-2">Description</h6>
                <div class="bg-light p-3 rounded">
                  <p class="mb-0 text-muted">{{ block?.description }}</p>
                </div>
              </div>
            </CCardBody>
          </CCard>
        </CCol>

        <!-- Location & Map -->
        <CCol lg="4">
          <CCard class="h-100 shadow-sm">
            <CCardHeader class="bg-white border-bottom">
              <h5 class="mb-0">
                <CIcon :icon="cilMap" class="me-2 text-primary" />
                Location
              </h5>
            </CCardHeader>
            <CCardBody>
              <div v-if="hasCoordinates">
                <!-- Coordinates Display -->
                <div class="mb-3">
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <small class="text-muted">GPS Coordinates</small>
                    <CButton size="sm" color="outline-secondary" @click="copyCoordinates" title="Copy coordinates">
                      <i class="fas fa-copy"></i>
                    </CButton>
                  </div>
                  <div class="bg-light p-2 rounded font-monospace small">
                    <div><strong>Lat:</strong> {{ parseFloat(block.latitude).toFixed(6) }}</div>
                    <div><strong>Lng:</strong> {{ parseFloat(block.longitude).toFixed(6) }}</div>
                  </div>
                </div>

                <!-- Map Container -->
                <!-- <div class="map-container mb-3" ref="mapContainer" v-if="hasCoordinates">
                  
                </div> -->

                <!-- Action Buttons -->
                <div class="d-grid gap-2">
                  <CButton color="primary" @click="openFullscreenMap">
                    <CIcon :icon="cilFullscreen" class="me-1" />
                    View Fullscreen Map
                  </CButton>
                  <CButton color="primary" variant="outline" @click="openInMaps">
                    <i class="fas fa-external-link-alt me-1"></i>
                    Open in Google Maps
                  </CButton>
                </div>
              </div>

              <!-- No Coordinates -->
              <div v-else class="text-center py-4">
                <CIcon :icon="cilLocationPin" size="xl" class="text-muted mb-3" />
                <h6 class="text-muted mb-2">No Location Data</h6>
                <p class="text-muted small mb-3">GPS coordinates haven't been set for this block.</p>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <!-- Additional Information Cards -->
      <CRow class="g-4 mt-2">
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
                    <h6 class="mb-1">Block Created</h6>
                    <p class="text-muted small mb-0">{{ new Date(block.created_at).toLocaleString() }}</p>
                  </div>
                </div>
                <div class="timeline-item" v-if="block.last_inspection">
                  <div class="timeline-marker bg-info"></div>
                  <div class="timeline-content">
                    <h6 class="mb-1">Last Inspection</h6>
                    <p class="text-muted small mb-0">{{ new Date(block.last_inspection).toLocaleString() }}</p>
                  </div>
                </div>
                <div class="timeline-item">
                  <div class="timeline-marker bg-warning"></div>
                  <div class="timeline-content">
                    <h6 class="mb-1">Last Updated</h6>
                    <p class="text-muted small mb-0">{{ new Date(block.updated_at).toLocaleString() }}</p>
                  </div>
                </div>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <!-- Parcels Records Table -->
      <CRow class="mt-4">
        <CCol cols="12">
          <CCard class="shadow-sm">
            <CCardHeader class="bg-white border-bottom">
              <div class="d-flex justify-content-between align-items-center">
                <h5 class="mb-0">
                  <CIcon :icon="cilList" class="me-2 text-success" />
                  Parcel Records ({{ parcels.length }})
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
                    <CFormSelect v-model="itemsPerPage" @change="resetPage" class="w-auto d-inline-block">
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
                      <CTableHeaderCell>Created At</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    <CTableRow 
                      v-for="parcel in paginatedParcels" 
                      :key="parcel.id"
                      class="table-row"
                    >
                      <CTableDataCell>
                        <router-link :to="`/parcels/${parcel.id}`" class="text-decoration-none parcel-link">
                      <i class="fas fa-parcel me-1 text-success"></i>
                      {{ parcel.parcel_code }}
                    </router-link>
                      </CTableDataCell>
                      <CTableDataCell>
                        {{ new Date(parcel.created_at).toLocaleDateString() }}
                      </CTableDataCell>
                    </CTableRow>
                    <CTableRow v-if="paginatedParcels.length === 0">
                      <CTableDataCell colspan="4" class="text-center py-5">
                        <div class="empty-state">
                          <i class="fas fa-apple-alt fa-3x text-muted mb-3"></i>
                          <h5 class="text-muted">No parcel records found</h5>
                          <p class="text-muted mb-3">
                            {{ searchQuery ? 'Try adjusting your search' : 'This parcel has no parcel records yet' }}
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
                      {{ Math.min(currentPage * itemsPerPage, filteredParcels.length) }} 
                      of {{ filteredParcels.length }} records
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
    </div>

    <!-- Fullscreen Map Modal -->
    <CModal 
      :visible="showMapModal" 
      @close="closeMapModal" 
      size="xl"
      fullscreen="lg"
    >
      <CModalHeader>
        <CModalTitle>
          <CIcon :icon="cilMap" class="me-2 text-primary" />
          {{ block?.name }} - Location Map
        </CModalTitle>
      </CModalHeader>
      <CModalBody class="p-0">
        <div class="fullscreen-map-container" ref="fullMapContainer"></div>
      </CModalBody>
      <CModalFooter>
        <div class="w-100 d-flex justify-content-between align-items-center">
          <div class="text-muted small">
            <CIcon :icon="cilLocationPin" class="me-1" />
            {{ parseFloat(block?.latitude).toFixed(6) }}, {{ parseFloat(block?.longitude).toFixed(6) }}
          </div>
          <div class="d-flex gap-2">
            <CButton color="primary" variant="outline" size="sm" @click="openInMaps">
              <i class="fas fa-external-link-alt me-1"></i>
              Open in Google Maps
            </CButton>
            <CButton color="secondary" @click="closeMapModal">
              Close
            </CButton>
          </div>
        </div>
      </CModalFooter>
    </CModal>
  </div>
</template>

<style scoped>
.block-view {
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