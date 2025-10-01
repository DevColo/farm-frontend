<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePastureStore } from '@/stores/pasture.store'
import { useCowStore } from '@/stores/cow.store'
import { useMilkStore } from '@/stores/milk.store'
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
  cilPencil,
  cilDescription,
  cilList,
  cilSearch,
} from '@coreui/icons'

const route = useRoute()
const router = useRouter()
const pastureStore = usePastureStore()
const cowStore = useCowStore()
const milkStore = useMilkStore()

const pasture = ref(null)
const loading = ref(true)
const error = ref(null)
const cows = ref([])
const milkRecords = ref([])

onMounted(async () => {
  try {
    const pastureId = route.params.id
    await pastureStore.fetchPastureById(pastureId);
    pasture.value = pastureStore.pasture;
    cows.value = pastureStore.pasture.cows;
    milkRecords.value = pastureStore.pasture.daily_milk_records;

  } catch (err) {
    error.value = 'Failed to load pasture details'
    console.error('Error fetching pasture:', err)
  } finally {
    loading.value = false
  }
})

const statusBadge = computed(() => {
  if (!pasture.value) return { color: 'secondary', text: 'Unknown' }
  return pasture.value.status === '1' 
    ? { color: 'success', text: 'Active' }
    : { color: 'danger', text: 'Inactive' }
})

// Computed statistics
const stats = computed(() => {
  if (!pasture.value) return {}
  
  const totalCows = cows.value.length
  const activeCows = cows.value.filter(c => c.status === '1').length
  const maleCows = cows.value.filter(c => c.gender === 'Male').length
  const femaleCows = cows.value.filter(c => c.gender === 'Female').length
  const totalMilkProduction = milkRecords.value.reduce(
    (sum, r) => sum + Number(r.morning_qty || 0) + Number(r.evening_qty || 0),
    0
  )
  const averageMilkPerDay = milkRecords.value.length > 0 
    ? (totalMilkProduction / milkRecords.value.length).toFixed(2)
    : 0

  return {
    totalCows,
    activeCows,
    maleCows,
    femaleCows,
    totalMilkProduction,
    averageMilkPerDay,
  }
})

// Breed counts
const breedCounts = computed(() => {
  const counts = {}
  cows.value.forEach(cow => {
    if (cow.breed) {
      counts[cow.breed] = (counts[cow.breed] || 0) + 1
    }
  })
  return counts
})

function goBack() {
  router.push('/pastures')
}
// Cows table controls
const searchQueryCows = ref('')
const itemsPerPageCows = ref(10)
const currentPageCows = ref(1)
const sortFieldCows = ref('name')
const sortOrderCows = ref('asc')

// Milk records table controls
const searchQueryMilk = ref('')
const itemsPerPageMilk = ref(10)
const currentPageMilk = ref(1)
const sortFieldMilk = ref('record_date')
const sortOrderMilk = ref('desc')

function getSortIcon(field, currentField, order) {
  if (currentField !== field) return '↕️'
  return order === 'asc' ? '↑' : '↓'
}

function sortBy(field, type) {
  if (type === 'cows') {
    if (sortFieldCows.value === field) {
      sortOrderCows.value = sortOrderCows.value === 'asc' ? 'desc' : 'asc'
    } else {
      sortFieldCows.value = field
      sortOrderCows.value = 'asc'
    }
  } else {
    if (sortFieldMilk.value === field) {
      sortOrderMilk.value = sortOrderMilk.value === 'asc' ? 'desc' : 'asc'
    } else {
      sortFieldMilk.value = field
      sortOrderMilk.value = 'asc'
    }
  }
}

// Cows filtering and sorting
const filteredCows = computed(() => {
  const q = searchQueryCows.value.trim().toLowerCase()
  
  let filtered = cows.value.filter((cow) => {
    if (!q) return true
    return [cow.name, cow.ear_tag, cow.breed].some((field) => 
      String(field).toLowerCase().includes(q)
    )
  })

  filtered.sort((a, b) => {
    let aValue = a[sortFieldCows.value]
    let bValue = b[sortFieldCows.value]
    
    aValue = String(aValue || '').toLowerCase()
    bValue = String(bValue || '').toLowerCase()
    
    if (sortOrderCows.value === 'asc') {
      return aValue.localeCompare(bValue)
    } else {
      return bValue.localeCompare(aValue)
    }
  })

  return filtered
})

