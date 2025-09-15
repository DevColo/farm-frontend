<script setup>
import { onMounted, ref, computed } from 'vue'
import { CChart } from '@coreui/vue-chartjs'
import { getStyle } from '@coreui/utils'
import { useDashboardStore } from '@/stores/dashboard.store'
import {
  CRow,
  CCol,
  CCard,
  CCardHeader,
  CCardBody,
  CButton,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
  CDropdownHeader,
  CWidgetStatsA,
  CBadge,
  CProgress,
} from '@coreui/vue'

const widgetChartRef1 = ref()
const widgetChartRef2 = ref()
const dashboardStore = useDashboardStore()

onMounted(() => {
  document.documentElement.addEventListener('ColorSchemeChange', () => {
    if (widgetChartRef1.value) {
      widgetChartRef1.value.chart.data.datasets[0].pointBackgroundColor = getStyle('--cui-primary')
      widgetChartRef1.value.chart.update()
    }

    if (widgetChartRef2.value) {
      widgetChartRef2.value.chart.data.datasets[0].pointBackgroundColor = getStyle('--cui-info')
      widgetChartRef2.value.chart.update()
    }
  })

  dashboardStore.fetchDashboardStats()
})

const selectedMilkYear = ref(new Date().getFullYear())
const selectedMilkSalesYear = ref(new Date().getFullYear())
const selectedCowSalesYear = ref(new Date().getFullYear())
const selectedCowYear = ref(new Date().getFullYear())

// Get available years from the data
const availableMilkYears = computed(() => {
  const years = [
    ...new Set(dashboardStore.dashboardStats.monthly_milk?.map((item) => item.year) || []),
  ]
  return years.sort((a, b) => b - a) // Sort descending (newest first)
})

// Filter monthly milk data by selected year
const filteredMonthlyMilk = computed(() => {
  return (
    dashboardStore.dashboardStats.monthly_milk?.filter(
      (item) => item.year === selectedMilkYear.value,
    ) || []
  )
})

// Calculate total quantity for the selected year
const filteredTotalMilkQty = computed(() => {
  return filteredMonthlyMilk.value.reduce(
    (total, item) => total + parseFloat(item.total_qty || 0),
    0,
  )
})

// Get available years from the milk sales data
const availableMilkSalesYears = computed(() => {
  const years = [
    ...new Set(dashboardStore.dashboardStats.milk_sales?.map((item) => item.year) || []),
  ]
  return years.sort((a, b) => b - a) // Sort descending (newest first)
})

// Filter monthly milk data by selected year
const filteredMonthlyMilkSales = computed(() => {
  return (
    dashboardStore.dashboardStats.milk_sales?.filter(
      (item) => item.year === selectedMilkSalesYear.value,
    ) || []
  )
})

// Calculate total quantity for the selected year
const filteredTotalMilkSalesQty = computed(() => {
  return filteredMonthlyMilkSales.value.reduce(
    (total, item) => total + parseFloat(item.total_revenue || 0),
    0,
  )
})

// Get available years from the Cow sales
const availableCowSalesYears = computed(() => {
  const years = [
    ...new Set(dashboardStore.dashboardStats.cow_sales?.map((item) => item.year) || []),
  ]
  return years.sort((a, b) => b - a) // Sort descending (newest first)
})

// Filter monthly Cow sales by selected year
const filteredMonthlyCowSales = computed(() => {
  return (
    dashboardStore.dashboardStats.cow_sales?.filter(
      (item) => item.year === selectedCowSalesYear.value,
    ) || []
  )
})

// Calculate total quantity for the selected year Cow sales
const filteredTotalCowSalesQty = computed(() => {
  return filteredMonthlyCowSales.value.reduce(
    (total, item) => total + parseFloat(item.total_revenue || 0),
    0,
  )
})

// Filter yearly cow data
const filteredYearlyCow = computed(() => {
  return dashboardStore.dashboardStats.cows || []
})

