<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useCowStore } from '@/stores/cow.store'
import { useMaternityStore } from '@/stores/maternity.store'
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
  CFormFeedback,
} from '@coreui/vue'
import { cilPencil, cilTrash, cilBaby } from '@coreui/icons'
import Multiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.css'

const cowStore = useCowStore()
const maternityStore = useMaternityStore()

const showModal = ref(false)
const birthModal = ref(false)
const isEditing = ref(false)
const validated = ref(false)

const currentMaternity = ref({
  id: null,
  maternity: '',
  reason: '',
  mating_date: '',
  pregnancy_status: '',
  cow_id: '',
})

// fetch data
onMounted(() => {
  maternityStore.fetchMaternities()
  cowStore.fetchFemaleCows()
  cowStore.fetchMaleCows()
})

// search & pagination
const searchQuery = ref('')
const itemsPerPage = ref(10)
const currentPage = ref(1)

const filteredMaternities = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return maternityStore.maternities
  return maternityStore.maternities.filter((m) =>
    [m.maternity, m.reason].some((f) => f?.toLowerCase().includes(q)),
  )
})

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredMaternities.value.length / itemsPerPage.value)),
)
const paginatedMaternities = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredMaternities.value.slice(start, start + itemsPerPage.value)
})

// Fix for the prop type warning
watch(
  () => currentMaternity.value.cow_id,
  (newValue) => {
    if (typeof newValue === 'number') {
      currentMaternity.value.cow_id = String(newValue)
    }
  },
)

function nextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++
}
function prevPage() {
  if (currentPage.value > 1) currentPage.value--
}
function resetPage() {
  currentPage.value = 1
}

// modal handlers
function openCreate() {
  isEditing.value = false
  validated.value = false
  currentMaternity.value = {
    id: null,
    maternity: '',
    reason: '',
    mating_date: '',
    pregnancy_status: '',
    cow_id: '',
  }
  showModal.value = true
}

function openEdit(maternity) {
  isEditing.value = true
  validated.value = false
  currentMaternity.value = { ...maternity }
  showModal.value = true
}

// Delivery modal
function openBirth(maternity) {
  isEditing.value = true
  validated.value = false
  currentMaternity.value = { ...maternity }
  birthModal.value = true
}

function confirmDelete(id) {
  if (confirm('Are you sure you want to delete this maternity record?')) {
    maternityStore.deleteMaternity(id)
  }
}

async function handleSubmit(e) {
  const form = e.currentTarget
  if (!form.checkValidity()) {
    e.preventDefault()
    e.stopPropagation()
    validated.value = true
    return
  }
  e.preventDefault()
  const payload = {
    cow_id: currentMaternity.value.cow_id.value,
    bull_id: currentMaternity.value.bull_id.value,
    mating_date: currentMaternity.value.mating_date,
    pregnancy_status: currentMaternity.value.pregnancy_status ?? 'Pregnant',
  }
  console.log('currentMaternity:', currentMaternity)
  if (isEditing.value) {
    await maternityStore.editMaternity(currentMaternity.value.id, payload)
  } else {
    await maternityStore.createMaternity(payload)
  }
  showModal.value = false
  //resetPage()
}

async function birthSubmit(e) {
  const form = e.currentTarget
  if (!form.checkValidity()) {
    e.preventDefault()
    e.stopPropagation()
    validated.value = true
    return
  }
  e.preventDefault()
  const payload = {
    pregnancy_status: 'Given Birth',
    birth_date: currentMaternity.value.birth_date,
    calf_amount: currentMaternity.value.calf_amount,
  }
  await maternityStore.editMaternity(currentMaternity.value.id, payload)
  birthModal.value = false
}

// Export in PDF
async function exportPDF() {
  const { default: jsPDF } = await import('jspdf')
  const autoTable = (await import('jspdf-autotable')).default
  const doc = new jsPDF()
  doc.setFontSize(18)
  doc.text('Cows maternity Records', 105, 15, { align: 'center' })
  doc.setFontSize(12)
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 25, { align: 'center' })
  autoTable(doc, {
    startY: 35,
    head: [['ID', 'maternity', 'reason', 'Date of maternity', 'Pasture']],
    body: filteredMaternities.value.map((maternity) => [
      maternity.id,
      maternity.maternity,
      maternity.reason,
      maternity.mating_date,
      maternity.cow?.ear_tag,
    ]),
  })
  doc.save('maternities.pdf')
}