const totalPagesCows = computed(() =>
  Math.max(1, Math.ceil(filteredCows.value.length / itemsPerPageCows.value))
)

const paginatedCows = computed(() => {
  const start = (currentPageCows.value - 1) * itemsPerPageCows.value
  return filteredCows.value.slice(start, start + itemsPerPageCows.value)
})

// Milk records filtering and sorting
const filteredMilkRecords = computed(() => {
  const q = searchQueryMilk.value.trim().toLowerCase()
  
  let filtered = milkRecords.value.filter((record) => {
    if (!q) return true
    return [record.record_date].some((field) => 
      String(field).toLowerCase().includes(q)
    )
  })

  filtered.sort((a, b) => {
    let aValue = a[sortFieldMilk.value]
    let bValue = b[sortFieldMilk.value]
    
    if (sortFieldMilk.value === 'record_date') {
      aValue = new Date(aValue).getTime()
      bValue = new Date(bValue).getTime()
    }
    
    if (sortOrderMilk.value === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return bValue > aValue ? 1 : -1
    }
  })

  return filtered
})

const totalPagesMilk = computed(() =>
  Math.max(1, Math.ceil(filteredMilkRecords.value.length / itemsPerPageMilk.value))
)

const paginatedMilkRecords = computed(() => {
  const start = (currentPageMilk.value - 1) * itemsPerPageMilk.value
  return filteredMilkRecords.value.slice(start, start + itemsPerPageMilk.value)
})

function resetPageCows() {
  currentPageCows.value = 1
}

function resetPageMilk() {
  currentPageMilk.value = 1
}

function nextPageCows() {
  if (currentPageCows.value < totalPagesCows.value) currentPageCows.value++
}

function prevPageCows() {
  if (currentPageCows.value > 1) currentPageCows.value--
}

function nextPageMilk() {
  if (currentPageMilk.value < totalPagesMilk.value) currentPageMilk.value++
}

function prevPageMilk() {
  if (currentPageMilk.value > 1) currentPageMilk.value--
}
</script>

