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
  CNav,
  CNavItem,
  CNavLink,
  CTabContent,
  CTabPane,
} from '@coreui/vue'
import { cilPencil, cilTrash } from '@coreui/icons'
import defaultCowImage from '@/assets/images/default-cow.jpg'
import Multiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.css'

const cowStore = useCowStore()
const pastureStore = usePastureStore()

const showModal = ref(false)
const isEditing = ref(false)
const validated = ref(false)
const activeTab = ref('details')

const currentCow = ref({
  id: null,
  name: '',
  ear_tag: '',
  date_of_birth: '',
  class: '',
  gender: '',
  breed: '',
  from_farm: '',
  source_location: '',
  description: '',
  pasture_id: '',
  status: true,
  image: null,
})

const currentCowParent = ref({
  mother_id: '',
  father_id: '',
})

const isFromFarm = computed(() => currentCow.value.from_farm === 'yes')

// fetch data
onMounted(async () => {
  await cowStore.fetchCows()
  await pastureStore.fetchPastures()
  await cowStore.loadParentOptions() // Load parent options for the form
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
  activeTab.value = 'details'
  currentCow.value = {
    id: null,
    name: '',
    ear_tag: '',
    date_of_birth: '',
    class: '',
    gender: '',
    breed: '',
    from_farm: '',
    source_location: '',
    description: '',
    pasture_id: '',
    status: true,
    image: null,
  }
  currentCowParent.value = {
    mother_id: '',
    father_id: '',
  }
  showModal.value = true
}

function openEdit(cow) {
  isEditing.value = true
  validated.value = false
  activeTab.value = 'details'
  currentCow.value = { ...cow, status: cow.status === '1' }
  // Load parent data if available
  currentCowParent.value = {
    mother_id: cow.parent?.mother_id || '',
    father_id: cow.parent?.father_id || '',
  }
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
    class: currentCow.value.class,
    gender: currentCow.value.gender,
    breed: currentCow.value.breed,
    from_farm: currentCow.value.from_farm,
    source_location: currentCow.value.from_farm === 'no' ? currentCow.value.source_location : '',
    description: currentCow.value.description,
    pasture_id: currentCow.value.pasture_id,
    status: currentCow.value.status ? '1' : '0',
    image: currentCow.value.image,
    // Parent data
    mother_id: currentCowParent.value.mother_id,
    father_id: currentCowParent.value.father_id,
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
      : cow.gender === 'Female' && !cow.has_given_birth
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
        'Class',
        'Breed',
        'Source',
        'Mother',
        'Father',
        'Age',
        'Calculated Class',
      ],
    ],
    body: filteredCows.value.map((cow, index) => {
      const { age, ageClass } = calculateAgeAndClass(cow.date_of_birth, cow)
      return [
        index + 1,
        cow.name,
        cow.ear_tag,
        cow.gender,
        cow.class,
        cow.breed,
        cow.source_location || (cow.from_farm === 'yes' ? 'From Farm' : '—'),
        cow.parent?.mother_id || '—',
        cow.parent?.father_id || '—',
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
    ['ID', 'Name', 'Ear Tag', 'DOB', 'Gender', 'Class', 'Breed', 'Age', 'Calculated Class'],
    ...filteredCows.value.map((cow) => {
      const { age, ageClass } = calculateAgeAndClass(cow.date_of_birth, cow)
      return [cow.id, cow.name, cow.ear_tag, cow.date_of_birth, cow.gender, cow.class, cow.breed, age, ageClass]
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

// Get Cow Image
function getCowImage(imageUrl) {
  return cowStore.getCowImageUrl({ image: imageUrl }) || defaultCowImage
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
                <CTableHeaderCell>Action</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              <CTableRow v-for="cow in paginatedCows" :key="cow.id">
                <CTableDataCell
                  ><router-link :to="`/cows/${cow.id}`">
                    {{ cow.name }}
                  </router-link></CTableDataCell
                >
                <CTableDataCell>{{ cow.ear_tag }}</CTableDataCell>
                <CTableDataCell>{{
                  new Date(cow.date_of_birth).toLocaleDateString() || ''
                }}</CTableDataCell>
                <CTableDataCell>{{
                  calculateAgeAndClass(cow.date_of_birth, cow).age
                }}</CTableDataCell>
                <CTableDataCell
                  ><router-link
                    :to="`/gender/cow/${cow.gender}`"
                    class="text-decoration-none text-dark"
                    >{{ cow.gender }}</router-link
                  ></CTableDataCell
                >
                <CTableDataCell
                  ><router-link
                    :to="`/class/cow/${cow.class || calculateAgeAndClass(cow.date_of_birth, cow).ageClass}`"
                    class="text-decoration-none text-dark"
                    >{{ cow.class || calculateAgeAndClass(cow.date_of_birth, cow).ageClass }}</router-link
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
                <CTableDataCell>
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
                <CTableDataCell colspan="9" class="text-center"> No cows found. </CTableDataCell>
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

  <!-- Create/Edit Modal -->
  <CModal :visible="showModal" @close="showModal = false" backdrop="static" size="lg">
    <CModalHeader>
      <CModalTitle>{{ isEditing ? 'Edit Cow' : 'Add Cow' }}</CModalTitle>
    </CModalHeader>
    <CModalBody>
      <!-- Navigation Tabs -->
      <CNav variant="tabs" class="mb-4">
        <CNavItem>
          <CNavLink 
            :active="activeTab === 'details'" 
            @click="activeTab = 'details'"
            style="cursor: pointer;"
          >
            Cow Details
          </CNavLink>
        </CNavItem>
        <CNavItem>
          <CNavLink 
            :active="activeTab === 'parent'" 
            @click="activeTab = 'parent'"
            style="cursor: pointer;"
          >
            Cow Parent
          </CNavLink>
        </CNavItem>
      </CNav>

      <!-- Tab Content -->
      <CForm
        class="row g-3 needs-validation"
        enctype="multipart/form-data"
        novalidate
        :validated="validated"
        @submit="handleSubmit"
      >
        <CTabContent>
          <!-- Cow Details Tab -->
          <CTabPane :visible="activeTab === 'details'">
            <CRow class="g-3">
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
                <CFormLabel for="gender">Gender</CFormLabel>
                <CFormSelect
                  id="gender"
                  v-model="currentCow.gender"
                  :options="[
                    { label: 'Select Gender', value: '' },
                    { label: 'Female', value: 'Female' },
                    { label: 'Male', value: 'Male' },
                  ]"
                  required
                />
                <CFormFeedback invalid>Gender is required.</CFormFeedback>
              </CCol>

              <CCol :md="6">
                <CFormLabel for="class">Class</CFormLabel>
                <CFormSelect
                  id="class"
                  v-model="currentCow.class"
                  :options="[
                    { label: 'Select Class', value: '' },
                    { label: 'Calf', value: 'Calf' },
                    { label: 'Yearling', value: 'Yearling' },
                    { label: 'Heifer', value: 'Heifer' },
                    { label: 'Cow', value: 'Cow' },
                    { label: 'Bull', value: 'Bull' },
                    { label: 'Steer', value: 'Steer' },
                  ]"
                />
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
                <CFormLabel for="from_farm">From Farm</CFormLabel>
                <CFormSelect
                  id="from_farm"
                  v-model="currentCow.from_farm"
                  :options="[
                    { label: 'Select Option', value: '' },
                    { label: 'Yes - From Farm', value: 'yes' },
                    { label: 'No - From Outside', value: 'no' },
                  ]"
                  required
                />
                <CFormFeedback invalid>This field is required.</CFormFeedback>
              </CCol>

              <CCol :md="6" v-if="currentCow.from_farm === 'no'">
                <CFormLabel for="source_location">Source Location</CFormLabel>
                <CFormInput id="source_location" v-model="currentCow.source_location" required />
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
            </CRow>
          </CTabPane>

          <!-- Cow Parent Tab -->
          <CTabPane :visible="activeTab === 'parent'">
            <CRow class="g-3">
              <CCol :xs="12">
                <p class="text-muted">
                  Specify the parent information for this cow. This is especially important for cows born on the farm.
                </p>
              </CCol>

              <CCol :md="6">
                <CFormLabel for="mother_id">Mother ID</CFormLabel>
                <Multiselect
                  id="mother_id"
                  v-model="currentCowParent.mother_id"
                  :options="cowStore.femaleParentOptions"
                  label="label"
                  track-by="value"
                  placeholder="Select Mother"
                  :searchable="true"
                  :allowEmpty="true"
                />
              </CCol>

              <CCol :md="6">
                <CFormLabel for="father_id">Father ID</CFormLabel>
                <Multiselect
                  id="father_id"
                  v-model="currentCowParent.father_id"
                  :options="cowStore.maleParentOptions"
                  label="label"
                  track-by="value"
                  placeholder="Select Father"
                  :searchable="true"
                  :allowEmpty="true"
                />
              </CCol>

              <CCol :xs="12" v-if="currentCow.from_farm === 'no'">
                <div class="alert alert-info">
                  <strong>Note:</strong> Since this cow is from outside the farm, parent information may not be available or relevant.
                </div>
              </CCol>
            </CRow>
          </CTabPane>
        </CTabContent>

        <CCol :xs="12" class="d-flex justify-content-end mt-4">
          <CButton color="secondary" class="me-2" @click="showModal = false">Cancel</CButton>
          <CButton color="success" type="submit">{{ isEditing ? 'Update' : 'Create' }}</CButton>
        </CCol>
      </CForm>
    </CModalBody>
  </CModal>
</template>