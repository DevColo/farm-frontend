<script setup>
import { onMounted, ref, computed } from 'vue'
import { CChart } from '@coreui/vue-chartjs'
import { getStyle } from '@coreui/utils'
import { useDashboardStore } from '@/stores/dashboard.store'

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
      (item) => item.year === selectedMilkYear.value,
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
      (item) => item.year === selectedCowYear.value,
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
</script>

<template>
  <CRow :xs="{ gutter: 4 }">
    <CCol :sm="6" :xl="4" :xxl="3">
      <CWidgetStatsA color="primary">
        <template #value>{{ dashboardStore.dashboardStats.cows_count }} </template>
        <template #title>Cows</template>
        <template #action>
          <CDropdown placement="bottom-end">
            <CDropdownToggle color="transparent" class="p-0 text-white" :caret="false">
              <CIcon icon="cil-options" class="text-white" />
            </CDropdownToggle>
            <CDropdownMenu>
              <CDropdownItem href="/cows">View Cows</CDropdownItem>
            </CDropdownMenu>
          </CDropdown>
        </template>
        <template #chart>
          <CChart
            type="line"
            class="mt-3 mx-3"
            style="height: 70px"
            ref="widgetChartRef1"
            :data="{
              labels: filteredYearlyCow.map((item) => item.year),
              datasets: [
                {
                  label: 'Total Cows',
                  backgroundColor: 'transparent',
                  borderColor: 'rgba(255,255,255,.55)',
                  pointBackgroundColor: getStyle('--cui-primary'),
                  data: filteredYearlyCow.map((item) => parseFloat(item.count)),
                },
              ],
            }"
            :options="{
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false,
                },
              },
              scales: {
                x: {
                  grid: {
                    display: false,
                    drawTicks: false,
                  },
                  ticks: {
                    display: false,
                  },
                },
                y: {
                  border: {
                    display: false,
                  },
                  grid: {
                    display: false,
                    drawTicks: false,
                  },
                  ticks: {
                    display: false,
                  },
                },
              },
            }"
          />
        </template>
      </CWidgetStatsA>
    </CCol>
    <CCol :sm="6" :xl="4" :xxl="3">
      <CWidgetStatsA color="info">
        <template #value>{{ dashboardStore.dashboardStats.pastures_count }} </template>
        <template #title>Pastures</template>
        <template #action>
          <CDropdown placement="bottom-end">
            <CDropdownToggle color="transparent" class="p-0 text-white" :caret="false">
              <CIcon icon="cil-options" class="text-white" />
            </CDropdownToggle>
            <CDropdownMenu>
              <CDropdownItem href="/pastures">View Pastures</CDropdownItem>
            </CDropdownMenu>
          </CDropdown>
        </template>
        <template #chart>
          <CChart
            type="line"
            class="mt-3 mx-3"
            style="height: 70px"
            ref="widgetChartRef1"
            :data="{
              labels: filteredYearlyPasture.map((item) => item.year),
              datasets: [
                {
                  label: 'Total Pastures',
                  backgroundColor: 'transparent',
                  borderColor: 'rgba(255,255,255,.55)',
                  pointBackgroundColor: getStyle('--cui-primary'),
                  data: filteredYearlyPasture.map((item) => parseFloat(item.count)),
                },
              ],
            }"
            :options="{
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false,
                },
              },
              scales: {
                x: {
                  grid: {
                    display: false,
                    drawTicks: false,
                  },
                  ticks: {
                    display: false,
                  },
                },
                y: {
                  border: {
                    display: false,
                  },
                  grid: {
                    display: false,
                    drawTicks: false,
                  },
                  ticks: {
                    display: false,
                  },
                },
              },
            }"
          />
        </template>
      </CWidgetStatsA>
    </CCol>

    <CCol :sm="6" :xl="4" :xxl="3">
      <CWidgetStatsA color="danger">
        <template #value>{{ filteredTotalMilkQty }} Liters</template>
        <template #title>Milk Quantity ({{ selectedMilkYear }})</template>
        <template #action>
          <CDropdown placement="bottom-end">
            <CDropdownToggle color="transparent" class="p-0 text-white" :caret="false">
              <CIcon icon="cil-options" class="text-white" />
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
            </CDropdownMenu>
          </CDropdown>
        </template>
        <template #chart>
          <CChart
            type="bar"
            class="mt-3 mx-3"
            style="height: 70px"
            :data="{
              labels: filteredMonthlyMilk.map((item) => item.month),
              datasets: [
                {
                  label: 'Recorded Liters',
                  backgroundColor: 'rgba(255,255,255,.2)',
                  borderColor: 'rgba(255,255,255,.55)',
                  data: filteredMonthlyMilk.map((item) => parseFloat(item.total_qty)),
                  barPercentage: 0.6,
                },
              ],
            }"
            :options="{
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false,
                },
              },
              scales: {
                x: {
                  grid: {
                    display: false,
                    drawTicks: false,
                  },
                  ticks: {
                    display: false,
                  },
                },
                y: {
                  border: {
                    display: false,
                  },
                  grid: {
                    display: false,
                    drawTicks: false,
                  },
                  ticks: {
                    display: false,
                  },
                },
              },
            }"
          />
        </template>
      </CWidgetStatsA>
    </CCol>
    <CCol :sm="6" :xl="4" :xxl="3">
      <CWidgetStatsA color="warning">
        <template #value>{{ dashboardStore.dashboardStats.customers_count }} </template>
        <template #title>Customers</template>
        <template #action>
          <CDropdown placement="bottom-end">
            <CDropdownToggle color="transparent" class="p-0 text-white" :caret="false">
              <CIcon icon="cil-options" class="text-white" />
            </CDropdownToggle>
            <CDropdownMenu>
              <CDropdownItem href="/customers">View Customers</CDropdownItem>
            </CDropdownMenu>
          </CDropdown>
        </template>
        <template #chart>
          <CChart
            type="line"
            class="mt-3"
            style="height: 70px"
            :data="{
              labels: filteredYearlyCustomer.map((item) => item.year),
              datasets: [
                {
                  label: 'Total Customers',
                  backgroundColor: 'rgba(255,255,255,.2)',
                  borderColor: 'rgba(255,255,255,.55)',
                  data: filteredYearlyCustomer.map((item) => item.year),
                  fill: true,
                },
              ],
            }"
            :options="{
              plugins: {
                legend: {
                  display: false,
                },
              },
              maintainAspectRatio: false,
              scales: {
                x: {
                  border: {
                    display: false,
                  },
                  display: false,
                },
                y: {
                  display: false,
                },
              },
              elements: {
                line: {
                  borderWidth: 2,
                  tension: 0.4,
                },
                point: {
                  radius: 0,
                  hitRadius: 10,
                  hoverRadius: 4,
                },
              },
            }"
          />
        </template>
      </CWidgetStatsA>
    </CCol>

    <CCol :sm="6" :xl="4" :xxl="3">
      <CWidgetStatsA color="secondary">
        <template #value>{{ filteredTotalMilkSalesQty }} Rwf</template>
        <template #title>Milk Sales ({{ selectedMilkSalesYear }})</template>
        <template #action>
          <CDropdown placement="bottom-end">
            <CDropdownToggle color="transparent" class="p-0 text-white" :caret="false">
              <CIcon icon="cil-options" class="text-white" />
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
        </template>
        <template #chart>
          <CChart
            type="bar"
            class="mt-3 mx-3"
            style="height: 70px"
            :data="{
              labels: filteredMonthlyMilkSales.map((item) => item.month),
              datasets: [
                {
                  label:
                    'Qty Sold ' +
                    filteredMonthlyMilkSales.map((item) => parseFloat(item.total_qty)) +
                    ' lts',
                  backgroundColor: 'rgba(255,255,255,.2)',
                  borderColor: 'rgba(255,255,255,.55)',
                  data: filteredMonthlyMilkSales.map((item) => parseFloat(item.total_revenue)),
                  barPercentage: 0.6,
                },
              ],
            }"
            :options="{
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false,
                },
              },
              scales: {
                x: {
                  grid: {
                    display: false,
                    drawTicks: false,
                  },
                  ticks: {
                    display: false,
                  },
                },
                y: {
                  border: {
                    display: false,
                  },
                  grid: {
                    display: false,
                    drawTicks: false,
                  },
                  ticks: {
                    display: false,
                  },
                },
              },
            }"
          />
        </template>
      </CWidgetStatsA>
    </CCol>

    <CCol :sm="6" :xl="4" :xxl="3">
      <CWidgetStatsA color="dark">
        <template #value>{{ filteredTotalCowSalesQty }} Rwf</template>
        <template #title>Cow Sales ({{ selectedCowSalesYear }})</template>
        <template #action>
          <CDropdown placement="bottom-end">
            <CDropdownToggle color="transparent" class="p-0 text-white" :caret="false">
              <CIcon icon="cil-options" class="text-white" />
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
        </template>
        <template #chart>
          <CChart
            type="bar"
            class="mt-3 mx-3"
            style="height: 70px"
            :data="{
              labels: filteredMonthlyCowSales.map((item) => item.month),
              datasets: [
                {
                  label:
                    'Qty Sold ' +
                    filteredMonthlyCowSales.map((item) => parseFloat(item.total_qty)) +
                    ' lts',
                  backgroundColor: 'rgba(255,255,255,.2)',
                  borderColor: 'rgba(255,255,255,.55)',
                  data: filteredMonthlyCowSales.map((item) => parseFloat(item.total_revenue)),
                  barPercentage: 0.6,
                },
              ],
            }"
            :options="{
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false,
                },
              },
              scales: {
                x: {
                  grid: {
                    display: false,
                    drawTicks: false,
                  },
                  ticks: {
                    display: false,
                  },
                },
                y: {
                  border: {
                    display: false,
                  },
                  grid: {
                    display: false,
                    drawTicks: false,
                  },
                  ticks: {
                    display: false,
                  },
                },
              },
            }"
          />
        </template>
      </CWidgetStatsA>
    </CCol>
  </CRow>
</template>
