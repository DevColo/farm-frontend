<template>
  <CRow>
    <CCol :xs="12">
      <CCard class="mb-4">
        <CCardHeader>
          <strong>Block List</strong>
        </CCardHeader>
        <CCardBody>
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

          <!-- Block List Table -->
          <CTable striped hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>ID</CTableHeaderCell>
                <CTableHeaderCell>Block Name</CTableHeaderCell>
                <CTableHeaderCell>Farm Name</CTableHeaderCell>
                <CTableHeaderCell>Active</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              <CTableRow v-for="block in paginatedBlocks" :key="block.id">
                <CTableDataCell>{{ block.id }}</CTableDataCell>
                <CTableDataCell>{{ block.blockName }}</CTableDataCell>
                <CTableDataCell>{{ block.farmName }}</CTableDataCell>
                <CTableDataCell>{{ block.active ? 'Yes' : 'No' }}</CTableDataCell>
              </CTableRow>
              <!-- Empty State -->
              <CTableRow v-if="filteredBlocks.length === 0">
                <CTableDataCell colspan="4" class="text-center">No blocks found.</CTableDataCell>
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
import { ref, computed } from 'vue';

// Data for the block list
const blocks = ref([
  { id: 1, blockName: 'Block A', farmName: 'Farm 1', active: true },
  { id: 2, blockName: 'Block B', farmName: 'Farm 2', active: false },
  { id: 3, blockName: 'Block A', farmName: 'Farm 3', active: true },
  { id: 4, blockName: 'Block C', farmName: 'Farm 4', active: true },
  { id: 5, blockName: 'Block B', farmName: 'Farm 5', active: false },
  { id: 6, blockName: 'Block C', farmName: 'Farm 6', active: true },
  // Add more blocks for testing pagination and search
]);

// State for pagination and search
const searchQuery = ref('');
const itemsPerPage = ref(10);
const currentPage = ref(1);

// Filter blocks based on search query
const filteredBlocks = computed(() => {
  return blocks.value.filter(block => {
    const lowerQuery = searchQuery.value.toLowerCase();
    return (
      block.blockName.toLowerCase().includes(lowerQuery) ||
      block.farmName.toLowerCase().includes(lowerQuery)
    );
  });
});

// Paginate filtered blocks
const totalPages = computed(() => {
  return Math.ceil(filteredBlocks.value.length / itemsPerPage.value);
});

const paginatedBlocks = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredBlocks.value.slice(start, end);
});
</script>
