<template>
  <CRow>
    <CCol :xs="12">
      <CCard class="mb-4">
        <CCardHeader>
          <strong>Parcel List</strong>
        </CCardHeader>
        <CCardBody>
          <!-- Search Bar and Pagination Control -->
          <div class="d-flex justify-content-between align-items-center mb-3">
            <!-- Search Bar -->
            <input
              type="text"
              v-model="searchQuery"
              class="form-control w-50"
              placeholder="Search by parcel or block name..."
            />
            <!-- Items per page -->
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

          <!-- Parcel List Table -->
          <CTable striped hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>ID</CTableHeaderCell>
                <CTableHeaderCell>Parcel Name</CTableHeaderCell>
                <CTableHeaderCell>Block Name</CTableHeaderCell>
                <CTableHeaderCell>Active</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              <CTableRow v-for="(parcel, index) in paginatedParcels" :key="index">
                <CTableDataCell>{{ index + 1 + (currentPage - 1) * itemsPerPage }}</CTableDataCell>
                <CTableDataCell>{{ parcel.parcelName }}</CTableDataCell>
                <CTableDataCell>{{ parcel.blockName }}</CTableDataCell>
                <CTableDataCell>{{ parcel.active ? 'Yes' : 'No' }}</CTableDataCell>
              </CTableRow>
              <CTableRow v-if="filteredParcels.length === 0">
                <CTableDataCell colspan="4" class="text-center">No parcels found.</CTableDataCell>
              </CTableRow>
            </CTableBody>
          </CTable>

          <!-- Pagination Controls -->
          <div class="d-flex justify-content-between align-items-center mt-3">
            <CButton color="primary" :disabled="currentPage === 1" @click="currentPage--">
              Previous
            </CButton>
            <div>
              Page {{ currentPage }} of {{ totalPages }}
            </div>
            <CButton color="primary" :disabled="currentPage === totalPages" @click="currentPage++">
              Next
            </CButton>
          </div>
        </CCardBody>
      </CCard>
    </CCol>
  </CRow>
</template>

<script setup>
import { ref, computed } from 'vue'

// Sample parcel data
const parcels = ref([
  { parcelName: 'Parcel A', blockName: 'Block 1', active: true },
  { parcelName: 'Parcel B', blockName: 'Block 2', active: false },
  { parcelName: 'Parcel C', blockName: 'Block 1', active: true },
  { parcelName: 'Parcel D', blockName: 'Block 3', active: true },
  { parcelName: 'Parcel E', blockName: 'Block 2', active: false },
  { parcelName: 'Parcel F', blockName: 'Block 1', active: true },
  { parcelName: 'Parcel G', blockName: 'Block 3', active: false },
  // Add more as needed
])

const searchQuery = ref('')
const itemsPerPage = ref(10)
const currentPage = ref(1)

const filteredParcels = computed(() => {
  return parcels.value.filter(parcel => {
    const query = searchQuery.value.toLowerCase()
    return (
      parcel.parcelName.toLowerCase().includes(query) ||
      parcel.blockName.toLowerCase().includes(query)
    )
  })
})

const totalPages = computed(() =>
  Math.ceil(filteredParcels.value.length / itemsPerPage.value)
)

const paginatedParcels = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredParcels.value.slice(start, start + itemsPerPage.value)
})
</script>

