<script setup>
import { ref, computed, onMounted } from 'vue'
import { usePastureStore } from '@/stores/pasture.store'
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

const pastureStore = usePastureStore()

const showModal = ref(false)
const isEditing = ref(false)
const currentPasture = ref({
  pasture: '',
  country: 'Rwanda',
  description: '',
  status: '1',
})

const searchQuery = ref('')
const itemsPerPage = ref(10)
const currentPage = ref(1)

onMounted(() => {
  pastureStore.fetchPastures()
})

const filteredPastures = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return pastureStore.pastures
  return pastureStore.pastures.filter((p) =>
    [p.pasture, p.country].some((field) => field?.toLowerCase().includes(query)),
  )
})

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredPastures.value.length / itemsPerPage.value)),
)
const paginatedPastures = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredPastures.value.slice(start, end)
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
  if (confirm('Are you sure you want to delete this pasture?')) {
    pastureStore.deletePasture(id)
  }
}

function openCreate() {
  isEditing.value = false
  currentPasture.value = {
    pasture: '',
    country: 'Rwanda',
    description: '',
    status: '1',
  }
  showModal.value = true
}

function openEdit(pasture) {
  isEditing.value = true
  currentPasture.value = { ...pasture }
  showModal.value = true
}

// Computed property to sync status string with checkbox boolean
const isActive = computed({
  get() {
    return currentPasture.value.status === '1'
  },
  set(value) {
    currentPasture.value.status = value ? '1' : '0'
  },
})

function handleSubmit() {
  if (isEditing.value) {
    pastureStore.editPasture(currentPasture.value.id, currentPasture.value)
  } else {
    pastureStore.createPasture(currentPasture.value)
  }
  showModal.value = false
  pastureStore.fetchPastures()
}
</script>

<template>
  <CRow>
    <CCol :xs="12">
      <CCard class="mb-4">
        <CCardHeader>
          <div class="d-flex justify-content-between align-items-center">
            <strong>Pasture List</strong>
            <CButton color="success" @click="openCreate">+ Create Pasture</CButton>
          </div>
        </CCardHeader>
        <CCardBody>
          <div class="d-flex justify-content-between align-items-center mb-3">
            <input
              type="text"
              v-model="searchQuery"
              class="form-control w-50"
              placeholder="Search by pasture name or country..."
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
                <CTableHeaderCell>Pasture Name</CTableHeaderCell>
                <CTableHeaderCell>Country</CTableHeaderCell>
                <CTableHeaderCell>Description</CTableHeaderCell>
                <CTableHeaderCell>Active</CTableHeaderCell>
                <CTableHeaderCell>Created At</CTableHeaderCell>
                <CTableHeaderCell>Action</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              <CTableRow v-for="pasture in paginatedPastures" :key="pasture.id">
                <CTableDataCell>{{ pasture.id }}</CTableDataCell>
                <CTableDataCell>{{ pasture.pasture }}</CTableDataCell>
                <CTableDataCell>{{ pasture.country || '' }}</CTableDataCell>
                <CTableDataCell>{{ pasture.description || '' }}</CTableDataCell>
                <CTableDataCell>
                  {{ pasture.status === '1' ? 'Yes' : 'No' }}
                </CTableDataCell>
                <CTableDataCell>{{
                  new Date(pasture.createdAt).toLocaleString() || ''
                }}</CTableDataCell>
                <CTableDataCell>
                  <CButton
                    color="info"
                    size="sm"
                    class="me-2 text-white"
                    title="Edit Pasture"
                    @click="openEdit(pasture)"
                  >
                    <CIcon :icon="cilPencil" />
                  </CButton>
                  <CButton
                    color="danger"
                    title="Delete Pasture"
                    size="sm"
                    class="text-white"
                    @click="confirmDelete(pasture.id)"
                  >
                    <CIcon :icon="cilTrash" />
                  </CButton>
                </CTableDataCell>
              </CTableRow>
              <CTableRow v-if="paginatedPastures.length === 0">
                <CTableDataCell colspan="6" class="text-center">No pastures found.</CTableDataCell>
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
      <CModalTitle>{{ isEditing ? 'Edit Pasture' : 'Create Pasture' }}</CModalTitle>
    </CModalHeader>
    <CModalBody>
      <CForm @submit.prevent="handleSubmit">
        <div class="mb-3">
          <CFormLabel>Pasture Name</CFormLabel>
          <CFormInput v-model="currentPasture.pasture" required />
        </div>
        <div class="mb-3">
          <CFormLabel>Country</CFormLabel>
          <CFormSelect v-model="currentPasture.country" required>
            <option disabled value="">Choose country</option>
            <option value="Rwanda">Rwanda</option>
            <option value="Uganda">Uganda</option>
            <option value="Burundi">Burundi</option>
            <option value="DR Congo">DR Congo</option>
          </CFormSelect>
        </div>
        <div class="mb-3">
          <CFormLabel>Description</CFormLabel>
          <CFormTextarea rows="3" v-model="currentPasture.description" />
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
