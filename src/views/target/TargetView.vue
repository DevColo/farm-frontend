<script setup>
import { ref, computed, onMounted } from 'vue'
import { useTargetStore } from '@/stores/target.store'
import { useHarvestStore } from '@/stores/harvest.store'
import {
  CRow,
  CCol,
  CCard,
  CCardHeader,
  CCardBody,
  CProgress,
  CProgressBar,
  CBreadcrumb,
  CBreadcrumbItem,
  CSpinner,
  CBadge,
  CFormSelect,
} from '@coreui/vue'
import { Bar, Doughnut, Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
)

const targetStore = useTargetStore()
const harvestStore = useHarvestStore()

const loading = ref(false)
const selectedYear = ref(new Date().getFullYear())
const selectedProductionType = ref('all')

// Fetch data
onMounted(async () => {
  loading.value = true
  try {
    await Promise.all([
      targetStore.fetchTargetsResult(),
      harvestStore.fetchHarvests()
    ])
  } finally {
    loading.value = false
  }
  console.log('Targets:', targetStore.targetsResult)
})

// Get available years from targets
const availableYears = computed(() => {
  const years = targetStore.targetsResult.map(t => t.year)
  return Array.from(new Set(years)).sort((a, b) => b - a)
})

// Filter targets by selected year and production type
const filteredTargets = computed(() => {
  return targetStore.targetsResult.filter(target => {
    const matchesYear = parseInt(target.year) === selectedYear.value
    const matchesType = selectedProductionType.value === 'all' || target.production_type === selectedProductionType.value
    return matchesYear && matchesType
  })
})

// Calculate actual production from harvests
const calculateActualProduction = (target) => {
  const harvests = harvestStore.harvests.filter(h => {
    const harvestYear = new Date(h.harvest_date).getFullYear()
    const harvestMatch = harvestYear === selectedYear.value
    
    if (target.production_type === 'fruit' && target.fruit_type) {
      // Match by fruit field with target's fruit_type
      return harvestMatch && h.fruit?.toLowerCase() === target.fruit_type.toLowerCase()
    }
    
    // For milk production, you'd need to add milk harvest records
    // or filter differently based on your data structure
    return harvestMatch && target.production_type === 'milk'
  })
  
  return harvests.reduce((sum, h) => sum + (Number(h.quantity) || 0), 0)
}

// Production progress data
const productionProgress = computed(() => {
  return filteredTargets.value.map(target => {
    // Use actual_quantity from API if available, otherwise calculate from harvests
    const actual = Number(target.actual_quantity) || 0
    const targetQty = Number(target.target_quantity) || 0
    const remaining = Math.max(0, targetQty - actual)
    const percentage = targetQty > 0 ? Math.min((actual / targetQty) * 100, 100) : 0
    
    return {
      id: target.id,
      type: target.production_type,
      fruitType: target.fruit_type,
      target: targetQty,
      actual: actual,
      remaining: remaining,
      percentage: percentage,
      status: percentage >= 100 ? 'completed' : percentage >= 75 ? 'on-track' : percentage >= 50 ? 'warning' : 'critical',
      farm: target.farm_id,
      country: target.country_id
    }
  })
})

// Overall statistics
const overallStats = computed(() => {
  const milkTargets = productionProgress.value.filter(p => p.type == 'milk')
  const fruitTargets = productionProgress.value.filter(p => p.type == 'fruit')
  
  const totalMilkTarget = milkTargets.reduce((sum, p) => sum + p.target, 0)
  const totalMilkActual = milkTargets.reduce((sum, p) => sum + p.actual, 0)
  const milkPercentage = totalMilkTarget > 0 ? (totalMilkActual / totalMilkTarget) * 100 : 0

  const totalFruitTarget = fruitTargets.reduce((sum, p) => sum + p.target, 0)
  const totalFruitActual = fruitTargets.reduce((sum, p) => sum + p.actual, 0)
  const fruitPercentage = totalFruitTarget > 0 ? (totalFruitActual / totalFruitTarget) * 100 : 0

  return {
    milk: { target: totalMilkTarget, actual: totalMilkActual, percentage: milkPercentage },
    fruit: { target: totalFruitTarget, actual: totalFruitActual, percentage: fruitPercentage },
    total: {
      targets: filteredTargets.value.length,
      completed: productionProgress.value.filter(p => p.status === 'completed').length,
      onTrack: productionProgress.value.filter(p => p.status === 'on-track').length,
      warning: productionProgress.value.filter(p => p.status === 'warning').length,
      critical: productionProgress.value.filter(p => p.status === 'critical').length,
    }
  }
})

