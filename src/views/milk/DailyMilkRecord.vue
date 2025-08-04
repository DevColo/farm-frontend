<script setup>
import { ref, computed, onMounted, watch } from 'vue'
//import { useCowStore } from '@/stores/cow.store'
import { useMilkStore } from '@/stores/milk.store'
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
import { cilPencil, cilTrash, cilUser } from '@coreui/icons'

//const cowStore = useCowStore()
const milkStore = useMilkStore()

const showModal = ref(false)
const isEditing = ref(false)
const validated = ref(false)
const filterDate = ref('')

const currentMilkRecord = ref({
  id: null,
  morning_qty: '',
  evening_qty: '',
  record_date: '',
  // cow_id: '',
})

// fetch data
onMounted(() => {
  // cowStore.fetchCows()
  milkStore.fetchMilkRecords()
})

// search & pagination
const searchQuery = ref('')
const itemsPerPage = ref(10)
const currentPage = ref(1)

// const filteredMilkRecords = computed(() => {
//   const q = searchQuery.value.trim().toLowerCase()
//   if (!q) return milkStore.milkRecords
//   return milkStore.milkRecords.filter((c) =>
//     [c.record_date, c.morning_qty, c.evening_qty].some((f) => f?.toLowerCase().includes(q)),
//   )
// })

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredMilkRecords.value.length / itemsPerPage.value)),
)
const paginatedMilkRecords = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredMilkRecords.value.slice(start, start + itemsPerPage.value)
})

