<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useCowStore } from '@/stores/cow.store'
import { useMedicationStore } from '@/stores/medication.store'
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
import { cilPencil, cilTrash } from '@coreui/icons'
import Multiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.css'

const cowStore = useCowStore()
const medicationStore = useMedicationStore()

const showModal = ref(false)
const isEditing = ref(false)
const validated = ref(false)

const currentMedication = ref({
  id: null,
  medication: '',
  reason: '',
  medication_date: '',
  cow_id: '',
})

// fetch data
onMounted(() => {
  medicationStore.fetchMedications()
  cowStore.fetchCows()
})

// search & pagination
const searchQuery = ref('')
const itemsPerPage = ref(10)
const currentPage = ref(1)

const filteredMedications = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return medicationStore.medications
  return medicationStore.medications.filter((m) =>
    [m.medication, m.reason].some((f) => f?.toLowerCase().includes(q)),
  )
})

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredMedications.value.length / itemsPerPage.value)),
)
const paginatedMedications = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredMedications.value.slice(start, start + itemsPerPage.value)
})

// Fix for the prop type warning
watch(
  () => currentMedication.value.cow_id,
  (newValue) => {
    if (typeof newValue === 'number') {
      currentMedication.value.cow_id = String(newValue)
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
  currentMedication.value = {
    id: null,
    medication: '',
    reason: '',
    medication_date: '',
    cow_id: '',
  }
  showModal.value = true
}

function openEdit(medication) {
  isEditing.value = true
  validated.value = false
  currentMedication.value = { ...medication }
  showModal.value = true
}

function confirmDelete(id) {
  if (confirm('Are you sure you want to delete this Medication record?')) {
    medicationStore.deleteMedication(id)
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
    medication: currentMedication.value.medication,
    cow_id: currentMedication.value.cow_id.value,
    medication_date: currentMedication.value.medication_date,
    reason: currentMedication.value.reason,
  }
  if (isEditing.value) {
    await medicationStore.editMedication(currentMedication.value.id, payload)
  } else {
    await medicationStore.createMedication(payload)
  }
  showModal.value = false
  //resetPage()
}

// Export in PDF
async function exportPDF() {
  const { default: jsPDF } = await import('jspdf')
  const autoTable = (await import('jspdf-autotable')).default
  const doc = new jsPDF()
  doc.setFontSize(18)
  doc.text('Cows Medication Records', 105, 15, { align: 'center' })
  doc.setFontSize(12)
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 25, { align: 'center' })
  autoTable(doc, {
    startY: 35,
    head: [['ID', 'Medication', 'reason', 'Date of Medication', 'Pasture']],
    body: filteredMedications.value.map((medication) => [
      medication.id,
      medication.medication,
      medication.reason,
      medication.medication_date,
      medication.cow?.ear_tag,
    ]),
  })
  doc.save('medications.pdf')
}

// Export in CSV
function exportCSV() {
  const rows = [
    ['ID', 'medication', 'reason', 'Date of Medication', 'Pasture'],
    ...filteredMedications.value.map((medication) => [
      medication.id,
      medication.medication,
      medication.reason,
      medication.medication_date,
      medication.cow?.ear_tag,
    ]),
  ]

  const csvContent = rows
    .map((row) => row.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(','))
    .join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', 'medications.csv')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
</script>

<template>
  <CRow>
    <CCol :xs="12">
      <CCard class="mb-4">
        <CCardHeader class="d-flex justify-content-between align-items-center">
          <strong>Cows Medication List</strong>
          <div class="d-flex gap-2 mb-3">
            <CButton color="dark" variant="outline" title="Export CSV" @click="exportCSV"
              ><CIcon icon="cil-file"
            /></CButton>
            <CButton color="dark" variant="outline" class="sm" title="Export PDF" @click="exportPDF"
              ><CIcon icon="cil-cloud-download"
            /></CButton>
            <CButton color="dark" @click="openCreate">+ Add Medication Record</CButton>
          </div>
        </CCardHeader>
        <CCardBody>
          <!-- search + page-size -->

          <div class="d-flex justify-content-between align-items-center mb-3">
            <input
              type="text"
              v-model="searchQuery"
              class="form-control w-25"
              placeholder="Search by medication or reason"
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
                <CTableHeaderCell>ID</CTableHeaderCell>
                <CTableHeaderCell>Medication</CTableHeaderCell>
                <CTableHeaderCell>reason</CTableHeaderCell>
                <CTableHeaderCell>Date of Medication</CTableHeaderCell>
                <CTableHeaderCell>Cow</CTableHeaderCell>
                <CTableHeaderCell>Action</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              <CTableRow v-for="medication in paginatedMedications" :key="medication.id">
                <CTableDataCell>{{ medication.id }}</CTableDataCell>
                <CTableDataCell>{{ medication.medication }}</CTableDataCell>
                <CTableDataCell>{{ medication.reason }}</CTableDataCell>
                <CTableDataCell>{{ medication.medication_date }}</CTableDataCell>
                <CTableDataCell
                  ><router-link :to="`/cows`" class="text-decoration-none text-dark">{{
                    medication.cow?.ear_tag ?? ''
                  }}</router-link></CTableDataCell
                >
                <CTableDataCell>
                  <!-- Edit Cow Button -->
                  <CButton
                    size="sm"
                    color="info"
                    class="me-2 text-white"
                    title="Edit Medication Record"
                    @click="openEdit(medication)"
                  >
                    <CIcon :icon="cilPencil" />
                  </CButton>

                  <!-- Delete Cow Button -->
                  <CButton
                    size="sm"
                    color="danger"
                    class="text-white"
                    title="Delete Medication Record"
                    @click="confirmDelete(medication.id)"
                  >
                    <CIcon :icon="cilTrash" />
                  </CButton>
                </CTableDataCell>
              </CTableRow>
              <CTableRow v-if="paginatedMedications.length === 0">
                <CTableDataCell colspan="8" class="text-center">
                  No medication record found.
                </CTableDataCell>
              </CTableRow>
            </CTableBody>
          </CTable>

          <!-- pagination controls -->
          <div class="text-end mb-3">
            <strong>Total Records:</strong> {{ filteredMedications.length }}
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
  <CModal :visible="showModal" @close="showModal = false" backdrop="static" size="lg">
    <CModalHeader>
      <CModalTitle>{{
        isEditing ? 'Edit Cow Medication Record' : 'Add Cow Medication Record'
      }}</CModalTitle>
    </CModalHeader>
    <CModalBody>
      <CForm
        class="row g-3 needs-validation"
        novalidate
        :validated="validated"
        @submit="handleSubmit"
      >
        <CCol :md="6">
          <CFormLabel for="medication">Medication</CFormLabel>
          <CFormInput id="medication" v-model="currentMedication.medication" required />
          <CFormFeedback invalid>Medication is required.</CFormFeedback>
        </CCol>

        <CCol :md="6">
          <CFormLabel for="reason">reason</CFormLabel>
          <CFormInput id="reason" v-model="currentMedication.reason" required />
          <CFormFeedback invalid>reason is required.</CFormFeedback>
        </CCol>

        <CCol :md="6">
          <CFormLabel for="cow">cow</CFormLabel>
          <Multiselect
            id="cow"
            v-model="currentMedication.cow_id"
            :options="[
              { label: 'Select cow', value: '' },
              ...cowStore.cows.map((cow) => ({
                label: cow.ear_tag,
                value: cow.id,
              })),
            ]"
            label="label"
            track-by="value"
            placeholder="Select Cow"
            :searchable="true"
            :allowEmpty="true"
            required
          />
          <CFormFeedback invalid v-if="!currentMedication.cow_id">Cow is required.</CFormFeedback>
        </CCol>

        <CCol :md="6">
          <CFormLabel for="dateOfMedication">Date of Medication</CFormLabel>
          <CFormInput
            id="dateOfMedication"
            type="date"
            v-model="currentMedication.medication_date"
            required
          />
          <CFormFeedback invalid>Date of Medication is required.</CFormFeedback>
        </CCol>

        <CCol :xs="12" class="d-flex justify-content-end">
          <CButton color="secondary" class="me-2" @click="showModal = false">Cancel</CButton>
          <CButton color="success" type="submit">{{ isEditing ? 'Update' : 'Create' }}</CButton>
        </CCol>
      </CForm>
    </CModalBody>
  </CModal>
</template>
