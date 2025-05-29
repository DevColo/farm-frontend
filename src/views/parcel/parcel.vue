<script setup>
import { ref, computed, onMounted } from 'vue'
import { useParcelStore } from '@/stores/parcel.store'
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

const parcelStore = useParcelStore()

const showModal = ref(false)
const isEditing = ref(false)
const currentParcel = ref({
  parcel: '',
  block: 'AAA',
  description: '',
  status: '1',
})

const searchQuery = ref('')
const itemsPerPage = ref(10)
const currentPage = ref(1)

onMounted(() => {
  ParcelStore.fetchParcel()
})

const filteredParcel = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return parcelStore.parcel
  return parcelStore.parcel.filter((p) =>
    [p.parcel, p.block].some((field) => field?.toLowerCase().includes(query)),
  )
})

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredParcel.value.length / itemsPerPage.value)),
)
const paginatedParcel = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredParcel.value.slice(start, end)
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
    description: '',
    status: '1',
  }
  showModal.value = true
}

function openEdit(parcel) {
  isEditing.value = true
  currentParcel.value = { ...parcel }
  showModal.value = true
}

// Computed property to sync status string with checkbox boolean
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
    parcekStore.createParcel(currentParcel.value)
  }
  showModal.value = false
  parcelStore.fetchParcel()
}
</script>

<template>
  <CRow>
    <CCol :xs="12">
      <CCard class="mb-4">
        <CCardHeader>
          <div class="d-flex justify-content-between align-items-center">
            <strong>Parcel</strong>
            <CButton color="success" @click="openCreate">+ Create Parcel</CButton>
          </div>
        </CCardHeader>
        <CCardBody>
          <div class="d-flex justify-content-between align-items-center mb-3">
            <input
              type="text"
              v-model="searchQuery"
              class="form-control w-50"
              placeholder="Search by parcel name or block..."
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
                <CTableHeaderCell>Parcel Name</CTableHeaderCell>
                <CTableHeaderCell>Block Name</CTableHeaderCell>
                <CTableHeaderCell>Description</CTableHeaderCell>
                <CTableHeaderCell>Active</CTableHeaderCell>
                <CTableHeaderCell>Created At</CTableHeaderCell>
                <CTableHeaderCell>Action</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              <CTableRow v-for="parcel in paginatedparcel" :key="parcel.id">
                <CTableDataCell>{{ parcel.id }}</CTableDataCell>
                <CTableDataCell>{{ parcel.parcel }}</CTableDataCell>
                <CTableDataCell>{{ parcel.block || '' }}</CTableDataCell>
                <CTableDataCell>{{ parcel.description || '' }}</CTableDataCell>
                <CTableDataCell>
                  {{ parcel.status === '1' ? 'Yes' : 'No' }}
                </CTableDataCell>
                <CTableDataCell>{{
                  new Date(parcel.createdAt).toLocaleString() || ''
                }}</CTableDataCell>
                <CTableDataCell>
                  <CButton
                    color="info"
                    size="sm"
                    class="me-2 text-white"
                    title="Edit Parcel"
                    @click="openEdit(parcel)"
                  >
                    <CIcon :icon="cilPencil" />
                  </CButton>
                  <CButton
                    color="danger"
                    title="Delete Parcel"
                    size="sm"
                    class="text-white"
                    @click="confirmDelete(parcel.id)"
                  >
                    <CIcon :icon="cilTrash" />
                  </CButton>
                </CTableDataCell>
              </CTableRow>
              <CTableRow v-if="paginatedParcel.length === 0">
                <CTableDataCell colspan="6" class="text-center">No parcel found.</CTableDataCell>
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
      <CModalTitle>{{ isEditing ? 'Edit Parcel' : 'Create Parcel' }}</CModalTitle>
    </CModalHeader>
    <CModalBody>
      <CForm @submit.prevent="handleSubmit">
        <div class="mb-3">
          <CFormLabel>Parcel Name</CFormLabel>
          <CFormInput v-model="currentParcel.parcel" required />
        </div>
        <div class="mb-3">
          <CFormLabel>farm</CFormLabel>
          <CFormSelect v-model="currentParcel.block" required>
            <option disabled value="">Choose block</option>
            <option value="Rwanda">AAA</option>
            <option value="Uganda">BBB</option>
            <option value="Burundi">CCC</option>
            <option value="DR Congo">DDD</option>
          </CFormSelect>
        </div>
        <div class="mb-3">
          <CFormLabel>Description</CFormLabel>
          <CFormTextarea rows="3" v-model="currentParcel.description" />
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


