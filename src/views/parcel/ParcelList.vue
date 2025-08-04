<script setup>
import { ref, computed, onMounted } from 'vue'
import { useParcelStore } from '@/stores/parcel.store'
import {
  CRow, CCol, CCard, CCardHeader, CCardBody,
  CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell,
  CButton, CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter,
  CForm, CFormLabel, CFormInput, CFormSelect, CFormCheck
} from '@coreui/vue'
import CIcon from '@coreui/icons-vue'
import { cilPencil, cilTrash } from '@coreui/icons'

const parcelStore = useParcelStore()

const showModal = ref(false)
const isEditing = ref(false)
const currentParcel = ref({
  parcel: '',
  block: 'AAA',
  status: '1',
})

const searchQuery = ref('')
const itemsPerPage = ref(10)
const currentPage = ref(1)

onMounted(() => {
  parcelStore.fetchParcel()
})

const filteredParcels = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return parcelStore.parcel
  return parcelStore.parcel.filter((p) =>
    [p.parcel, p.block].some(field => field?.toLowerCase().includes(query))
  )
})

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredParcels.value.length / itemsPerPage.value))
)

const paginatedParcels = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredParcels.value.slice(start, end)
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
  if (confirm('Are you sure you want to delete this parcel?')) {
    parcelStore.deleteParcel(id)
  }
}

function openCreate() {
  isEditing.value = false
  currentParcel.value = {
    parcel: '',
    block: 'AAA',
    status: '1',
  }
  showModal.value = true
}

function openEdit(parcel) {
  isEditing.value = true
  currentParcel.value = { ...parcel }
  showModal.value = true
}

const isActive = computed({
  get() {
    return currentParcel.value.status === '1'
  },
  set(value) {
    currentParcel.value.status = value ? '1' : '0'
  },
})

function handleSubmit() {
  if (isEditing.value) {
    parcelStore.editParcel(currentParcel.value.id, currentParcel.value)
  } else {
    parcelStore.createParcel(currentParcel.value)
  }
  showModal.value = false
  parcelStore.fetchParcel()
}
</script>

<template>
  <CRow>
    <CCol xs="12">
      <CCard class="mb-4">
        <CCardHeader>
          <div class="d-flex justify-content-between align-items-center">
            <strong>Parcel List</strong>
            <CButton color="dark" @click="openCreate">+ Create Parcel</CButton>
          </div>
        </CCardHeader>
        <CCardBody>
          <div class="d-flex justify-content-between align-items-center mb-3">
            <input
              type="text"
              v-model="searchQuery"
              class="form-control w-25"
              placeholder="Search by parcel or block"
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
                <CTableHeaderCell>Parcel Name</CTableHeaderCell>
                <CTableHeaderCell>Block</CTableHeaderCell>
                <CTableHeaderCell>Status</CTableHeaderCell>
                <CTableHeaderCell>Created At</CTableHeaderCell>
                <CTableHeaderCell>Actions</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              <CTableRow v-for="parcel in paginatedParcels" :key="parcel.id">
                <CTableDataCell>{{ parcel.parcel }}</CTableDataCell>
                <CTableDataCell>{{ parcel.block }}</CTableDataCell>
                <CTableDataCell>{{ parcel.status === '1' ? 'Yes' : 'No' }}</CTableDataCell>
                <CTableDataCell>{{ parcel.createdAt ? new Date(parcel.createdAt).toLocaleString() : '' }}</CTableDataCell>
                <CTableDataCell>
                  <CButton color="info" size="sm" class="me-2 text-white" @click="openEdit(parcel)">
                    <CIcon :icon="cilPencil" />
                  </CButton>
                  <CButton color="danger" size="sm" class="text-white" @click="confirmDelete(parcel.id)">
                    <CIcon :icon="cilTrash" />
                  </CButton>
                </CTableDataCell>
              </CTableRow>
              <CTableRow v-if="paginatedParcels.length === 0">
                <CTableDataCell colspan="5" class="text-center">No parcels found.</CTableDataCell>
              </CTableRow>
            </CTableBody>
          </CTable>

          <div class="text-end mb-3">
            <strong>Total Records:</strong> {{ filteredParcels.length }}
          </div>

          <div class="d-flex justify-content-between align-items-center mt-3">
            <CButton color="dark" variant="outline" :disabled="currentPage === 1" @click="prevPage">
              Previous
            </CButton>
            <div>Page {{ currentPage }} of {{ totalPages }}</div>
            <CButton color="dark" variant="outline" :disabled="currentPage === totalPages" @click="nextPage">
              Next
            </CButton>
          </div>
        </CCardBody>
      </CCard>
    </CCol>

    <!-- Modal for Create/Edit -->
    <CModal :visible="showModal" @close="showModal = false" backdrop="static">
      <CModalHeader>
        <CModalTitle>{{ isEditing ? 'Edit Parcel' : 'Create Parcel' }}</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CForm @submit.prevent="handleSubmit">
          <div class="mb-3">
            <CFormLabel>Parcel Name</CFormLabel>
            <CFormInput v-model="currentParcel.parcel" required />
          </div>
          <div class="mb-3">
            <CFormLabel>Block</CFormLabel>
            <CFormSelect v-model="currentParcel.block" required>
              <option value="AAA">AAA</option>
              <option value="UUU">UUU</option>
              <option value="BBB">BBB</option>
              <option value="DDD">DDD</option>
            </CFormSelect>
          </div>
          <div class="mb-3">
            <CFormCheck v-model="isActive" label="Active" />
          </div>
          <CModalFooter>
            <CButton color="secondary" @click="showModal = false">Cancel</CButton>
            <CButton color="success" type="submit">{{ isEditing ? 'Update' : 'Create' }}</CButton>
          </CModalFooter>
        </CForm>
      </CModalBody>
    </CModal>
  </CRow>
</template>