<template>
  <div class="pasture-view">
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
    <div v-else-if="pasture">
      <!-- Breadcrumb -->
      <CBreadcrumb class="mb-4">
        <CBreadcrumbItem>
          <router-link to="/dashboard" class="text-decoration-none">Dashboard</router-link>
        </CBreadcrumbItem>
        <CBreadcrumbItem>
          <router-link to="/pastures" class="text-decoration-none">Pastures</router-link>
        </CBreadcrumbItem>
        <CBreadcrumbItem active>{{ pasture.pasture }}</CBreadcrumbItem>
      </CBreadcrumb>

      <CRow class="g-4">
        <!-- Pasture Information -->
        <CCol lg="8">
          <CCard class="h-100 shadow-sm">
            <CCardHeader class="bg-white border-bottom">
              <h5 class="mb-0">
                <CIcon :icon="cilDescription" class="me-2 text-primary" />
                Pasture Information
              </h5>
            </CCardHeader>
            <CCardBody>
              <CRow class="g-4">
                <CCol md="3">
                  <CListGroup flush>
                    <CListGroupItem class="border-0 ps-0">
                      <div class="d-flex justify-content-between">
                        <span class="text-muted small">Pasture Name: <br><span class="fw-bold">{{ pasture.pasture }}</span></span>
                      </div>
                    </CListGroupItem>
                  </CListGroup>
                </CCol>

                <CCol md="3">
                  <CListGroup flush>
                    <CListGroupItem class="border-0 ps-0">
                      <div class="d-flex justify-content-between">
                        <span class="text-muted small">Country: <br><span class="fw-bold">{{ pasture.country }}</span></span>
                      </div>
                    </CListGroupItem>
                  </CListGroup>
                </CCol>

                <CCol md="3">
                  <CListGroup flush>
                    <CListGroupItem class="border-0 ps-0">
                      <div class="d-flex justify-content-between">
                        <span class="text-muted small">Status: <br><CBadge :color="statusBadge.color">{{ statusBadge.text }}</CBadge></span>
                      </div>
                    </CListGroupItem>
                  </CListGroup>
                </CCol>

                <CCol md="3">
                  <CListGroup flush>
                    <CListGroupItem class="border-0 ps-0">
                      <div class="d-flex justify-content-between">
                        <span class="text-muted small">Total Cows: <br><span class="fw-bold">{{ stats.totalCows }}</span></span>
                      </div>
                    </CListGroupItem>
                  </CListGroup>
                </CCol>
              </CRow>

              <!-- Description -->
              <div class="mt-4">
                <h6 class="mb-2">Description</h6>
                <div class="bg-light p-3 rounded">
                  <p class="mb-0 text-muted">{{ pasture?.description || 'No description provided' }}</p>
                </div>
              </div>
            </CCardBody>
          </CCard>
        </CCol>

        <!-- Statistics Card -->
        <CCol lg="4">
          <CCard class="shadow-sm h-100">
            <CCardHeader class="bg-white border-bottom">
              <h6 class="mb-0">
                <i class="fas fa-chart-bar me-2 text-success"></i>
                Statistics
              </h6>
            </CCardHeader>
            <CCardBody>
              <div class="list-group list-group-flush">
                <div class="list-group-item d-flex justify-content-between align-items-center border-0 px-0">
                  <span class="text-muted">Total Cows</span>
                  <CBadge color="primary" class="badge-pill">{{ stats.totalCows }}</CBadge>
                </div>
                <div class="list-group-item d-flex justify-content-between align-items-center border-0 px-0">
                  <span class="text-muted">Active Cows</span>
                  <CBadge color="success" class="badge-pill">{{ stats.activeCows }}</CBadge>
                </div>
                <div class="list-group-item d-flex justify-content-between align-items-center border-0 px-0">
                  <span class="text-muted">Male Cows</span>
                  <CBadge color="info" class="badge-pill">{{ stats.maleCows }}</CBadge>
                </div>
                <div class="list-group-item d-flex justify-content-between align-items-center border-0 px-0">
                  <span class="text-muted">Female Cows</span>
                  <CBadge color="secondary" class="badge-pill">{{ stats.femaleCows }}</CBadge>
                </div>
                <div class="list-group-item d-flex justify-content-between align-items-center border-0 px-0">
                  <span class="text-muted">Total Milk (L)</span>
                  <CBadge color="warning" class="badge-pill">{{ stats.totalMilkProduction }}</CBadge>
                </div>
                <div class="list-group-item d-flex justify-content-between align-items-center border-0 px-0">
                  <span class="text-muted">Avg/Day (L)</span>
                  <CBadge color="dark" class="badge-pill">{{ stats.averageMilkPerDay }}</CBadge>
                </div>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <!-- Additional Information Cards -->
      <CRow class="g-4 mt-2">
        <!-- Breed Statistics -->
        <CCol lg="4">
          <CCard class="shadow-sm">
            <CCardHeader class="bg-white border-bottom">
              <h6 class="mb-0">
                <i class="fas fa-paw me-2 text-info"></i>
                Breed Statistics
              </h6>
            </CCardHeader>
            <CCardBody>
              <div v-for="(count, breed) in breedCounts" :key="breed" class="d-flex justify-content-between align-items-center mb-2">
                <span class="text-muted">{{ breed }}</span>
                <CBadge color="info" class="badge-pill">{{ count }}</CBadge>
              </div>
              <div v-if="Object.keys(breedCounts).length === 0" class="text-center text-muted">
                No breed data available
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
                    <h6 class="mb-1">Pasture Created</h6>
                    <p class="text-muted small mb-0">{{ new Date(pasture.created_at).toLocaleString() }}</p>
                  </div>
                </div>
                <div class="timeline-item">
                  <div class="timeline-marker bg-warning"></div>
                  <div class="timeline-content">
                    <h6 class="mb-1">Last Updated</h6>
                    <p class="text-muted small mb-0">{{ new Date(pasture.updated_at).toLocaleString() }}</p>
                  </div>
                </div>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <!-- Cows Table -->
      <CRow class="mt-4">
        <CCol cols="12">
          <CCard class="shadow-sm">
            <CCardHeader class="bg-white border-bottom">
              <div class="d-flex justify-content-between align-items-center">
                <h5 class="mb-0">
                  <i class="fas fa-cow me-2 text-primary"></i>
                  Cows ({{ cows.length }})
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
                        v-model="searchQueryCows"
                        placeholder="Search cows..."
                        @input="resetPageCows"
                      />
                    </CInputGroup>
                  </div>
                  <div class="col-md-6 text-end">
                    <CFormSelect v-model="itemsPerPageCows" @change="resetPageCows" class="w-auto d-inline-block">
                      <option value="5">5</option>
                      <option value="10">10</option>
                      <option value="25">25</option>
                      <option value="50">50</option>
                    </CFormSelect>
                  </div>
                </div>
              </div>

              <!-- Cows Table -->
              <div class="table-responsive">
                <CTable hover class="mb-0">
                  <CTableHead class="table-light">
                    <CTableRow>
                      <CTableHeaderCell class="sortable" @click="sortBy('name', 'cows')">
                        Name {{ getSortIcon('name', sortFieldCows, sortOrderCows) }}
                      </CTableHeaderCell>
                      <CTableHeaderCell class="sortable" @click="sortBy('ear_tag', 'cows')">
                        Tag Number {{ getSortIcon('ear_tag', sortFieldCows, sortOrderCows) }}
                      </CTableHeaderCell>
                      <CTableHeaderCell>Breed</CTableHeaderCell>
                      <CTableHeaderCell>Gender</CTableHeaderCell>
                      <CTableHeaderCell>Date of Birth</CTableHeaderCell>
                      <CTableHeaderCell>Status</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    <CTableRow 
                      v-for="cow in paginatedCows" 
                      :key="cow.id"
                      class="table-row"
                    >
                      <CTableDataCell>
                        <router-link :to="`/cows/${cow.id}`" class="text-decoration-none">
                          <i class="fas fa-cow me-1 text-primary"></i>
                          {{ cow.name }}
                        </router-link>
                      </CTableDataCell>
                      <CTableDataCell>{{ cow.ear_tag }}</CTableDataCell>
                      <CTableDataCell>{{ cow.breed }}</CTableDataCell>
                      <CTableDataCell>
                        <CBadge :color="cow.gender === 'Male' ? 'info' : 'secondary'">
                          {{ cow.gender }}
                        </CBadge>
                      </CTableDataCell>
                      <CTableDataCell>
                        {{ new Date(cow.date_of_birth).toLocaleDateString() }}
                      </CTableDataCell>
                      <CTableDataCell>
                        <CBadge :color="cow.status === '1' ? 'success' : 'danger'">
                          {{ cow.status === '1' ? 'Active' : 'Inactive' }}
                        </CBadge>
                      </CTableDataCell>
                    </CTableRow>
                    <CTableRow v-if="paginatedCows.length === 0">
                      <CTableDataCell colspan="6" class="text-center py-5">
                        <div class="empty-state">
                          <i class="fas fa-cow fa-3x text-muted mb-3"></i>
                          <h5 class="text-muted">No cows found</h5>
                          <p class="text-muted mb-3">
                            {{ searchQueryCows ? 'Try adjusting your search' : 'This pasture has no cows yet' }}
                          </p>
                        </div>
                      </CTableDataCell>
                    </CTableRow>
                  </CTableBody>
                </CTable>
              </div>

              <!-- Pagination -->
              <div class="p-3 bg-light border-top" v-if="totalPagesCows > 1">
                <div class="d-flex justify-content-between align-items-center">
                  <div class="pagination-info">
                    <span class="text-muted small">
                      Showing {{ (currentPageCows - 1) * itemsPerPageCows + 1 }} to 
                      {{ Math.min(currentPageCows * itemsPerPageCows, filteredCows.length) }} 
                      of {{ filteredCows.length }} cows
                    </span>
                  </div>
                  <div class="pagination-controls d-flex align-items-center gap-2">
                    <CButton 
                      size="sm" 
                      variant="outline" 
                      :disabled="currentPageCows === 1"
                      @click="prevPageCows"
                    >
                      Previous
                    </CButton>
                    <CButton 
                      size="sm" 
                      variant="outline" 
                      :disabled="currentPageCows === totalPagesCows"
                      @click="nextPageCows"
                    >
                      Next
                    </CButton>
                  </div>
                </div>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <!-- Milk Records Table -->
      <CRow class="mt-4">
        <CCol cols="12">
          <CCard class="shadow-sm">
            <CCardHeader class="bg-white border-bottom">
              <div class="d-flex justify-content-between align-items-center">
                <h5 class="mb-0">
                  <i class="fas fa-tint me-2 text-info"></i>
                  Milk Records ({{ milkRecords.length }})
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
                        v-model="searchQueryMilk"
                        placeholder="Search by date..."
                        @input="resetPageMilk"
                      />
                    </CInputGroup>
                  </div>
                  <div class="col-md-6 text-end">
                    <CFormSelect v-model="itemsPerPageMilk" @change="resetPageMilk" class="w-auto d-inline-block">
                      <option value="5">5</option>
                      <option value="10">10</option>
                      <option value="25">25</option>
                      <option value="50">50</option>
                    </CFormSelect>
                  </div>
                </div>
              </div>

              <!-- Milk Records Table -->
              <div class="table-responsive">
                <CTable hover class="mb-0">
                  <CTableHead class="table-light">
                    <CTableRow>
                      <CTableHeaderCell class="sortable" @click="sortBy('record_date', 'milk')">
                        Record Date {{ getSortIcon('record_date', sortFieldMilk, sortOrderMilk) }}
                      </CTableHeaderCell>
                      <CTableHeaderCell>Morning Qty (L)</CTableHeaderCell>
                      <CTableHeaderCell>Evening Qty (L)</CTableHeaderCell>
                      <CTableHeaderCell>Total Qty (L)</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    <CTableRow 
                      v-for="record in paginatedMilkRecords" 
                      :key="record.id"
                      class="table-row"
                    >
                      <CTableDataCell>{{ record.record_date }}</CTableDataCell>
                      <CTableDataCell>{{ record.morning_qty }}</CTableDataCell>
                      <CTableDataCell>{{ record.evening_qty }}</CTableDataCell>
                      <CTableDataCell>
                        <strong>{{ Number(record.morning_qty || 0) + Number(record.evening_qty || 0) }}</strong>
                      </CTableDataCell>
                    </CTableRow>
                    <CTableRow v-if="paginatedMilkRecords.length === 0">
                      <CTableDataCell colspan="4" class="text-center py-5">
                        <div class="empty-state">
                          <i class="fas fa-tint fa-3x text-muted mb-3"></i>
                          <h5 class="text-muted">No milk records found</h5>
                          <p class="text-muted mb-3">
                            {{ searchQueryMilk ? 'Try adjusting your search' : 'This pasture has no milk records yet' }}
                          </p>
                        </div>
                      </CTableDataCell>
                    </CTableRow>
                  </CTableBody>
                </CTable>
              </div>

              <!-- Pagination -->
              <div class="p-3 bg-light border-top" v-if="totalPagesMilk > 1">
                <div class="d-flex justify-content-between align-items-center">
                  <div class="pagination-info">
                    <span class="text-muted small">
                      Showing {{ (currentPageMilk - 1) * itemsPerPageMilk + 1 }} to 
                      {{ Math.min(currentPageMilk * itemsPerPageMilk, filteredMilkRecords.length) }} 
                      of {{ filteredMilkRecords.length }} records
                    </span>
                  </div>
                  <div class="pagination-controls d-flex align-items-center gap-2">
                    <CButton 
                      size="sm" 
                      variant="outline" 
                      :disabled="currentPageMilk === 1"
                      @click="prevPageMilk"
                    >
                      Previous
                    </CButton>
                    <CButton 
                      size="sm" 
                      variant="outline" 
                      :disabled="currentPageMilk === totalPagesMilk"
                      @click="nextPageMilk"
                    >
                      Next
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
.pasture-view {
  padding: 0;
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

/* Badge Styles */
.badge-pill {
  padding: 0.375rem 0.75rem;
  font-weight: 500;
}

/* Table Styles */
.sortable {
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s;
}

.sortable:hover {
  background-color: #e9ecef !important;
}

.table-row {
  transition: all 0.2s ease;
}

.table-row:hover {
  background-color: #f8f9fa;
}

/* Empty State */
.empty-state {
  padding: 2rem;
}

/* Card Hover Effects */
.card {
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.card:hover {
  box-shadow: 0 4px 25px rgba(0, 0, 0, 0.1) !important;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .d-flex.justify-content-between.align-items-center {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start !important;
  }
  
  .d-flex.gap-2 {
    flex-wrap: wrap;
    width: 100%;
  }
  
  .pagination-controls {
    width: 100%;
    justify-content: center;
  }
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