// Export in CSV
function exportCSV() {
  const rows = [
    ['ID', 'maternity', 'reason', 'Date of maternity', 'Pasture'],
    ...filteredMaternities.value.map((maternity) => [
      maternity.id,
      maternity.maternity,
      maternity.reason,
      maternity.mating_date,
      maternity.cow?.ear_tag,
    ]),
  ]

  const csvContent = rows
    .map((row) => row.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(','))
    .join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', 'maternities.csv')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

function calculateExpectedBirth(matingDate) {
  if (!matingDate) return null

  const date = new Date(matingDate)
  date.setMonth(date.getMonth() + 9) // add 9 months

  const options = { year: 'numeric', month: 'long' }
  return date.toLocaleDateString(undefined, options) // Example: "April 2026"
}
</script>

<template>
  <CRow>
    <CCol :xs="12">
      <CCard class="mb-4">
        <CCardHeader class="d-flex justify-content-between align-items-center">
          <strong>Cows Maternity List</strong>
          <div class="d-flex gap-2 mb-3">
            <CButton color="dark" variant="outline" title="Export CSV" @click="exportCSV"
              ><CIcon icon="cil-file"
            /></CButton>
            <CButton color="dark" variant="outline" class="sm" title="Export PDF" @click="exportPDF"
              ><CIcon icon="cil-cloud-download"
            /></CButton>
            <CButton color="dark" @click="openCreate">+ Add Maternity Record</CButton>
          </div>
        </CCardHeader>
        <CCardBody>
          <!-- search + page-size -->

          <div class="d-flex justify-content-between align-items-center mb-3">
            <input
              type="text"
              v-model="searchQuery"
              class="form-control w-25"
              placeholder="Search by maternity or reason"
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

          <!-- cows table -->
          <CTable striped hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Cow</CTableHeaderCell>
                <CTableHeaderCell>Bull</CTableHeaderCell>
                <CTableHeaderCell>Date of Mating</CTableHeaderCell>
                <CTableHeaderCell>Maternity Status</CTableHeaderCell>
                <CTableHeaderCell>Expected Labour Month</CTableHeaderCell>
                <CTableHeaderCell>Action</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              <CTableRow v-for="maternity in paginatedMaternities" :key="maternity.id">
                <CTableDataCell
                  ><router-link :to="`/cows/${maternity.cow?.id}`">
                    {{ maternity.cow?.ear_tag }}
                  </router-link></CTableDataCell
                >
                <CTableDataCell
                  ><router-link :to="`/cows/${maternity.bull?.id}`">
                    {{ maternity.bull?.ear_tag }}
                  </router-link></CTableDataCell
                >
                <CTableDataCell>{{ maternity.mating_date }}</CTableDataCell>
                <CTableDataCell>{{ maternity.pregnancy_status }}</CTableDataCell>
                <CTableDataCell>
                  {{
                    maternity.pregnancy_status === 'Pregnant'
                      ? calculateExpectedBirth(maternity.mating_date)
                      : 'N/A'
                  }}
                </CTableDataCell>
                <CTableDataCell>
                  <!-- Edit Cow Button -->
                  <CButton
                    size="sm"
                    color="info"
                    class="me-2 text-white"
                    title="Edit maternity Record"
                    @click="openEdit(maternity)"
                  >
                    <CIcon :icon="cilPencil" />
                  </CButton>

                  <!-- Birth Button -->
                  <CButton
                    v-if="maternity.pregnancy_status === 'Pregnant'"
                    size="sm"
                    color="warning"
                    class="me-2 text-white"
                    title="Edit maternity Record"
                    @click="openBirth(maternity)"
                  >
                    <CIcon :icon="cilBaby" />
                  </CButton>

                  <!-- Delete Cow Button -->
                  <CButton
                    size="sm"
                    color="danger"
                    class="text-white"
                    title="Delete maternity Record"
                    @click="confirmDelete(maternity.id)"
                  >
                    <CIcon :icon="cilTrash" />
                  </CButton>
                </CTableDataCell>
              </CTableRow>
              <CTableRow v-if="paginatedMaternities.length === 0">
                <CTableDataCell colspan="8" class="text-center">
                  No maternity record found.
                </CTableDataCell>
              </CTableRow>
            </CTableBody>
          </CTable>

          <!-- pagination controls -->
          <div class="text-end mb-3">
            <strong>Total Records:</strong> {{ filteredMaternities.length }}
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
  <CModal :visible="showModal" @close="showModal = false" backdrop="static" size="md">
    <CModalHeader>
      <CModalTitle>{{
        isEditing ? 'Edit Cow Maternity Record' : 'Add Cow Maternity Record'
      }}</CModalTitle>
    </CModalHeader>
    <CModalBody>
      <CForm
        class="row g-3 needs-validation"
        novalidate
        :validated="validated"
        @submit="handleSubmit"
      >
        <CCol :md="12">
          <CFormLabel for="cow">Female Cow</CFormLabel>
          <Multiselect
            id="cow"
            v-model="currentMaternity.cow_id"
            :options="[
              ...cowStore.femaleCows.map((cow) => ({
                label: cow.ear_tag,
                value: cow.id,
              })),
            ]"
            label="label"
            track-by="value"
            placeholder="Select Female Cow"
            :searchable="true"
            :allowEmpty="false"
            required
          />
          <CFormFeedback invalid v-if="!currentMaternity.cow_id">Cow is required.</CFormFeedback>
        </CCol>

        <CCol :md="12">
          <CFormLabel for="bull">Bull</CFormLabel>
          <Multiselect
            id="bull"
            v-model="currentMaternity.bull_id"
            :options="[
              ...cowStore.maleCows
                .filter((bull) => bull.male_type === 'Bull')
                .map((bull) => ({
                  label: bull.ear_tag,
                  value: bull.id,
                })),
            ]"
            label="label"
            track-by="value"
            placeholder="Select Bull"
            :searchable="true"
            :allowEmpty="false"
            required
          />
          <CFormFeedback invalid v-if="!currentMaternity.bull_id">Bull is required.</CFormFeedback>
        </CCol>

        <CCol :md="12">
          <CFormLabel for="dateOfMating">Date of Mating</CFormLabel>
          <CFormInput
            id="dateOfMating"
            type="date"
            v-model="currentMaternity.mating_date"
            required
          />
          <CFormFeedback invalid v-if="!currentMaternity.mating_date"
            >Date of Mating is required.</CFormFeedback
          >
        </CCol>

        <CCol :md="12">
          <CFormLabel for="pregnancy_status">Maternity Status</CFormLabel>
          <CFormSelect
            id="pregnancy_status"
            v-model="currentMaternity.pregnancy_status"
            :options="
              [{ label: 'Select Maternity Status', value: '' }, 'Pregnant', 'Not Pregnant'].map(
                (b) => (typeof b === 'string' ? { label: b, value: b } : b),
              )
            "
            required
          />
          <CFormFeedback invalid>Maternity Status is required.</CFormFeedback>
        </CCol>

        <CCol :xs="12" class="d-flex justify-content-end">
          <CButton color="secondary" class="me-2" @click="showModal = false">Cancel</CButton>
          <CButton color="success" type="submit">{{ isEditing ? 'Update' : 'Create' }}</CButton>
        </CCol>
      </CForm>
    </CModalBody>
  </CModal>

  <!-- Birth Modal -->
  <CModal :visible="birthModal" @close="birthModal = false" backdrop="static" size="md">
    <CModalHeader>
      <CModalTitle>{{ 'Maternity Update for ' + currentMaternity.cow?.ear_tag }}</CModalTitle>
    </CModalHeader>
    <CModalBody>
      <CForm
        class="row g-3 needs-validation"
        novalidate
        :validated="validated"
        @submit="birthSubmit"
      >
        <CCol :md="12">
          <CFormLabel>Maternity Status</CFormLabel>
          <CFormInput
            v-model="currentMaternity.pregnancy_status_update"
            type="text"
            value="Given Birth"
            readonly
            required
          />
          <CFormFeedback invalid>Maternity Status is required.</CFormFeedback>
        </CCol>
        <CCol :md="12">
          <CFormLabel for="dateOfBirth">Date of Birth</CFormLabel>
          <CFormInput id="dateOfBirth" type="date" v-model="currentMaternity.birth_date" required />
          <CFormFeedback invalid v-if="!currentMaternity.birth_date"
            >Date of Mating is required.</CFormFeedback
          >
        </CCol>

        <CCol :md="12">
          <CFormLabel>Amount of Calf</CFormLabel>
          <CFormInput v-model="currentMaternity.calf_amount" type="number" required />
          <CFormFeedback invalid v-if="!currentMaternity.calf_amount"
            >Amount of Calf is required.</CFormFeedback
          >
        </CCol>

        <CCol :xs="12" class="d-flex justify-content-end">
          <CButton color="secondary" class="me-2" @click="showModal = false">Cancel</CButton>
          <CButton color="success" type="submit">{{ isEditing ? 'Update' : 'Create' }}</CButton>
        </CCol>
      </CForm>
    </CModalBody>
  </CModal>
</template>