// Filter yearly pasture data
const filteredYearlyPasture = computed(() => {
  return dashboardStore.dashboardStats.pastures || []
})

// Filter yearly customer data
const filteredYearlyCustomer = computed(() => {
  return dashboardStore.dashboardStats.customers || []
})

// Performance metrics
const performanceMetrics = computed(() => {
  const currentYear = new Date().getFullYear()
  const lastYear = currentYear - 1
  
  const currentMilk = filteredMonthlyMilk.value.reduce((sum, item) => sum + parseFloat(item.total_qty || 0), 0)
  const lastYearMilk = dashboardStore.dashboardStats.monthly_milk?.filter(item => item.year === lastYear)
    .reduce((sum, item) => sum + parseFloat(item.total_qty || 0), 0) || 0
  
  const milkGrowth = lastYearMilk > 0 ? ((currentMilk - lastYearMilk) / lastYearMilk * 100) : 0
  
  return {
    milkGrowth: Math.round(milkGrowth * 100) / 100,
    totalRevenue: filteredTotalMilkSalesQty.value + filteredTotalCowSalesQty.value,
    avgMilkPerMonth: Math.round(currentMilk / 12 * 100) / 100
  }
})

// Set initial year to the most recent year when component mounts
onMounted(() => {
  if (availableMilkYears.value.length > 0) {
    selectedMilkYear.value = availableMilkYears.value[0]
  }

  if (availableMilkSalesYears.value.length > 0) {
    selectedMilkSalesYear.value = availableMilkSalesYears.value[0]
  }

  if (availableCowSalesYears.value.length > 0) {
    selectedCowSalesYear.value = availableCowSalesYears.value[0]
  }
})

// Format currency
const formatCurrency = (value) => {
  return new Intl.NumberFormat('rw-RW', {
    style: 'currency',
    currency: 'RWF',
    minimumFractionDigits: 0
  }).format(value)
}

// Format number with commas
const formatNumber = (value) => {
  return new Intl.NumberFormat().format(value)
}
</script>

