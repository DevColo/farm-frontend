<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useCowStore } from '@/stores/cow.store'
import { usePastureStore } from '@/stores/pasture.store'
import { useFeedingStore } from '@/stores/feeding.store'
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
import { cilHealing, cilPencil, cilTrash, cilUser } from '@coreui/icons'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import defaultCowImage from '@/assets/images/default-cow.jpg'

const cowStore = useCowStore()
const pastureStore = usePastureStore()
const feedingStore = useFeedingStore()

const showModal = ref(false)
const isEditing = ref(false)
const validated = ref(false)

const currentFeeding = ref({
  id: null,
  food: '',
  quantity: '',
  fed_date: '',
  cow_id: '',
})

const herdFromOutside = computed(() => currentFeeding.value.herd === 'from_outside')

// fetch data
onMounted(() => {
  feedingStore.fetchFeedings()
  cowStore.fetchCows()
  pastureStore.fetchPastures()
})

// search & pagination
const searchQuery = ref('')
const itemsPerPage = ref(10)
const currentPage = ref(1)

const filteredFeedings = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return feedingStore.feedings
  return feedingStore.feedings.filter((c) =>
    [c.name, c.ear_tag, c.breed].some((f) => f?.toLowerCase().includes(q)),
  )
})

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredFeedings.value.length / itemsPerPage.value)),
)
const paginatedFeedings = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredFeedings.value.slice(start, start + itemsPerPage.value)
})

