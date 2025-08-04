<script setup>
import { ref, computed, onMounted } from 'vue'
import { useFarmStore } from '@/stores/farm.store'
import {
  CRow,
  CCol,
  CCard,
  CCardHeader,
  CCardBody,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CFormLabel,
  CFormInput,
  CFormTextarea,
  CFormSelect,
  CFormCheck,
} from '@coreui/vue'
import CIcon from '@coreui/icons-vue'
import { cilPencil, cilTrash } from '@coreui/icons'

const farmStore = useFarmStore()

const showModal = ref(false)
const isEditing = ref(false)
const currentFarm = ref({
  product: '',
  unitPrice: '',   // <- new field
  quantity: '',    // <- new field
  currency: '',    // <- new field
  customer: '',    // <- new field
  status: '1',
})


const searchQuery = ref('')
const itemsPerPage = ref(10)
const currentPage = ref(1)

onMounted(() => {
  farmStore.fetchFarm()
})

const filteredFarm = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return farmStore.farm
  return farmStore.farm.filter((p) =>
    [p.farm, p.country].some((field) => field?.toLowerCase().includes(query)),
  )
})

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredFarm.value.length / itemsPerPage.value)),
)
const paginatedFarm = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredFarm.value.slice(start, end)
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

function confirmDelete(id) {
  if (confirm('Are you sure you want to delete this farm?')) {
    farmStore.deleteFarm(id)
  }
}

function openCreate() {
  isEditing.value = false
  currentFarm.value = {
    farm: '',
    country: 'Rwanda',
    description: '',
    status: '1',
  }
  showModal.value = true
}

function openEdit(farm) {
  isEditing.value = true
  currentFarm.value = { ...farm }
  showModal.value = true
}

// Computed property to sync status string with checkbox boolean
const isActive = computed({
  get() {
    return currentFarm.value.status === '1'
  },
  set(value) {
    currentFarm.value.status = value ? '1' : '0'
  },
})

function handleSubmit() {
  if (isEditing.value) {
    farmStore.editFarm(currentFarm.value.id, currentFarm.value)
  } else {
    farmStore.createFarm(currentFarm.value)
  }
  showModal.value = false
  farmStore.fetchFarm()
}
</script>

<template>
  <CRow>
    <CCol :xs="12">
      <CCard class="mb-4">
        <CCardHeader>
          <div class="d-flex justify-content-between align-items-center">
            <strong>Product</strong>
            <CButton color="dark" @click="openCreate">+ Create Product </CButton>
          </div>
        </CCardHeader>
        <CCardBody>
          <div class="d-flex justify-content-between align-items-center mb-3">
            <input
              type="text"
              v-model="searchQuery"
              class="form-control w-50"
              placeholder="Search by product name or category..."
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
                <CTableHeaderCell>Product Name</CTableHeaderCell>
                <CTableHeaderCell>Unit Price</CTableHeaderCell>
                <CTableHeaderCell>Quantity</CTableHeaderCell>
                <CTableHeaderCell>Currency</CTableHeaderCell>
                <CTableHeaderCell>Customer</CTableHeaderCell>
                <CTableHeaderCell>Action</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              <CTableRow v-for="farm in paginatedFarm" :key="farm.id">
                <CTableDataCell>{{ farm.id }}</CTableDataCell>
                <CTableDataCell>{{ farm.farm }}</CTableDataCell>
                <CTableDataCell>{{ farm.country || '' }}</CTableDataCell>
                <CTableDataCell>{{ farm.description || '' }}</CTableDataCell>
                <CTableDataCell>
                  {{ farm.status === '1' ? 'Yes' : 'No' }}
                </CTableDataCell>
                <CTableDataCell>{{
                  new Date(farm.createdAt).toLocaleString() || ''
                }}</CTableDataCell>
                <CTableDataCell>
                  <CButton
                    color="info"
                    size="sm"
                    class="me-2 text-white"
                    title="Edit Farm"
                    @click="openEdit(farm)"
                  >
                    <CIcon :icon="cilPencil" />
                  </CButton>
                  <CButton
                    color="danger"
                    title="Delete Farm"
                    size="sm"
                    class="text-white"
                    @click="confirmDelete(farm.id)"
                  >
                    <CIcon :icon="cilTrash" />
                  </CButton>
                </CTableDataCell>
              </CTableRow>
              <CTableRow v-if="paginatedFarm.length === 0">
                <CTableDataCell colspan="6" class="text-center">No product found.</CTableDataCell>
              </CTableRow>
            </CTableBody>
          </CTable>

          <div class="d-flex justify-content-between align-items-center mt-3">
            <CButton color="dark" variant="outline" :disabled="currentPage === 1" @click="prevPage">
              Previous
            </CButton>
            <div>Page {{ currentPage }} of {{ totalPages }}</div>
            <CButton
              color="dark"
              variant="outline"
              :disabled="currentPage === totalPages"
              @click="nextPage"
            >
              Next
            </CButton>
          </div>
        </CCardBody>
      </CCard>
    </CCol>
  </CRow>

  <!-- Create/Edit Modal -->
  <CModal :visible="showModal" @close="showModal = false" backdrop="static">
    <CModalHeader>
      <CModalTitle>{{ isEditing ? 'Edit product' : 'Create Product' }}</CModalTitle>
    </CModalHeader>
    <CModalBody>
      <CForm @submit.prevent="handleSubmit">
    <div class="mb-3">
  <CFormLabel>Product</CFormLabel>
  <CFormInput v-model="currentFarm.farm" required />
</div>

<div class="mb-3">
  <CFormLabel>Unit Price</CFormLabel>
  <CFormInput type="number" v-model="currentFarm.unitPrice" />
</div>

<div class="mb-3">
  <CFormLabel>Quantity</CFormLabel>
  <CFormInput type="number" v-model="currentFarm.quantity" />
</div>

<div class="mb-3">
  <CFormLabel>Currency</CFormLabel>
  <CFormInput v-model="currentFarm.currency" />
</div>

<div class="mb-3">
  <CFormLabel>Customer</CFormLabel>
  <CFormInput v-model="currentFarm.customer" />
</div>


        <div class="mb-3">
          <CFormCheck v-model="isActive" type="checkbox" label=" Active" />
        </div>
        <CModalFooter>
          <CButton color="secondary" @click="showModal = false">Cancel</CButton>
          <CButton color="success" type="submit">{{ isEditing ? 'Update' : 'Create' }}</CButton>
        </CModalFooter>
      </CForm>
    </CModalBody>
  </CModal>
</template>