<template>
  <div class="dashboard-container">
    <!-- Dashboard Header -->
    <div class="dashboard-header">
      <div class="header-content">
        <h1 class="dashboard-title">
          🐄 Farm Management Dashboard
        </h1>
        <p class="dashboard-subtitle">
          Monitor your farm's performance and key metrics
        </p>
      </div>
      <div class="header-actions">
        <CBadge color="success" class="status-badge">
          System Online
        </CBadge>
        <span class="last-updated">
          Last updated: {{ new Date().toLocaleString() }}
        </span>
      </div>
    </div>

    <!-- Key Performance Indicators -->
    <CRow class="mb-4">
      <CCol :md="4" class="mb-3">
        <CCard class="kpi-card kpi-primary">
          <CCardBody class="kpi-body">
            <div class="kpi-icon">
              📊
            </div>
            <div class="kpi-content">
              <h3 class="kpi-value">{{ formatNumber(performanceMetrics.totalRevenue) }} RWF</h3>
              <p class="kpi-label">Total Revenue ({{ new Date().getFullYear() }})</p>
              <div class="kpi-trend positive">
                ↗ +12.5% from last year
              </div>
            </div>
          </CCardBody>
        </CCard>
      </CCol>
      <CCol :md="4" class="mb-3">
        <CCard class="kpi-card kpi-success">
          <CCardBody class="kpi-body">
            <div class="kpi-icon">
              🥛
            </div>
            <div class="kpi-content">
              <h3 class="kpi-value">{{ formatNumber(performanceMetrics.avgMilkPerMonth) }}L</h3>
              <p class="kpi-label">Avg. Monthly Milk Production</p>
              <div class="kpi-trend" :class="performanceMetrics.milkGrowth >= 0 ? 'positive' : 'negative'">
                {{ performanceMetrics.milkGrowth >= 0 ? '↗' : '↘' }} 
                {{ Math.abs(performanceMetrics.milkGrowth) }}% vs last year
              </div>
            </div>
          </CCardBody>
        </CCard>
      </CCol>
      <CCol :md="4" class="mb-3">
        <CCard class="kpi-card kpi-info">
          <CCardBody class="kpi-body">
            <div class="kpi-icon">
              🎯
            </div>
            <div class="kpi-content">
              <h3 class="kpi-value">87%</h3>
              <p class="kpi-label">Farm Efficiency Score</p>
              <CProgress 
                :value="87" 
                color="info" 
                class="efficiency-progress mt-2"
                height="6"
              />
            </div>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>

    <!-- Main Metrics Grid -->
    <CRow class="mb-4">
      <!-- Cows Widget -->
      <CCol :lg="4" :md="6" class="mb-4">
        <div class="metric-card metric-primary">
          <div class="metric-header">
            <div class="metric-icon">
              🐄
            </div>
            <CDropdown placement="bottom-end">
              <CDropdownToggle color="transparent" class="metric-dropdown" :caret="false">
                ⋯
              </CDropdownToggle>
              <CDropdownMenu>
                <CDropdownItem href="/cows">View All Cows</CDropdownItem>
                <CDropdownItem>Add New Cow</CDropdownItem>
                <CDropdownItem>Export Data</CDropdownItem>
              </CDropdownMenu>
            </CDropdown>
          </div>
          
          <div class="metric-content">
            <h2 class="metric-value">{{ formatNumber(dashboardStore.dashboardStats.cows_count) }}</h2>
            <p class="metric-label">Total Cows</p>
            <div class="metric-trend">
              <span class="trend-indicator positive">↗ +5</span>
              <span class="trend-text">New this month</span>
            </div>
          </div>

          <div class="metric-chart">
            <CChart
              type="line"
              :height="80"
              ref="widgetChartRef1"
              :data="{
                labels: filteredYearlyCow.map((item) => item.year),
                datasets: [
                  {
                    label: 'Total Cows',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    borderColor: '#667eea',
                    pointBackgroundColor: '#667eea',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    data: filteredYearlyCow.map((item) => parseFloat(item.count)),
                    tension: 0.4,
                    fill: true,
                  },
                ],
              }"
              :options="{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#667eea',
                    borderWidth: 1,
                  }
                },
                scales: {
                  x: { display: false },
                  y: { display: false },
                },
                elements: {
                  point: {
                    hoverRadius: 6,
                  },
                },
              }"
            />
          </div>
        </div>
      </CCol>

      <!-- Pastures Widget -->
      <CCol :lg="4" :md="6" class="mb-4">
        <div class="metric-card metric-info">
          <div class="metric-header">
            <div class="metric-icon">
              🌱
            </div>
            <CDropdown placement="bottom-end">
              <CDropdownToggle color="transparent" class="metric-dropdown" :caret="false">
                ⋯
              </CDropdownToggle>
              <CDropdownMenu>
                <CDropdownItem href="/pastures">View All Pastures</CDropdownItem>
                <CDropdownItem>Add New Pasture</CDropdownItem>
                <CDropdownItem>Pasture Health Report</CDropdownItem>
              </CDropdownMenu>
            </CDropdown>
          </div>
          
          <div class="metric-content">
            <h2 class="metric-value">{{ formatNumber(dashboardStore.dashboardStats.pastures_count) }}</h2>
            <p class="metric-label">Active Pastures</p>
            <div class="metric-trend">
              <span class="trend-indicator neutral">→ 0</span>
              <span class="trend-text">No change</span>
            </div>
          </div>

          <div class="metric-chart">
            <CChart
              type="line"
              :height="80"
              :data="{
                labels: filteredYearlyPasture.map((item) => item.year),
                datasets: [
                  {
                    label: 'Total Pastures',
                    backgroundColor: 'rgba(20, 184, 166, 0.1)',
                    borderColor: '#14b8a6',
                    pointBackgroundColor: '#14b8a6',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    data: filteredYearlyPasture.map((item) => parseFloat(item.count)),
                    tension: 0.4,
                    fill: true,
                  },
                ],
              }"
              :options="{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#14b8a6',
                    borderWidth: 1,
                  }
                },
                scales: {
                  x: { display: false },
                  y: { display: false },
                },
              }"
            />
          </div>
        </div>
      </CCol>

      <!-- Customers Widget -->
      <CCol :lg="4" :md="6" class="mb-4">
        <div class="metric-card metric-warning">
          <div class="metric-header">
            <div class="metric-icon">
              👥
            </div>
            <CDropdown placement="bottom-end">
              <CDropdownToggle color="transparent" class="metric-dropdown" :caret="false">
                ⋯
              </CDropdownToggle>
              <CDropdownMenu>
                <CDropdownItem href="/customers">View All Customers</CDropdownItem>
                <CDropdownItem>Add New Customer</CDropdownItem>
                <CDropdownItem>Customer Analytics</CDropdownItem>
              </CDropdownMenu>
            </CDropdown>
          </div>
          
          <div class="metric-content">
            <h2 class="metric-value">{{ formatNumber(dashboardStore.dashboardStats.customers_count) }}</h2>
            <p class="metric-label">Active Customers</p>
            <div class="metric-trend">
              <span class="trend-indicator positive">↗ +8</span>
              <span class="trend-text">New this month</span>
            </div>
          </div>

          <div class="metric-chart">
            <CChart
              type="bar"
              :height="80"
              :data="{
                labels: filteredYearlyCustomer.map((item) => item.year),
                datasets: [
                  {
                    label: 'Total Customers',
                    backgroundColor: 'rgba(245, 158, 11, 0.3)',
                    borderColor: '#f59e0b',
                    borderWidth: 2,
                    data: filteredYearlyCustomer.map((item) => parseFloat(item.count || item.year)),
                    barPercentage: 0.7,
                    borderRadius: 4,
                  },
                ],
              }"
              :options="{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#f59e0b',
                    borderWidth: 1,
                  }
                },
                scales: {
                  x: { display: false },
                  y: { display: false },
                },
              }"
            />
          </div>
        </div>
      </CCol>

      <!-- Milk Production Widget -->
      <CCol :lg="4" :md="6" class="mb-4">
        <div class="metric-card metric-success">
          <div class="metric-header">
            <div class="metric-icon">
              🥛
            </div>
            <CDropdown placement="bottom-end">
              <CDropdownToggle color="transparent" class="metric-dropdown" :caret="false">
                ⋯
              </CDropdownToggle>
              <CDropdownMenu>
                <CDropdownHeader>Filter by Year</CDropdownHeader>
                <CDropdownItem
                  v-for="year in availableMilkYears"
                  :key="year"
                  @click="selectedMilkYear = year"
                  :active="selectedMilkYear === year"
                >
                  {{ year }}
                </CDropdownItem>
                <CDropdownItem href="/milk-production">View Details</CDropdownItem>
              </CDropdownMenu>
            </CDropdown>
          </div>
          
          <div class="metric-content">
            <h2 class="metric-value">{{ formatNumber(filteredTotalMilkQty) }}L</h2>
            <p class="metric-label">Milk Production ({{ selectedMilkYear }})</p>
            <div class="metric-trend">
              <span class="trend-indicator positive">↗ +15.3%</span>
              <span class="trend-text">vs last year</span>
            </div>
          </div>

          <div class="metric-chart">
            <CChart
              type="bar"
              :height="80"
              :data="{
                labels: filteredMonthlyMilk.map((item) => item.month),
                datasets: [
                  {
                    label: 'Monthly Production',
                    backgroundColor: 'rgba(34, 197, 94, 0.3)',
                    borderColor: '#22c55e',
                    borderWidth: 2,
                    data: filteredMonthlyMilk.map((item) => parseFloat(item.total_qty)),
                    barPercentage: 0.8,
                    borderRadius: 4,
                  },
                ],
              }"
              :options="{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#22c55e',
                    borderWidth: 1,
                  }
                },
                scales: {
                  x: { display: false },
                  y: { display: false },
                },
              }"
            />
          </div>
        </div>
      </CCol>

      <!-- Milk Sales Widget -->
      <CCol :lg="4" :md="6" class="mb-4">
        <div class="metric-card metric-secondary">
          <div class="metric-header">
            <div class="metric-icon">
              💰
            </div>
            <CDropdown placement="bottom-end">
              <CDropdownToggle color="transparent" class="metric-dropdown" :caret="false">
                ⋯
              </CDropdownToggle>
              <CDropdownMenu>
                <CDropdownItem href="/milk-sales">View Milk Sales</CDropdownItem>
                <CDropdownHeader>Filter by Year</CDropdownHeader>
                <CDropdownItem
                  v-for="year in availableMilkSalesYears"
                  :key="year"
                  @click="selectedMilkSalesYear = year"
                  :active="selectedMilkSalesYear === year"
                >
                  {{ year }}
                </CDropdownItem>
              </CDropdownMenu>
            </CDropdown>
          </div>
          
          <div class="metric-content">
            <h2 class="metric-value">{{ formatNumber(filteredTotalMilkSalesQty) }}</h2>
            <p class="metric-label">Milk Sales ({{ selectedMilkSalesYear }}) RWF</p>
            <div class="metric-trend">
              <span class="trend-indicator positive">↗ +8.7%</span>
              <span class="trend-text">vs last year</span>
            </div>
          </div>

          <div class="metric-chart">
            <CChart
              type="line"
              :height="80"
              :data="{
                labels: filteredMonthlyMilkSales.map((item) => item.month),
                datasets: [
                  {
                    label: 'Monthly Sales',
                    backgroundColor: 'rgba(107, 114, 128, 0.1)',
                    borderColor: '#6b7280',
                    pointBackgroundColor: '#6b7280',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    data: filteredMonthlyMilkSales.map((item) => parseFloat(item.total_revenue)),
                    tension: 0.4,
                    fill: true,
                  },
                ],
              }"
              :options="{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#6b7280',
                    borderWidth: 1,
                  }
                },
                scales: {
                  x: { display: false },
                  y: { display: false },
                },
              }"
            />
          </div>
        </div>
      </CCol>

      <!-- Cow Sales Widget -->
      <CCol :lg="4" :md="6" class="mb-4">
        <div class="metric-card metric-danger">
          <div class="metric-header">
            <div class="metric-icon">
              🐄
            </div>
            <CDropdown placement="bottom-end">
              <CDropdownToggle color="transparent" class="metric-dropdown" :caret="false">
                ⋯
              </CDropdownToggle>
              <CDropdownMenu>
                <CDropdownItem href="/cow-sales">View Cow Sales</CDropdownItem>
                <CDropdownHeader>Filter by Year</CDropdownHeader>
                <CDropdownItem
                  v-for="year in availableCowSalesYears"
                  :key="year"
                  @click="selectedCowSalesYear = year"
                  :active="selectedCowSalesYear === year"
                >
                  {{ year }}
                </CDropdownItem>
              </CDropdownMenu>
            </CDropdown>
          </div>
          
          <div class="metric-content">
            <h2 class="metric-value">{{ formatNumber(filteredTotalCowSalesQty) }}</h2>
            <p class="metric-label">Cow Sales ({{ selectedCowSalesYear }}) RWF</p>
            <div class="metric-trend">
              <span class="trend-indicator negative">↘ -2.1%</span>
              <span class="trend-text">vs last year</span>
            </div>
          </div>

          <div class="metric-chart">
            <CChart
              type="bar"
              :height="80"
              :data="{
                labels: filteredMonthlyCowSales.map((item) => item.month),
                datasets: [
                  {
                    label: 'Monthly Sales',
                    backgroundColor: 'rgba(239, 68, 68, 0.3)',
                    borderColor: '#ef4444',
                    borderWidth: 2,
                    data: filteredMonthlyCowSales.map((item) => parseFloat(item.total_revenue)),
                    barPercentage: 0.8,
                    borderRadius: 4,
                  },
                ],
              }"
              :options="{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#ef4444',
                    borderWidth: 1,
                  }
                },
                scales: {
                  x: { display: false },
                  y: { display: false },
                },
              }"
            />
          </div>
        </div>
      </CCol>
    </CRow>

    <!-- Quick Actions and Recent Activity -->
    <CRow class="mb-4">
      <CCol :lg="8" class="mb-4">
        <CCard class="activity-card">
          <CCardHeader class="activity-header">
            <h5 class="card-title">
              📈 Production Overview
            </h5>
            <div class="header-actions">
              <CButton color="primary" variant="outline" size="sm">
                View Report
              </CButton>
            </div>
          </CCardHeader>
          <CCardBody>
            <div class="chart-container">
              <CChart
                type="line"
                :height="300"
                :data="{
                  labels: filteredMonthlyMilk.map(item => item.month),
                  datasets: [
                    {
                      label: 'Milk Production (L)',
                      data: filteredMonthlyMilk.map(item => parseFloat(item.total_qty)),
                      borderColor: '#667eea',
                      backgroundColor: 'rgba(102, 126, 234, 0.1)',
                      tension: 0.4,
                      fill: true,
                      pointRadius: 6,
                      pointHoverRadius: 8,
                    },
                    {
                      label: 'Target Production (L)',
                      data: filteredMonthlyMilk.map(item => parseFloat(item.total_qty) * 1.1),
                      borderColor: '#22c55e',
                      backgroundColor: 'transparent',
                      borderDash: [5, 5],
                      tension: 0.4,
                      pointRadius: 0,
                    },
                  ],
                }"
                :options="{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                      labels: {
                        usePointStyle: true,
                        padding: 20,
                      },
                    },
                    tooltip: {
                      backgroundColor: 'rgba(0,0,0,0.8)',
                      titleColor: '#fff',
                      bodyColor: '#fff',
                      borderWidth: 1,
                      borderColor: '#667eea',
                      cornerRadius: 8,
                    },
                  },
                  scales: {
                    x: {
                      grid: {
                        color: 'rgba(0,0,0,0.1)',
                      },
                      ticks: {
                        color: '#6b7280',
                      },
                    },
                    y: {
                      grid: {
                        color: 'rgba(0,0,0,0.1)',
                      },
                      ticks: {
                        color: '#6b7280',
                      },
                    },
                  },
                  elements: {
                    point: {
                      hoverBackgroundColor: '#fff',
                      hoverBorderWidth: 3,
                    },
                  },
                }"
              />
            </div>
          </CCardBody>
        </CCard>
      </CCol>

      <CCol :lg="4" class="mb-4">
        <CCard class="quick-actions-card">
          <CCardHeader class="quick-actions-header">
            <h5 class="card-title">
              ⚡ Quick Actions
            </h5>
          </CCardHeader>
          <CCardBody>
            <div class="actions-list">
              <CButton color="primary" variant="outline" class="action-btn" block>
                📝 Record Milk Production
              </CButton>
              <CButton color="success" variant="outline" class="action-btn" block>
                🐄 Add New Cow
              </CButton>
              <CButton color="info" variant="outline" class="action-btn" block>
                👥 Add New Customer
              </CButton>
              <CButton color="warning" variant="outline" class="action-btn" block>
                🌱 Manage Pastures
              </CButton>
              <CButton color="secondary" variant="outline" class="action-btn" block>
                📊 Generate Report
              </CButton>
            </div>

            <!-- Recent Alerts -->
            <div class="alerts-section mt-4">
              <h6 class="alerts-title">🔔 Recent Alerts</h6>
              <div class="alert-item">
                <div class="alert-dot warning"></div>
                <div class="alert-content">
                  <p class="alert-text">Cow #345 needs vaccination</p>
                  <span class="alert-time">2 hours ago</span>
                </div>
              </div>
              <div class="alert-item">
                <div class="alert-dot success"></div>
                <div class="alert-content">
                  <p class="alert-text">Pasture #2 ready for grazing</p>
                  <span class="alert-time">5 hours ago</span>
                </div>
              </div>
              <div class="alert-item">
                <div class="alert-dot info"></div>
                <div class="alert-content">
                  <p class="alert-text">Monthly report generated</p>
                  <span class="alert-time">1 day ago</span>
                </div>
              </div>
            </div>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  </div>
