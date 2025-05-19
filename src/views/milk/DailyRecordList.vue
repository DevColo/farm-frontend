<template>
  <div>
    <h4 class="mb-4">Daily Record List</h4>

    <!-- Search -->
    <CFormInput
      v-model="searchQuery"
      placeholder="Search by cow name..."
      class="mb-3"
    />

    <!-- Table -->
    <CTable hover striped responsive>
      <CTableHead>
        <CTableRow>
          <CTableHeaderCell>Cow</CTableHeaderCell>
          <CTableHeaderCell>Date</CTableHeaderCell>
          <CTableHeaderCell>Morning Qty (L)</CTableHeaderCell>
          <CTableHeaderCell>Evening Qty (L)</CTableHeaderCell>
          <CTableHeaderCell>Total Qty (L)</CTableHeaderCell>
          <CTableHeaderCell>Usage Type</CTableHeaderCell>
          <CTableHeaderCell>Sold Qty (L)</CTableHeaderCell>
          <CTableHeaderCell>Revenue ($)</CTableHeaderCell>
        </CTableRow>
      </CTableHead>
      <CTableBody>
        <CTableRow v-for="record in paginatedRecords" :key="record.id">
          <CTableDataCell>{{ record.cow }}</CTableDataCell>
          <CTableDataCell>{{ record.date }}</CTableDataCell>
          <CTableDataCell>{{ record.morningQuantity }}</CTableDataCell>
          <CTableDataCell>{{ record.eveningQuantity }}</CTableDataCell>
          <CTableDataCell>{{ record.totalQuantity }}</CTableDataCell>
          <CTableDataCell>{{ record.usageType }}</CTableDataCell>
          <CTableDataCell>{{ record.soldQuantity || 0 }}</CTableDataCell>
          <CTableDataCell>{{ record.revenue ? `$${record.revenue.toFixed(2)}` : '-' }}</CTableDataCell>
        </CTableRow>
        <CTableRow v-if="paginatedRecords.length === 0">
          <CTableDataCell colspan="8" class="text-center text-muted">
            No records found.
          </CTableDataCell>
        </CTableRow>
      </CTableBody>
    </CTable>

    <!-- Total -->
    <div class="fw-bold mt-3">
      Total milk collected today: {{ totalMilkForDay.toFixed(2) }} Liters
    </div>

    <!-- Pagination -->
    <div class="d-flex justify-content-between align-items-center mt-3">
      <div>Page {{ currentPage }} of {{ totalPages }}</div>
      <CPagination>
        <CPaginationItem :disabled="currentPage === 1" @click="currentPage--">
          Previous
        </CPaginationItem>
        <CPaginationItem
          v-for="page in totalPages"
          :key="page"
          :active="page === currentPage"
          @click="currentPage = page"
        >
          {{ page }}
        </CPaginationItem>
        <CPaginationItem :disabled="currentPage === totalPages" @click="currentPage++">
          Next
        </CPaginationItem>
      </CPagination>
    </div>
  </div>
</template>

<script setup>
import {
  CFormInput,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CPagination,
  CPaginationItem
} from '@coreui/vue'

import { ref, computed, watch } from 'vue'

const records = ref([
  {
    id: 1,
    cow: 'Bessie',
    date: '2025-05-15',
    morningQuantity: 5,
    eveningQuantity: 4,
    totalQuantity: 9,
    usageType: 'Sold',
    soldQuantity: 9,
    revenue: 27, // Example: $3 per liter
  },
  {
    id: 2,
    cow: 'Daisy',
    date: '2025-05-15',
    morningQuantity: 4.5,
    eveningQuantity: 4,
    totalQuantity: 8.5,
    usageType: 'Kept',
    soldQuantity: 0,
    revenue: 0,
  },
  {
    id: 3,
    cow: 'MooMoo',
    date: '2025-05-15',
    morningQuantity: 6,
    eveningQuantity: 5,
    totalQuantity: 11,
    usageType: 'Both',
    soldQuantity: 6,
    revenue: 18,
  },
])

const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = 5

const filteredRecords = computed(() =>
  records.value.filter(record =>
    record.cow.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
)

const totalPages = computed(() =>
  Math.ceil(filteredRecords.value.length / pageSize)
)

const paginatedRecords = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredRecords.value.slice(start, start + pageSize)
})

const totalMilkForDay = computed(() =>
  filteredRecords.value.reduce((sum, r) => sum + r.totalQuantity, 0)
)

watch(searchQuery, () => {
  currentPage.value = 1
})
</script>
