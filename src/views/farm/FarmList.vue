<script setup>
import { ref, computed } from 'vue'

const farms = ref([
  { id: 1, name: 'Green Valley', country: 'Rwanda', active: true },
  { id: 2, name: 'Sunrise Farm', country: 'Uganda', active: false },
  { id: 3, name: 'Mountain Field', country: 'Rwanda', active: true },
  { id: 4, name: 'River Edge', country: 'Burundi', active: true },
  { id: 5, name: 'Sunset Farm', country: 'DR Congo', active: false },
  // 👉 Add up to 100+ farms for testing
])

const searchQuery = ref('')
const itemsPerPage = ref(10)
const currentPage = ref(1)

const filteredFarms = computed(() => {
  return farms.value.filter(farm => {
    const query = searchQuery.value.toLowerCase()
    return (
      farm.name.toLowerCase().includes(query) ||
      farm.country.toLowerCase().includes(query)
    )
  })
})

const totalPages = computed(() => Math.ceil(filteredFarms.value.length / itemsPerPage.value))

const paginatedFarms = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredFarms.value.slice(start, end)
})

function nextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++
}
function prevPage() {
  if (currentPage.value > 1) currentPage.value--
}
function resetPage() {
  currentPage.value = 1
}
</script>

<template>
  <CRow>
    <CCol :xs="12">
      <CCard class="mb-4">
        <CCardHeader>
          <strong>Farm List</strong>
        </CCardHeader>
        <CCardBody>
          <div class="d-flex justify-content-between align-items-center mb-3">
            <input
              type="text"
              v-model="searchQuery"
              class="form-control w-50"
              placeholder="Search by name or country..."
              @input="resetPage"
            />

            <div class="d-flex align-items-center">
              <label class="me-2">Show:</label>
              <select v-model="itemsPerPage" @change="resetPage" class="form-select">
                <option :value="10">10</option>
                <option :value="25">25</option>
                <option :value="50">50</option>
                <option :value="100">100</option>
              </select>
            </div>
          </div>

          <CTable striped hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>ID</CTableHeaderCell>
                <CTableHeaderCell>Farm Name</CTableHeaderCell>
                <CTableHeaderCell>Country</CTableHeaderCell>
                <CTableHeaderCell>Active</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              <CTableRow v-for="farm in paginatedFarms" :key="farm.id">
                <CTableDataCell>{{ farm.id }}</CTableDataCell>
                <CTableDataCell>{{ farm.name }}</CTableDataCell>
                <CTableDataCell>{{ farm.country }}</CTableDataCell>
                <CTableDataCell>{{ farm.active ? 'Yes' : 'No' }}</CTableDataCell>
              </CTableRow>
              <CTableRow v-if="paginatedFarms.length === 0">
                <CTableDataCell colspan="4" class="text-center">No farms found.</CTableDataCell>
              </CTableRow>
            </CTableBody>
          </CTable>

          <!-- Pagination Controls -->
          <div class="d-flex justify-content-between align-items-center mt-3">
            <CButton color="primary" :disabled="currentPage === 1" @click="prevPage">
              Previous
            </CButton>
            <div>
              Page {{ currentPage }} of {{ totalPages }}
            </div>
            <CButton color="primary" :disabled="currentPage === totalPages" @click="nextPage">
              Next
            </CButton>
          </div>
        </CCardBody>
      </CCard>
    </CCol>
  </CRow>
</template>