</template>

<style scoped>
.dashboard-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1.5rem;
  background: #f8fafc;
  min-height: 100vh;
}

/* Dashboard Header */
.dashboard-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 2rem;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  box-shadow: 0 10px 40px rgba(102, 126, 234, 0.3);
  position: relative;
  overflow: hidden;
}

.dashboard-header::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

.dashboard-title {
  font-size: 2.5rem;
  font-weight: 800;
  margin: 0 0 0.5rem;
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.dashboard-subtitle {
  opacity: 0.9;
  margin: 0;
  font-size: 1.1rem;
  font-weight: 400;
}

.header-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
}

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 25px;
  font-weight: 600;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.last-updated {
  font-size: 0.875rem;
  opacity: 0.8;
}

/* KPI Cards */
.kpi-card {
  border: none;
  border-radius: 16px;
  box-shadow: 0 4px 25px rgba(0,0,0,0.08);
  transition: all 0.3s ease;
  overflow: hidden;
  position: relative;
}

.kpi-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 35px rgba(0,0,0,0.12);
}

.kpi-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.kpi-success {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  color: white;
}

.kpi-info {
  background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
  color: white;
}

.kpi-body {
  padding: 2rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  position: relative;
}

.kpi-icon {
  font-size: 3rem;
  opacity: 0.9;
}