// Chart data - Production comparison
const productionComparisonChart = computed(() => {
  const labels = productionProgress.value.map(p => {
    let label = p.type.charAt(0).toUpperCase() + p.type.slice(1)
    if (p.fruitType) {
      label += ` (${p.fruitType.charAt(0).toUpperCase() + p.fruitType.slice(1)})`
    }
    if (p.farm) {
      label += ` - ${p.farm}`
    }
    return label
  })
  
  return {
    labels: labels,
    datasets: [
      {
        label: 'Target',
        backgroundColor: '#4f5d73',
        data: productionProgress.value.map(p => p.target)
      },
      {
        label: 'Actual',
        backgroundColor: '#2eb85c',
        data: productionProgress.value.map(p => p.actual)
      }
    ]
  }
})

// Chart options
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
    },
    tooltip: {
      callbacks: {
        label: function(context) {
          return `${context.dataset.label}: ${context.parsed.y.toLocaleString()}`
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true
    }
  }
}

// Overall completion doughnut chart
const completionDoughnutChart = computed(() => {
  return {
    labels: ['Completed', 'On Track', 'Warning', 'Critical'],
    datasets: [{
      data: [
        overallStats.value.total.completed,
        overallStats.value.total.onTrack,
        overallStats.value.total.warning,
        overallStats.value.total.critical
      ],
      backgroundColor: [
        '#2eb85c',
        '#39f',
        '#f9b115',
        '#e55353'
      ]
    }]
  }
})

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
    }
  }
}

// Get progress color
function getProgressColor(status) {
  const colors = {
    completed: 'success',
    'on-track': 'info',
    warning: 'warning',
    critical: 'danger'
  }
  return colors[status] || 'secondary'
}

// Format number
function formatNumber(num) {
  return Number(num).toLocaleString()
}

// Get status badge
function getStatusBadge(status) {
  const badges = {
    completed: { color: 'success', text: 'Progress: Completed', icon: '✓' },
    'on-track': { color: 'info', text: 'Progress: On Track', icon: '↗' },
    warning: { color: 'warning', text: 'Progress: Needs Attention', icon: '⚠' },
    critical: { color: 'danger', text: 'Progress: Critical', icon: '' }
  }
  return badges[status] || { color: 'secondary', text: 'Unknown', icon: '?' }
}
</script>

