<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useBlockStore } from '@/stores/block.store'
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
import Multiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.css'

const blockStore = useBlockStore()
const farmStore = useFarmStore()

const showModal = ref(false)
const isEditing = ref(false)
const editingId = ref(null)
const currentBlock = ref({
  name: '',
  country: 'Rwanda',
  description: '',
  status: '1',
})

const searchQuery = ref('')
const itemsPerPage = ref(10)
const currentPage = ref(1)
const farms = ref([])

onMounted(() => {
  blockStore.fetchBlocks()
  farmStore.fetchFarms()
})

// Watch the store in case farms are updated dynamically later
watch(
  () => farmStore.farms,
  (newFarms) => {
    farms.value = newFarms.map(c => ({
      value: c.id,
      label: c.name,
    }))
  },
  { deep: true }
)

const filteredBlocks = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  // Always work with an array
  const blocks = Array.isArray(blockStore.blocks) ? blockStore.blocks : []

  if (blocks.length === 0) return []
  if (!query) return blocks

  return blocks.filter((p) =>
    [p.name, p.country].some((field) =>
      field?.toLowerCase().includes(query),
    ),
  )
})

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredBlocks.value.length / itemsPerPage.value)),
)

const paginatedBlocks = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value

  // Make sure slice is called only on arrays
  return Array.isArray(filteredBlocks.value)
    ? filteredBlocks.value.slice(start, end)
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
    blockStore.deleteFarm(id)
  }
}

function openCreate() {
  isEditing.value = false
  editingId.value = null
  currentBlock.value = {
    name: '',
    farm: '',
    description: '',
    status: '1',
  }
  showModal.value = true
}

function openEdit(block) {
  isEditing.value = true
  editingId.value = block.id
  currentBlock.value = { ...block }
  showModal.value = true
  // Find matching farm object from options
  const farmObj = farms.value.find(c => 
    c.label.toLowerCase() === block.farm?.toLowerCase()
  )
  currentBlock.value.farm = farmObj || null
  console.log(countryObj)
}

// Computed property to sync status string with checkbox boolean
const isActive = computed({
  get() {
    return currentBlock.value.status === '1'
  },
  set(value) {
    currentBlock.value.status = value ? '1' : '0'
  },
})

function handleSubmit() {
    const payload = {
    name: currentBlock.value.name,
    description: currentBlock.value.description,
    status: currentBlock.value.status,
    farm: currentBlock.value.farm.value,
  }

  if (isEditing.value) {
    payload.block_id = editingId.value
    blockStore.editBlock(payload)
  } else {
    blockStore.createBlock(payload)
  }
  showModal.value = false
  blockStore.fetchBlocks()
}
</script>

<template>
  <CRow>
    <CCol :xs="12">
      <CCard class="mb-4">
        <CCardHeader>
          <div class="d-flex justify-content-between align-items-center">
            <strong>Block List</strong>
            <CButton color="dark" @click="openCreate">+ Create Block</CButton>
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
                <CTableHeaderCell>Block Name</CTableHeaderCell>
                <CTableHeaderCell>Farm</CTableHeaderCell>
                <CTableHeaderCell>Description</CTableHeaderCell>
                <CTableHeaderCell>Created At</CTableHeaderCell>
                <CTableHeaderCell>Action</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              <CTableRow v-for="block in paginatedBlocks" :key="block.id">
                <CTableDataCell
                  >{{ block.name }}</CTableDataCell
                >
                <CTableDataCell>{{ block.farm ?? '' }}</CTableDataCell>
                <CTableDataCell>{{ block.description ?? '' }}</CTableDataCell>
                <CTableDataCell>{{
                  new Date(block.created_at).toLocaleString() || ''
                }}</CTableDataCell>
                <CTableDataCell>
                  <CButton
                    color="info"
                    size="sm"
                    class="me-2 text-white"
                    title="Edit block"
                    @click="openEdit(block)"
                  >
                    <CIcon :icon="cilPencil" />
                  </CButton>
                  <CButton
                    color="danger"
                    title="Delete block"
                    size="sm"
                    class="text-white"
                    @click="confirmDelete(block.id)"
                  >
                    <CIcon :icon="cilTrash" />
                  </CButton>
                </CTableDataCell>
              </CTableRow>
              <CTableRow v-if="paginatedBlocks.length === 0">
                <CTableDataCell colspan="6" class="text-center">No block found.</CTableDataCell>
              </CTableRow>
            </CTableBody>
          </CTable>

          <div class="text-end mb-3">
            <strong>Total Records:</strong> {{ filteredBlocks.length }}
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
      <CModalTitle>{{ isEditing ? 'Edit Block' : 'Create Block' }}</CModalTitle>
    </CModalHeader>
    <CModalBody>
      <CForm @submit.prevent="handleSubmit">
        <div class="mb-3">
          <CFormLabel>Block Name</CFormLabel>
          <CFormInput v-model="currentBlock.name" required />
        </div>
        <div class="mb-3">
          <CFormLabel>Farm</CFormLabel>
          <Multiselect
            v-model="currentBlock.farm"
            placeholder="Select Farm"
            track-by="value"
            label="label"
            :options="farms"
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
          <CFormTextarea rows="3" v-model="currentBlock.description" />
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