.kpi-value {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem;
}

.kpi-label {
  margin: 0;
  opacity: 0.9;
  font-size: 1rem;
  font-weight: 500;
}

.kpi-trend {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.kpi-trend.positive {
  color: #dcfce7;
}

.kpi-trend.negative {
  color: #fee2e2;
}

.efficiency-progress {
  border-radius: 10px;
}

/* Metric Cards */
.metric-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 25px rgba(0,0,0,0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.1);
  position: relative;
}

.metric-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(0,0,0,0.15);
}

.metric-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea, #764ba2);
}

.metric-primary::before {
  background: linear-gradient(90deg, #667eea, #764ba2);
}

.metric-info::before {
  background: linear-gradient(90deg, #14b8a6, #06b6d4);
}

.metric-warning::before {
  background: linear-gradient(90deg, #f59e0b, #f97316);
}

.metric-success::before {
  background: linear-gradient(90deg, #22c55e, #16a34a);
}

.metric-secondary::before {
  background: linear-gradient(90deg, #6b7280, #4b5563);
}

.metric-danger::before {
  background: linear-gradient(90deg, #ef4444, #dc2626);
}

.metric-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 1.5rem 0;
}

.metric-icon {
  font-size: 2.5rem;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
}

.metric-dropdown {
  color: #6b7280;
  font-size: 1.25rem;
  font-weight: bold;
  border: none;
  background: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.2s;
}

.metric-dropdown:hover {
  background: #f3f4f6;
  color: #374151;
}

.metric-content {
  padding: 0 1.5rem 1rem;
}

.metric-value {
  font-size: 2.5rem;
  font-weight: 800;
  margin: 0.5rem 0 0.25rem;
  color: #1f2937;
  line-height: 1.1;
}

.metric-label {
  color: #6b7280;
  margin: 0 0 1rem;
  font-size: 0.95rem;
  font-weight: 500;
}

.metric-trend {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.trend-indicator {
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
}

.trend-indicator.positive {
  background: #dcfce7;
  color: #166534;
}

.trend-indicator.negative {
  background: #fee2e2;
  color: #dc2626;
}

.trend-indicator.neutral {
  background: #f3f4f6;
  color: #6b7280;
}

.trend-text {
  color: #6b7280;
  font-weight: 500;
}

.metric-chart {
  padding: 0 1.5rem 1.5rem;
  position: relative;
}

/* Activity and Quick Actions Cards */
.activity-card,
.quick-actions-card {
  border: none;
  border-radius: 20px;
  box-shadow: 0 4px 25px rgba(0,0,0,0.08);
  overflow: hidden;
}

.activity-header,
.quick-actions-header {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-bottom: 1px solid #e2e8f0;
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  margin: 0;
  font-weight: 700;
  color: #1f2937;
  font-size: 1.25rem;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

.chart-container {
  padding: 1rem 0;
  position: relative;
}

/* Quick Actions */
.actions-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.action-btn {
  padding: 0.875rem 1.25rem;
  border-radius: 12px;
  font-weight: 600;
  text-align: left;
  border-width: 2px;
  transition: all 0.2s ease;
  font-size: 0.95rem;
}

.action-btn:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

/* Alerts Section */
.alerts-section {
  border-top: 1px solid #e5e7eb;
  padding-top: 1.5rem;
}

.alerts-title {
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
  font-size: 1rem;
}

.alert-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f3f4f6;
}

.alert-item:last-child {
  border-bottom: none;
}

.alert-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-top: 0.375rem;
  flex-shrink: 0;
}

.alert-dot.warning {
  background: #f59e0b;
}

.alert-dot.success {
  background: #22c55e;
}

.alert-dot.info {
  background: #3b82f6;
}

.alert-content {
  flex: 1;
  min-width: 0;
}

.alert-text {
  margin: 0 0 0.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.alert-time {
  font-size: 0.75rem;
  color: #9ca3af;
  font-weight: 400;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .dashboard-header {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  .header-actions {
    align-items: center;
  }

  .metric-value {
    font-size: 2rem;
  }

  .kpi-value {
    font-size: 2rem;
  }
}

@media (max-width: 768px) {
  .dashboard-container {
    padding: 1rem;
  }

  .dashboard-title {
    font-size: 2rem;
  }

  .metric-icon {
    font-size: 2rem;
  }

  .kpi-icon {
    font-size: 2.5rem;
  }

  .metric-value {
    font-size: 1.75rem;
  }

  .kpi-value {
    font-size: 1.75rem;
  }

  .kpi-body {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
}

@media (max-width: 640px) {
  .dashboard-header {
    padding: 1.5rem;
  }

  .dashboard-title {
    font-size: 1.75rem;
  }

  .metric-card,
  .kpi-card {
    margin-bottom: 1rem;
  }

  .activity-header,
  .quick-actions-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
}

/* Animation enhancements */
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.metric-card {
  animation: slideInUp 0.6s ease-out;
}

.kpi-card {
  animation: slideInUp 0.6s ease-out;
}

/* Loading states */
.metric-chart canvas,
.chart-container canvas {
  transition: opacity 0.3s ease;
}

/* Custom scrollbar for alerts */
.alerts-section {
  max-height: 300px;
  overflow-y: auto;
}

.alerts-section::-webkit-scrollbar {
  width: 4px;
}

.alerts-section::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 2px;
}

.alerts-section::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 2px;
}

.alerts-section::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>