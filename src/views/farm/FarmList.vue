<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useFarmStore } from '@/stores/farm.store'
import { useCountryStore } from '@/stores/country.store'
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
import Multiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.css'

const farmStore = useFarmStore()
const countryStore = useCountryStore()

const showModal = ref(false)
const isEditing = ref(false)
const editingId = ref(null)
const currentFarm = ref({
  name: '',
  country: 'Rwanda',
  description: '',
  status: '1',
})

const searchQuery = ref('')
const itemsPerPage = ref(10)
const currentPage = ref(1)
const countries = ref([])

onMounted(() => {
  farmStore.fetchFarms()
  countryStore.fetchCountries()
})

// Watch the store in case countries are updated dynamically later
watch(
  () => countryStore.countries,
  (newCountries) => {
    countries.value = newCountries.map(c => ({
      value: c.id,
      label: c.country,
    }))
  },
  { deep: true }
)

const filteredFarms = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  // Always work with an array
  const farms = Array.isArray(farmStore.farms) ? farmStore.farms : []

  if (farms.length === 0) return []
  if (!query) return farms

  return farms.filter((p) =>
    [p.name, p.country].some((field) =>
      field?.toLowerCase().includes(query),
    ),
  )
})

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredFarms.value.length / itemsPerPage.value)),
)

const paginatedFarms = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value

  // Make sure slice is called only on arrays
  return Array.isArray(filteredFarms.value)
    ? filteredFarms.value.slice(start, end)
    : []
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
  editingId.value = null
  currentFarm.value = {
    name: '',
    country: '',
    description: '',
    status: '1',
  }
  showModal.value = true
}

function openEdit(farm) {
  isEditing.value = true
  editingId.value = farm.id
  currentFarm.value = { ...farm }
  showModal.value = true
  // Find matching country object from options
  const countryObj = countries.value.find(c => 
    c.label.toLowerCase() === farm.country?.toLowerCase()
  )
  currentFarm.value.country = countryObj || null
  console.log(countryObj)
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
    const payload = {
    name: currentFarm.value.name,
    description: currentFarm.value.description,
    status: currentFarm.value.status,
    country: currentFarm.value.country.value,
  }

  if (isEditing.value) {
    payload.farm_id = editingId.value
    farmStore.editFarm(payload)
  } else {
    farmStore.createFarm(payload)
  }
  showModal.value = false
  farmStore.fetchFarms()
}
</script>

<template>
  <CRow>
    <CCol :xs="12">
      <CCard class="mb-4">
        <CCardHeader>
          <div class="d-flex justify-content-between align-items-center">
            <strong>Farm List</strong>
            <CButton color="dark" @click="openCreate">+ Create Farm</CButton>
          </div>
        </CCardHeader>
        <CCardBody>
          <div class="d-flex justify-content-between align-items-center mb-3">
            <input
              type="text"
              v-model="searchQuery"
              class="form-control w-25"
              placeholder="Search by farm or country"
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
                <CTableHeaderCell>Farm Name</CTableHeaderCell>
                <CTableHeaderCell>Country</CTableHeaderCell>
                <CTableHeaderCell>Amount of Block</CTableHeaderCell>
                <CTableHeaderCell>Description</CTableHeaderCell>
                <CTableHeaderCell>Created At</CTableHeaderCell>
                <CTableHeaderCell>Action</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              <CTableRow v-for="farm in paginatedFarms" :key="farm.id">
                <CTableDataCell
                  >{{ farm.name }}</CTableDataCell
                >
                <CTableDataCell>{{ farm.country ?? '' }}</CTableDataCell>
                <CTableDataCell>{{ farm.block_count ?? '' }}</CTableDataCell>
                <CTableDataCell>{{ farm.description ?? '' }}</CTableDataCell>
                <CTableDataCell>{{
                  new Date(farm.created_at).toLocaleString() || ''
                }}</CTableDataCell>
                <CTableDataCell>
                  <CButton
                    color="info"
                    size="sm"
                    class="me-2 text-white"
                    title="Edit farm"
                    @click="openEdit(farm)"
                  >
                    <CIcon :icon="cilPencil" />
                  </CButton>
                  <CButton
                    color="danger"
                    title="Delete farm"
                    size="sm"
                    class="text-white"
                    @click="confirmDelete(farm.id)"
                  >
                    <CIcon :icon="cilTrash" />
                  </CButton>
                </CTableDataCell>
              </CTableRow>
              <CTableRow v-if="paginatedFarms.length === 0">
                <CTableDataCell colspan="6" class="text-center">No Farm found.</CTableDataCell>
              </CTableRow>
            </CTableBody>
          </CTable>

          <div class="text-end mb-3">
            <strong>Total Records:</strong> {{ filteredFarms.length }}
          </div>
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
      <CModalTitle>{{ isEditing ? 'Edit Farm' : 'Create Farm' }}</CModalTitle>
    </CModalHeader>
    <CModalBody>
      <CForm @submit.prevent="handleSubmit">
        <div class="mb-3">
          <CFormLabel>Farm Name</CFormLabel>
          <CFormInput v-model="currentFarm.name" required />
        </div>
        <div class="mb-3">
          <CFormLabel>Country</CFormLabel>
          <Multiselect
            v-model="currentFarm.country"
            placeholder="Select Country"
            track-by="value"
            label="label"
            :options="countries"
            :show-no-results="false"
            :close-on-select="true"
            :clear-on-select="false"
            :preserve-search="true"
            :preselect-first="false"
            required
          />
        </div>
        <div class="mb-3">
          <CFormLabel>Description</CFormLabel>
          <CFormTextarea rows="3" v-model="currentFarm.description" />
        </div>
        <div class="mb-3">
          <CFormCheck v-model="isActive" type="checkbox" label=" Active" />
        </div>
        <CModalFooter>
          <CButton color="light" @click="showModal = false">Cancel</CButton>
          <CButton color="dark" type="submit">{{ isEditing ? 'Update' : 'Create' }}</CButton>
        </CModalFooter>
      </CForm>
    </CModalBody>
  </CModal>
</template>
