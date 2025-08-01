<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useCowStore } from '@/stores/cow.store'
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
  CFormFeedback,
} from '@coreui/vue'
import { cilPencil, cilTrash, cilUser } from '@coreui/icons'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import defaultCowImage from '@/assets/images/default-cow.jpg'
import Multiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.css'

const cowStore = useCowStore()
const pastureStore = usePastureStore()

const showModal = ref(false)
const isEditing = ref(false)
const validated = ref(false)

const currentCow = ref({
  id: null,
  name: '',
  ear_tag: '',
  date_of_birth: '',
  type: '',
  male_type: '',
  given_birth: '',
  breed: '',
  herd: '',
  mother_ear_tag: '',
  father_ear_tag: '',
  from_location: '',
  description: '',
  pasture_id: '',
  status: true,
  image: null,
})

const herdFromOutside = computed(() => currentCow.value.herd === 'from_outside')

// fetch data
onMounted(() => {
  cowStore.fetchCows()
  pastureStore.fetchPastures()
})

// search & pagination
const searchQuery = ref('')
const filterYear = ref('')
const itemsPerPage = ref(10)
const currentPage = ref(1)

// Generate available years dynamically based on cow data
const availableYears = computed(() => {
  const years = cowStore.cows.map((cow) => new Date(cow.date_of_birth).getFullYear())
  return Array.from(new Set(years)).sort((a, b) => b - a) // Sort years in descending order
})

const filteredCows = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  const year = filterYear.value
  return cowStore.cows.filter((c) => {
    const matchesQuery =
      !q || [c.name, c.ear_tag, c.breed].some((f) => f?.toLowerCase().includes(q))
    const matchesYear = !year || new Date(c.date_of_birth).getFullYear() === parseInt(year)
    return matchesQuery && matchesYear
  })
})

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredCows.value.length / itemsPerPage.value)),
)
const paginatedCows = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredCows.value.slice(start, start + itemsPerPage.value)
})