// Fix for the prop type warning
watch(
  () => currentMilkRecord.value.cow_id,
  (newValue) => {
    if (typeof newValue === 'number') {
      currentMilkRecord.value.cow_id = String(newValue)
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
  currentMilkRecord.value = {
    id: null,
    morning_qty: '',
    evening_qty: '',
    record_date: '',
    // cow_id: '',
  }
  showModal.value = true
}

function openEdit(milkRecord) {
  isEditing.value = true
  validated.value = false
  currentMilkRecord.value = { ...milkRecord }
  showModal.value = true
}

function confirmDelete(id) {
  if (confirm('Are you sure you want to delete this milk record ?')) {
    milkStore.deleteMilkRecord(id)
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
  const today = new Date()
  const payload = {
    // cow_id: currentMilkRecord.value.cow_id,
    morning_qty: currentMilkRecord.value.morning_qty,
    evening_qty: currentMilkRecord.value.evening_qty,
    record_date: currentMilkRecord.value.record_date ?? today,
    //record_date: today,
  }
  if (isEditing.value) {
    await milkStore.editMilkRecord(currentMilkRecord.value.id, payload)
  } else {
    await milkStore.createMilkRecord(payload)
  }
  showModal.value = false
  milkStore.fetchMilkRecords()
}

// Export in PDF
async function exportPDF() {
  const { default: jsPDF } = await import('jspdf')
  const autoTable = (await import('jspdf-autotable')).default

  const doc = new jsPDF()
  autoTable(doc, {
    head: [
      [
        'RECORDED DATE',
        // 'COW NAME',
        // 'EAR TAG',
        'MORNING QTY (L)',
        'EVENING QTY (L)',
        'TOTAL QTY (L)',
      ],
    ],
    body: filteredMilkRecords.value.map((milk) => {
      return [
        milk.record_date,
        // milk.cow.name,
        // milk.cow.ear_tag,
        milk.morning_qty,
        milk.evening_qty,
        (milk.morning_qty ?? 0) + (milk.evening_qty ?? 0),
      ]
    }),
  })
  doc.save('milk-record.pdf')
}

// Export in CSV
function exportCSV() {
  const rows = [
    [
      'RECORDED DATE',
      // 'COW NAME', 'EAR TAG',
      'MORNING QTY (L)',
      'EVENING QTY (L)',
      'TOTAL QTY (L)',
    ],
    ...filteredMilkRecords.value.map((milk) => {
      return [
        milk.record_date,
        // milk.cow.name,
        // milk.cow.ear_tag,
        milk.morning_qty,
        milk.evening_qty,
        (milk.morning_qty ?? 0) + (milk.evening_qty ?? 0),
      ]
    }),
  ]

  const csvContent = rows
    .map((row) => row.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(','))
    .join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', 'milk-record.csv')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Calculate Revenue
const getTotalQuantity = (morning_qty = 0, evening_qty = 0) => {
  return BigInt(morning_qty) + BigInt(evening_qty)
}

// Calculate Revenue
const getRevenue = (morning_qty = 0, evening_qty = 0) => {
  var total = BigInt(morning_qty) + BigInt(evening_qty)
  return total * BigInt(1000)
}

// Extend your computed filter
const filteredMilkRecords = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  const date = filterDate.value

  return milkStore.milkRecords.filter((record) => {
    const matchSearch =
      !q ||
      [record.record_date, record.morning_qty, record.evening_qty].some((f) =>
        f?.toString().toLowerCase().includes(q),
      )

    const matchDate = !date || record.record_date === date

    return matchSearch && matchDate
  })
})
</script>

<template>
  <CRow>
    <CCol :xs="12">
      <CCard class="mb-4">
        <CCardHeader class="d-flex justify-content-between align-items-center">
          <strong>Daily Milk Record</strong>
          <div class="d-flex gap-2 mb-3">
            <CButton color="dark" variant="outline" title="Export CSV" @click="exportCSV"
              ><CIcon icon="cil-file"
            /></CButton>
            <CButton color="dark" variant="outline" class="sm" title="Export PDF" @click="exportPDF"
              ><CIcon icon="cil-cloud-download"
            /></CButton>
            <CButton color="dark" @click="openCreate">+ Add Milk Record</CButton>
          </div>
        </CCardHeader>
        <CCardBody>
          <!-- search + page-size -->

          <div class="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3">
            <!-- Search -->
            <div class="d-flex align-items-center" style="gap: 8px">
              <input
                type="text"
                v-model="searchQuery"
                class="form-control"
                style="max-width: 220px"
                placeholder="Search by date, quantity"
                @input="resetPage"
              />

              <!-- Date Filter -->
              <input
                type="date"
                v-model="filterDate"
                class="form-control"
                @change="resetPage"
                style="max-width: 180px"
              />
            </div>

            <!-- Items Per Page -->
            <div class="d-flex align-items-center ms-auto" style="gap: 8px">
              <label class="mb-0">Show:</label>
              <select v-model="itemsPerPage" @change="resetPage" class="form-select w-auto">
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
                <CTableHeaderCell>Record Date</CTableHeaderCell>
                <CTableHeaderCell>Morning Qty (L)</CTableHeaderCell>
                <CTableHeaderCell>Evening Qty (L)</CTableHeaderCell>
                <CTableHeaderCell>Total Qty (L)</CTableHeaderCell>
                <CTableHeaderCell>Action</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              <CTableRow v-for="milk in paginatedMilkRecords" :key="milk.id">
                <CTableDataCell>{{ milk.record_date }}</CTableDataCell>
                <CTableDataCell>{{ milk.morning_qty ?? 'NOT RECORDED' }}</CTableDataCell>
                <CTableDataCell>{{ milk.evening_qty ?? 'NOT RECORDED' }}</CTableDataCell>
                <CTableDataCell>{{
                  getTotalQuantity(milk.morning_qty, milk.evening_qty)
                }}</CTableDataCell>
                <!-- <CTableDataCell>{{
                  getRevenue(milk.morning_qty, milk.evening_qty)
                }}</CTableDataCell> -->
                <CTableDataCell>
                  <!-- Edit Cow Button -->
                  <CButton
                    size="sm"
                    color="info"
                    class="me-2 text-white"
                    title="Edit Daily Milk Record"
                    @click="openEdit(milk)"
                  >
                    <CIcon :icon="cilPencil" />
                  </CButton>

                  <!-- Delete Cow Button -->
                  <CButton
                    size="sm"
                    color="danger"
                    class="text-white"
                    title="Delete Daily Milk Record"
                    @click="confirmDelete(milk.id)"
                  >
                    <CIcon :icon="cilTrash" />
                  </CButton>
                </CTableDataCell>
              </CTableRow>
              <CTableRow v-if="paginatedMilkRecords.length === 0">
                <CTableDataCell colspan="8" class="text-center">
                  No Dail Milk Record Found.
                </CTableDataCell>
              </CTableRow>
            </CTableBody>
          </CTable>

          <!-- pagination controls -->
          <div class="text-end mb-3">
            <strong>Total Records:</strong> {{ filteredMilkRecords.length }}
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
      <CModalTitle>{{
        isEditing ? 'Edit Daily Milk Record' : 'Add Daily Milk Record'
      }}</CModalTitle>
    </CModalHeader>
    <CModalBody>
      <CForm
        class="row g-3 needs-validation"
        novalidate
        :validated="validated"
        @submit="handleSubmit"
      >
        <!-- <CCol :md="6">
          <CFormLabel for="cow">Cow</CFormLabel>
          <CFormSelect
            id="cow"
            v-model="currentMilkRecord.cow_id"
            :options="[
              { label: 'Select Cow', value: '' },
              ...cowStore.cows.map((cow) => ({
                label: cow.name ? cow.name + '-' + cow.ear_tag : cow.ear_tag,
                value: cow.id,
              })),
            ]"
            required
          />
          <CFormFeedback invalid>Cow is required.</CFormFeedback>
        </CCol> -->

        <CCol :md="12">
          <CFormLabel for="record_date">Record Date</CFormLabel>
          <CFormInput id="record_date" type="date" v-model="currentMilkRecord.record_date" />
        </CCol>

        <CCol :md="12">
          <CFormLabel for="type">Morning Quantity (L)</CFormLabel>
          <CFormInput
            id="morning_qty"
            type="number"
            v-model.number="currentMilkRecord.morning_qty"
            min="0"
            step="0.1"
            class="mb-3"
          />
          <CFormFeedback invalid>Morning Quantity is required.</CFormFeedback>
        </CCol>

        <CCol :md="12">
          <CFormLabel for="type">Evening Quantity (L)</CFormLabel>
          <CFormInput
            id="evening_qty"
            type="number"
            v-model.number="currentMilkRecord.evening_qty"
            min="0"
            step="0.1"
            class="mb-3"
          />
          <CFormFeedback invalid>Evening Quantity is required.</CFormFeedback>
        </CCol>

        <CCol :xs="12" class="d-flex justify-content-end">
          <CButton color="secondary" class="me-2" @click="showModal = false">Cancel</CButton>
          <CButton color="success" type="submit">{{ isEditing ? 'Update' : 'Add Record' }}</CButton>
        </CCol>
      </CForm>
    </CModalBody>
  </CModal>
</template>