<template>
  <div class="position-relative">
    <!-- Loading Overlay -->
    <div v-if="loading" class="loading-overlay">
      <CSpinner color="primary" variant="grow" />
    </div>

    <!-- Breadcrumb -->
    <CBreadcrumb class="mb-4">
      <CBreadcrumbItem>
        <router-link to="/dashboard" class="text-decoration-none">Dashboard</router-link>
      </CBreadcrumbItem>
      <CBreadcrumbItem>
        <router-link to="/targets" class="text-decoration-none">Production Targets</router-link>
      </CBreadcrumbItem>
      <CBreadcrumbItem active>Progress View</CBreadcrumbItem>
    </CBreadcrumb>

    <!-- Filters -->
    <CCard class="mb-4 shadow-sm border-0">
      <CCardBody>
        <CRow class="align-items-center">
          <CCol md="3">
            <label class="form-label fw-semibold mb-2">Select Year</label>
            <CFormSelect v-model="selectedYear">
              <option v-for="year in availableYears" :key="year" :value="year">
                {{ year }}
              </option>
            </CFormSelect>
          </CCol>
          <CCol md="3">
            <label class="form-label fw-semibold mb-2">Production Type</label>
            <CFormSelect v-model="selectedProductionType">
              <option value="all">All Types</option>
              <option value="milk">Milk</option>
              <option value="fruit">Fruit</option>
            </CFormSelect>
          </CCol>
        </CRow>
      </CCardBody>
    </CCard>

    <!-- Statistics Cards -->
    <CRow class="mb-4">
      <!-- Milk Production Card -->
      <CCol md="6" v-if="selectedProductionType === 'all' || selectedProductionType === 'milk'">
        <CCard class="stat-card shadow-sm border-0 h-100">
          <CCardBody>
            <div class="d-flex align-items-center mb-3">
              <div class="stat-icon milk-icon">
                <i class="fas fa-glass-whiskey"></i>
              </div>
              <div class="ms-3">
                <h6 class="text-muted mb-1">Milk Production</h6>
                <h3 class="mb-0">{{ formatNumber(overallStats.milk.actual) }} / {{ formatNumber(overallStats.milk.target) }} L</h3>
              </div>
            </div>
            <CProgress class="mb-2" height="20">
              <CProgressBar 
                :value="overallStats.milk.percentage" 
                color="primary"
              >
                {{ overallStats.milk.percentage.toFixed(1) }}%
              </CProgressBar>
            </CProgress>
            <small class="text-muted">
              <i class="fas fa-chart-line me-1"></i>
              {{ overallStats.milk.percentage >= 100 ? 'Target Achieved!' : `${(100 - overallStats.milk.percentage).toFixed(1)}% remaining` }}
            </small>
          </CCardBody>
        </CCard>
      </CCol>

      <!-- Fruit Production Card -->
      <CCol md="6" v-if="selectedProductionType === 'all' || selectedProductionType === 'fruit'">
        <CCard class="stat-card shadow-sm border-0 h-100">
          <CCardBody>
            <div class="d-flex align-items-center mb-3">
              <div class="stat-icon fruit-icon">
                <i class="fas fa-apple-alt"></i>
              </div>
              <div class="ms-3">
                <h6 class="text-muted mb-1">Fruit Production</h6>
                <h3 class="mb-0">{{ formatNumber(overallStats.fruit.actual) }} / {{ formatNumber(overallStats.fruit.target) }} Kg</h3>
              </div>
            </div>
            <CProgress class="mb-2" height="20">
              <CProgressBar 
                :value="overallStats.fruit.percentage" 
                color="success"
              >
                {{ overallStats.fruit.percentage.toFixed(1) }}%
              </CProgressBar>
            </CProgress>
            <small class="text-muted">
              <i class="fas fa-chart-line me-1"></i>
              {{ overallStats.fruit.percentage >= 100 ? 'Target Achieved!' : `${(100 - overallStats.fruit.percentage).toFixed(1)}% remaining` }}
            </small>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>

    <!-- Charts Row -->
    <CRow class="mb-4">
      <!-- Production Comparison Chart -->
      <CCol md="8">
        <CCard class="shadow-sm border-0 h-100">
          <CCardHeader class="bg-white border-bottom">
            <h6 class="mb-0">
              <i class="fas fa-chart-bar me-2 text-primary"></i>
              Target vs Actual Production
            </h6>
          </CCardHeader>
          <CCardBody>
            <div style="height: 300px;">
              <Bar 
                v-if="productionProgress.length > 0"
                :data="productionComparisonChart" 
                :options="chartOptions"
              />
              <div v-else class="d-flex align-items-center justify-content-center h-100">
                <div class="text-center text-muted">
                  <i class="fas fa-chart-bar fa-3x mb-3"></i>
                  <p>No data available for selected filters</p>
                </div>
              </div>
            </div>
          </CCardBody>
        </CCard>
      </CCol>

      <!-- Status Distribution Chart -->
      <CCol md="4">
        <CCard class="shadow-sm border-0 h-100">
          <CCardHeader class="bg-white border-bottom">
            <h6 class="mb-0">
              <i class="fas fa-chart-pie me-2 text-success"></i>
              Progress Status 
            </h6>
          </CCardHeader>
          <CCardBody>
            <div style="height: 300px;">
              <Doughnut 
                v-if="overallStats.total.targets > 0"
                :data="completionDoughnutChart" 
                :options="doughnutOptions"
              />
              <div v-else class="d-flex align-items-center justify-content-center h-100">
                <div class="text-center text-muted">
                  <i class="fas fa-chart-pie fa-3x mb-3"></i>
                  <p>No targets set</p>
                </div>
              </div>
            </div>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>

    <!-- Individual Target Progress -->
    <CCard class="shadow-sm border-0">
      <CCardHeader class="bg-white border-bottom">
        <h6 class="mb-0">
          <i class="fas fa-tasks me-2 text-info"></i>
          Individual Target Progress
        </h6>
      </CCardHeader>
      <CCardBody>
        <div v-if="productionProgress.length === 0" class="text-center py-5">
          <i class="fas fa-exclamation-circle fa-3x text-muted mb-3"></i>
          <h5 class="text-muted">No targets found</h5>
          <p class="text-muted">Please select a different year or add new targets</p>
          <router-link to="/targets">
            <CButton color="primary">
              <i class="fas fa-plus me-2"></i>Add Target
            </CButton>
          </router-link>
        </div>

        <CRow v-else>
          <CCol md="6" v-for="progress in productionProgress" :key="progress.id" class="mb-4">
            <div class="progress-card p-4 border rounded">
              <div class="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h6 class="mb-1 text-capitalize">
                    {{ progress.type }}
                    <span v-if="progress.fruitType" class="text-muted">- {{ progress.fruitType }}</span>
                  </h6>
                  <small class="text-muted">
                    Year {{ selectedYear }}
                    <span v-if="progress.farm" class="ms-2">
                      <i class="fas fa-map-marker-alt"></i> {{ progress.farm }}
                    </span>
                    <span v-if="progress.country" class="ms-2">
                      <i class="fas fa-flag"></i> {{ progress.country }}
                    </span>
                  </small>
                </div>
                <CBadge :color="getStatusBadge(progress.status).color" class="px-2 py-1">
                  {{ getStatusBadge(progress.status).icon }} {{ getStatusBadge(progress.status).text }}
                </CBadge>
              </div>

              <div class="mb-3">
                <div class="d-flex justify-content-between mb-2">
                  <span class="text-muted small">Actual: <strong>{{ formatNumber(progress.actual) }}</strong></span>
                  <span class="text-muted small">Target: <strong>{{ formatNumber(progress.target) }}</strong></span>
                </div>
                <CProgress height="25" class="progress-modern">
                  <CProgressBar 
                    :value="progress.percentage" 
                    :color="getProgressColor(progress.status)"
                    animated
                  >
                    <strong>{{ progress.percentage.toFixed(1) }}%</strong>
                  </CProgressBar>
                </CProgress>
              </div>

              <div class="stats-row d-flex justify-content-between">
                <div class="stat-item">
                  <small class="text-muted d-block">Remaining</small>
                  <strong>{{ formatNumber(progress.remaining) }}</strong>
                </div>
                <div class="stat-item text-end">
                  <small class="text-muted d-block">Unit</small>
                  <strong>{{ progress.type === 'milk' ? 'Liters' : 'Kg' }}</strong>
                </div>
              </div>
            </div>
          </CCol>
        </CRow>
      </CCardBody>
    </CCard>
  </div>
</template>

<style scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

/* Stat Cards */
.stat-card {
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
}

.milk-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.fruit-icon {
  background: linear-gradient(135deg, #2eb85c 0%, #1a9c46 100%);
  color: white;
}

/* Progress Cards */
.progress-card {
  background: #fff;
  transition: all 0.3s ease;
  border: 1px solid #e0e0e0 !important;
}

.progress-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #d0d0d0 !important;
}

.progress-modern {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
}

.stats-row {
  padding-top: 1rem;
  border-top: 1px dashed #e0e0e0;
}

.stat-item strong {
  font-size: 1.1rem;
  color: #2c3e50;
}

/* Chart Cards */
.card-header {
  background: linear-gradient(to right, #f8f9fa, #ffffff);
}

/* Responsive */
@media (max-width: 768px) {
  .stat-icon {
    width: 50px;
    height: 50px;
    font-size: 1.5rem;
  }
  
  .progress-card {
    margin-bottom: 1rem;
  }
}

/* Custom scrollbar for charts */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>