// Fix for the prop type warning
watch(
  () => currentCow.value.pasture_id,
  (newValue) => {
    if (typeof newValue === 'number') {
      currentCow.value.pasture_id = String(newValue)
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
  currentCow.value = {
    id: null,
    name: '',
    ear_tag: '',
    date_of_birth: '',
    type: '',
    male_type: '',
    given_birth: '',
    breed: '',
    herd: '',
    mother_ear_tag: '',
    father_ear_tag: '',
    from_location: '',
    description: '',
    pasture_id: '',
    status: true,
    image: null,
  }
  showModal.value = true
}

function openEdit(cow) {
  isEditing.value = true
  validated.value = false
  currentCow.value = { ...cow, status: cow.status === '1' }
  showModal.value = true
}

function confirmDelete(id) {
  if (confirm('Are you sure you want to delete this cow?')) {
    cowStore.deleteCow(id)
  }
}

// sync boolean checkbox with string status
const isActive = computed({
  get: () => currentCow.value.status === '1' || currentCow.value.status === true,
  set: (v) => {
    currentCow.value.status = v ? '1' : '0'
  },
})

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
    name: currentCow.value.name,
    ear_tag: currentCow.value.ear_tag,
    date_of_birth: currentCow.value.date_of_birth,
    type: currentCow.value.type,
    male_type: currentCow.value.male_type,
    given_birth: currentCow.value.given_birth,
    breed: currentCow.value.breed,
    herd: currentCow.value.herd,
    mother_ear_tag: currentCow.value.mother_ear_tag,
    father_ear_tag: currentCow.value.father_ear_tag,
    from_location: currentCow.value.herd === 'from_outside' ? currentCow.value.from_location : '',
    description: currentCow.value.description,
    pasture_id: currentCow.value.pasture_id,
    status: currentCow.value.status ? '1' : '0',
    image: currentCow.value.image,
  }
  if (isEditing.value) {
    await cowStore.editCow(currentCow.value.id, payload)
  } else {
    await cowStore.createCow(payload)
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

  // Add header
  doc.setFontSize(18)
  doc.text('Jakaja', 105, 15, { align: 'center' })
  doc.text('Cow List', 105, 22, { align: 'center' })

  // Add logo
  const logoUrl = new URL('@/assets/images/logo.png', import.meta.url).href
  const logoWidth = 30
  const logoHeight = 30
  const logoX = 10
  const logoY = 15

  const logoImage = new Image()
  logoImage.src = logoUrl
  logoImage.onload = () => {
    doc.addImage(logoImage, 'PNG', logoX, logoY, logoWidth, logoHeight)
  }
  autoTable(doc, {
    startY: 30,
    head: [
      [
        'Sno',
        'Name',
        'Tag',
        'Gender',
        'Type',
        'Breed',
        'Source',
        'Mother',
        'Father',
        'Age',
        'Class',
      ],
    ],
    body: filteredCows.value.map((cow, index) => {
      const { age, ageClass } = calculateAgeAndClass(cow.date_of_birth, cow)
      return [
        index + 1,
        cow.name,
        cow.ear_tag,
        cow.type,
        cow.type == 'Male' ? cow.male_type : '',
        cow.breed,
        cow.from_location,
        cow.mother_ear_tag,
        cow.father_ear_tag,
        age,
        ageClass,
      ]
    }),
  })
  doc.save('cows.pdf')
}

// Export in CSV
function exportCSV() {
  const rows = [
    ['ID', 'Name', 'Ear Tag', 'DOB', 'Breed', 'Age', 'Class'],
    ...filteredCows.value.map((cow) => {
      const { age, ageClass } = calculateAgeAndClass(cow.date_of_birth, cow)
      return [cow.id, cow.name, cow.ear_tag, cow.date_of_birth, cow.breed, age, ageClass]
    }),
  ]

  const csvContent = rows
    .map((row) => row.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(','))
    .join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', 'cows.csv')
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

  const { age, ageClass } = calculateAgeAndClass(cow.date_of_birth, cow)

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
        ['Date of Birth', cow.date_of_birth],
        ['Age', age],
        ['Class', ageClass],
        ['Type', cow.type],
        ['Breed', cow.breed],
        ['Herd', cow.herd === 'from_outside' ? 'From Outside' : 'From Farm'],
        ['From Location', cow.from_location || '—'],
        ['Pasture', cow.pasture?.pasture || '—'],
        ['Status', cow.status === '1' ? 'Active' : 'Inactive'],
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
  currentCow.value.image = null
}

const healthRecords = ref({
  medication: [],
  feeding: [],
  maternity: [],
})
</script>

<template>
  <CRow>
    <CCol :xs="12">
      <CCard class="mb-4">
        <CCardHeader class="d-flex justify-content-between align-items-center">
          <strong>Cow List</strong>
          <div class="d-flex gap-2 mb-3">
            <CButton color="dark" variant="outline" title="Export CSV" @click="exportCSV"
              ><CIcon icon="cil-file"
            /></CButton>
            <CButton color="dark" variant="outline" class="sm" title="Export PDF" @click="exportPDF"
              ><CIcon icon="cil-cloud-download"
            /></CButton>
            <CButton color="dark" @click="openCreate">+ Create Cow</CButton>
          </div>
        </CCardHeader>
        <CCardBody>
          <!-- search + page-size -->
          <div class="d-flex justify-content-start align-items-center flex-wrap mb-3">
            <!-- Search Input -->
            <div class="d-flex align-items-center me-2" style="min-width: 250px">
              <input
                type="text"
                v-model="searchQuery"
                class="form-control"
                style="max-width: 250px"
                placeholder="Search by name, tag or breed..."
                @input="resetPage"
              />
            </div>

            <!-- Filter by Year -->
            <div class="d-flex align-items-center me-5">
              <label class="me-2 mb-0">Filter by Year:</label>
              <select v-model="filterYear" @change="resetPage" class="form-select w-auto">
                <option value="">All</option>
                <option v-for="year in availableYears" :key="year" :value="year">
                  {{ year }}
                </option>
              </select>
            </div>

            <!-- Items per Page -->
            <div
              class="d-flex align-items-center"
              style="float: right; right: 18px; position: absolute"
            >
              <label class="me-2 mb-0">Show:</label>
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
                <CTableHeaderCell>Name</CTableHeaderCell>
                <CTableHeaderCell>Ear Tag</CTableHeaderCell>
                <CTableHeaderCell>DOB</CTableHeaderCell>
                <CTableHeaderCell>Age</CTableHeaderCell>
                <CTableHeaderCell>Gender</CTableHeaderCell>
                <CTableHeaderCell>Class</CTableHeaderCell>
                <CTableHeaderCell>Breed</CTableHeaderCell>
                <CTableHeaderCell>Pasture</CTableHeaderCell>
                <!-- <CTableHeaderCell>Status</CTableHeaderCell> -->
                <CTableHeaderCell>Action</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              <CTableRow v-for="cow in paginatedCows" :key="cow.id">
                <CTableDataCell>{{ cow.name }}</CTableDataCell>
                <CTableDataCell>{{ cow.ear_tag }}</CTableDataCell>
                <CTableDataCell>{{ cow.date_of_birth }}</CTableDataCell>
                <CTableDataCell>{{
                  calculateAgeAndClass(cow.date_of_birth, cow).age
                }}</CTableDataCell>
                <CTableDataCell
                  ><router-link
                    :to="`/gender/cow/${cow.type}`"
                    class="text-decoration-none text-dark"
                    >{{ cow.type }}
                    {{ cow.male_type != null ? ' - ' + cow.male_type : '' }}</router-link
                  ></CTableDataCell
                >
                <CTableDataCell
                  ><router-link
                    :to="`/class/cow/${calculateAgeAndClass(cow.date_of_birth, cow).ageClass}`"
                    class="text-decoration-none text-dark"
                    >{{ calculateAgeAndClass(cow.date_of_birth, cow).ageClass }}</router-link
                  ></CTableDataCell
                >
                <CTableDataCell
                  ><router-link
                    :to="`/breed/cow/${cow.breed}`"
                    class="text-decoration-none text-dark"
                    >{{ cow.breed || '—' }}</router-link
                  ></CTableDataCell
                >
                <CTableDataCell
                  ><router-link
                    :to="`/pasture/cow/${cow.pasture?.id}`"
                    class="text-decoration-none text-dark"
                    >{{ cow.pasture?.pasture || '—' }}</router-link
                  ></CTableDataCell
                >
                <!-- <CTableDataCell>
                  <span :class="['badge', cow.status === '1' ? 'bg-success' : 'bg-danger']">
                    {{ cow.status === '1' ? 'Active' : 'Inactive' }}
                  </span>
                </CTableDataCell> -->
                <CTableDataCell>
                  <!-- View Profile Button -->
                  <CButton
                    size="sm"
                    color="secondary"
                    class="me-2 text-white"
                    title="View Profile"
                    @click="openProfile(cow)"
                  >
                    <CIcon :icon="cilUser" />
                  </CButton>

                  <!-- Edit Cow Button -->
                  <CButton
                    size="sm"
                    color="info"
                    class="me-2 text-white"
                    title="Edit Cow"
                    @click="openEdit(cow)"
                  >
                    <CIcon :icon="cilPencil" />
                  </CButton>

                  <!-- Delete Cow Button -->
                  <CButton
                    size="sm"
                    color="danger"
                    class="text-white"
                    title="Delete Cow"
                    @click="confirmDelete(cow.id)"
                  >
                    <CIcon :icon="cilTrash" />
                  </CButton>
                </CTableDataCell>
              </CTableRow>
              <CTableRow v-if="paginatedCows.length === 0">
                <CTableDataCell colspan="8" class="text-center"> No cows found. </CTableDataCell>
              </CTableRow>
            </CTableBody>
          </CTable>

          <!-- pagination controls -->
          <div class="text-end mb-3"><strong>Total Records:</strong> {{ filteredCows.length }}</div>
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
          ><CNavLink :active="activeTab === 'feeding'" @click="activeTab = 'feeding'"
            >Feeding History</CNavLink
          ></CNavItem
        >
        <CNavItem
          ><CNavLink :active="activeTab === 'health'" @click="activeTab = 'health'"
            >Medication</CNavLink
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
          <div class="row">
            <div class="col-md-6">
              <p><strong>Name:</strong> {{ selectedCow.name ?? '' }}</p>
              <p><strong>Ear Tag:</strong> {{ selectedCow.ear_tag ?? '' }}</p>
              <p><strong>Date of Birth:</strong> {{ selectedCow.date_of_birth ?? '' }}</p>
              <p><strong>Gender:</strong> {{ selectedCow.type ?? '' }}</p>
              <p><strong>Breed:</strong> {{ selectedCow.breed ?? '' }}</p>
              <p>
                <strong>Herd:</strong>
                {{ selectedCow.herd === 'from_farm' ? 'From Farm' : 'From Another Farm' }}
              </p>
              <p v-if="selectedCow.herd != 'from_farm'">
                <strong>Source Location:</strong>
                {{ selectedCow.from_location ?? '' }}
              </p>
              <p v-if="selectedCow.type != 'Male'">
                <strong>Type:</strong>
                {{ selectedCow.male_type ?? '' }}
              </p>
              <p v-if="selectedCow.type != 'Male'">
                <strong>Given Birth:</strong> {{ selectedCow.given_birth === '1' ? 'Yes' : 'No' }}
              </p>
            </div>
            <div class="col-md-6">
              <p>
                <strong>Class:</strong>
                {{ calculateAgeAndClass(selectedCow.date_of_birth, selectedCow).ageClass }}
              </p>
              <p><strong>Mother Ear Tag:</strong> {{ selectedCow.mother_ear_tag ?? '' }}</p>
              <p><strong>Father Ear Tag:</strong> {{ selectedCow.father_ear_tag ?? '' }}</p>
              <p><strong>Pasture:</strong> {{ selectedCow.pasture?.pasture ?? '—' }}</p>
              <p v-if="selectedCow.pasture?.country">
                <strong>Pasture Country:</strong> {{ selectedCow.pasture.country }}
              </p>
              <p><strong>Description:</strong> {{ selectedCow.description ?? '' }}</p>
              <p>
                <strong>Status:</strong> {{ selectedCow.status === '1' ? 'Active' : 'Inactive' }}
              </p>
            </div>
          </div>
          <CButton color="dark" @click="exportCowProfile(selectedCow)"
            ><CIcon icon="cil-cloud-download" /> Download</CButton
          >
        </CTabPane>

        <CTabPane :visible="activeTab === 'feeding'">
          <div>
            <CTable striped hover responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>ID</CTableHeaderCell>
                  <CTableHeaderCell>Food</CTableHeaderCell>
                  <CTableHeaderCell>Quantity</CTableHeaderCell>
                  <CTableHeaderCell>Fed Date</CTableHeaderCell>
                  <CTableHeaderCell>Pasture</CTableHeaderCell>
                  <!-- <CTableHeaderCell>Created At</CTableHeaderCell> -->
                </CTableRow>
              </CTableHead>
              <CTableBody>
                <CTableRow v-for="record in selectedCow.feedings" :key="record.id">
                  <CTableDataCell>{{ record.id }}</CTableDataCell>
                  <CTableDataCell>{{ record.food }}</CTableDataCell>
                  <CTableDataCell>{{ record.quantity }}</CTableDataCell>
                  <CTableDataCell>{{ record.fed_date }}</CTableDataCell>
                  <CTableDataCell>{{ selectedCow.pasture.pasture }}</CTableDataCell>
                  <!-- <CTableDataCell>{{ new Date(record.createdAt).toLocaleString() }}</CTableDataCell> -->
                </CTableRow>
                <CTableRow v-if="selectedCow.feedings.length === 0">
                  <CTableDataCell colspan="6" class="text-center"
                    >No feeding records found.</CTableDataCell
                  >
                </CTableRow>
              </CTableBody>
            </CTable>
          </div>
        </CTabPane>

        <CTabPane :visible="activeTab === 'health'">
          <div>
            <CTable striped hover responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Medication</CTableHeaderCell>
                  <CTableHeaderCell>Reason</CTableHeaderCell>
                  <CTableHeaderCell>Date</CTableHeaderCell>
                  <!-- <CTableHeaderCell>Created At</CTableHeaderCell> -->
                </CTableRow>
              </CTableHead>
              <CTableBody>
                <CTableRow v-for="record in selectedCow.medications" :key="record.id">
                  <CTableDataCell>{{ record.medication }}</CTableDataCell>
                  <CTableDataCell>{{ record.reason }}</CTableDataCell>
                  <CTableDataCell>{{ record.medication_date }}</CTableDataCell>
                  <!-- <CTableDataCell>{{ new Date(record.createdAt).toLocaleString() }}</CTableDataCell> -->
                </CTableRow>
                <CTableRow v-if="selectedCow.medications.length === 0">
                  <CTableDataCell colspan="6" class="text-center"
                    >No medication records found.</CTableDataCell
                  >
                </CTableRow>
              </CTableBody>
            </CTable>
          </div>
        </CTabPane>
      </CTabContent>
    </CModalBody>
  </CModal>

  <!-- Create/Edit Modal -->
  <CModal :visible="showModal" @close="showModal = false" backdrop="static" size="lg">
    <CModalHeader>
      <CModalTitle>{{ isEditing ? 'Edit Cow' : 'Add Cow' }}</CModalTitle>
    </CModalHeader>
    <CModalBody>
      <CForm
        class="row g-3 needs-validation"
        enctype="multipart/form-data"
        novalidate
        :validated="validated"
        @submit="handleSubmit"
      >
        <CCol :md="6">
          <CFormLabel for="name">Cow Name</CFormLabel>
          <CFormInput id="name" v-model="currentCow.name" required />
          <CFormFeedback invalid>Name is required.</CFormFeedback>
        </CCol>

        <CCol :md="6">
          <CFormLabel for="earTag">Ear Tag</CFormLabel>
          <CFormInput id="earTag" v-model="currentCow.ear_tag" required />
          <CFormFeedback invalid>Ear tag is required.</CFormFeedback>
        </CCol>

        <CCol :md="6">
          <CFormLabel for="dateOfBirth">Date of Birth</CFormLabel>
          <CFormInput id="dateOfBirth" type="date" v-model="currentCow.date_of_birth" required />
          <CFormFeedback invalid>Date of birth is required.</CFormFeedback>
        </CCol>

        <CCol :md="6">
          <CFormLabel for="type">Gender</CFormLabel>
          <CFormSelect
            id="type"
            v-model="currentCow.type"
            :options="[
              { label: 'Select Type', value: '' },
              { label: 'Female', value: 'Female' },
              { label: 'Male', value: 'Male' },
            ]"
            required
          />
          <CFormFeedback invalid>Type is required.</CFormFeedback>
        </CCol>

        <CCol :md="6" v-if="currentCow.type === 'Female'">
          <CFormLabel for="given_birth">Has Given Birth</CFormLabel>
          <CFormSelect
            id="given_birth"
            v-model="currentCow.given_birth"
            :options="[
              { label: 'Select Option', value: '' },
              { label: 'Yes', value: '1' },
              { label: 'No', value: '0' },
            ]"
            required
          />
          <CFormFeedback invalid>This field is required for females.</CFormFeedback>
        </CCol>

        <CCol :md="6" v-if="currentCow.type === 'Male'">
          <CFormLabel for="male_type">Male Type</CFormLabel>
          <CFormSelect
            id="male_type"
            v-model="currentCow.male_type"
            :options="[
              { label: 'Select Type', value: '' },
              { label: 'Bull', value: 'Bull' },
              { label: 'Steer', value: 'Steer' },
            ]"
            required
          />
          <CFormFeedback invalid>This field is required for males.</CFormFeedback>
        </CCol>

        <CCol :md="6">
          <CFormLabel for="breed">Breed</CFormLabel>
          <CFormSelect
            id="breed"
            v-model="currentCow.breed"
            :options="
              [
                { label: 'Select Breed', value: '' },
                'Holstein',
                'Jersey',
                'Guernsey',
                'Angus',
                'Hereford',
                'Simmental',
                'Brahman',
                'Limousin',
                'Charolais',
                'Red Poll',
              ].map((b) => (typeof b === 'string' ? { label: b, value: b } : b))
            "
            required
          />
          <CFormFeedback invalid>Breed is required.</CFormFeedback>
        </CCol>

        <CCol :md="6">
          <CFormLabel for="herd">Herd</CFormLabel>
          <CFormSelect
            id="herd"
            v-model="currentCow.herd"
            :options="[
              { label: 'Select Herd', value: '' },
              { label: 'From Farm', value: 'from_farm' },
              { label: 'From Outside', value: 'from_outside' },
            ]"
            required
          />
          <CFormFeedback invalid>Herd is required.</CFormFeedback>
        </CCol>

        <CCol :md="6" v-if="currentCow.herd === 'from_farm'">
          <CFormLabel for="mother_ear_tag">Mother Ear Tag</CFormLabel>
          <Multiselect
            id="mother_ear_tag"
            v-model="currentCow.mother_ear_tag"
            :options="
              cowStore.cows.filter((cow) => cow.type === 'Female').map((cow) => cow.ear_tag)
            "
            placeholder="Select Mother"
            :searchable="true"
            :allowEmpty="true"
            required
          />
          <CFormFeedback invalid>Mother ear tag is required.</CFormFeedback>
        </CCol>

        <CCol :md="6" v-if="currentCow.herd === 'from_farm'">
          <CFormLabel for="father_ear_tag">Father Ear Tag</CFormLabel>
          <Multiselect
            id="father_ear_tag"
            v-model="currentCow.father_ear_tag"
            :options="cowStore.cows.filter((cow) => cow.type === 'Male').map((cow) => cow.ear_tag)"
            placeholder="Select Father"
            :searchable="true"
            :allowEmpty="true"
            required
          />
          <CFormFeedback invalid>Father ear tag is required.</CFormFeedback>
        </CCol>

        <CCol :md="6" v-if="herdFromOutside">
          <CFormLabel for="from_location">Source Location</CFormLabel>
          <CFormInput id="from_location" v-model="currentCow.from_location" required />
          <CFormFeedback invalid>Source location required if from outside.</CFormFeedback>
        </CCol>

        <CCol :md="6">
          <CFormLabel for="pasture">Pasture</CFormLabel>
          <CFormSelect
            id="pasture"
            v-model="currentCow.pasture_id"
            :options="[
              { label: 'Select pasture', value: '' },
              ...pastureStore.pastures.map((p) => ({ label: p.pasture, value: p.id })),
            ]"
            required
          />
          <CFormFeedback invalid>Select pasture.</CFormFeedback>
        </CCol>

        <CCol :xs="12">
          <CFormLabel for="description">Description</CFormLabel>
          <CFormTextarea id="description" rows="3" v-model="currentCow.description" />
        </CCol>
        <CCol :xs="4" v-if="isEditing && currentCow.image && typeof currentCow.image === 'string'">
          <div class="d-flex align-items-start gap-3 mb-2">
            <img
              :src="getCowImage(currentCow.image)"
              class="img-fluid rounded"
              style="max-height: 200px"
              alt="Cow"
            />
            <CButton color="danger" size="sm" title="Remove Image" @click="removeImage"
              ><CIcon :icon="cilTrash"
            /></CButton>
          </div>
        </CCol>
        <CCol :xs="12">
          <CFormLabel for="image">Cow Image</CFormLabel>
          <CFormInput
            type="file"
            id="image"
            @change="(e) => (currentCow.image = e.target.files[0])"
            accept="image/*"
          />
        </CCol>

        <CCol :xs="12" class="d-flex align-items-center">
          <CFormCheck id="status" v-model="isActive" label="Active" />
        </CCol>

        <CCol :xs="12" class="d-flex justify-content-end">
          <CButton color="secondary" class="me-2" @click="showModal = false">Cancel</CButton>
          <CButton color="success" type="submit">{{ isEditing ? 'Update' : 'Create' }}</CButton>
        </CCol>
      </CForm>
    </CModalBody>
  </CModal>
</template>