// Fix for the prop type warning
watch(
  () => currentFeeding.value.pasture_id,
  (newValue) => {
    if (typeof newValue === 'number') {
      currentFeeding.value.pasture_id = String(newValue)
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
  currentFeeding.value = {
    id: null,
    food: '',
    quantity: '',
    fed_date: '',
    cow_id: '',
  }
  showModal.value = true
}

function openEdit(cow) {
  isEditing.value = true
  validated.value = false
  currentFeeding.value = { ...cow }
  showModal.value = true
}

function confirmDelete(id) {
  if (confirm('Are you sure you want to delete this feeding record?')) {
    feedingStore.deleteFeeding(id)
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
    food: currentFeeding.value.food,
    cow_id: currentFeeding.value.cow_id,
    fed_date: currentFeeding.value.fed_date,
    quantity: currentFeeding.value.quantity,
  }
  if (isEditing.value) {
    await feedingStore.editFeeding(currentFeeding.value.id, payload)
  } else {
    await feedingStore.createFeeding(payload)
  }
  showModal.value = false
  //resetPage()
}

// Get Cow Age and Class
function calculateAgeAndClass(dateStr, cow) {
  if (!dateStr) return { age: '—', ageClass: '—' }

  const dob = new Date(dateStr)
  const now = new Date()
  let months = (now.getFullYear() - dob.getFullYear()) * 12 + (now.getMonth() - dob.getMonth())

  if (now.getDate() < dob.getDate()) months--

  const years = Math.floor(months / 12)
  const remainingMonths = months % 12

  let ageString = ''
  if (years > 0) ageString += `${years} year${years > 1 ? 's' : ''}`
  if (remainingMonths > 0) {
    if (ageString) ageString += ' '
    ageString += `${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`
  }
  if (!ageString) ageString = 'Less than 1 month'

  const ageClass =
    months >= 1 && months <= 11
      ? 'Calf'
      : months >= 12 && months < 23
      ? 'Yearling'
      : cow.given_birth == '1'
      ? 'Heifer'
      : 'Adult'

  return { age: ageString, ageClass }
}

// Export in PDF
async function exportPDF() {
  const { default: jsPDF } = await import('jspdf')
  const autoTable = (await import('jspdf-autotable')).default
  const doc = new jsPDF()
  doc.setFontSize(18)
  doc.text('Cows Feeding Records', 105, 15, { align: 'center' })
  doc.setFontSize(12)
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 25, { align: 'center' })
  autoTable(doc, {
    startY: 35,
    head: [['ID', 'Food', 'Quantity', 'Date of Feeding', 'Cow']],
    body: filteredFeedings.value.map((feeding) => [
      feeding.id,
      feeding.food,
      feeding.quantity,
      feeding.fed_date,
      feeding.cow?.name
        ? `${feeding.cow.name} - ${feeding.cow.ear_tag}`
        : feeding.cow?.ear_tag || '',
    ]),
  })
  doc.save('feedings.pdf')
}

// Export in CSV
function exportCSV() {
  const rows = [
    ['ID', 'Food', 'Quantity', 'Date of Feeding', 'Cow'],
    ...filteredFeedings.value.map((feeding) => [
      feeding.id,
      feeding.food,
      feeding.quantity,
      feeding.fed_date,
      feeding.cow?.name
        ? `${feeding.cow.name} - ${feeding.cow.ear_tag}`
        : feeding.cow?.ear_tag || '',
    ]),
  ]

  const csvContent = rows
    .map((row) => row.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(','))
    .join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', 'feedings.csv')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
// Cow Profile Modal
const activeTab = ref('profile')
const showProfileModal = ref(false)
const selectedCow = ref({})

function openProfile(cow) {
  selectedCow.value = cow
  showProfileModal.value = true
}

// Get Cow Image
function getCowImage(imageUrl) {
  return imageUrl ? `${import.meta.env.VITE_API_BASE_URL}/${imageUrl}` : defaultCowImage
}

// Export Cow Profile as PDF
function exportCowProfile(cow) {
  const doc = new jsPDF()

  const { age, ageClass } = calculateAgeAndClass(cow.fed_date, cow)

  // Load cow image (or fallback) and generate PDF once it's ready
  const imageUrl = cow.image ? `${import.meta.env.VITE_API_BASE_URL}/${cow.image}` : defaultCowImage
  toDataURL(imageUrl, (dataUrl) => {
    // Add image
    doc.addImage(dataUrl, 'JPEG', 15, 10, 40, 40)

    // Title
    doc.setFontSize(16)
    doc.text('Cow Profile', 105, 20, null, null, 'center')

    // Profile table
    autoTable(doc, {
      startY: 55,
      styles: { fontSize: 11 },
      head: [['Field', 'Value']],
      body: [
        ['Name', cow.name],
        ['Ear Tag', cow.ear_tag],
        ['Date of Birth', cow.fed_date],
        ['Age', age],
        ['Class', ageClass],
        ['Type', cow.type],
        ['Breed', cow.breed],
        ['Herd', cow.herd === 'from_outside' ? 'From Outside' : 'From Farm'],
        ['From Location', cow.from_location || '—'],
        ['Pasture', cow.pasture?.pasture || '—'],
        ['Description', cow.description || '—'],
      ],
    })

    doc.save(`Cow_Profile_${cow.name || cow.ear_tag}.pdf`)
  })
}

function toDataURL(url, callback) {
  const img = new Image()
  img.crossOrigin = 'Anonymous'
  img.onload = function () {
    const canvas = document.createElement('canvas')
    canvas.width = this.naturalWidth
    canvas.height = this.naturalHeight

    const ctx = canvas.getContext('2d')
    ctx.drawImage(this, 0, 0)

    const dataURL = canvas.toDataURL('image/jpeg')
    callback(dataURL)
  }
  img.onerror = function () {
    console.warn('Could not load image:', url)
    callback('')
  }
  img.src = url
}

// Remove image
const removeImage = () => {
  currentFeeding.value.image = null
}

const showHealthModal = ref(false)
const activeHealthTab = ref('medication')
const medication = ref({ type: '', reason: '' })
const feeding = ref({ type: '', date: '' })
const maternity = ref({ bullId: '', date: '' })
const bulls = computed(() => feedingStore.cows.filter((cow) => cow.type === 'bull'))

function openHealthModal(cow) {
  selectedCow.value = cow // Ensure selectedCow is set
  showHealthModal.value = true
  activeHealthTab.value = 'medication'
}

// function handleMedicationSubmit() {
//   if (!medication.value.type || !medication.value.reason) {
//     alert('Please fill out all required fields for medication.')
//     return
//   }
//   console.log('Medication saved:', medication.value)
//   medication.value = { type: '', reason: '' }
//   showHealthModal.value = false
// }

// function handleFeedingSubmit() {
//   if (!feeding.value.type || !feeding.value.date) {
//     alert('Please fill out all required fields for feeding.')
//     return
//   }
//   console.log('Feeding saved:', feeding.value)
//   feeding.value = { type: '', date: '' }
//   showHealthModal.value = false
// }

// function handleMaternitySubmit() {
//   if (!maternity.value.bullId || !maternity.value.date) {
//     alert('Please fill out all required fields for maternity.')
//     return
//   }
//   console.log('Maternity saved:', maternity.value)
//   maternity.value = { bullId: '', date: '' }
//   showHealthModal.value = false
// }

const healthRecords = ref({
  medication: [],
  feeding: [],
  maternity: [],
})

function handleMedicationSubmit() {
  if (!medication.value.type || !medication.value.reason) {
    alert('Please fill out all required fields for medication.')
    return
  }
  healthRecords.value.medication.push({ ...medication.value })
  alert('Medication record saved successfully!')
  medication.value = { type: '', reason: '' }
  showHealthModal.value = false
}

function handleFeedingSubmit() {
  if (!feeding.value.type || !feeding.value.date) {
    alert('Please fill out all required fields for feeding.')
    return
  }
  healthRecords.value.feeding.push({ ...feeding.value })
  alert('Feeding record saved successfully!')
  feeding.value = { type: '', date: '' }
  showHealthModal.value = false
}

function handleMaternitySubmit() {
  if (!maternity.value.bullId || !maternity.value.date) {
    alert('Please fill out all required fields for maternity.')
    return
  }
  healthRecords.value.maternity.push({ ...maternity.value })
  alert('Maternity record saved successfully!')
  maternity.value = { bullId: '', date: '' }
  showHealthModal.value = false
}
</script>

<template>
  <CRow>
    <CCol :xs="12">
      <CCard class="mb-4">
        <CCardHeader class="d-flex justify-content-between align-items-center">
          <strong>Cows Feeding List</strong>
          <div class="d-flex gap-2 mb-3">
            <CButton color="dark" variant="outline" title="Export CSV" @click="exportCSV"
              ><CIcon icon="cil-file"
            /></CButton>
            <CButton color="dark" variant="outline" class="sm" title="Export PDF" @click="exportPDF"
              ><CIcon icon="cil-cloud-download"
            /></CButton>
            <CButton color="dark" @click="openCreate">+ Add Feeding Record</CButton>
          </div>
        </CCardHeader>
        <CCardBody>
          <!-- search + page-size -->

          <div class="d-flex justify-content-between align-items-center mb-3">
            <input
              type="text"
              v-model="searchQuery"
              class="form-control w-25"
              placeholder="Search by name, tag or breed..."
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
                <CTableHeaderCell>Food</CTableHeaderCell>
                <CTableHeaderCell>Quantity</CTableHeaderCell>
                <CTableHeaderCell>Date of Feeding</CTableHeaderCell>
                <CTableHeaderCell>Cow</CTableHeaderCell>
                <CTableHeaderCell>Action</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              <CTableRow v-for="feeding in paginatedFeedings" :key="feeding.id">
                <CTableDataCell>{{ feeding.id }}</CTableDataCell>
                <CTableDataCell>{{ feeding.food }}</CTableDataCell>
                <CTableDataCell>{{ feeding.quantity }}</CTableDataCell>
                <CTableDataCell>{{ feeding.fed_date }}</CTableDataCell>
                <CTableDataCell
                  ><router-link
                    :to="`/cow/${feeding.cow?.id}`"
                    class="text-decoration-none text-dark"
                    >{{ feeding.cow?.name ?? '' }} - {{ feeding.cow?.ear_tag ?? '' }}</router-link
                  ></CTableDataCell
                >
                <CTableDataCell>
                  <!-- Edit Cow Button -->
                  <CButton
                    size="sm"
                    color="info"
                    class="me-2 text-white"
                    title="Edit Feeding Record"
                    @click="openEdit(feeding)"
                  >
                    <CIcon :icon="cilPencil" />
                  </CButton>

                  <!-- Delete Cow Button -->
                  <CButton
                    size="sm"
                    color="danger"
                    class="text-white"
                    title="Delete Feeding Record"
                    @click="confirmDelete(feeding.id)"
                  >
                    <CIcon :icon="cilTrash" />
                  </CButton>
                </CTableDataCell>
              </CTableRow>
              <CTableRow v-if="paginatedFeedings.length === 0">
                <CTableDataCell colspan="8" class="text-center">
                  No feeding record found.
                </CTableDataCell>
              </CTableRow>
            </CTableBody>
          </CTable>

          <!-- pagination controls -->
          <div class="text-end mb-3">
            <strong>Total Records:</strong> {{ filteredFeedings.length }}
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

  <!-- Profile Modal -->
  <CModal :visible="showProfileModal" @close="showProfileModal = false" size="lg">
    <CModalHeader
      ><CModalTitle
        >{{ selectedCow.name ? selectedCow.name + ' - ' : '' }}
        {{ selectedCow.ear_tag }}</CModalTitle
      ></CModalHeader
    >
    <CModalBody>
      <CNav variant="tabs">
        <CNavItem
          ><CNavLink :active="activeTab === 'profile'" @click="activeTab = 'profile'"
            >Profile</CNavLink
          ></CNavItem
        >
        <CNavItem
          ><CNavLink :active="activeTab === 'health'" @click="activeTab = 'health'"
            >Health</CNavLink
          ></CNavItem
        >
        <CNavItem
          ><CNavLink :active="activeTab === 'history'" @click="activeTab = 'history'"
            >History</CNavLink
          ></CNavItem
        >
      </CNav>

      <CTabContent class="mt-3">
        <CTabPane :visible="activeTab === 'profile'">
          <div class="text-center mb-3">
            <img
              :src="getCowImage(selectedCow.image)"
              class="img-fluid rounded"
              style="max-height: 200px"
            />
          </div>
          <p><strong>Name:</strong> {{ selectedCow.name ?? '' }}</p>
          <p><strong>Ear Tag:</strong> {{ selectedCow.ear_tag ?? '' }}</p>
          <p><strong>Date of Birth:</strong> {{ selectedCow.fed_date ?? '' }}</p>
          <p><strong>Type:</strong> {{ selectedCow.type ?? '' }}</p>
          <p><strong>Breed:</strong> {{ selectedCow.breed ?? '' }}</p>
          <p>
            <strong>Herd:</strong>
            {{ selectedCow.herd === 'from_farm' ? 'From Farm' : 'From Another Farm' }}
          </p>
          <p v-if="selectedCow.herd != 'from_farm'">
            <strong>Source Location:</strong>
            {{ selectedCow.from_location ?? '' }}
          </p>
          <p><strong>Description:</strong> {{ selectedCow.description ?? '' }}</p>
          <CButton color="dark" @click="exportCowProfile(selectedCow)"
            ><CIcon icon="cil-cloud-download" /> Download</CButton
          >
        </CTabPane>

        <CTabPane :visible="activeTab === 'health'">
          <p>Fed Corn on June 9, 2025</p>
        </CTabPane>

        <CTabPane :visible="activeTab === 'history'">
          <p>Mate with Cow X on June 9, 2025</p>
        </CTabPane>
      </CTabContent>
    </CModalBody>
  </CModal>

  <template>
    <CTabPane :visible="activeTab === 'health'">
      <div v-if="healthRecords.medication.length > 0">
        <h5>Medication Records</h5>
        <ul>
          <li v-for="(record, index) in healthRecords.medication" :key="index">
            Type: {{ record.type }}, Reason: {{ record.reason }}
          </li>
        </ul>
      </div>
      <div v-if="healthRecords.feeding.length > 0">
        <h5>Feeding Records</h5>
        <ul>
          <li v-for="(record, index) in healthRecords.feeding" :key="index">
            Type: {{ record.type }}, Date: {{ record.date }}
          </li>
        </ul>
      </div>
      <div v-if="healthRecords.maternity.length > 0">
        <h5>Maternity Records</h5>
        <ul>
          <li v-for="(record, index) in healthRecords.maternity" :key="index">
            Bull ID: {{ record.bullId }}, Date: {{ record.date }}
          </li>
        </ul>
      </div>
    </CTabPane>
  </template>
  <!-- Health Modal -->
  <CModal :visible="showHealthModal" @close="showHealthModal = false" size="lg" v-if="selectedCow">
    <CModalHeader>
      <CModalTitle
        >{{ selectedCow.name ? selectedCow.name + ' - ' : '' }} {{ selectedCow.ear_tag }} Health &
        Feeding Records</CModalTitle
      >
    </CModalHeader>
    <CModalBody>
      <CNav variant="tabs">
        <CNavItem>
          <CNavLink
            :active="activeHealthTab === 'medication'"
            @click="activeHealthTab = 'medication'"
          >
            Medication
          </CNavLink>
        </CNavItem>
        <CNavItem>
          <CNavLink :active="activeHealthTab === 'feeding'" @click="activeHealthTab = 'feeding'">
            Feeding
          </CNavLink>
        </CNavItem>
        <CNavItem v-if="selectedCow.type === 'cow'">
          <CNavLink
            :active="activeHealthTab === 'maternity'"
            @click="activeHealthTab = 'maternity'"
          >
            Maternity
          </CNavLink>
        </CNavItem>
      </CNav>

      <CTabContent class="mt-3">
        <!-- Medication Tab -->
        <CTabPane :visible="activeHealthTab === 'medication'">
          <CForm @submit.prevent="handleMedicationSubmit">
            <CCol :md="6">
              <CFormLabel for="medicationType">Medication Type</CFormLabel>
              <CFormSelect
                id="medicationType"
                v-model="medication.type"
                :options="[
                  { label: 'Select Type', value: '' },
                  { label: 'Injection', value: 'injection' },
                  { label: 'Oral', value: 'oral' },
                ]"
                required
              />
              <CFormFeedback invalid>Medication type is required.</CFormFeedback>
            </CCol>
            <CCol :md="12">
              <CFormLabel for="medicationReason">Reason</CFormLabel>
              <CFormTextarea id="medicationReason" v-model="medication.reason" rows="3" required />
              <CFormFeedback invalid>Reason is required.</CFormFeedback>
            </CCol>
            <CCol :xs="12" class="d-flex justify-content-end mt-3">
              <CButton color="success" type="submit">Save Medication</CButton>
            </CCol>
          </CForm>
        </CTabPane>

        <!-- Feeding Tab -->
        <CTabPane :visible="activeHealthTab === 'feeding'">
          <CForm @submit.prevent="handleFeedingSubmit">
            <CCol :md="6">
              <CFormLabel for="feedingType">Food Type</CFormLabel>
              <CFormSelect
                id="feedingType"
                v-model="feeding.type"
                :options="[
                  { label: 'Select Food Type', value: '' },
                  { label: 'Grass', value: 'grass' },
                  { label: 'Hay', value: 'hay' },
                  { label: 'Silage', value: 'silage' },
                ]"
                required
              />
              <CFormFeedback invalid>Food type is required.</CFormFeedback>
            </CCol>
            <CCol :md="6">
              <CFormLabel for="feedingDate">Date Fed</CFormLabel>
              <CFormInput id="feedingDate" type="date" v-model="feeding.date" required />
              <CFormFeedback invalid>Date is required.</CFormFeedback>
            </CCol>
            <CCol :xs="12" class="d-flex justify-content-end mt-3">
              <CButton color="success" type="submit">Save Feeding</CButton>
            </CCol>
          </CForm>
        </CTabPane>

        <!-- Maternity Tab -->
        <CTabPane :visible="activeHealthTab === 'maternity'">
          <CForm @submit.prevent="handleMaternitySubmit">
            <CCol :md="6">
              <CFormLabel for="bull">Bull</CFormLabel>
              <CFormSelect
                id="bull"
                v-model="maternity.bullId"
                :options="bulls.map((bull) => ({ label: bull.name, value: bull.id }))"
                required
              />
              <CFormFeedback invalid>Bull is required.</CFormFeedback>
            </CCol>
            <CCol :md="6">
              <CFormLabel for="matingDate">Date of Mating</CFormLabel>
              <CFormInput id="matingDate" type="date" v-model="maternity.date" required />
              <CFormFeedback invalid>Date is required.</CFormFeedback>
            </CCol>
            <CCol :xs="12" class="d-flex justify-content-end mt-3">
              <CButton color="success" type="submit">Save Maternity</CButton>
            </CCol>
          </CForm>
        </CTabPane>
      </CTabContent>
    </CModalBody>
  </CModal>

  <!-- Create/Edit Modal -->
  <CModal :visible="showModal" @close="showModal = false" backdrop="static" size="lg">
    <CModalHeader>
      <CModalTitle>{{
        isEditing ? 'Edit Cow Feeding Record' : 'Add Cow Feeding Record'
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
          <CFormLabel for="food">Food</CFormLabel>
          <CFormSelect
            id="food"
            v-model="currentFeeding.food"
            :options="[
              { label: 'Select Food', value: '' },
              { label: 'Corn', value: 'Corn' },
              { label: 'Grass', value: 'Grass' },
              { label: 'Grains', value: 'Grains' },
              { label: 'Barley', value: 'Barley' },
              { label: 'Silage', value: 'Silage' },
              { label: 'Carrots', value: 'Carrots' },
              { label: 'Concentrates', value: 'Concentrates' },
              { label: 'Supplements', value: 'Supplements' },
              { label: 'Potatoes', value: 'Potatoes' },
              { label: 'Bananas', value: 'Bananas' },
              { label: 'Pumpkins', value: 'Pumpkins' },
            ]"
            required
          />
          <CFormFeedback invalid>Food is required.</CFormFeedback>
        </CCol>

        <CCol :md="6">
          <CFormLabel for="quantity">Quantity</CFormLabel>
          <CFormInput id="quantity" v-model="currentFeeding.quantity" required />
          <CFormFeedback invalid>Quantity is required.</CFormFeedback>
        </CCol>

        <CCol :md="6">
          <CFormLabel for="cow">Cow</CFormLabel>
          <CFormSelect
            id="cow"
            v-model="currentFeeding.cow_id"
            :options="[
              { label: 'Select cow', value: '' },
              ...cowStore.cows.map((cow) => ({
                label: cow.name ? cow.name + ' - ' + cow.ear_tag : cow.ear_tag,
                value: cow.id,
              })),
            ]"
            required
          />
          <CFormFeedback invalid>Select cow.</CFormFeedback>
        </CCol>

        <CCol :md="6">
          <CFormLabel for="dateOfFeeding">Date of Feeding</CFormLabel>
          <CFormInput id="dateOfFeeding" type="date" v-model="currentFeeding.fed_date" required />
          <CFormFeedback invalid>Date of Feeding is required.</CFormFeedback>
        </CCol>

        <CCol :xs="12" class="d-flex justify-content-end">
          <CButton color="secondary" class="me-2" @click="showModal = false">Cancel</CButton>
          <CButton color="success" type="submit">{{ isEditing ? 'Update' : 'Create' }}</CButton>
        </CCol>
      </CForm>
    </CModalBody>
  </CModal>
</template>
