<template>
  <div>
    <h4 class="mb-4">Daily Record List</h4>

     <!-- Search Bar and Pagination Control -->
          <div class="d-flex justify-content-between align-items-center mb-3">
            <!-- Search Bar -->
            <input
              type="text"
              v-model="searchQuery"
              class="form-control w-50"
              placeholder="Search by block name or farm name..."
            />
            <!-- Items per page selection -->
            <div class="d-flex align-items-center">
              <label class="me-2">Show:</label>
              <select v-model="itemsPerPage" class="form-select">
                <option :value="10">10</option>
                <option :value="25">25</option>
                <option :value="50">50</option>
                <option :value="100">100</option>
              </select>
            </div>
          </div>
    <!-- Table -->
    <CTable hover striped>
      <CTableHead>
        <CTableRow>
          <CTableHeaderCell scope="col">Cow</CTableHeaderCell>
          <CTableHeaderCell scope="col">Date</CTableHeaderCell>
          <CTableHeaderCell scope="col">Morning Qty</CTableHeaderCell>
          <CTableHeaderCell scope="col">Evening Qty</CTableHeaderCell>
          <CTableHeaderCell scope="col">Total Qty</CTableHeaderCell>
        </CTableRow>
      </CTableHead>
      <CTableBody>
        <CTableRow v-for="record in paginatedRecords" :key="record.id">
          <CTableDataCell>{{ record.cow }}</CTableDataCell>
          <CTableDataCell>{{ record.date }}</CTableDataCell>
          <CTableDataCell>{{ record.morningQuantity }}</CTableDataCell>
          <CTableDataCell>{{ record.eveningQuantity }}</CTableDataCell>
          <CTableDataCell>{{ record.totalQuantity }}</CTableDataCell>
        </CTableRow>
        <CTableRow v-if="paginatedRecords.length === 0">
          <CTableDataCell colspan="5" class="text-center text-muted">No records found.</CTableDataCell>
        </CTableRow>
      </CTableBody>
    </CTable>

    <!-- Pagination -->
    <div class="d-flex justify-content-between align-items-center mt-3">
      <div>Page {{ currentPage }} of {{ totalPages }}</div>
      <CPagination>
        <CPaginationItem
          :disabled="currentPage === 1"
          @click="currentPage--"
        >
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

        <CPaginationItem
          :disabled="currentPage === totalPages"
          @click="currentPage++"
        >
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

// Sample data
const records = ref([
  { id: 1, cow: 'Bessie', date: '2025-05-01', morningQuantity: 5, eveningQuantity: 4, totalQuantity: 9 },
  { id: 2, cow: 'Daisy', date: '2025-05-01', morningQuantity: 4.5, eveningQuantity: 4, totalQuantity: 8.5 },
  { id: 3, cow: 'MooMoo', date: '2025-05-01', morningQuantity: 6, eveningQuantity: 5, totalQuantity: 11 },
  // Add more if needed
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

watch(searchQuery, () => {
  currentPage.value = 1
})
</script>
